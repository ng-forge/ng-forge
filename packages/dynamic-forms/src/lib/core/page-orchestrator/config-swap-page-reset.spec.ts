import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { GoToPageEvent } from '../../events/constants/go-to-page.event';
import { DynamicForm } from '../../dynamic-form.component';
import { FIELD_REGISTRY, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { FormConfig } from '@ng-forge/dynamic-forms/internal';
import { delay } from '@ng-forge/utils';

// Configs are cast because `input` is registered at runtime below, not in the compile-time registry.

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

async function waitForFormInit(fixture: ComponentFixture<DynamicForm>, timeoutMs = 200): Promise<void> {
  fixture.detectChanges();
  TestBed.flushEffects();
  await firstValueFrom(race(fixture.componentInstance.initialized$.pipe(map(() => true)), timer(timeoutMs).pipe(map(() => false))));
  for (let i = 0; i < 2; i++) {
    TestBed.flushEffects();
    fixture.detectChanges();
    await delay(0);
  }
  await fixture.whenStable();
  TestBed.flushEffects();
  fixture.detectChanges();
}

function pagedConfig(label: string, initialPage?: number | { index: number; validate?: boolean }): FormConfig {
  return {
    ...(initialPage !== undefined ? { options: { initialPage } } : {}),
    fields: [
      { key: 'p1', type: 'page', fields: [{ key: 'a', type: 'input', label: `A-${label}` }] },
      { key: 'p2', type: 'page', fields: [{ key: 'b', type: 'input', label: `B-${label}` }] },
      { key: 'p3', type: 'page', fields: [{ key: 'c', type: 'input', label: `C-${label}` }] },
    ],
  } as unknown as FormConfig;
}

function activePage(fixture: ComponentFixture<DynamicForm>): number {
  const host = fixture.nativeElement.querySelector('.df-page-orchestrator');
  return Number(host?.getAttribute('data-current-page') ?? -1);
}

/**
 * Replacing a config resets the pager to its starting page. That predates
 * `initialPage` (the reset target was a hardcoded 0); these lock in that
 * `initialPage` becomes the reset target rather than introducing a new reset.
 */
describe('config swap resets the active page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [
        {
          provide: FIELD_REGISTRY,
          useFactory: () => {
            const registry = new Map();
            BUILT_IN_FIELDS.forEach((t) => registry.set(t.name, t));
            TEST_FIELD_TYPES.forEach((t) => registry.set(t.name, t));
            return registry;
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('resets to page 0 when no initialPage is set', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1'));
    fixture.componentRef.setInput('value', {});
    await waitForFormInit(fixture);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await waitForFormInit(fixture);
    expect(activePage(fixture)).toBe(2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2'));
    await waitForFormInit(fixture, 600);

    expect(activePage(fixture)).toBe(0);
  });

  it('resets to initialPage when one is set', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1', 1));
    fixture.componentRef.setInput('value', {});
    await waitForFormInit(fixture);
    expect(activePage(fixture)).toBe(1);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await waitForFormInit(fixture);
    expect(activePage(fixture)).toBe(2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2', 1));
    await waitForFormInit(fixture, 600);

    // Reset target follows the config, so the deep-linked page survives a swap.
    expect(activePage(fixture)).toBe(1);
  });

  it('re-applies a gated initialPage after a swap', async () => {
    const gated = { index: 1, validate: true };
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1', gated));
    fixture.componentRef.setInput('value', {});
    await waitForFormInit(fixture);
    expect(activePage(fixture)).toBe(1);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await waitForFormInit(fixture);
    expect(activePage(fixture)).toBe(2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2', gated));
    await waitForFormInit(fixture, 600);

    // The gated landing must re-apply, matching the ungated case above.
    expect(activePage(fixture)).toBe(1);
  });
});

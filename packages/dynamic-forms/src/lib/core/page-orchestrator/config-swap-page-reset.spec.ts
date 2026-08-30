import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { GoToPageEvent } from '../../events/constants/go-to-page.event';
import { DynamicForm } from '../../dynamic-form.component';
import { FIELD_REGISTRY, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { FormConfig } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';

// Configs are cast because `input` is registered at runtime below, not in the compile-time registry.

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

async function waitForActivePage(fixture: ComponentFixture<DynamicForm>, expectedPage: number, timeoutMs = 1000): Promise<void> {
  fixture.detectChanges();
  const stateManager = fixture.debugElement.injector.get(FormStateManager);

  await vi.waitFor(
    async () => {
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(stateManager.isSchemaCurrent()).toBe(true);
      expect(activePage(fixture)).toBe(expectedPage);
    },
    { timeout: timeoutMs, interval: 10 },
  );
}

function pagedConfig(label: string, initialPage?: number | { index: number; validate?: boolean }): FormConfig {
  return {
    ...(initialPage !== undefined ? { options: { initialPage } } : {}),
    fields: [
      { key: 'p1', type: 'page', fields: [{ key: 'a', type: 'input', label: `A-${label}` }] },
      {
        key: 'p2',
        type: 'page',
        fields: [{ key: 'b', type: 'input', label: `B-${label}`, validators: [{ type: 'required' }] }],
      },
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
    await waitForActivePage(fixture, 0);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await waitForActivePage(fixture, 2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2'));
    await waitForActivePage(fixture, 0);
  });

  it('resets to initialPage when one is set', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1', 1));
    fixture.componentRef.setInput('value', {});
    await waitForActivePage(fixture, 1);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await waitForActivePage(fixture, 2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2', 1));
    // Reset target follows the config, so the deep-linked page survives a swap.
    await waitForActivePage(fixture, 1);
  });

  it('re-applies a gated initialPage after a swap', async () => {
    const gated = { index: 2, validate: true };
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1', gated));
    fixture.componentRef.setInput('value', { a: 'filled' });
    // Page 1 is invalid, so the gated landing cannot reach page 2.
    await waitForActivePage(fixture, 1);
    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await waitForActivePage(fixture, 2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2', gated));
    // The gated landing must re-apply, matching the ungated case above.
    await waitForActivePage(fixture, 1);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { GoToPageEvent } from '../../events/constants/go-to-page.event';
import { PageChangeEvent } from '../../events/constants/page-change.event';
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

async function settle(fixture: ComponentFixture<DynamicForm>, timeoutMs = 200): Promise<void> {
  fixture.detectChanges();
  TestBed.flushEffects();
  const initialized = await firstValueFrom(
    race(fixture.componentInstance.initialized$.pipe(map(() => true)), timer(timeoutMs).pipe(map(() => false))),
  );
  expect(initialized).toBe(true);
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
      { key: 'p1', type: 'page', fields: [{ key: 'a', type: 'input', label: `A-${label}`, validators: [{ type: 'required' }] }] },
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
 * The active page index has one owner. These lock the contract that the previous
 * split ownership (an orchestrator `linkedSignal` re-deriving from a state-manager
 * signal that an effect wrote back) could only satisfy by luck of flush order.
 */
describe('active page index ownership', () => {
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

  it('applies a GoToPageEvent dispatched before the pager has mounted', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1'));
    fixture.componentRef.setInput('value', { a: 'filled' });

    // Dispatched in the same tick the form is created, so the orchestrator has not
    // subscribed yet. The request is intent, not a message to a live listener.
    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));

    await settle(fixture);
    expect(activePage(fixture)).toBe(2);
  });

  it('keeps an explicit navigation to page 0 distinct from never having navigated', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1', 2));
    fixture.componentRef.setInput('value', { a: 'filled' });
    await settle(fixture);
    expect(activePage(fixture)).toBe(2);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(0, { validate: false }));
    await settle(fixture);

    // Must stay on 0. Treating 0 as "unset" re-lands on initialPage instead.
    expect(activePage(fixture)).toBe(0);
  });

  it('re-lands on initialPage after a config swap, whatever the user navigated to', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1', 1));
    fixture.componentRef.setInput('value', { a: 'filled' });
    await settle(fixture);
    expect(activePage(fixture)).toBe(1);

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: false }));
    await settle(fixture);
    expect(activePage(fixture)).toBe(2);

    fixture.componentRef.setInput('dynamic-form', pagedConfig('v2', 1));
    await settle(fixture, 600);
    expect(activePage(fixture)).toBe(1);
  });

  it('gates a pre-mount request on validity, stopping at the first invalid page', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1'));
    // `a` is required and left empty, so page 0 is invalid.
    fixture.componentRef.setInput('value', {});

    const bus = fixture.debugElement.injector.get(EventBus);
    bus.dispatch(new GoToPageEvent(2, { validate: true }));

    await settle(fixture);
    expect(activePage(fixture)).toBe(0);
  });

  it('does not lose navigation requested after page change but before the destination settles', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', pagedConfig('v1'));
    fixture.componentRef.setInput('value', { a: 'filled' });
    await settle(fixture);

    const bus = fixture.debugElement.injector.get(EventBus);
    let requestedDuringTransition = false;
    const pageChangeSubscription = bus.on<PageChangeEvent>('page-change').subscribe((event) => {
      if (event.currentPageIndex !== 1 || requestedDuringTransition) return;
      requestedDuringTransition = true;
      queueMicrotask(() => bus.dispatch(new GoToPageEvent(2, { validate: false })));
    });

    bus.dispatch(new GoToPageEvent(1, { validate: false }));
    await settle(fixture);

    expect(requestedDuringTransition).toBe(true);
    expect(activePage(fixture)).toBe(2);
    pageChangeSubscription.unsubscribe();
  });
});

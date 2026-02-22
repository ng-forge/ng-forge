import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent } from '../../events/constants';
import { PageNavigationStateChangeEvent } from '../../events/constants/page-navigation-state-change.event';
import { DynamicForm } from '../../dynamic-form.component';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models/field-type';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { FormConfig } from '../../models/form-config';
import { delay } from '@ng-forge/utils';

// Minimal field type registration for page orchestrator tests.
// We only need the form schema to be built correctly; actual rendering is secondary.
const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../testing/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

/** Waits for the form to fully initialize, using initialized$ for reliability. */
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

function createForm(config: FormConfig, initialValue?: Record<string, unknown>): ComponentFixture<DynamicForm> {
  const fixture = TestBed.createComponent(DynamicForm);
  fixture.componentRef.setInput('dynamic-form', config);
  if (initialValue !== undefined) {
    fixture.componentRef.setInput('value', initialValue);
  }
  return fixture;
}

describe('PageOrchestratorComponent', () => {
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

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── Validity guard (B2 / disableWhenPageInvalid) ───────────────────────────

  describe('currentPageValid / validity guard', () => {
    it('blocks next-page navigation when a required plain field is empty', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      eventBus.dispatch(NextPageEvent);
      fixture.detectChanges();
      await waitForFormInit(fixture);

      expect(pageChangeCount).toBe(0);
    });

    it('allows next-page navigation when the current page is valid', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [{ key: 'name', type: 'input', label: 'Name', required: true, value: 'Alice' }],
          },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, { name: 'Alice' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (pageChangeEvent = e));

      eventBus.dispatch(NextPageEvent);
      fixture.detectChanges();
      await waitForFormInit(fixture);

      expect(pageChangeEvent).toBeTruthy();
      expect(pageChangeEvent!.currentPageIndex).toBe(1);
    });

    it('blocks navigation when a required field inside a group is empty', async () => {
      // Regression guard for collectLeafFieldKeys group fix:
      // Before the fix, group children were looked up at root level (form['street'] → undefined)
      // and silently treated as valid. After the fix, the group node itself is checked
      // (form['address']().valid()) which correctly aggregates child validity.
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [{ key: 'street', type: 'input', label: 'Street', required: true }],
              },
            ],
          },
          { key: 'page2', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      eventBus.dispatch(NextPageEvent);
      fixture.detectChanges();
      await waitForFormInit(fixture);

      expect(pageChangeCount).toBe(0);
    });

    it('blocks navigation when a required field inside a row is empty', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'contactRow',
                type: 'row',
                fields: [{ key: 'phone', type: 'input', label: 'Phone', required: true }],
              },
            ],
          },
          { key: 'page2', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      eventBus.dispatch(NextPageEvent);
      fixture.detectChanges();
      await waitForFormInit(fixture);

      expect(pageChangeCount).toBe(0);
    });
  });

  // ─── Hidden page auto-redirect (B15) ────────────────────────────────────────

  describe('hidden page auto-redirect', () => {
    it('auto-navigates away from a statically hidden first page on init', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hiddenPage',
            type: 'page',
            logic: [{ type: 'hidden', condition: true }],
            fields: [{ key: 'hidden1', type: 'input', label: 'Hidden' }],
          },
          {
            key: 'visiblePage',
            type: 'page',
            fields: [{ key: 'name', type: 'input', label: 'Name' }],
          },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      const eventBus = fixture.debugElement.injector.get(EventBus);

      const navStates: PageNavigationStateChangeEvent[] = [];
      eventBus.on<PageNavigationStateChangeEvent>('page-navigation-state-change').subscribe((e) => navStates.push(e));

      await waitForFormInit(fixture);
      TestBed.flushEffects();
      fixture.detectChanges();
      await delay(0);

      // The hidden first page should have triggered auto-redirect to page 1
      const lastState = navStates.at(-1);
      expect(lastState?.state.currentPageIndex).toBe(1);
    });

    it('does not fire PageChangeEvent when all pages are hidden', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hiddenPage1',
            type: 'page',
            logic: [{ type: 'hidden', condition: true }],
            fields: [{ key: 'f1', type: 'input', label: 'F1' }],
          },
          {
            key: 'hiddenPage2',
            type: 'page',
            logic: [{ type: 'hidden', condition: true }],
            fields: [{ key: 'f2', type: 'input', label: 'F2' }],
          },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      await waitForFormInit(fixture);
      TestBed.flushEffects();
      fixture.detectChanges();
      await delay(0);

      // No visible page to redirect to — no PageChangeEvent should fire
      expect(pageChangeCount).toBe(0);
    });

    it('skips a hidden middle page during next-page navigation', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [{ key: 'step1', type: 'input', label: 'Step 1', value: 'filled' }],
          },
          {
            key: 'hiddenPage',
            type: 'page',
            logic: [{ type: 'hidden', condition: true }],
            fields: [{ key: 'hidden1', type: 'input', label: 'Hidden' }],
          },
          {
            key: 'page3',
            type: 'page',
            fields: [{ key: 'step3', type: 'input', label: 'Step 3' }],
          },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, { step1: 'filled' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      eventBus.dispatch(NextPageEvent);
      fixture.detectChanges();
      await waitForFormInit(fixture);

      // Should jump from page 0 to page 2, skipping the hidden middle page
      expect(lastPageChangeEvent).toBeTruthy();
      expect(lastPageChangeEvent!.currentPageIndex).toBe(2);
    });
  });
});

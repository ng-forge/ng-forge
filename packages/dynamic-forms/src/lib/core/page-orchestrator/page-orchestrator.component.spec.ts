import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PageOrchestratorComponent } from './page-orchestrator.component';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { GoToPageEvent } from '../../events/constants/go-to-page.event';
import { NextPageEvent } from '../../events/constants/next-page.event';
import { PageChangeEvent } from '../../events/constants/page-change.event';
import { PagerStateEvent } from '../../events/constants/pager-state.event';
import { DynamicForm } from '../../dynamic-form.component';
import { FIELD_REGISTRY, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { FormConfig } from '@ng-forge/dynamic-forms/internal';
import { delay } from '@ng-forge/utils';

// Configs are cast because `input` is registered at runtime below, not in the compile-time registry.

// Minimal field type registration for page orchestrator tests.
// We only need the form schema to be built correctly; actual rendering is secondary.
const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
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

    it('blocks navigation when a required field inside a container is empty', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'detailsBlock',
                type: 'container',
                wrappers: [],
                fields: [{ key: 'nickname', type: 'input', label: 'Nickname', required: true }],
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

    it('blocks navigation when a required field inside a nested container is empty', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'outerBlock',
                type: 'container',
                wrappers: [],
                fields: [
                  {
                    key: 'innerRow',
                    type: 'row',
                    fields: [
                      {
                        key: 'innerBlock',
                        type: 'container',
                        wrappers: [],
                        fields: [{ key: 'nickname', type: 'input', label: 'Nickname', required: true }],
                      },
                    ],
                  },
                ],
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

    it('blocks navigation when a required field inside a group nested in a container is empty', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'detailsBlock',
                type: 'container',
                wrappers: [],
                fields: [
                  {
                    key: 'profile',
                    type: 'group',
                    fields: [{ key: 'nickname', type: 'input', label: 'Nickname', required: true }],
                  },
                ],
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

    it('reports the page invalid to currentPageValid when a container child is invalid', async () => {
      // `currentPageValid` is the signal both consumers read: the navigateToNextPage() gate
      // and resolveNextButtonDisabled (which keeps the next button enabled when it is true).
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'detailsBlock',
                type: 'container',
                wrappers: [],
                fields: [{ key: 'nickname', type: 'input', label: 'Nickname', required: true }],
              },
            ],
          },
          { key: 'page2', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);

      const orchestrator = fixture.debugElement.query(By.directive(PageOrchestratorComponent))
        .componentInstance as PageOrchestratorComponent;

      expect(orchestrator.currentPageValid()).toBe(false);
    });

    it('allows navigation when every field inside a container is valid', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'detailsBlock',
                type: 'container',
                wrappers: [],
                fields: [{ key: 'nickname', type: 'input', label: 'Nickname', required: true, value: 'Robin' }],
              },
            ],
          },
          { key: 'page2', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, { nickname: 'Robin' });
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

    it('renders a large page > group > many rows shape without standalone injector errors', async () => {
      const rowCount = 40;
      const rows = Array.from({ length: rowCount }, (_, i) => ({
        key: `row${i}`,
        type: 'row',
        fields: [{ key: `field${i}`, type: 'input', label: `Field ${i}` }],
      }));

      const config: FormConfig = {
        fields: [
          {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'section',
                type: 'group',
                fields: rows,
              },
            ],
          },
          {
            key: 'page2',
            type: 'page',
            fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }],
          },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture, 1500);

      const section = fixture.nativeElement.querySelector('[data-testid="section"]');
      // Rows inside the `section` group are scoped — DOM IDs become `section_row_*`.
      const renderedRows = fixture.nativeElement.querySelectorAll('[data-testid^="section_row"]');

      expect(section).toBeTruthy();
      expect(renderedRows).toHaveLength(rowCount);
    }, 5000);
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

      const navStates: PagerStateEvent[] = [];
      eventBus.on<PagerStateEvent>('pager-state').subscribe((e) => navStates.push(e));

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

  // ─── Programmatic navigation (GoToPageEvent) ────────────────────────────────

  describe('GoToPageEvent', () => {
    /** Dispatches an event and lets the form settle. */
    async function dispatchAndSettle(fixture: ComponentFixture<DynamicForm>, eventBus: EventBus, pageIndex: number): Promise<void> {
      eventBus.dispatch(new GoToPageEvent(pageIndex));
      fixture.detectChanges();
      await waitForFormInit(fixture);
    }

    it('jumps forward when every intermediate page is valid', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email', required: true }] },
          { key: 'page3', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, { name: 'Alice', email: 'alice@example.com' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      await dispatchAndSettle(fixture, eventBus, 2);

      expect(lastPageChangeEvent).toBeTruthy();
      expect(lastPageChangeEvent!.currentPageIndex).toBe(2);
    });

    it('lands on the first invalid page when a forward jump crosses one', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email', required: true }] },
          { key: 'page3', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      // page2's required `email` is empty — the jump to page 3 must stop there.
      const fixture = createForm(config, { name: 'Alice' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      await dispatchAndSettle(fixture, eventBus, 2);

      expect(lastPageChangeEvent).toBeTruthy();
      expect(lastPageChangeEvent!.currentPageIndex).toBe(1);
    });

    it('does not move when the origin page itself is invalid', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email' }] },
          { key: 'page3', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      await dispatchAndSettle(fixture, eventBus, 2);

      expect(pageChangeCount).toBe(0);
    });

    it('does not validate the target page itself', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email', required: true }] },
        ],
      } as unknown as FormConfig;

      // page2 is invalid, but it is the target — only intermediate pages are gated.
      const fixture = createForm(config, { name: 'Alice' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      await dispatchAndSettle(fixture, eventBus, 1);

      expect(lastPageChangeEvent).toBeTruthy();
      expect(lastPageChangeEvent!.currentPageIndex).toBe(1);
    });

    it('jumps backward unconditionally, even from an invalid page', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email', required: true }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, { name: 'Alice' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      // Forward onto the invalid page2, then back to page1 despite page2 being invalid.
      await dispatchAndSettle(fixture, eventBus, 1);
      expect(lastPageChangeEvent!.currentPageIndex).toBe(1);

      await dispatchAndSettle(fixture, eventBus, 0);

      expect(lastPageChangeEvent!.currentPageIndex).toBe(0);
    });

    it('skips hidden pages when validating a forward jump', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          {
            key: 'hiddenPage',
            type: 'page',
            logic: [{ type: 'hidden', condition: true }],
            // Invalid, but hidden — must not block the jump.
            fields: [{ key: 'secret', type: 'input', label: 'Secret', required: true }],
          },
          { key: 'page3', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, { name: 'Alice' });
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      await dispatchAndSettle(fixture, eventBus, 2);

      expect(lastPageChangeEvent).toBeTruthy();
      expect(lastPageChangeEvent!.currentPageIndex).toBe(2);
    });

    it('ignores an out-of-bounds page index', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name' }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      await dispatchAndSettle(fixture, eventBus, 5);

      expect(pageChangeCount).toBe(0);
    });

    it('ignores a hidden target page', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name' }] },
          {
            key: 'hiddenPage',
            type: 'page',
            logic: [{ type: 'hidden', condition: true }],
            fields: [{ key: 'secret', type: 'input', label: 'Secret' }],
          },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let pageChangeCount = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => pageChangeCount++);

      await dispatchAndSettle(fixture, eventBus, 1);

      expect(pageChangeCount).toBe(0);
    });

    it('skips intermediate validation when disableWhenPageInvalid is false', async () => {
      const config: FormConfig = {
        options: { nextButton: { disableWhenPageInvalid: false } },
        fields: [
          { key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name', required: true }] },
          { key: 'page2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email', required: true }] },
          { key: 'page3', type: 'page', fields: [{ key: 'confirm', type: 'input', label: 'Confirm' }] },
        ],
      } as unknown as FormConfig;

      const fixture = createForm(config, {});
      await waitForFormInit(fixture);
      const eventBus = fixture.debugElement.injector.get(EventBus);

      let lastPageChangeEvent: PageChangeEvent | null = null;
      eventBus.on<PageChangeEvent>('page-change').subscribe((e) => (lastPageChangeEvent = e));

      await dispatchAndSettle(fixture, eventBus, 2);

      expect(lastPageChangeEvent).toBeTruthy();
      expect(lastPageChangeEvent!.currentPageIndex).toBe(2);
    });
  });
});

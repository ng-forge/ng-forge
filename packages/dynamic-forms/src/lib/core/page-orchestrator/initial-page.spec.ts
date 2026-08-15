import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { GoToPageEvent } from '../../events/constants/go-to-page.event';
import { PagerStateEvent } from '../../events/constants/pager-state.event';
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

/** Three pages; `a` and `b` are required, `c` is not. */
function pagedConfig(options?: Record<string, unknown>, pageLogic?: unknown): FormConfig {
  return {
    ...(options ? { options } : {}),
    fields: [
      { key: 'p1', type: 'page', fields: [{ key: 'a', type: 'input', label: 'A', required: true }] },
      {
        key: 'p2',
        type: 'page',
        ...(pageLogic ? { logic: pageLogic } : {}),
        fields: [{ key: 'b', type: 'input', label: 'B', required: true }],
      },
      { key: 'p3', type: 'page', fields: [{ key: 'c', type: 'input', label: 'C' }] },
    ],
  } as unknown as FormConfig;
}

function createForm(config: FormConfig, value: Record<string, unknown> = {}): ComponentFixture<DynamicForm> {
  const fixture = TestBed.createComponent(DynamicForm);
  fixture.componentRef.setInput('dynamic-form', config);
  fixture.componentRef.setInput('value', value);
  return fixture;
}

/** Reads the page the orchestrator settled on, from the host's data attribute. */
function activePage(fixture: ComponentFixture<DynamicForm>): number {
  const host = fixture.nativeElement.querySelector('.df-page-orchestrator');
  return Number(host?.getAttribute('data-current-page') ?? -1);
}

describe('initialPage / deep linking', () => {
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

  describe('FormOptions.initialPage', () => {
    it('starts on the requested page when all data is present', async () => {
      const fixture = createForm(pagedConfig({ initialPage: 2 }), { a: 'x', b: 'y' });
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(2);
    });

    it('starts on the requested page even when an earlier page is incomplete', async () => {
      // The resume case: saved on page 2 with page 1 half-filled.
      const fixture = createForm(pagedConfig({ initialPage: 2 }), { a: 'x' });
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(2);
    });

    it('gates the landing when validate is true', async () => {
      const fixture = createForm(pagedConfig({ initialPage: { index: 2, validate: true } }), { a: 'x' });
      await waitForFormInit(fixture);

      // page 1 (`b`) is invalid, so the gated landing stops there
      expect(activePage(fixture)).toBe(1);
    });

    it('defaults to page 0 when omitted', async () => {
      const fixture = createForm(pagedConfig(), { a: 'x', b: 'y' });
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(0);
    });

    it('clamps an out-of-bounds index to the last page', async () => {
      const fixture = createForm(pagedConfig({ initialPage: 99 }), { a: 'x', b: 'y' });
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(2);
    });

    it('ignores a negative index', async () => {
      const fixture = createForm(pagedConfig({ initialPage: -3 }), {});
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(0);
    });

    it('ignores a non-numeric index', async () => {
      const fixture = createForm(pagedConfig({ initialPage: Number.NaN }), {});
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(0);
    });

    it('falls forward to the nearest visible page when the target is hidden', async () => {
      const fixture = createForm(pagedConfig({ initialPage: 1 }, [{ type: 'hidden', condition: true }]), { a: 'x' });
      await waitForFormInit(fixture);

      // page 1 is hidden, so the landing resolves to the next visible page
      expect(activePage(fixture)).toBe(2);
    });

    it('resolves a hidden target to the nearest visible page when gated too', async () => {
      const fixture = createForm(pagedConfig({ initialPage: { index: 1, validate: true } }, [{ type: 'hidden', condition: true }]), {
        a: 'x',
      });
      await waitForFormInit(fixture);

      // Gated and ungated landings must agree on how a hidden target resolves.
      expect(activePage(fixture)).toBe(2);
    });
  });

  describe('GoToPageEvent validate option', () => {
    it('is gated by default', async () => {
      const fixture = createForm(pagedConfig(), { a: 'x' });
      await waitForFormInit(fixture);
      const bus = fixture.debugElement.injector.get(EventBus);

      bus.dispatch(new GoToPageEvent(2));
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(1);
    });

    it('lands exactly when validate is false', async () => {
      const fixture = createForm(pagedConfig(), { a: 'x' });
      await waitForFormInit(fixture);
      const bus = fixture.debugElement.injector.get(EventBus);

      bus.dispatch(new GoToPageEvent(2, { validate: false }));
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(2);
    });

    it('still refuses a hidden target when ungated', async () => {
      const fixture = createForm(pagedConfig(undefined, [{ type: 'hidden', condition: true }]), { a: 'x' });
      await waitForFormInit(fixture);
      const bus = fixture.debugElement.injector.get(EventBus);

      const seen: number[] = [];
      bus.on<PagerStateEvent>('pager-state').subscribe((e) => seen.push(e.state.currentPageIndex));

      bus.dispatch(new GoToPageEvent(1, { validate: false }));
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(0);
    });

    it('still refuses an out-of-bounds target when ungated', async () => {
      const fixture = createForm(pagedConfig(), { a: 'x', b: 'y' });
      await waitForFormInit(fixture);
      const bus = fixture.debugElement.injector.get(EventBus);

      bus.dispatch(new GoToPageEvent(99, { validate: false }));
      await waitForFormInit(fixture);

      expect(activePage(fixture)).toBe(0);
    });
  });
});

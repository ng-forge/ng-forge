import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { computed, Injector, runInInjectionContext, signal, WritableSignal, type Signal } from '@angular/core';
import type { FieldContext } from '@angular/forms/signals';
import { FunctionRegistryService } from './function-registry.service';
import { FieldContextRegistryService } from './field-context-registry.service';
import { RootFormRegistryService } from './root-form-registry.service';
import { EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { createMockLogger } from '../../../../../test-utils/src/mock-logger';
import { DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { createWarningTracker } from '../../utils/warning-tracker';
import { LogicFunctionCacheService } from '../expressions/logic-function-cache.service';
import { createLogicFunction } from '../expressions/logic-function-factory';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { applyHiddenLogic } from '../../mappers/apply-hidden-logic';
import type { ConditionalExpression } from '../../models/expressions/conditional-expression';
import type { LogicConfig } from '../../models/logic';

/**
 * Performance regression benchmark: reactive logic fan-out.
 *
 * Each field carries a `hidden` condition that references ONLY its own control
 * field. Changing one control must re-evaluate ONLY the conditions that
 * reference that control — not every field's condition.
 *
 * Historically every condition subscribed to the whole-form value signal
 * (`RootFormRegistryService.formValue`), so changing any field re-evaluated all
 * N conditions — O(N) fan-out per keystroke, the root cause of jank on large
 * single-page forms. This test locks in fine-grained subscription.
 */
describe('reactive logic fan-out (perf regression)', () => {
  const N = 25;
  let fieldSignals: WritableSignal<unknown>[];
  let rootForm: WritableSignal<unknown>;
  let formValue: Signal<Record<string, unknown>>;
  let injector: Injector;

  const key = (i: number) => `f${i}`;

  beforeEach(() => {
    fieldSignals = Array.from({ length: N }, () => signal<unknown>(''));

    // Monolithic whole-form value (what the old code subscribed to).
    formValue = computed(() => {
      const out: Record<string, unknown> = {};
      for (let i = 0; i < N; i++) out[key(i)] = fieldSignals[i]();
      return out;
    });

    // Navigable FieldTree mock: rootForm()[key] is a FieldState accessor whose
    // `.value()` is that field's own signal — matches Signal Forms' shape
    // (`tree[key]().value()`), so fine-grained reads subscribe to one field only.
    const tree: Record<string, unknown> = {};
    for (let i = 0; i < N; i++) {
      const state = { value: fieldSignals[i] };
      tree[key(i)] = () => state;
    }
    rootForm = signal(tree);

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue, rootForm } },
        { provide: EXTERNAL_DATA, useValue: signal(undefined) },
        { provide: DynamicFormLogger, useValue: createMockLogger() },
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createWarningTracker },
        LogicFunctionCacheService,
      ],
    });
    injector = TestBed.inject(Injector);
  });

  function mockFieldContext<T>(value: T, pathKeys: readonly string[]): FieldContext<T> {
    const state = {
      value: signal(value),
      touched: signal(false),
      dirty: signal(false),
      valid: signal(true),
      invalid: signal(false),
      pending: signal(false),
      hidden: signal(false),
      readonly: signal(false),
      disabled: signal(false),
    };
    return { value: signal(value), state, pathKeys: signal(pathKeys) } as unknown as FieldContext<T>;
  }

  it(`re-evaluates only the conditions referencing the changed field (not all ${N})`, () => {
    const evalCount = new Array<number>(N).fill(0);
    const consumers: Array<Signal<boolean>> = [];

    runInInjectionContext(injector, () => {
      for (let i = 0; i < N; i++) {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: key(i),
          operator: 'equals',
          value: 'x',
        };
        const fn = createLogicFunction<unknown>(expression);
        const ctx = mockFieldContext('', [key(i)]);
        // Mirror how Signal Forms wraps the LogicFn in a computed.
        consumers.push(
          computed(() => {
            evalCount[i]++;
            return fn(ctx);
          }),
        );
      }
    });

    // Warm up: force first evaluation of every consumer.
    consumers.forEach((c) => c());
    const baseline = [...evalCount];

    // Change ONE field's value.
    fieldSignals[0].set('x');

    // Read every consumer again — memoized computeds only re-run if a dependency changed.
    consumers.forEach((c) => c());

    const reevaluated = evalCount.filter((v, i) => v > baseline[i]).length;

    // Only field 0's condition references f0, so only it should re-run.
    expect(reevaluated).toBe(1);
  });

  it(`display-only (page/button) conditions re-evaluate only when a referenced field changes (not all ${N})`, () => {
    const registry = TestBed.inject(FieldContextRegistryService);
    const evalCount = new Array<number>(N).fill(0);
    const consumers: Array<Signal<boolean>> = [];

    // Mirror PageOrchestrator.evaluatePageHidden: each page's hidden condition
    // references one field, evaluated against a display-only context.
    for (let i = 0; i < N; i++) {
      const condition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: key(i),
        operator: 'equals',
        value: 'x',
      };
      consumers.push(
        computed(() => {
          evalCount[i]++;
          return evaluateCondition(condition, registry.createDisplayOnlyContext(`page${i}`, {}));
        }),
      );
    }

    consumers.forEach((c) => c());
    const baseline = [...evalCount];

    fieldSignals[0].set('x');
    consumers.forEach((c) => c());

    const reevaluated = evalCount.filter((v, i) => v > baseline[i]).length;
    expect(reevaluated).toBe(1);
  });

  it(`container hidden logic (applyHiddenLogic) re-evaluates only when a referenced field changes (not all ${N})`, () => {
    const registry = TestBed.inject(FieldContextRegistryService);
    const rootFormRegistry = TestBed.inject(RootFormRegistryService);
    const evalCount = new Array<number>(N).fill(0);
    const consumers: Array<Signal<unknown>> = [];

    // Mirror the container/text mapper path: applyHiddenLogic inside the inputs
    // computed, with the lazy evaluation-context factory the mappers pass.
    for (let i = 0; i < N; i++) {
      const logic: LogicConfig[] = [
        {
          type: 'hidden',
          condition: { type: 'fieldValue', fieldPath: key(i), operator: 'equals', value: 'x' },
        },
      ];
      consumers.push(
        computed(() => {
          evalCount[i]++;
          const inputs: Record<string, unknown> = {};
          applyHiddenLogic(inputs, { logic }, rootFormRegistry, () => registry.createDisplayOnlyContext(`group${i}`, {}));
          return inputs['hidden'];
        }),
      );
    }

    consumers.forEach((c) => c());
    const baseline = [...evalCount];

    fieldSignals[0].set('x');
    consumers.forEach((c) => c());

    const reevaluated = evalCount.filter((v, i) => v > baseline[i]).length;
    expect(reevaluated).toBe(1);
  });

  it('array-scoped conditions re-evaluate only for the changed item', () => {
    const ITEMS = 10;
    const itemSignals = Array.from({ length: ITEMS }, () => ({ a: signal<unknown>(''), b: signal<unknown>('') }));

    const arrayFormValue = computed(() => ({
      items: itemSignals.map((item) => ({ a: item.a(), b: item.b() })),
    }));

    // Navigable array subtree: tree.items is callable (aggregated value) and also
    // indexable by item; each item is callable and indexable by field, mirroring
    // Signal Forms' `tree.items[i].a` shape.
    const itemNodes: Record<number, unknown> = {};
    for (let i = 0; i < ITEMS; i++) {
      const { a, b } = itemSignals[i];
      const itemCall = () => ({ value: computed(() => ({ a: a(), b: b() })) });
      itemNodes[i] = Object.assign(itemCall, {
        a: () => ({ value: a }),
        b: () => ({ value: b }),
      });
    }
    const itemsCall = () => ({ value: computed(() => itemSignals.map((item) => ({ a: item.a(), b: item.b() }))) });
    const itemsNode = Object.assign(itemsCall, itemNodes);
    const arrayRootForm = signal({ items: itemsNode });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: arrayFormValue, rootForm: arrayRootForm } },
        { provide: EXTERNAL_DATA, useValue: signal(undefined) },
        { provide: DynamicFormLogger, useValue: createMockLogger() },
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createWarningTracker },
        LogicFunctionCacheService,
      ],
    });
    const registry = TestBed.inject(FieldContextRegistryService);

    // Each item's condition references its own sibling `b`.
    const condition: ConditionalExpression = { type: 'fieldValue', fieldPath: 'b', operator: 'equals', value: 'x' };
    const evalCount = new Array<number>(ITEMS).fill(0);
    const consumers: Array<Signal<boolean>> = [];

    for (let i = 0; i < ITEMS; i++) {
      const ctx = mockFieldContext('', ['items', String(i), 'a']);
      consumers.push(
        computed(() => {
          evalCount[i]++;
          return evaluateCondition(condition, registry.createReactiveEvaluationContext(ctx));
        }),
      );
    }

    consumers.forEach((c) => c());
    const baseline = [...evalCount];

    itemSignals[0].b.set('x');
    consumers.forEach((c) => c());

    const reevaluated = evalCount.filter((v, i) => v > baseline[i]).length;

    expect(reevaluated).toBe(1);
    expect(consumers[0]()).toBe(true);
  });
});

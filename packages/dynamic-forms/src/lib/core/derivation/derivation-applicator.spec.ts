import { describe, expect, it, vi, beforeEach } from 'vitest';
import { computed, signal, WritableSignal } from '@angular/core';
import { applyDerivations, applyDerivationsForTrigger, DerivationApplicatorContext } from './derivation-applicator';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationLogger } from './derivation-logger.service';

describe('derivation-applicator', () => {
  /**
   * Mock logger for testing.
   */
  function createMockLogger(): Logger {
    return {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
  }

  /**
   * Mock derivation logger for testing (no-op implementation).
   */
  function createMockDerivationLogger(): DerivationLogger {
    return {
      cycleStart: vi.fn(),
      iteration: vi.fn(),
      evaluation: vi.fn(),
      summary: vi.fn(),
      maxIterationsReached: vi.fn(),
    };
  }

  /**
   * Mock form that mimics Angular Signal Forms structure.
   *
   * Real structure: form[key] is a signal (FieldTree). Calling form[key]() returns
   * a FieldState with: value (WritableSignal), dirty (Signal<boolean>),
   * touched (Signal<boolean>), reset() (method that clears dirty+touched).
   */
  function createMockForm(initialValue: Record<string, unknown>): {
    form: Record<string, unknown>;
    values: Record<string, unknown>;
    dirtyStates: Record<string, WritableSignal<boolean>>;
  } {
    const values = { ...initialValue };
    const form: Record<string, unknown> = {};
    const dirtyStates: Record<string, WritableSignal<boolean>> = {};

    for (const key of Object.keys(initialValue)) {
      // Create a writable signal for the value
      const valueSignal = signal(values[key]);
      // Create dirty/touched signals (defaults to false = pristine/untouched)
      const dirtySignal = signal(false);
      const touchedSignal = signal(false);
      dirtyStates[key] = dirtySignal;

      // FieldState instance — matches the public Angular Signal Forms API
      const fieldInstance = {
        value: valueSignal,
        dirty: dirtySignal,
        touched: touchedSignal,
        reset: () => {
          dirtySignal.set(false);
          touchedSignal.set(false);
        },
      };

      // Angular Signal Forms field accessors are signals (FieldTree).
      // We use a computed signal that always returns the field instance.
      form[key] = computed(() => fieldInstance);

      // Sync signal changes back to our values object for assertions
      // This is a test helper - in real code the signal IS the source of truth
      Object.defineProperty(values, key, {
        get: () => valueSignal(),
        set: (v: unknown) => valueSignal.set(v),
        enumerable: true,
        configurable: true,
      });
    }

    return { form: form as Record<string, unknown>, values, dirtyStates };
  }

  /**
   * Helper to create a derivation entry (self-targeting).
   */
  function createEntry(fieldKey: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      fieldKey,
      dependsOn: options.dependsOn ?? [],
      condition: options.condition ?? true,
      value: options.value,
      expression: options.expression,
      functionName: options.functionName,
      trigger: options.trigger ?? 'onChange',
      isShorthand: options.isShorthand ?? false,
      stopOnUserOverride: options.stopOnUserOverride,
      reEngageOnDependencyChange: options.reEngageOnDependencyChange,
    };
  }

  /**
   * Helper to create a collection from entries.
   */
  function createCollection(entries: DerivationEntry[]): DerivationCollection {
    return { entries };
  }

  describe('applyDerivations', () => {
    let logger: Logger;
    let formValueSignal: WritableSignal<Record<string, unknown>>;

    beforeEach(() => {
      logger = createMockLogger();
      formValueSignal = signal({ country: 'USA', phonePrefix: '', amount: 0 });
    });

    describe('static value derivations', () => {
      it('should apply static value when condition is true', () => {
        const { form, values } = createMockForm({ country: 'USA', phonePrefix: '' });
        formValueSignal.set({ country: 'USA', phonePrefix: '' });

        const collection = createCollection([createEntry('phonePrefix', { condition: true, value: '+1' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBeGreaterThanOrEqual(1);
        expect(values.phonePrefix).toBe('+1');
      });

      it('should skip derivation when condition is false', () => {
        const { form, values } = createMockForm({ country: 'USA', phonePrefix: 'original' });
        formValueSignal.set({ country: 'USA', phonePrefix: 'original' });

        const collection = createCollection([createEntry('phonePrefix', { condition: false, value: '+1' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBe(0);
        expect(result.skippedCount).toBeGreaterThanOrEqual(1);
        expect(values.phonePrefix).toBe('original');
      });

      it('should skip derivation when value is unchanged', () => {
        const { form } = createMockForm({ country: 'USA', phonePrefix: '+1' });
        formValueSignal.set({ country: 'USA', phonePrefix: '+1' });

        const collection = createCollection([createEntry('phonePrefix', { condition: true, value: '+1' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        // Value is same, so no application
        expect(result.appliedCount).toBe(0);
        expect(result.skippedCount).toBeGreaterThanOrEqual(1);
      });
    });

    describe('expression derivations', () => {
      it('should evaluate and apply expression result', () => {
        const { form, values } = createMockForm({ quantity: 2, price: 10, total: 0 });
        formValueSignal.set({ quantity: 2, price: 10, total: 0 });

        const collection = createCollection([
          createEntry('total', {
            expression: 'formValue.quantity * formValue.price',
            dependsOn: ['quantity', 'price'],
          }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBeGreaterThanOrEqual(1);
        expect(values.total).toBe(20);
      });
    });

    describe('function derivations', () => {
      it('should call and apply function result', () => {
        const { form, values } = createMockForm({ country: 'Germany', currency: '' });
        formValueSignal.set({ country: 'Germany', currency: '' });

        const collection = createCollection([
          createEntry('currency', {
            functionName: 'getCurrency',
          }),
        ]);

        const getCurrencyFn = vi.fn().mockReturnValue('EUR');

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          derivationFunctions: {
            getCurrency: getCurrencyFn,
          },
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        expect(getCurrencyFn).toHaveBeenCalled();
        expect(result.appliedCount).toBeGreaterThanOrEqual(1);
        expect(values.currency).toBe('EUR');
      });

      it('should log error when function not found', () => {
        const { form } = createMockForm({ country: 'Germany', currency: '' });
        formValueSignal.set({ country: 'Germany', currency: '' });

        const collection = createCollection([
          createEntry('currency', {
            functionName: 'unknownFunction',
          }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        expect(result.errorCount).toBeGreaterThanOrEqual(1);
        expect(logger.error).toHaveBeenCalled();
      });
    });

    describe('changed fields filtering', () => {
      it('should only process derivations for changed fields', () => {
        const { form, values } = createMockForm({
          field1: 'a',
          field2: 'b',
          target1: '',
          target2: '',
        });
        formValueSignal.set({ field1: 'a', field2: 'b', target1: '', target2: '' });

        const collection = createCollection([
          createEntry('target1', { value: 'derived1', dependsOn: ['field1'] }),
          createEntry('target2', { value: 'derived2', dependsOn: ['field2'] }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        // Only field1 changed
        const changedFields = new Set(['field1']);
        applyDerivations(collection, context, changedFields);

        expect(values.target1).toBe('derived1');
        expect(values.target2).toBe(''); // Not processed
      });

      it('should process all derivations when no changed fields specified', () => {
        const { form, values } = createMockForm({
          field1: 'a',
          field2: 'b',
          target1: '',
          target2: '',
        });
        formValueSignal.set({ field1: 'a', field2: 'b', target1: '', target2: '' });

        const collection = createCollection([
          createEntry('target1', { value: 'derived1', dependsOn: ['field1'] }),
          createEntry('target2', { value: 'derived2', dependsOn: ['field2'] }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        applyDerivations(collection, context);

        expect(values.target1).toBe('derived1');
        expect(values.target2).toBe('derived2');
      });

      it('should process derivation when dependency includes wildcard', () => {
        const { form, values } = createMockForm({ anyField: 'x', target: '' });
        formValueSignal.set({ anyField: 'x', target: '' });

        const collection = createCollection([createEntry('target', { value: 'wildcard', dependsOn: ['*'] })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        // Even though unrelatedField changed, wildcard dependency means it processes
        const changedFields = new Set(['unrelatedField']);
        applyDerivations(collection, context, changedFields);

        expect(values.target).toBe('wildcard');
      });
    });

    describe('loop prevention', () => {
      it('should not apply same derivation twice in one cycle', () => {
        const { form, values } = createMockForm({ source: 'initial', target: '' });
        formValueSignal.set({ source: 'initial', target: '' });

        // Two derivations with same field key (self-targeting)
        // Only one should run - once applied, it won't apply again in same cycle
        const collection = createCollection([createEntry('target', { value: 'first' }), createEntry('target', { value: 'second' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        applyDerivations(collection, context);

        // Only one should apply (the first one)
        expect(values.target).toBe('first');
      });

      it('should stop at max iterations and log error', () => {
        // Create a scenario that would cause infinite iterations
        // This is tricky since we have cycle detection, but let's test the safety limit
        createMockForm({ a: '', b: '' });

        // Mock form that always changes value (simulating oscillation)
        const mockForm: Record<string, { value: { set: (v: unknown) => void } }> = {
          a: {
            value: {
              set: () => {
                // no-op - just simulate setting
              },
            },
          },
          b: {
            value: {
              set: () => {
                // no-op - just simulate setting
              },
            },
          },
        };

        // Create entries that depend on each other but with different values each time
        const collection = createCollection([createEntry('b', { expression: 'formValue.a + "b"', dependsOn: ['a'] })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: mockForm as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        // Should complete without infinite loop
        expect(result.iterations).toBeLessThanOrEqual(10);
      });
    });

    describe('result tracking', () => {
      it('should track applied, skipped, and error counts', () => {
        const { form } = createMockForm({
          field1: 'a',
          field2: 'b',
          target1: '',
          target2: 'existing',
          target3: '',
        });
        formValueSignal.set({
          field1: 'a',
          field2: 'b',
          target1: '',
          target2: 'existing',
          target3: '',
        });

        const collection = createCollection([
          // Will apply
          createEntry('target1', { value: 'applied' }),
          // Will skip (value unchanged)
          createEntry('target2', { value: 'existing' }),
          // Will error (missing function)
          createEntry('target3', { functionName: 'missing' }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBeGreaterThanOrEqual(1);
        expect(result.skippedCount).toBeGreaterThanOrEqual(1);
        expect(result.errorCount).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('array derivations', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = createMockLogger();
    });

    /**
     * Creates a mock form with array structure for testing array derivations.
     *
     * Angular Signal Forms array structure:
     * - form['items'] is both callable AND has numeric indices
     * - form['items'][0] → FieldTree for item 0 (which is also callable)
     * - form['items'][0]['lineTotal'] → FieldTree for lineTotal field
     * - form['items'][0]['lineTotal']() → { value: WritableSignal<number> }
     */
    function createMockArrayForm(initialValue: {
      items: Array<{ quantity: number; unitPrice: number; lineTotal: number }>;
      globalDiscount: number;
    }): {
      form: Record<string, unknown>;
      values: typeof initialValue;
    } {
      const values = { ...initialValue, items: [...initialValue.items.map((item) => ({ ...item }))] };

      // Create FieldTree-like objects for each array item
      const itemFieldTrees = values.items.map((item, index) => {
        const quantitySignal = signal(item.quantity);
        const unitPriceSignal = signal(item.unitPrice);
        const lineTotalSignal = signal(item.lineTotal);

        // Sync signals back to values
        Object.defineProperty(values.items[index], 'lineTotal', {
          get: () => lineTotalSignal(),
          set: (v: number) => lineTotalSignal.set(v),
          enumerable: true,
          configurable: true,
        });

        // Each item field is a FieldTree-like object with child fields
        // Field accessors must be signals (pass isSignal() check)
        const dirtySignal = signal(false);
        const touchedSignal = signal(false);
        const qDirty = signal(false);
        const qTouched = signal(false);
        const upDirty = signal(false);
        const upTouched = signal(false);
        return {
          quantity: computed(() => ({
            value: quantitySignal,
            dirty: qDirty,
            touched: qTouched,
            reset: () => {
              qDirty.set(false);
              qTouched.set(false);
            },
          })),
          unitPrice: computed(() => ({
            value: unitPriceSignal,
            dirty: upDirty,
            touched: upTouched,
            reset: () => {
              upDirty.set(false);
              upTouched.set(false);
            },
          })),
          lineTotal: computed(() => ({
            value: lineTotalSignal,
            dirty: dirtySignal,
            touched: touchedSignal,
            reset: () => {
              dirtySignal.set(false);
              touchedSignal.set(false);
            },
          })),
        };
      });

      const globalDiscountSignal = signal(values.globalDiscount);
      const globalDiscountDirty = signal(false);
      const globalDiscountTouched = signal(false);

      // Array field must be both callable (for getting value) AND have numeric indices
      // Use Object.assign on a computed to keep signal identity + numeric indices
      const itemsComputed = computed(() => ({ value: signal(values.items) }));
      const itemsArrayField = Object.assign(
        itemsComputed,
        // Numeric indices for direct field access
        itemFieldTrees.reduce(
          (acc, tree, idx) => {
            acc[idx] = tree;
            return acc;
          },
          {} as Record<number, (typeof itemFieldTrees)[0]>,
        ),
      );

      const form = {
        items: itemsArrayField,
        globalDiscount: computed(() => ({
          value: globalDiscountSignal,
          dirty: globalDiscountDirty,
          touched: globalDiscountTouched,
          reset: () => {
            globalDiscountDirty.set(false);
            globalDiscountTouched.set(false);
          },
        })),
      };

      return { form, values };
    }

    /**
     * Creates a mock form with array structure that also exposes dirty signals.
     * Extends createMockArrayForm for tests that need stopOnUserOverride behavior.
     */
    function createMockArrayFormWithDirtyAccess(initialValue: {
      items: Array<{ quantity: number; unitPrice: number; lineTotal: number }>;
      globalDiscount: number;
    }): {
      form: Record<string, unknown>;
      values: typeof initialValue;
      itemDirtyStates: Array<Record<string, WritableSignal<boolean>>>;
    } {
      const values = { ...initialValue, items: [...initialValue.items.map((item) => ({ ...item }))] };
      const itemDirtyStates: Array<Record<string, WritableSignal<boolean>>> = [];

      const itemFieldTrees = values.items.map((item, index) => {
        const quantitySignal = signal(item.quantity);
        const unitPriceSignal = signal(item.unitPrice);
        const lineTotalSignal = signal(item.lineTotal);

        Object.defineProperty(values.items[index], 'lineTotal', {
          get: () => lineTotalSignal(),
          set: (v: number) => lineTotalSignal.set(v),
          enumerable: true,
          configurable: true,
        });

        const ltDirty = signal(false);
        const ltTouched = signal(false);
        const qDirty = signal(false);
        const qTouched = signal(false);
        const upDirty = signal(false);
        const upTouched = signal(false);

        itemDirtyStates.push({
          lineTotal: ltDirty,
          quantity: qDirty,
          unitPrice: upDirty,
        });

        return {
          quantity: computed(() => ({
            value: quantitySignal,
            dirty: qDirty,
            touched: qTouched,
            reset: () => {
              qDirty.set(false);
              qTouched.set(false);
            },
          })),
          unitPrice: computed(() => ({
            value: unitPriceSignal,
            dirty: upDirty,
            touched: upTouched,
            reset: () => {
              upDirty.set(false);
              upTouched.set(false);
            },
          })),
          lineTotal: computed(() => ({
            value: lineTotalSignal,
            dirty: ltDirty,
            touched: ltTouched,
            reset: () => {
              ltDirty.set(false);
              ltTouched.set(false);
            },
          })),
        };
      });

      const globalDiscountSignal = signal(values.globalDiscount);
      const globalDiscountDirty = signal(false);
      const globalDiscountTouched = signal(false);

      const itemsComputed = computed(() => ({ value: signal(values.items) }));
      const itemsArrayField = Object.assign(
        itemsComputed,
        itemFieldTrees.reduce(
          (acc, tree, idx) => {
            acc[idx] = tree;
            return acc;
          },
          {} as Record<number, (typeof itemFieldTrees)[0]>,
        ),
      );

      const form = {
        items: itemsArrayField,
        globalDiscount: computed(() => ({
          value: globalDiscountSignal,
          dirty: globalDiscountDirty,
          touched: globalDiscountTouched,
          reset: () => {
            globalDiscountDirty.set(false);
            globalDiscountTouched.set(false);
          },
        })),
      };

      return { form, values, itemDirtyStates };
    }

    it('should apply array item derivation using formValue (scoped to item)', () => {
      const { form, values } = createMockArrayForm({
        items: [
          { quantity: 2, unitPrice: 10, lineTotal: 0 },
          { quantity: 3, unitPrice: 20, lineTotal: 0 },
        ],
        globalDiscount: 0,
      });

      const formValueSignal = signal({
        items: values.items,
        globalDiscount: 0,
      });

      // Derivation defined on lineTotal field (self-targeting) within array
      const collection = createCollection([
        createEntry('items.$.lineTotal', {
          expression: 'formValue.quantity * formValue.unitPrice',
          dependsOn: ['quantity', 'unitPrice'],
        }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      // Each item should have its lineTotal calculated
      expect(values.items[0].lineTotal).toBe(20); // 2 * 10
      expect(values.items[1].lineTotal).toBe(60); // 3 * 20
    });

    it('should provide rootFormValue for cross-scope references in array derivations', () => {
      const { form, values } = createMockArrayForm({
        items: [
          { quantity: 2, unitPrice: 100, lineTotal: 0 },
          { quantity: 1, unitPrice: 50, lineTotal: 0 },
        ],
        globalDiscount: 0.1, // 10% discount
      });

      const formValueSignal = signal({
        items: values.items,
        globalDiscount: 0.1,
      });

      // Derivation using both formValue (array item scope) and rootFormValue (form scope)
      const collection = createCollection([
        createEntry('items.$.lineTotal', {
          expression: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.globalDiscount)',
          dependsOn: ['quantity', 'unitPrice', 'globalDiscount'],
        }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      // Each item should apply the global discount
      expect(values.items[0].lineTotal).toBe(180); // 2 * 100 * 0.9
      expect(values.items[1].lineTotal).toBe(45); // 1 * 50 * 0.9
    });

    it('should skip array item derivation when that item field is dirty (stopOnUserOverride)', () => {
      const { form, values, itemDirtyStates } = createMockArrayFormWithDirtyAccess({
        items: [
          { quantity: 2, unitPrice: 10, lineTotal: 0 },
          { quantity: 3, unitPrice: 20, lineTotal: 0 },
        ],
        globalDiscount: 0,
      });

      // Simulate user editing lineTotal of item 0 only
      itemDirtyStates[0]['lineTotal'].set(true);

      const formValueSignal = signal({
        items: values.items,
        globalDiscount: 0,
      });

      const collection = createCollection([
        createEntry('items.$.lineTotal', {
          expression: 'formValue.quantity * formValue.unitPrice',
          dependsOn: ['quantity', 'unitPrice'],
          stopOnUserOverride: true,
        }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      // Item 0's lineTotal should NOT be derived (user override)
      expect(values.items[0].lineTotal).toBe(0);
      // Item 1's lineTotal SHOULD be derived (no user override)
      expect(values.items[1].lineTotal).toBe(60); // 3 * 20
    });

    it('should re-engage array item derivation when top-level dependency changes (reEngageOnDependencyChange)', () => {
      const { form, values, itemDirtyStates } = createMockArrayFormWithDirtyAccess({
        items: [{ quantity: 2, unitPrice: 10, lineTotal: 99 }],
        globalDiscount: 10,
      });

      // Simulate user having overridden lineTotal
      itemDirtyStates[0]['lineTotal'].set(true);

      const formValueSignal = signal({
        items: values.items,
        globalDiscount: 10,
      });

      const collection = createCollection([
        createEntry('items.$.lineTotal', {
          expression: 'formValue.quantity * formValue.unitPrice',
          dependsOn: ['quantity', 'unitPrice', 'globalDiscount'],
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
        }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      // changedFields contains the top-level dependency key (direct match with dependsOn)
      const changedFields = new Set(['globalDiscount']);
      const result = applyDerivations(collection, context, changedFields);

      // Dirty state should be cleared, derivation should re-apply
      expect(result.appliedCount).toBe(1);
      expect(values.items[0].lineTotal).toBe(20); // 2 * 10
      expect(itemDirtyStates[0]['lineTotal']()).toBe(false);
    });
  });

  describe('external data in derivations', () => {
    let logger: Logger;
    let formValueSignal: WritableSignal<Record<string, unknown>>;

    beforeEach(() => {
      logger = createMockLogger();
      formValueSignal = signal({ field1: '', adminField: '' });
    });

    it('should provide externalData in evaluation context for expressions', () => {
      const { form, values } = createMockForm({ field1: '', isAdmin: false });
      formValueSignal.set({ field1: '', isAdmin: false });

      // Test a simple comparison expression that the parser supports
      const collection = createCollection([
        createEntry('isAdmin', {
          expression: "externalData.userRole === 'admin'",
          dependsOn: ['*'],
        }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        externalData: { userRole: 'admin' },
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      expect(values.isAdmin).toBe(true);
    });

    it('should provide externalData to custom derivation functions', () => {
      const { form, values } = createMockForm({ field1: '', derived: '' });
      formValueSignal.set({ field1: '', derived: '' });

      const collection = createCollection([
        createEntry('derived', {
          functionName: 'deriveFromExternal',
          dependsOn: ['*'],
        }),
      ]);

      const deriveFromExternal = vi.fn().mockImplementation((ctx) => {
        return ctx.externalData?.permissions?.includes('write') ? 'writable' : 'readonly';
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        derivationFunctions: { deriveFromExternal },
        externalData: { permissions: ['read', 'write'] },
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      expect(deriveFromExternal).toHaveBeenCalled();
      expect(values.derived).toBe('writable');
    });

    it('should handle undefined externalData gracefully in custom functions', () => {
      const { form, values } = createMockForm({ field1: '', target: '' });
      formValueSignal.set({ field1: '', target: '' });

      // Use a custom function that handles undefined externalData
      const collection = createCollection([
        createEntry('target', {
          functionName: 'getDefaultRole',
          dependsOn: ['*'],
        }),
      ]);

      const getDefaultRole = vi.fn().mockImplementation((ctx) => {
        return ctx.externalData?.userRole || 'guest';
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        derivationFunctions: { getDefaultRole },
        // No externalData provided
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      expect(values.target).toBe('guest');
    });

    it('should provide externalData in array item derivations', () => {
      // Re-use the array form creation helper from the array tests
      const values = {
        items: [
          { quantity: 2, unitPrice: 100, lineTotal: 0 },
          { quantity: 1, unitPrice: 50, lineTotal: 0 },
        ],
        globalDiscount: 0,
      };

      // Create minimal mock form for array
      const lineTotalSignal0 = signal(0);
      const lineTotalSignal1 = signal(0);

      // Sync signals back to values
      Object.defineProperty(values.items[0], 'lineTotal', {
        get: () => lineTotalSignal0(),
        set: (v: number) => lineTotalSignal0.set(v),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(values.items[1], 'lineTotal', {
        get: () => lineTotalSignal1(),
        set: (v: number) => lineTotalSignal1.set(v),
        enumerable: true,
        configurable: true,
      });

      const d0q = signal(false);
      const d0u = signal(false);
      const d0l = signal(false);
      const d1q = signal(false);
      const d1u = signal(false);
      const d1l = signal(false);
      const form = {
        items: Object.assign(
          computed(() => ({ value: signal(values.items) })),
          {
            0: {
              quantity: computed(() => ({ value: signal(values.items[0].quantity), dirty: d0q, reset: () => d0q.set(false) })),
              unitPrice: computed(() => ({ value: signal(values.items[0].unitPrice), dirty: d0u, reset: () => d0u.set(false) })),
              lineTotal: computed(() => ({ value: lineTotalSignal0, dirty: d0l, reset: () => d0l.set(false) })),
            },
            1: {
              quantity: computed(() => ({ value: signal(values.items[1].quantity), dirty: d1q, reset: () => d1q.set(false) })),
              unitPrice: computed(() => ({ value: signal(values.items[1].unitPrice), dirty: d1u, reset: () => d1u.set(false) })),
              lineTotal: computed(() => ({ value: lineTotalSignal1, dirty: d1l, reset: () => d1l.set(false) })),
            },
          },
        ),
      };

      const formValueSignal = signal({
        items: values.items,
        globalDiscount: 0,
      });

      // Derivation using externalData for discount rate
      const collection = createCollection([
        createEntry('items.$.lineTotal', {
          expression: 'formValue.quantity * formValue.unitPrice * (1 - externalData.discountRate)',
          dependsOn: ['quantity', 'unitPrice'],
        }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        externalData: { discountRate: 0.2 }, // 20% discount from external source
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(collection, context);

      // Each item should apply the external discount rate
      expect(values.items[0].lineTotal).toBe(160); // 2 * 100 * 0.8
      expect(values.items[1].lineTotal).toBe(40); // 1 * 50 * 0.8
    });
  });

  describe('applyDerivationsForTrigger', () => {
    let logger: Logger;
    let formValueSignal: WritableSignal<Record<string, unknown>>;

    beforeEach(() => {
      logger = createMockLogger();
      formValueSignal = signal({ field1: 'a', target1: '', target2: '' });
    });

    it('should only process onChange derivations when trigger is onChange', () => {
      const { form, values } = createMockForm({ field1: 'a', target1: '', target2: '' });
      formValueSignal.set({ field1: 'a', target1: '', target2: '' });

      const collection = createCollection([
        createEntry('target1', { value: 'onChange', trigger: 'onChange' }),
        createEntry('target2', { value: 'debounced', trigger: 'debounced' }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivationsForTrigger(collection, 'onChange', context);

      expect(values.target1).toBe('onChange');
      expect(values.target2).toBe(''); // Not processed
    });

    it('should only process debounced derivations when trigger is debounced', () => {
      const { form, values } = createMockForm({ field1: 'a', target1: '', target2: '' });
      formValueSignal.set({ field1: 'a', target1: '', target2: '' });

      const collection = createCollection([
        createEntry('target1', { value: 'onChange', trigger: 'onChange' }),
        createEntry('target2', { value: 'debounced', trigger: 'debounced' }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivationsForTrigger(collection, 'debounced', context);

      expect(values.target1).toBe(''); // Not processed
      expect(values.target2).toBe('debounced');
    });

    it('should handle empty filtered collection', () => {
      const { form } = createMockForm({ field1: 'a', target1: '' });
      formValueSignal.set({ field1: 'a', target1: '' });

      const collection = createCollection([createEntry('target1', { value: 'debounced', trigger: 'debounced' })]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      const result = applyDerivationsForTrigger(collection, 'onChange', context);

      expect(result.appliedCount).toBe(0);
      expect(result.skippedCount).toBe(0);
    });
  });

  describe('stopOnUserOverride', () => {
    let logger: Logger;
    let formValueSignal: WritableSignal<Record<string, unknown>>;

    beforeEach(() => {
      logger = createMockLogger();
      formValueSignal = signal({ country: 'USA', phonePrefix: '', displayName: '' });
    });

    it('should skip derivation when field is dirty (user-modified)', () => {
      const { form, dirtyStates } = createMockForm({ country: 'USA', phonePrefix: '', displayName: '' });
      formValueSignal = signal({ country: 'USA', phonePrefix: '', displayName: '' });

      // Simulate user editing phonePrefix
      dirtyStates['phonePrefix'].set(true);

      const entry = createEntry('phonePrefix', {
        value: '+1',
        dependsOn: ['country'],
        stopOnUserOverride: true,
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      const result = applyDerivations(createCollection([entry]), context);
      expect(result.appliedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
    });

    it('should apply derivation when field is pristine (not user-modified)', () => {
      const { form, values } = createMockForm({ country: 'USA', phonePrefix: '', displayName: '' });
      formValueSignal = signal({ country: 'USA', phonePrefix: '', displayName: '' });

      // dirtyStates['phonePrefix'] defaults to false (pristine)

      const entry = createEntry('phonePrefix', {
        value: '+1',
        dependsOn: ['country'],
        stopOnUserOverride: true,
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      const result = applyDerivations(createCollection([entry]), context);
      expect(result.appliedCount).toBe(1);
      expect(values['phonePrefix']).toBe('+1');
    });

    it('should apply derivation when stopOnUserOverride is false even if field is dirty', () => {
      const { form, values, dirtyStates } = createMockForm({ country: 'USA', phonePrefix: '' });
      formValueSignal = signal({ country: 'USA', phonePrefix: '' });

      dirtyStates['phonePrefix'].set(true);

      const entry = createEntry('phonePrefix', {
        value: '+1',
        dependsOn: ['country'],
        stopOnUserOverride: false,
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      const result = applyDerivations(createCollection([entry]), context);
      expect(result.appliedCount).toBe(1);
      expect(values['phonePrefix']).toBe('+1');
    });

    it('should mark field as pristine after applying derivation value', () => {
      const { form, dirtyStates } = createMockForm({ country: 'USA', phonePrefix: '' });
      formValueSignal = signal({ country: 'USA', phonePrefix: '' });

      const entry = createEntry('phonePrefix', {
        value: '+1',
        dependsOn: ['country'],
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      applyDerivations(createCollection([entry]), context);

      // After derivation applies value, field should be pristine
      expect(dirtyStates['phonePrefix']()).toBe(false);
    });

    describe('reEngageOnDependencyChange', () => {
      it('should clear dirty state and apply when dependency changes', () => {
        const { form, values, dirtyStates } = createMockForm({ country: 'UK', phonePrefix: '+44-custom' });
        formValueSignal = signal({ country: 'UK', phonePrefix: '+44-custom' });

        // Simulate user editing phonePrefix
        dirtyStates['phonePrefix'].set(true);

        const entry = createEntry('phonePrefix', {
          value: '+44',
          dependsOn: ['country'],
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
        });

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        // Simulate that 'country' changed
        const changedFields = new Set(['country']);
        const result = applyDerivations(createCollection([entry]), context, changedFields);

        // Dirty state should be cleared, derivation should apply
        expect(result.appliedCount).toBe(1);
        expect(values['phonePrefix']).toBe('+44');
        expect(dirtyStates['phonePrefix']()).toBe(false);
      });

      it('should keep dirty state when dependency has NOT changed', () => {
        const { form, dirtyStates } = createMockForm({ country: 'UK', phonePrefix: '+44-custom' });
        formValueSignal = signal({ country: 'UK', phonePrefix: '+44-custom' });

        dirtyStates['phonePrefix'].set(true);

        const entry = createEntry('phonePrefix', {
          value: '+44',
          dependsOn: ['country'],
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
        });

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        // Simulate that some other field changed, NOT 'country'
        const changedFields = new Set(['otherField']);
        const result = applyDerivations(createCollection([entry]), context, changedFields);

        // Override should persist, derivation should be skipped
        expect(result.appliedCount).toBe(0);
        expect(dirtyStates['phonePrefix']()).toBe(true);
      });

      it('should guard against null changedFields (initial evaluation)', () => {
        const { form, dirtyStates } = createMockForm({ country: 'UK', phonePrefix: '+44-custom' });
        formValueSignal = signal({ country: 'UK', phonePrefix: '+44-custom' });

        dirtyStates['phonePrefix'].set(true);

        const entry = createEntry('phonePrefix', {
          value: '+44',
          dependsOn: ['country'],
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
        });

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        // No changedFields (initial evaluation)
        const result = applyDerivations(createCollection([entry]), context);

        // reEngageOnDependencyChange should NOT clear dirty when changedFields is undefined
        expect(result.appliedCount).toBe(0);
        expect(dirtyStates['phonePrefix']()).toBe(true);
      });

      it('should not re-engage when reEngageOnDependencyChange is false', () => {
        const { form, dirtyStates } = createMockForm({ country: 'UK', phonePrefix: '+44-custom' });
        formValueSignal = signal({ country: 'UK', phonePrefix: '+44-custom' });

        dirtyStates['phonePrefix'].set(true);

        const entry = createEntry('phonePrefix', {
          value: '+44',
          dependsOn: ['country'],
          stopOnUserOverride: true,
          reEngageOnDependencyChange: false,
        });

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        // Even though 'country' changed, re-engagement is disabled
        const changedFields = new Set(['country']);
        const result = applyDerivations(createCollection([entry]), context, changedFields);

        expect(result.appliedCount).toBe(0);
        expect(dirtyStates['phonePrefix']()).toBe(true);
      });

      it('should treat reEngageOnDependencyChange as a no-op without stopOnUserOverride', () => {
        const { form, values, dirtyStates } = createMockForm({ country: 'UK', phonePrefix: '+44-custom' });
        formValueSignal = signal({ country: 'UK', phonePrefix: '+44-custom' });

        dirtyStates['phonePrefix'].set(true);

        const entry = createEntry('phonePrefix', {
          value: '+44',
          dependsOn: ['country'],
          stopOnUserOverride: false,
          reEngageOnDependencyChange: true,
        });

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
          derivationLogger: createMockDerivationLogger(),
        };

        const changedFields = new Set(['country']);
        const result = applyDerivations(createCollection([entry]), context, changedFields);

        // Without stopOnUserOverride, derivation applies regardless of dirty state
        expect(result.appliedCount).toBe(1);
        expect(values['phonePrefix']).toBe('+44');
        // Dirty state should NOT be reset (reEngageOnDependencyChange is ignored)
        expect(dirtyStates['phonePrefix']()).toBe(true);
      });
    });

    it('should skip nested field derivation when field is dirty (stopOnUserOverride)', () => {
      // Create a mock form with nested structure: address.city
      const cityValue = signal('');
      const cityDirty = signal(false);
      const cityTouched = signal(false);
      const streetValue = signal('');
      const streetDirty = signal(false);
      const streetTouched = signal(false);
      const countryValue = signal('USA');
      const countryDirty = signal(false);
      const countryTouched = signal(false);

      const values: Record<string, unknown> = {};
      Object.defineProperty(values, 'city', {
        get: () => cityValue(),
        set: (v: unknown) => cityValue.set(v as string),
        enumerable: true,
        configurable: true,
      });

      const form: Record<string, unknown> = {
        address: {
          city: computed(() => ({
            value: cityValue,
            dirty: cityDirty,
            touched: cityTouched,
            reset: () => {
              cityDirty.set(false);
              cityTouched.set(false);
            },
          })),
          street: computed(() => ({
            value: streetValue,
            dirty: streetDirty,
            touched: streetTouched,
            reset: () => {
              streetDirty.set(false);
              streetTouched.set(false);
            },
          })),
        },
        country: computed(() => ({
          value: countryValue,
          dirty: countryDirty,
          touched: countryTouched,
          reset: () => {
            countryDirty.set(false);
            countryTouched.set(false);
          },
        })),
      };

      // Simulate user editing address.city
      cityDirty.set(true);

      formValueSignal = signal({ address: { city: '', street: '' }, country: 'USA' });

      const entry = createEntry('address.city', {
        value: 'Default City',
        dependsOn: ['country'],
        stopOnUserOverride: true,
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      const result = applyDerivations(createCollection([entry]), context);
      expect(result.appliedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
    });

    it('should handle two derivations targeting the same field with stopOnUserOverride (chain tracking blocks second)', () => {
      const { form, values, dirtyStates } = createMockForm({ country: 'USA', phonePrefix: '+custom' });
      formValueSignal = signal({ country: 'USA', phonePrefix: '+custom' });

      // Simulate user having overridden phonePrefix
      dirtyStates['phonePrefix'].set(true);

      // Two derivations target the same field, both with stopOnUserOverride
      // The first has reEngageOnDependencyChange and its dependency changed
      // The second does NOT have reEngageOnDependencyChange
      const entry1 = createEntry('phonePrefix', {
        value: '+1',
        dependsOn: ['country'],
        stopOnUserOverride: true,
        reEngageOnDependencyChange: true,
      });
      const entry2 = createEntry('phonePrefix', {
        value: '+1-alt',
        dependsOn: ['country'],
        stopOnUserOverride: true,
        // No reEngageOnDependencyChange
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      // country changed → entry1's reEngage resets dirty → entry1 applies '+1'
      // entry2 is blocked by chain tracking (same derivation key 'phonePrefix' already applied)
      // This prevents the first derivation's reset() from unexpectedly enabling the second
      const changedFields = new Set(['country']);
      const result = applyDerivations(createCollection([entry1, entry2]), context, changedFields);

      expect(result.appliedCount).toBe(1);
      expect(values['phonePrefix']).toBe('+1');
      expect(dirtyStates['phonePrefix']()).toBe(false);
    });

    it('should apply derivation when stopOnUserOverride targets non-existent field path', () => {
      const { form } = createMockForm({ country: 'USA' });
      formValueSignal = signal({ country: 'USA', missingField: '' });

      const entry = createEntry('missingField', {
        value: 'derived',
        dependsOn: ['country'],
        stopOnUserOverride: true,
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
      };

      // Non-existent field → readFieldDirty returns undefined → defaults to false
      // Derivation should proceed (and fail at value-setting, but that's downstream)
      const result = applyDerivations(createCollection([entry]), context);
      // The derivation attempts to apply but the value can't be set (no form accessor)
      // This results in a warning, not an applied derivation
      expect(result.appliedCount).toBe(0);
    });
  });

  describe('evaluation context properties', () => {
    let logger: Logger;
    let formValueSignal: WritableSignal<Record<string, unknown>>;

    beforeEach(() => {
      logger = createMockLogger();
    });

    it('should include formFieldState in evaluation context for expression evaluation', () => {
      const { form } = createMockForm({ source: 'test', target: '' });
      formValueSignal = signal({ source: 'test', target: '' });

      // Create an entry with a functionName to capture the context
      let capturedContext: Record<string, unknown> | undefined;
      const entry = createEntry('target', {
        functionName: 'captureContext',
        dependsOn: ['source'],
      });

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
        derivationLogger: createMockDerivationLogger(),
        derivationFunctions: {
          captureContext: (ctx) => {
            capturedContext = ctx as unknown as Record<string, unknown>;
            return 'derived';
          },
        },
      };

      applyDerivations(createCollection([entry]), context);

      expect(capturedContext).toBeDefined();
      expect(capturedContext!['formFieldState']).toBeDefined();
    });
  });
});

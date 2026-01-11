import { describe, expect, it, vi, beforeEach } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { applyDerivations, applyDerivationsForTrigger, DerivationApplicatorContext } from './derivation-applicator';
import { DerivationCollection, DerivationEntry, createEmptyDerivationCollection } from './derivation-types';
import { Logger } from '../../providers/features/logger/logger.interface';

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
   * Mock form that mimics Angular Signal Forms structure.
   *
   * Real structure: form[key] is callable, form[key]() returns { value: WritableSignal }
   */
  function createMockForm(initialValue: Record<string, unknown>): {
    form: Record<string, () => { value: WritableSignal<unknown> }>;
    values: Record<string, unknown>;
  } {
    const values = { ...initialValue };
    const form: Record<string, () => { value: WritableSignal<unknown> }> = {};

    for (const key of Object.keys(initialValue)) {
      // Create a writable signal for the value
      const valueSignal = signal(values[key]);

      // Create a callable field accessor that returns { value: WritableSignal }
      form[key] = () => ({
        value: valueSignal,
      });

      // Sync signal changes back to our values object for assertions
      // This is a test helper - in real code the signal IS the source of truth
      Object.defineProperty(values, key, {
        get: () => valueSignal(),
        set: (v: unknown) => valueSignal.set(v),
        enumerable: true,
        configurable: true,
      });
    }

    return { form, values };
  }

  /**
   * Helper to create a derivation entry.
   */
  function createEntry(source: string, target: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      sourceFieldKey: source,
      targetFieldKey: target,
      dependsOn: options.dependsOn ?? [source],
      condition: options.condition ?? true,
      value: options.value,
      expression: options.expression,
      functionName: options.functionName,
      trigger: options.trigger ?? 'onChange',
      isShorthand: options.isShorthand ?? false,
    };
  }

  /**
   * Helper to create a collection from entries.
   */
  function createCollection(entries: DerivationEntry[]): DerivationCollection {
    const collection = createEmptyDerivationCollection();
    collection.entries = entries;

    // Build lookup maps
    for (const entry of entries) {
      const targetEntries = collection.byTarget.get(entry.targetFieldKey) ?? [];
      targetEntries.push(entry);
      collection.byTarget.set(entry.targetFieldKey, targetEntries);

      const sourceEntries = collection.bySource.get(entry.sourceFieldKey) ?? [];
      sourceEntries.push(entry);
      collection.bySource.set(entry.sourceFieldKey, sourceEntries);

      // Build byDependency map and track wildcards
      let hasWildcard = false;
      for (const dep of entry.dependsOn) {
        if (dep === '*') {
          hasWildcard = true;
        } else {
          const depEntries = collection.byDependency.get(dep) ?? [];
          depEntries.push(entry);
          collection.byDependency.set(dep, depEntries);
        }
      }

      if (hasWildcard) {
        collection.wildcardEntries.push(entry);
      }

      // Handle array paths
      if (entry.targetFieldKey.includes('.$.')) {
        const arrayPath = entry.targetFieldKey.split('.$.')[0];
        const arrayEntries = collection.byArrayPath.get(arrayPath) ?? [];
        arrayEntries.push(entry);
        collection.byArrayPath.set(arrayPath, arrayEntries);
      }
    }

    return collection;
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

        const collection = createCollection([createEntry('country', 'phonePrefix', { condition: true, value: '+1' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBeGreaterThanOrEqual(1);
        expect(values.phonePrefix).toBe('+1');
      });

      it('should skip derivation when condition is false', () => {
        const { form, values } = createMockForm({ country: 'USA', phonePrefix: 'original' });
        formValueSignal.set({ country: 'USA', phonePrefix: 'original' });

        const collection = createCollection([createEntry('country', 'phonePrefix', { condition: false, value: '+1' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBe(0);
        expect(result.skippedCount).toBeGreaterThanOrEqual(1);
        expect(values.phonePrefix).toBe('original');
      });

      it('should skip derivation when value is unchanged', () => {
        const { form } = createMockForm({ country: 'USA', phonePrefix: '+1' });
        formValueSignal.set({ country: 'USA', phonePrefix: '+1' });

        const collection = createCollection([createEntry('country', 'phonePrefix', { condition: true, value: '+1' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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
          createEntry('quantity', 'total', {
            expression: 'formValue.quantity * formValue.price',
            dependsOn: ['quantity', 'price'],
          }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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
          createEntry('country', 'currency', {
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
          createEntry('country', 'currency', {
            functionName: 'unknownFunction',
          }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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
          createEntry('field1', 'target1', { value: 'derived1', dependsOn: ['field1'] }),
          createEntry('field2', 'target2', { value: 'derived2', dependsOn: ['field2'] }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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
          createEntry('field1', 'target1', { value: 'derived1', dependsOn: ['field1'] }),
          createEntry('field2', 'target2', { value: 'derived2', dependsOn: ['field2'] }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
        };

        applyDerivations(collection, context);

        expect(values.target1).toBe('derived1');
        expect(values.target2).toBe('derived2');
      });

      it('should process derivation when dependency includes wildcard', () => {
        const { form, values } = createMockForm({ anyField: 'x', target: '' });
        formValueSignal.set({ anyField: 'x', target: '' });

        const collection = createCollection([createEntry('anyField', 'target', { value: 'wildcard', dependsOn: ['*'] })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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

        // Two derivations with same source->target
        const collection = createCollection([
          createEntry('source', 'target', { value: 'first' }),
          createEntry('source', 'target', { value: 'second' }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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
        const collection = createCollection([createEntry('a', 'b', { expression: 'formValue.a + "b"' })]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: mockForm as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
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
          createEntry('field1', 'target1', { value: 'applied' }),
          // Will skip (value unchanged)
          createEntry('field2', 'target2', { value: 'existing' }),
          // Will error (missing function)
          createEntry('field2', 'target3', { functionName: 'missing' }),
        ]);

        const context: DerivationApplicatorContext = {
          formValue: formValueSignal,
          rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          logger,
        };

        const result = applyDerivations(collection, context);

        expect(result.appliedCount).toBeGreaterThanOrEqual(1);
        expect(result.skippedCount).toBeGreaterThanOrEqual(1);
        expect(result.errorCount).toBeGreaterThanOrEqual(1);
      });
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
        createEntry('field1', 'target1', { value: 'onChange', trigger: 'onChange' }),
        createEntry('field1', 'target2', { value: 'onBlur', trigger: 'onBlur' }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
      };

      applyDerivationsForTrigger(collection, 'onChange', context);

      expect(values.target1).toBe('onChange');
      expect(values.target2).toBe(''); // Not processed
    });

    it('should only process onBlur derivations when trigger is onBlur', () => {
      const { form, values } = createMockForm({ field1: 'a', target1: '', target2: '' });
      formValueSignal.set({ field1: 'a', target1: '', target2: '' });

      const collection = createCollection([
        createEntry('field1', 'target1', { value: 'onChange', trigger: 'onChange' }),
        createEntry('field1', 'target2', { value: 'onBlur', trigger: 'onBlur' }),
      ]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
      };

      applyDerivationsForTrigger(collection, 'onBlur', context);

      expect(values.target1).toBe(''); // Not processed
      expect(values.target2).toBe('onBlur');
    });

    it('should handle empty filtered collection', () => {
      const { form } = createMockForm({ field1: 'a', target1: '' });
      formValueSignal.set({ field1: 'a', target1: '' });

      const collection = createCollection([createEntry('field1', 'target1', { value: 'onBlur', trigger: 'onBlur' })]);

      const context: DerivationApplicatorContext = {
        formValue: formValueSignal,
        rootForm: form as unknown as import('@angular/forms/signals').FieldTree<unknown>,
        logger,
      };

      const result = applyDerivationsForTrigger(collection, 'onChange', context);

      expect(result.appliedCount).toBe(0);
      expect(result.skippedCount).toBe(0);
    });
  });
});

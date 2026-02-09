import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { NoopLogger } from '../../providers/features/logger/noop-logger';
import { PropertyDerivationApplicatorContext } from './property-derivation-applicator';
import { applyPropertyDerivations, applyPropertyDerivationsForTrigger } from './property-derivation-applicator';
import { PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';
import { createPropertyOverrideStore } from './property-override-store';

function createEntry(overrides: Partial<PropertyDerivationEntry> = {}): PropertyDerivationEntry {
  return {
    fieldKey: 'endDate',
    targetProperty: 'minDate',
    dependsOn: ['startDate'],
    condition: true,
    expression: 'formValue.startDate',
    trigger: 'onChange',
    ...overrides,
  };
}

function createContext(formValue: Record<string, unknown> = {}): PropertyDerivationApplicatorContext {
  const store = createPropertyOverrideStore();
  return {
    formValue: signal(formValue),
    store,
    logger: new NoopLogger(),
  };
}

describe('applyPropertyDerivations', () => {
  it('should apply a simple expression-based property derivation', () => {
    const entry = createEntry({
      fieldKey: 'endDate',
      targetProperty: 'minDate',
      expression: 'formValue.startDate',
    });
    const collection: PropertyDerivationCollection = { entries: [entry] };
    const context = createContext({ startDate: '2024-01-15' });

    const result = applyPropertyDerivations(collection, context);

    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.errorCount).toBe(0);
    expect(context.store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
  });

  it('should apply a static value property derivation', () => {
    const entry = createEntry({
      fieldKey: 'phone',
      targetProperty: 'label',
      expression: undefined,
      value: 'Mobile Phone',
      dependsOn: [],
    });
    const collection: PropertyDerivationCollection = { entries: [entry] };
    const context = createContext({});

    applyPropertyDerivations(collection, context);

    expect(context.store.getOverrides('phone')()).toEqual({ label: 'Mobile Phone' });
  });

  it('should apply a function-based property derivation', () => {
    const entry = createEntry({
      fieldKey: 'city',
      targetProperty: 'options',
      expression: undefined,
      functionName: 'getCities',
      dependsOn: ['country'],
    });
    const collection: PropertyDerivationCollection = { entries: [entry] };
    const cities = [
      { label: 'NYC', value: 'nyc' },
      { label: 'LA', value: 'la' },
    ];
    const context = createContext({ country: 'USA' });
    context.propertyDerivationFunctions = {
      getCities: () => cities,
    };

    applyPropertyDerivations(collection, context);

    expect(context.store.getOverrides('city')()).toEqual({ options: cities });
  });

  it('should skip when condition is false', () => {
    const entry = createEntry({
      condition: false,
    });
    const collection: PropertyDerivationCollection = { entries: [entry] };
    const context = createContext({ startDate: '2024-01-15' });

    const result = applyPropertyDerivations(collection, context);

    expect(result.skippedCount).toBe(1);
    expect(result.appliedCount).toBe(0);
    // Store should still be empty
    expect(context.store.getOverrides('endDate')()).toEqual({});
  });

  it('should handle errors gracefully and count them', () => {
    const entry = createEntry({
      expression: undefined,
      functionName: 'nonExistent',
    });
    const collection: PropertyDerivationCollection = { entries: [entry] };
    const context = createContext({});

    const result = applyPropertyDerivations(collection, context);

    expect(result.errorCount).toBe(1);
    expect(result.appliedCount).toBe(0);
  });

  it('should filter entries by changedFields', () => {
    const entry1 = createEntry({
      fieldKey: 'endDate',
      targetProperty: 'minDate',
      dependsOn: ['startDate'],
      expression: 'formValue.startDate',
    });
    const entry2 = createEntry({
      fieldKey: 'city',
      targetProperty: 'options',
      dependsOn: ['country'],
      expression: 'formValue.country',
    });
    const collection: PropertyDerivationCollection = { entries: [entry1, entry2] };
    const context = createContext({ startDate: '2024-01-15', country: 'USA' });

    const result = applyPropertyDerivations(collection, context, new Set(['startDate']));

    // Only entry1 should be processed (depends on startDate)
    expect(result.appliedCount).toBe(1);
    expect(context.store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
    expect(context.store.getOverrides('city')()).toEqual({});
  });

  it('should include wildcard entries when filtering by changedFields', () => {
    const entry = createEntry({
      fieldKey: 'summary',
      targetProperty: 'label',
      dependsOn: ['*'],
      expression: undefined,
      functionName: 'computeLabel',
    });
    const collection: PropertyDerivationCollection = { entries: [entry] };
    const context = createContext({});
    context.propertyDerivationFunctions = {
      computeLabel: () => 'Computed Label',
    };

    const result = applyPropertyDerivations(collection, context, new Set(['anyField']));

    expect(result.appliedCount).toBe(1);
  });

  it('should apply multiple property derivations to the same field', () => {
    const entry1 = createEntry({
      fieldKey: 'endDate',
      targetProperty: 'minDate',
      expression: 'formValue.startDate',
    });
    const entry2 = createEntry({
      fieldKey: 'endDate',
      targetProperty: 'label',
      expression: undefined,
      value: 'End Date',
      dependsOn: [],
    });
    const collection: PropertyDerivationCollection = { entries: [entry1, entry2] };
    const context = createContext({ startDate: '2024-01-15' });

    applyPropertyDerivations(collection, context);

    expect(context.store.getOverrides('endDate')()).toEqual({
      minDate: '2024-01-15',
      label: 'End Date',
    });
  });

  describe('array field property derivations', () => {
    it('should resolve $ placeholder path to per-item overrides', () => {
      const entry = createEntry({
        fieldKey: 'items.$.endDate',
        targetProperty: 'minDate',
        dependsOn: ['items'],
        expression: 'formValue.startDate',
      });
      const collection: PropertyDerivationCollection = { entries: [entry] };
      const context = createContext({
        items: [{ startDate: '2024-01-01' }, { startDate: '2024-06-15' }],
      });

      const result = applyPropertyDerivations(collection, context);

      expect(result.appliedCount).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(result.errorCount).toBe(0);
      expect(context.store.getOverrides('items.0.endDate')()).toEqual({ minDate: '2024-01-01' });
      expect(context.store.getOverrides('items.1.endDate')()).toEqual({ minDate: '2024-06-15' });
    });

    it('should give each array item its own scoped evaluation context', () => {
      const entry = createEntry({
        fieldKey: 'items.$.total',
        targetProperty: 'label',
        dependsOn: ['items'],
        expression: undefined,
        functionName: 'computeItemLabel',
      });
      const collection: PropertyDerivationCollection = { entries: [entry] };
      const context = createContext({
        items: [
          { name: 'Widget', quantity: 3 },
          { name: 'Gadget', quantity: 7 },
        ],
      });
      context.propertyDerivationFunctions = {
        computeItemLabel: (evalCtx) => {
          const item = evalCtx.formValue as Record<string, unknown>;
          return `${item['name']} x${item['quantity']}`;
        },
      };

      const result = applyPropertyDerivations(collection, context);

      expect(result.appliedCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(context.store.getOverrides('items.0.total')()).toEqual({ label: 'Widget x3' });
      expect(context.store.getOverrides('items.1.total')()).toEqual({ label: 'Gadget x7' });
    });

    it('should continue processing other items when one item errors', () => {
      const entry = createEntry({
        fieldKey: 'items.$.result',
        targetProperty: 'value',
        dependsOn: ['items'],
        expression: undefined,
        functionName: 'riskyCompute',
      });
      const collection: PropertyDerivationCollection = { entries: [entry] };
      const context = createContext({
        items: [{ safe: true }, { safe: false }, { safe: true }],
      });
      context.propertyDerivationFunctions = {
        riskyCompute: (evalCtx) => {
          const item = evalCtx.formValue as Record<string, unknown>;
          if (!item['safe']) {
            throw new Error('Item is not safe');
          }
          return 'computed';
        },
      };

      const result = applyPropertyDerivations(collection, context);

      // The entry itself is counted as applied (appliedAny = true)
      expect(result.appliedCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(context.store.getOverrides('items.0.result')()).toEqual({ value: 'computed' });
      expect(context.store.getOverrides('items.1.result')()).toEqual({});
      expect(context.store.getOverrides('items.2.result')()).toEqual({ value: 'computed' });
    });

    it('should return false when array value is not an array', () => {
      const entry = createEntry({
        fieldKey: 'items.$.endDate',
        targetProperty: 'minDate',
        dependsOn: ['items'],
        expression: 'formValue.startDate',
      });
      const collection: PropertyDerivationCollection = { entries: [entry] };
      const context = createContext({ items: 'not-an-array' });

      const result = applyPropertyDerivations(collection, context);

      expect(result.appliedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    it('should evaluate condition per item and only apply to matching items', () => {
      const entry = createEntry({
        fieldKey: 'items.$.discount',
        targetProperty: 'visible',
        dependsOn: ['items'],
        expression: undefined,
        value: true,
        condition: {
          type: 'javascript',
          expression: 'formValue.eligible === true',
        },
      });
      const collection: PropertyDerivationCollection = { entries: [entry] };
      const context = createContext({
        items: [{ eligible: true }, { eligible: false }, { eligible: true }],
      });

      const result = applyPropertyDerivations(collection, context);

      // appliedAny = true because at least one item matched
      expect(result.appliedCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(context.store.getOverrides('items.0.discount')()).toEqual({ visible: true });
      expect(context.store.getOverrides('items.1.discount')()).toEqual({});
      expect(context.store.getOverrides('items.2.discount')()).toEqual({ visible: true });
    });
  });
});

describe('applyPropertyDerivationsForTrigger', () => {
  it('should only process onChange entries when trigger is onChange', () => {
    const onChangeEntry = createEntry({ trigger: 'onChange' });
    const debouncedEntry = createEntry({
      fieldKey: 'other',
      targetProperty: 'label',
      trigger: 'debounced',
      debounceMs: 500,
      expression: undefined,
      value: 'Debounced Label',
    });
    const collection: PropertyDerivationCollection = { entries: [onChangeEntry, debouncedEntry] };
    const context = createContext({ startDate: '2024-01-15' });

    const result = applyPropertyDerivationsForTrigger(collection, 'onChange', context);

    expect(result.appliedCount).toBe(1);
    expect(context.store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
    expect(context.store.getOverrides('other')()).toEqual({});
  });

  it('should only process debounced entries when trigger is debounced', () => {
    const onChangeEntry = createEntry({ trigger: 'onChange' });
    const debouncedEntry = createEntry({
      fieldKey: 'other',
      targetProperty: 'label',
      trigger: 'debounced',
      debounceMs: 500,
      expression: undefined,
      value: 'Debounced Label',
      dependsOn: [],
    });
    const collection: PropertyDerivationCollection = { entries: [onChangeEntry, debouncedEntry] };
    const context = createContext({ startDate: '2024-01-15' });

    const result = applyPropertyDerivationsForTrigger(collection, 'debounced', context);

    expect(result.appliedCount).toBe(1);
    expect(context.store.getOverrides('endDate')()).toEqual({});
    expect(context.store.getOverrides('other')()).toEqual({ label: 'Debounced Label' });
  });
});

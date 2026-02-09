import { signal, Signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { delay } from '@ng-forge/utils';
import { FieldDef } from '../../definitions/base/field-def';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { createDerivationWarningTracker, DERIVATION_WARNING_TRACKER } from '../derivation/derivation-warning-tracker';
import { createPropertyOverrideStore, PropertyOverrideStore } from './property-override-store';
import { PropertyDerivationOrchestrator, PropertyDerivationOrchestratorConfig } from './property-derivation-orchestrator';

/**
 * Helper to create a minimal FieldDef with propertyDerivation logic.
 */
function createFieldWithPropertyDerivation(
  key: string,
  targetProperty: string,
  overrides: Record<string, unknown> = {},
): FieldDef<unknown> {
  // Build the logic config carefully. expression/value/functionName are mutually exclusive.
  // When `expression` is explicitly set to `undefined`, we omit it entirely so the
  // collector uses value or functionName instead.
  const hasExplicitExpression = 'expression' in overrides;
  const logicConfig: Record<string, unknown> = {
    type: 'propertyDerivation',
    targetProperty,
    dependsOn: (overrides['dependsOn'] as string[]) ?? [key],
    trigger: (overrides['trigger'] as 'onChange' | 'debounced') ?? 'onChange',
  };

  if (hasExplicitExpression) {
    if (overrides['expression'] !== undefined) {
      logicConfig['expression'] = overrides['expression'];
    }
  } else {
    logicConfig['expression'] = `formValue.${key}`;
  }

  if (overrides['condition'] !== undefined) logicConfig['condition'] = overrides['condition'];
  if (overrides['value'] !== undefined) logicConfig['value'] = overrides['value'];
  if (overrides['functionName'] !== undefined) logicConfig['functionName'] = overrides['functionName'];
  if (overrides['debounceMs'] !== undefined) logicConfig['debounceMs'] = overrides['debounceMs'];

  return {
    key,
    type: 'input',
    logic: [logicConfig],
  } as FieldDef<unknown>;
}

/**
 * Helper to create a minimal FieldDef without logic.
 */
function createPlainField(key: string): FieldDef<unknown> {
  return {
    key,
    type: 'input',
  } as FieldDef<unknown>;
}

/**
 * Flush effects and wait for async streams to process.
 *
 * The orchestrator uses `toObservable` + `auditTime(0)` for the onChange stream,
 * which requires at least a microtask + macrotask to propagate. We use
 * `TestBed.flushEffects()` for Angular effects and a small `delay()` for
 * RxJS stream processing.
 */
async function flushAndSettle(ms = 50): Promise<void> {
  TestBed.flushEffects();
  await delay(ms);
  TestBed.flushEffects();
}

describe('PropertyDerivationOrchestrator', () => {
  let mockLogger: MockLogger;
  let store: PropertyOverrideStore;
  let schemaFields: WritableSignal<FieldDef<unknown>[] | undefined>;
  let formValue: WritableSignal<Record<string, unknown>>;
  let functionRegistry: FunctionRegistryService;

  beforeEach(() => {
    mockLogger = createMockLogger();
    store = createPropertyOverrideStore();
    schemaFields = signal<FieldDef<unknown>[] | undefined>(undefined);
    formValue = signal<Record<string, unknown>>({});

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        { provide: DynamicFormLogger, useValue: mockLogger },
        {
          provide: DERIVATION_WARNING_TRACKER,
          useFactory: createDerivationWarningTracker,
        },
        { provide: FORM_OPTIONS, useValue: signal(undefined) },
      ],
    });

    functionRegistry = TestBed.inject(FunctionRegistryService);
  });

  function createOrchestrator(configOverrides: Partial<PropertyDerivationOrchestratorConfig> = {}): PropertyDerivationOrchestrator {
    const config: PropertyDerivationOrchestratorConfig = {
      schemaFields,
      formValue,
      store,
      ...configOverrides,
    };

    return TestBed.runInInjectionContext(() => new PropertyDerivationOrchestrator(config));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // propertyDerivationCollection computed
  // ─────────────────────────────────────────────────────────────────────────────

  describe('propertyDerivationCollection computed', () => {
    it('should return null when schemaFields is undefined', () => {
      schemaFields.set(undefined);
      const orchestrator = createOrchestrator();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();
    });

    it('should return null when schemaFields is an empty array', () => {
      schemaFields.set([]);
      const orchestrator = createOrchestrator();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();
    });

    it('should return null when no fields have propertyDerivation logic', () => {
      schemaFields.set([createPlainField('name'), createPlainField('email')]);
      const orchestrator = createOrchestrator();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();
    });

    it('should return a collection when fields have propertyDerivation logic', () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);
      const orchestrator = createOrchestrator();

      const collection = orchestrator.propertyDerivationCollection();

      expect(collection).not.toBeNull();
      expect(collection!.entries).toHaveLength(1);
      expect(collection!.entries[0].fieldKey).toBe('endDate');
      expect(collection!.entries[0].targetProperty).toBe('minDate');
    });

    it('should collect multiple property derivation entries from different fields', () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
        createFieldWithPropertyDerivation('city', 'options', {
          expression: 'formValue.country',
          dependsOn: ['country'],
        }),
      ]);
      const orchestrator = createOrchestrator();

      const collection = orchestrator.propertyDerivationCollection();

      expect(collection).not.toBeNull();
      expect(collection!.entries).toHaveLength(2);
    });

    it('should be a pure computed that does not call store methods directly', () => {
      // Before constructing the orchestrator, spy on the store
      const clearSpy = vi.spyOn(store, 'clear');
      const registerFieldSpy = vi.spyOn(store, 'registerField');

      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);

      // Reset spy counts AFTER construction (constructor sets up the effect which
      // may or may not have run yet). We only care about reads of the computed.
      const orchestrator = createOrchestrator();
      clearSpy.mockClear();
      registerFieldSpy.mockClear();

      // Reading the computed multiple times should not trigger store side effects
      orchestrator.propertyDerivationCollection();
      orchestrator.propertyDerivationCollection();
      orchestrator.propertyDerivationCollection();

      // The computed itself is pure — store side effects happen only in the effect
      expect(clearSpy).not.toHaveBeenCalled();
      expect(registerFieldSpy).not.toHaveBeenCalled();

      clearSpy.mockRestore();
      registerFieldSpy.mockRestore();
    });

    it('should update collection when schemaFields changes', () => {
      schemaFields.set([createPlainField('name')]);
      const orchestrator = createOrchestrator();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();

      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);

      const collection = orchestrator.propertyDerivationCollection();
      expect(collection).not.toBeNull();
      expect(collection!.entries).toHaveLength(1);
    });

    it('should preserve entry properties from the field definition', () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
          trigger: 'debounced',
          debounceMs: 1000,
        }),
      ]);
      const orchestrator = createOrchestrator();

      const collection = orchestrator.propertyDerivationCollection();
      const entry = collection!.entries[0];

      expect(entry.fieldKey).toBe('endDate');
      expect(entry.targetProperty).toBe('minDate');
      expect(entry.expression).toBe('formValue.startDate');
      expect(entry.dependsOn).toEqual(['startDate']);
      expect(entry.trigger).toBe('debounced');
      expect(entry.debounceMs).toBe(1000);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // effect: store registration
  // ─────────────────────────────────────────────────────────────────────────────

  describe('effect: store registration', () => {
    it('should register fields in the store when collection has entries', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);

      createOrchestrator();
      await flushAndSettle();

      expect(store.hasField('endDate')).toBe(true);
    });

    it('should clear the store when collection becomes null', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);

      createOrchestrator();
      await flushAndSettle();

      expect(store.hasField('endDate')).toBe(true);

      // Remove all fields with property derivations
      schemaFields.set([createPlainField('name')]);
      await flushAndSettle();

      expect(store.hasField('endDate')).toBe(false);
    });

    it('should re-register fields when schema changes', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);

      createOrchestrator();
      await flushAndSettle();

      expect(store.hasField('endDate')).toBe(true);

      // Change to different fields
      schemaFields.set([
        createFieldWithPropertyDerivation('city', 'options', {
          expression: 'formValue.country',
          dependsOn: ['country'],
        }),
      ]);
      await flushAndSettle();

      // Old field should be gone (store.clear() was called), new one registered
      expect(store.hasField('endDate')).toBe(false);
      expect(store.hasField('city')).toBe(true);
    });

    it('should register multiple fields from a single schema', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
        createFieldWithPropertyDerivation('city', 'options', {
          expression: 'formValue.country',
          dependsOn: ['country'],
        }),
      ]);

      createOrchestrator();
      await flushAndSettle();

      expect(store.hasField('endDate')).toBe(true);
      expect(store.hasField('city')).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // onChange stream
  // ─────────────────────────────────────────────────────────────────────────────

  describe('onChange stream', () => {
    it('should apply onChange property derivations when formValue is set', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '' });

      createOrchestrator();
      await flushAndSettle();

      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
    });

    it('should apply static value property derivations', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('phone', 'label', {
          expression: undefined,
          value: 'Mobile Phone',
          dependsOn: [],
        }),
      ]);
      formValue.set({ phone: '' });

      createOrchestrator();
      await flushAndSettle();

      expect(store.getOverrides('phone')()).toEqual({ label: 'Mobile Phone' });
    });

    it('should apply function-based property derivations', async () => {
      const cities = [
        { label: 'NYC', value: 'nyc' },
        { label: 'LA', value: 'la' },
      ];
      functionRegistry.registerPropertyDerivationFunction('getCities', () => cities);

      schemaFields.set([
        createFieldWithPropertyDerivation('city', 'options', {
          expression: undefined,
          functionName: 'getCities',
          dependsOn: ['country'],
        }),
      ]);
      formValue.set({ country: 'USA', city: '' });

      createOrchestrator();
      await flushAndSettle();

      expect(store.getOverrides('city')()).toEqual({ options: cities });
    });

    it('should update overrides when formValue changes', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '' });

      createOrchestrator();
      await flushAndSettle();

      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });

      // Update form value
      formValue.set({ startDate: '2024-06-01', endDate: '' });
      await flushAndSettle();

      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-06-01' });
    });

    it('should skip entries where condition is false', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
          condition: false,
        }),
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '' });

      createOrchestrator();
      await flushAndSettle();

      // Condition is false, so no override should be set
      expect(store.getOverrides('endDate')()).toEqual({});
    });

    it('should not process debounced entries in the onChange stream', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
          trigger: 'onChange',
        }),
        createFieldWithPropertyDerivation('city', 'label', {
          expression: undefined,
          value: 'Debounced City',
          dependsOn: [],
          trigger: 'debounced',
        }),
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '', city: '' });

      createOrchestrator();
      await flushAndSettle();

      // onChange entry should be applied
      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
      // debounced entry should NOT be applied from the onChange stream
      expect(store.getOverrides('city')()).toEqual({});
    });

    it('should apply multiple property derivations to the same field', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
        // Second property derivation on the same field but different target property.
        // We need to create the field def manually to have two logic entries on one field.
        {
          key: 'endDate',
          type: 'input',
          logic: [
            {
              type: 'propertyDerivation',
              targetProperty: 'label',
              value: 'End Date',
              dependsOn: [],
              trigger: 'onChange',
            },
          ],
        } as FieldDef<unknown>,
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '' });

      createOrchestrator();
      await flushAndSettle();

      const overrides = store.getOverrides('endDate')();
      expect(overrides['minDate']).toBe('2024-01-15');
      expect(overrides['label']).toBe('End Date');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // debounced stream
  //
  // The debounced stream uses debounceTime(DEFAULT_DEBOUNCE_MS) + pairwise,
  // which requires waiting for the real debounce period to elapse. These tests
  // use real timeouts and are inherently slower.
  // ─────────────────────────────────────────────────────────────────────────────

  describe('debounced stream', () => {
    it(
      'should apply debounced property derivations after debounce period',
      {
        timeout: DEFAULT_DEBOUNCE_MS + 2000,
      },
      async () => {
        schemaFields.set([
          createFieldWithPropertyDerivation('city', 'label', {
            expression: undefined,
            value: 'Debounced City Label',
            dependsOn: ['country'],
            trigger: 'debounced',
          }),
        ]);
        formValue.set({ country: 'USA', city: '' });

        createOrchestrator();
        await flushAndSettle();

        // Change the value to trigger pairwise emission
        formValue.set({ country: 'Germany', city: '' });
        TestBed.flushEffects();

        // Wait for the full debounce period to elapse
        await delay(DEFAULT_DEBOUNCE_MS + 100);
        TestBed.flushEffects();

        expect(store.getOverrides('city')()).toEqual({
          label: 'Debounced City Label',
        });
      },
    );

    it(
      'should not apply debounced entries before debounce period elapses',
      {
        timeout: DEFAULT_DEBOUNCE_MS + 2000,
      },
      async () => {
        schemaFields.set([
          createFieldWithPropertyDerivation('city', 'label', {
            expression: undefined,
            value: 'Debounced City Label',
            dependsOn: ['country'],
            trigger: 'debounced',
          }),
        ]);
        formValue.set({ country: 'USA', city: '' });

        createOrchestrator();
        await flushAndSettle();

        formValue.set({ country: 'Germany', city: '' });
        TestBed.flushEffects();

        // Wait only a fraction of the debounce time
        await delay(100);
        TestBed.flushEffects();

        // Should NOT be applied yet
        expect(store.getOverrides('city')()).toEqual({});

        // Wait the remaining time so the subscription completes cleanly
        await delay(DEFAULT_DEBOUNCE_MS + 100);
      },
    );
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // external data
  // ─────────────────────────────────────────────────────────────────────────────

  describe('external data', () => {
    it('should resolve external data signals for property derivations', async () => {
      const discountSignal = signal(0.1);
      const externalData = signal<Record<string, Signal<unknown>> | undefined>({
        discount: discountSignal,
      });

      schemaFields.set([
        createFieldWithPropertyDerivation('price', 'label', {
          expression: 'externalData.discount',
          dependsOn: ['*'],
        }),
      ]);
      formValue.set({ price: 100 });

      createOrchestrator({ externalData });
      await flushAndSettle();

      expect(store.getOverrides('price')()).toEqual({ label: 0.1 });
    });

    it('should handle undefined externalData gracefully', async () => {
      const externalData = signal<Record<string, Signal<unknown>> | undefined>(undefined);

      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '' });

      createOrchestrator({ externalData });
      await flushAndSettle();

      // Should still work without external data
      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // wildcard dependency warnings
  // ─────────────────────────────────────────────────────────────────────────────

  describe('wildcard dependency warnings', () => {
    it('should collect entries with implicit wildcard when functionName has no dependsOn', () => {
      functionRegistry.registerPropertyDerivationFunction('computeLabel', () => 'computed');

      // Create a field manually with functionName but no dependsOn.
      // The collector will add '*' as an implicit wildcard dependency.
      const field = {
        key: 'summary',
        type: 'input',
        logic: [
          {
            type: 'propertyDerivation' as const,
            targetProperty: 'label',
            functionName: 'computeLabel',
            // No dependsOn -> collector adds '*'
          },
        ],
      } as FieldDef<unknown>;

      schemaFields.set([field]);
      const orchestrator = createOrchestrator();

      const collection = orchestrator.propertyDerivationCollection();
      expect(collection).not.toBeNull();
      expect(collection!.entries[0].dependsOn).toContain('*');
      expect(collection!.entries[0].functionName).toBe('computeLabel');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // error handling
  // ─────────────────────────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('should log error when a property derivation function is not found', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('city', 'options', {
          expression: undefined,
          functionName: 'nonExistentFunction',
          dependsOn: ['country'],
        }),
      ]);
      formValue.set({ country: 'USA', city: '' });

      createOrchestrator();
      await flushAndSettle();

      // The applicator logs the error when the function is not found
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should create orchestrator successfully within injection context', () => {
      expect(() => createOrchestrator()).not.toThrow();
    });

    it('should handle empty initial state', async () => {
      schemaFields.set(undefined);
      formValue.set({});

      const orchestrator = createOrchestrator();
      await flushAndSettle();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();
    });

    it('should transition from no-derivations to having derivations', async () => {
      schemaFields.set([createPlainField('name')]);
      formValue.set({ name: 'John' });

      const orchestrator = createOrchestrator();
      await flushAndSettle();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();
      expect(store.hasField('endDate')).toBe(false);

      // Now add a field with property derivation
      schemaFields.set([
        createPlainField('name'),
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);
      formValue.set({ name: 'John', startDate: '2024-01-15', endDate: '' });
      await flushAndSettle();

      expect(orchestrator.propertyDerivationCollection()).not.toBeNull();
      expect(store.hasField('endDate')).toBe(true);
      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });
    });

    it('should transition from having derivations to no derivations', async () => {
      schemaFields.set([
        createFieldWithPropertyDerivation('endDate', 'minDate', {
          expression: 'formValue.startDate',
          dependsOn: ['startDate'],
        }),
      ]);
      formValue.set({ startDate: '2024-01-15', endDate: '' });

      const orchestrator = createOrchestrator();
      await flushAndSettle();

      expect(orchestrator.propertyDerivationCollection()).not.toBeNull();
      expect(store.getOverrides('endDate')()).toEqual({ minDate: '2024-01-15' });

      // Remove all property derivation fields
      schemaFields.set([createPlainField('name')]);
      formValue.set({ name: 'John' });
      await flushAndSettle();

      expect(orchestrator.propertyDerivationCollection()).toBeNull();
      expect(store.hasField('endDate')).toBe(false);
    });
  });
});

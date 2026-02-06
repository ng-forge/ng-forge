import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, Signal, WritableSignal } from '@angular/core';

import { FormStateManager, FormStateManagerDeps } from './form-state-manager';
import { FormConfig, FormOptions } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { FieldTypeDefinition } from '../models/field-type';
import { EventBus } from '../events/event.bus';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../testing/src/mock-logger';

type TestModel = Record<string, unknown>;
type TestFields = RegisteredFieldTypes[];
type TestFormConfig = FormConfig<TestFields>;
type TestDeps = FormStateManagerDeps<TestFields, TestModel>;

function createFieldRegistry(): TestDeps['fieldRegistry'] {
  const rawRegistry = new Map<string, FieldTypeDefinition>([
    [
      'input',
      {
        name: 'input',
        mapper: vi.fn(),
        loadComponent: () => Promise.resolve(class MockComponent {}),
      },
    ],
  ]);

  return {
    raw: rawRegistry,
    getType: (name: string) => rawRegistry.get(name),
    getLoadedComponent: vi.fn().mockReturnValue(undefined),
    loadTypeComponent: vi.fn().mockResolvedValue(undefined),
  };
}

function createDeps(
  config: TestFormConfig,
  overrides?: Partial<{
    formOptions: Signal<FormOptions | undefined>;
    value: WritableSignal<Partial<TestModel> | undefined>;
    fieldRegistry: TestDeps['fieldRegistry'];
  }>,
): TestDeps {
  return {
    config: signal(config) as Signal<TestFormConfig>,
    formOptions: overrides?.formOptions ?? (signal(undefined) as Signal<FormOptions | undefined>),
    value: overrides?.value ?? signal(undefined),
    fieldRegistry: overrides?.fieldRegistry ?? createFieldRegistry(),
  };
}

describe('FormStateManager', () => {
  let stateManager: FormStateManager<TestFields, TestModel>;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = createMockLogger();

    TestBed.configureTestingModule({
      providers: [
        FormStateManager,
        EventBus,
        { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
        SchemaRegistryService,
        FunctionRegistryService,
        { provide: DynamicFormLogger, useValue: mockLogger },
      ],
    });

    stateManager = TestBed.inject(FormStateManager) as FormStateManager<TestFields, TestModel>;
  });

  // ─────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should be created successfully', () => {
      expect(stateManager).toBeTruthy();
    });

    it('should have undefined activeConfig before initialization', () => {
      expect(stateManager.activeConfig()).toBeUndefined();
    });

    it('should set activeConfig after initialize and flushEffects', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const result = stateManager.activeConfig();
      expect(result).toBeDefined();
      expect(result!.fields).toHaveLength(1);
      expect(result!.fields[0].key).toBe('name');
    });

    it('should warn via logger on double initialization', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;
      const deps = createDeps(config);

      stateManager.initialize(deps);
      stateManager.initialize(deps);

      expect(mockLogger.warn).toHaveBeenCalledWith('FormStateManager already initialized');
    });

    it('should register schemas from config during initialize', () => {
      const schemaRegistry = TestBed.inject(SchemaRegistryService);
      const registerSpy = vi.spyOn(schemaRegistry, 'registerSchema');

      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        schemas: [{ name: 'testSchema', validators: [] }],
      } as unknown as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(registerSpy).toHaveBeenCalledTimes(1);
      expect(registerSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'testSchema' }));
    });

    it('should register custom functions from config during initialize', () => {
      const fnRegistry = TestBed.inject(FunctionRegistryService);
      const registerFnSpy = vi.spyOn(fnRegistry, 'registerCustomFunction');

      const customFn = vi.fn();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        customFnConfig: {
          customFunctions: { myFn: customFn },
        },
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(registerFnSpy).toHaveBeenCalledWith('myFn', customFn);
    });

    it('should register validators from config during initialize', () => {
      const fnRegistry = TestBed.inject(FunctionRegistryService);
      const setValidatorsSpy = vi.spyOn(fnRegistry, 'setValidators');

      const myValidator = vi.fn();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        customFnConfig: {
          validators: { myValidator },
        },
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(setValidatorsSpy).toHaveBeenCalledWith(expect.objectContaining({ myValidator }));
    });

    it('should register derivation functions from config during initialize', () => {
      const fnRegistry = TestBed.inject(FunctionRegistryService);
      const setDerivationsSpy = vi.spyOn(fnRegistry, 'setDerivationFunctions');

      const myDerivation = vi.fn();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        customFnConfig: {
          derivations: { myDerivation },
        },
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(setDerivationsSpy).toHaveBeenCalledWith(expect.objectContaining({ myDerivation }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Form Mode Detection
  // ─────────────────────────────────────────────────────────────────────

  describe('formModeDetection', () => {
    it('should detect non-paged mode for flat fields', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(true);
      expect(detection.errors).toEqual([]);
    });

    it('should detect paged mode for page fields', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'email', label: 'Email' }] },
        ],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('paged');
      expect(detection.isValid).toBe(true);
    });

    it('should return non-paged with valid=true when no config is active', () => {
      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Effective Form Options
  // ─────────────────────────────────────────────────────────────────────

  describe('effectiveFormOptions', () => {
    it('should return config options when no input options are provided', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        options: { disabled: true },
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const options = stateManager.effectiveFormOptions();
      expect(options.disabled).toBe(true);
    });

    it('should use input options to override config options', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        options: { disabled: true },
      } as TestFormConfig;

      const formOptions = signal({ disabled: false } as FormOptions | undefined);
      stateManager.initialize(createDeps(config, { formOptions }));
      TestBed.flushEffects();

      const options = stateManager.effectiveFormOptions();
      expect(options.disabled).toBe(false);
    });

    it('should return empty options when neither config nor input options are provided', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const options = stateManager.effectiveFormOptions();
      expect(options).toEqual({});
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Form State Signals
  // ─────────────────────────────────────────────────────────────────────

  describe('form state signals', () => {
    beforeEach(() => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;
      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();
    });

    it('should report valid as true for a form with no required fields', () => {
      expect(stateManager.valid()).toBe(true);
    });

    it('should report invalid as false for a valid form', () => {
      expect(stateManager.invalid()).toBe(false);
    });

    it('should report dirty as false initially', () => {
      expect(stateManager.dirty()).toBe(false);
    });

    it('should report touched as false initially', () => {
      expect(stateManager.touched()).toBe(false);
    });

    it('should report errors as empty initially', () => {
      expect(stateManager.errors()).toEqual([]);
    });

    it('should report disabled as false when not configured as disabled', () => {
      expect(stateManager.disabled()).toBe(false);
    });

    it('should report disabled as true when options.disabled is true', () => {
      // The disabled computed checks effectiveFormOptions().disabled first,
      // which reads from the input formOptions signal. We test it via input override.
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        options: { disabled: true },
      } as TestFormConfig;

      const formOptions = signal({ disabled: true } as FormOptions | undefined);
      // Re-initialize a fresh TestBed to get a clean FormStateManager
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          FormStateManager,
          EventBus,
          { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
          SchemaRegistryService,
          FunctionRegistryService,
          { provide: DynamicFormLogger, useValue: mockLogger },
        ],
      });
      const freshManager = TestBed.inject(FormStateManager) as FormStateManager<TestFields, TestModel>;
      freshManager.initialize(createDeps(config, { formOptions }));
      TestBed.flushEffects();

      expect(freshManager.disabled()).toBe(true);
    });

    it('should report submitting as false initially', () => {
      expect(stateManager.submitting()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Default Values
  // ─────────────────────────────────────────────────────────────────────

  describe('defaultValues', () => {
    it('should compute defaults from field value properties', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'input', key: 'name', label: 'Name', value: 'John' },
          { type: 'input', key: 'email', label: 'Email', value: 'john@example.com' },
        ],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const defaults = stateManager.defaultValues();
      expect(defaults).toEqual(
        expect.objectContaining({
          name: 'John',
          email: 'john@example.com',
        }),
      );
    });

    it('should return empty string defaults for input fields without explicit values', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const defaults = stateManager.defaultValues();
      expect(defaults).toEqual(expect.objectContaining({ name: '' }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Entity Computation
  // ─────────────────────────────────────────────────────────────────────

  describe('entity', () => {
    it('should merge input value with defaults', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'input', key: 'name', label: 'Name', value: 'Default' },
          { type: 'input', key: 'email', label: 'Email', value: 'default@test.com' },
        ],
      } as TestFormConfig;

      const valueSignal = signal({ name: 'Override' } as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      const entity = stateManager.entity();
      expect(entity).toEqual(
        expect.objectContaining({
          name: 'Override',
          email: 'default@test.com',
        }),
      );
    });

    it('should use only defaults when no input value is provided', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const entity = stateManager.entity();
      expect(entity).toEqual(expect.objectContaining({ name: 'Default' }));
    });

    it('should filter to valid field keys only', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      const valueSignal = signal({ name: 'John', extraField: 'should-be-filtered' } as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      const entity = stateManager.entity();
      expect(entity).toEqual(expect.objectContaining({ name: 'John' }));
      expect(entity).not.toHaveProperty('extraField');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Reset / Clear
  // ─────────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('should set value back to defaults', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as TestFormConfig;

      const valueSignal = signal({ name: 'Changed' } as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      stateManager.reset();

      expect(valueSignal()).toEqual(expect.objectContaining({ name: 'Default' }));
    });
  });

  describe('clear', () => {
    it('should set value to empty object', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as TestFormConfig;

      const valueSignal = signal({ name: 'Some Value' } as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      stateManager.clear();

      expect(valueSignal()).toEqual({});
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // updateValue
  // ─────────────────────────────────────────────────────────────────────

  describe('updateValue', () => {
    it('should set the value signal correctly', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      const valueSignal = signal(undefined as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      stateManager.updateValue({ name: 'Updated' });

      expect(valueSignal()).toEqual({ name: 'Updated' });
    });

    it('should overwrite previous value', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      const valueSignal = signal({ name: 'Old' } as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      stateManager.updateValue({ name: 'New' });

      expect(valueSignal()).toEqual({ name: 'New' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Page Field Definitions
  // ─────────────────────────────────────────────────────────────────────

  describe('pageFieldDefinitions', () => {
    it('should return empty array for non-paged forms', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(stateManager.pageFieldDefinitions()).toEqual([]);
    });

    it('should return page fields for paged forms', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'email', label: 'Email' }] },
        ],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const pages = stateManager.pageFieldDefinitions();
      expect(pages).toHaveLength(2);
      expect(pages[0].type).toBe('page');
      expect(pages[0].key).toBe('page1');
      expect(pages[1].key).toBe('page2');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // formSetup
  // ─────────────────────────────────────────────────────────────────────

  describe('formSetup', () => {
    it('should return non-paged mode for flat forms', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup.mode).toBe('non-paged');
    });

    it('should populate schemaFields for non-paged forms', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'input', key: 'name', label: 'Name' },
          { type: 'input', key: 'email', label: 'Email' },
        ],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup.schemaFields).toBeDefined();
      expect(setup.schemaFields.length).toBeGreaterThanOrEqual(2);
      const keys = setup.schemaFields.map((f) => f.key);
      expect(keys).toContain('name');
      expect(keys).toContain('email');
    });

    it('should return paged mode for paged forms', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup.mode).toBe('paged');
    });

    it('should return empty fields array for paged forms (pages handle their own rendering)', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup.fields).toEqual([]);
    });

    it('should include defaultValues computed from field definitions', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup.defaultValues).toEqual(expect.objectContaining({ name: 'Default' }));
    });

    it('should return empty formSetup when no config is active', () => {
      const setup = stateManager.formSetup();
      expect(setup.fields).toEqual([]);
      expect(setup.schemaFields).toEqual([]);
      expect(setup.mode).toBe('non-paged');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // fieldLoadingErrors
  // ─────────────────────────────────────────────────────────────────────

  describe('fieldLoadingErrors', () => {
    it('should start with an empty array', () => {
      expect(stateManager.fieldLoadingErrors()).toEqual([]);
    });

    it('should still be empty after successful initialization', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(stateManager.fieldLoadingErrors()).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // shouldRender / renderPhase
  // ─────────────────────────────────────────────────────────────────────

  describe('shouldRender', () => {
    it('should be false before initialization', () => {
      expect(stateManager.shouldRender()).toBe(false);
    });

    it('should be true after initialization with valid config', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(stateManager.shouldRender()).toBe(true);
    });
  });

  describe('renderPhase', () => {
    it('should be render before initialization', () => {
      expect(stateManager.renderPhase()).toBe('render');
    });

    it('should be render after initialization', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(stateManager.renderPhase()).toBe('render');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // fieldSignalContext
  // ─────────────────────────────────────────────────────────────────────

  describe('fieldSignalContext', () => {
    it('should provide an injector reference', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const context = stateManager.fieldSignalContext();
      expect(context.injector).toBeDefined();
    });

    it('should provide a form instance', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const context = stateManager.fieldSignalContext();
      expect(context.form).toBeDefined();
    });

    it('should provide the defaultValues signal', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'MyDefault' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const context = stateManager.fieldSignalContext();
      const defaults = context.defaultValues();
      expect(defaults).toEqual(expect.objectContaining({ name: 'MyDefault' }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // form computed signal
  // ─────────────────────────────────────────────────────────────────────

  describe('form', () => {
    it('should create a form instance with entity values', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Hello' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const formInstance = stateManager.form()();
      expect(formInstance).toBeDefined();
      expect(formInstance.value()).toEqual(expect.objectContaining({ name: 'Hello' }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ─────────────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should not throw when called before initialization', () => {
      expect(() => stateManager.ngOnDestroy()).not.toThrow();
    });

    it('should not throw when called after initialization', () => {
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      expect(() => stateManager.ngOnDestroy()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Multiple fields
  // ─────────────────────────────────────────────────────────────────────

  describe('multiple fields', () => {
    it('should handle multiple fields with different default values', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'input', key: 'firstName', label: 'First Name', value: 'John' },
          { type: 'input', key: 'lastName', label: 'Last Name', value: 'Doe' },
          { type: 'input', key: 'email', label: 'Email' },
        ],
      } as TestFormConfig;

      stateManager.initialize(createDeps(config));
      TestBed.flushEffects();

      const defaults = stateManager.defaultValues();
      expect(defaults).toEqual(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: '',
        }),
      );
    });

    it('should handle form value merging with multiple fields', () => {
      const config: TestFormConfig = {
        fields: [
          { type: 'input', key: 'firstName', label: 'First Name', value: 'John' },
          { type: 'input', key: 'lastName', label: 'Last Name', value: 'Doe' },
        ],
      } as TestFormConfig;

      const valueSignal = signal({ firstName: 'Jane' } as Partial<TestModel> | undefined);
      stateManager.initialize(createDeps(config, { value: valueSignal }));
      TestBed.flushEffects();

      const entity = stateManager.entity();
      expect(entity).toEqual(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // resolvedFields
  // ─────────────────────────────────────────────────────────────────────

  describe('resolvedFields', () => {
    it('should start as an empty array', () => {
      expect(stateManager.resolvedFields()).toEqual([]);
    });
  });
});

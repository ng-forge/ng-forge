import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, Signal, WritableSignal } from '@angular/core';

import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from './form-state-manager';
import { FormConfig, FormOptions } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { EventBus } from '../events/event.bus';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../testing/src/mock-logger';

type TestModel = Record<string, unknown>;
type TestFields = RegisteredFieldTypes[];
type TestFormConfig = FormConfig<TestFields>;

function createFormStateDeps(
  config: TestFormConfig,
  overrides?: Partial<{
    formOptions: Signal<FormOptions | undefined>;
    value: WritableSignal<Partial<TestModel> | undefined>;
  }>,
): FormStateDeps {
  return {
    config: signal(config) as Signal<FormConfig<RegisteredFieldTypes[]>>,
    formOptions: overrides?.formOptions ?? (signal(undefined) as Signal<FormOptions | undefined>),
    value: overrides?.value ?? signal(undefined),
  };
}

let mockLogger: MockLogger;

function initManager(
  config: TestFormConfig,
  overrides?: Partial<{
    formOptions: Signal<FormOptions | undefined>;
    value: WritableSignal<Partial<TestModel> | undefined>;
  }>,
) {
  mockLogger = createMockLogger();
  const deps = createFormStateDeps(config, overrides);

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: FORM_STATE_DEPS, useValue: deps },
      FormStateManager,
      EventBus,
      { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
      SchemaRegistryService,
      FunctionRegistryService,
      { provide: DynamicFormLogger, useValue: mockLogger },
    ],
  });

  const stateManager = TestBed.inject(FormStateManager) as FormStateManager<TestFields, TestModel>;
  TestBed.flushEffects();

  return { stateManager, deps, mockLogger };
}

describe('FormStateManager', () => {
  // ─────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should be created successfully', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager).toBeTruthy();
    });

    it('should set activeConfig after creation and flushEffects', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const result = stateManager.activeConfig();
      expect(result).toBeDefined();
      expect(result!.fields).toHaveLength(1);
      expect(result!.fields[0].key).toBe('name');
    });

    it('should register schemas from config during initialization', () => {
      mockLogger = createMockLogger();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        schemas: [{ name: 'testSchema', validators: [] }],
      } as unknown as TestFormConfig;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: FORM_STATE_DEPS, useValue: createFormStateDeps(config) },
          FormStateManager,
          EventBus,
          { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
          SchemaRegistryService,
          FunctionRegistryService,
          { provide: DynamicFormLogger, useValue: mockLogger },
        ],
      });

      const schemaRegistry = TestBed.inject(SchemaRegistryService);
      const registerSpy = vi.spyOn(schemaRegistry, 'registerSchema');

      TestBed.inject(FormStateManager);
      TestBed.flushEffects();

      expect(registerSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'testSchema' }));
    });

    it('should register custom functions from config', () => {
      mockLogger = createMockLogger();
      const customFn = vi.fn();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        customFnConfig: {
          customFunctions: { myFn: customFn },
        },
      } as TestFormConfig;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: FORM_STATE_DEPS, useValue: createFormStateDeps(config) },
          FormStateManager,
          EventBus,
          { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
          SchemaRegistryService,
          FunctionRegistryService,
          { provide: DynamicFormLogger, useValue: mockLogger },
        ],
      });

      const fnRegistry = TestBed.inject(FunctionRegistryService);
      const registerFnSpy = vi.spyOn(fnRegistry, 'registerCustomFunction');

      TestBed.inject(FormStateManager);
      TestBed.flushEffects();

      expect(registerFnSpy).toHaveBeenCalledWith('myFn', customFn);
    });

    it('should register validators from config', () => {
      mockLogger = createMockLogger();
      const myValidator = vi.fn();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        customFnConfig: {
          validators: { myValidator },
        },
      } as TestFormConfig;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: FORM_STATE_DEPS, useValue: createFormStateDeps(config) },
          FormStateManager,
          EventBus,
          { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
          SchemaRegistryService,
          FunctionRegistryService,
          { provide: DynamicFormLogger, useValue: mockLogger },
        ],
      });

      const fnRegistry = TestBed.inject(FunctionRegistryService);
      const setValidatorsSpy = vi.spyOn(fnRegistry, 'setValidators');

      TestBed.inject(FormStateManager);
      TestBed.flushEffects();

      expect(setValidatorsSpy).toHaveBeenCalledWith(expect.objectContaining({ myValidator }));
    });

    it('should register derivation functions from config', () => {
      mockLogger = createMockLogger();
      const myDerivation = vi.fn();
      const config: TestFormConfig = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        customFnConfig: {
          derivations: { myDerivation },
        },
      } as TestFormConfig;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: FORM_STATE_DEPS, useValue: createFormStateDeps(config) },
          FormStateManager,
          EventBus,
          { provide: RootFormRegistryService, useValue: new RootFormRegistryService(signal({}), signal(undefined)) },
          SchemaRegistryService,
          FunctionRegistryService,
          { provide: DynamicFormLogger, useValue: mockLogger },
        ],
      });

      const fnRegistry = TestBed.inject(FunctionRegistryService);
      const setDerivationsSpy = vi.spyOn(fnRegistry, 'setDerivationFunctions');

      TestBed.inject(FormStateManager);
      TestBed.flushEffects();

      expect(setDerivationsSpy).toHaveBeenCalledWith(expect.objectContaining({ myDerivation }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Form Mode Detection
  // ─────────────────────────────────────────────────────────────────────

  describe('formModeDetection', () => {
    it('should detect non-paged mode for flat fields', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(true);
      expect(detection.errors).toEqual([]);
    });

    it('should detect paged mode for page fields', () => {
      const { stateManager } = initManager({
        fields: [
          { type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'email', label: 'Email' }] },
        ],
      } as TestFormConfig);

      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('paged');
      expect(detection.isValid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Effective Form Options
  // ─────────────────────────────────────────────────────────────────────

  describe('effectiveFormOptions', () => {
    it('should return config options when no input options are provided', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        options: { disabled: true },
      } as TestFormConfig);

      const options = stateManager.effectiveFormOptions();
      expect(options.disabled).toBe(true);
    });

    it('should use input options to override config options', () => {
      const formOptions = signal({ disabled: false } as FormOptions | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name' }],
          options: { disabled: true },
        } as TestFormConfig,
        { formOptions },
      );

      const options = stateManager.effectiveFormOptions();
      expect(options.disabled).toBe(false);
    });

    it('should return empty options when neither config nor input options are provided', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const options = stateManager.effectiveFormOptions();
      expect(options).toEqual({});
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Form State Signals
  // ─────────────────────────────────────────────────────────────────────

  describe('form state signals', () => {
    it('should report valid as true for a form with no required fields', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.valid()).toBe(true);
    });

    it('should report invalid as false for a valid form', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.invalid()).toBe(false);
    });

    it('should report dirty as false initially', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.dirty()).toBe(false);
    });

    it('should report touched as false initially', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.touched()).toBe(false);
    });

    it('should report errors as empty initially', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.errors()).toEqual([]);
    });

    it('should report disabled as false when not configured as disabled', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.disabled()).toBe(false);
    });

    it('should report disabled as true when options.disabled is true', () => {
      const formOptions = signal({ disabled: true } as FormOptions | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name' }],
          options: { disabled: true },
        } as TestFormConfig,
        { formOptions },
      );

      expect(stateManager.disabled()).toBe(true);
    });

    it('should report submitting as false initially', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.submitting()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Default Values
  // ─────────────────────────────────────────────────────────────────────

  describe('defaultValues', () => {
    it('should compute defaults from field value properties', () => {
      const { stateManager } = initManager({
        fields: [
          { type: 'input', key: 'name', label: 'Name', value: 'John' },
          { type: 'input', key: 'email', label: 'Email', value: 'john@example.com' },
        ],
      } as TestFormConfig);

      const defaults = stateManager.defaultValues();
      expect(defaults).toEqual(
        expect.objectContaining({
          name: 'John',
          email: 'john@example.com',
        }),
      );
    });

    it('should return empty string defaults for input fields without explicit values', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const defaults = stateManager.defaultValues();
      expect(defaults).toEqual(expect.objectContaining({ name: '' }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Entity Computation
  // ─────────────────────────────────────────────────────────────────────

  describe('entity', () => {
    it('should merge input value with defaults', () => {
      const valueSignal = signal({ name: 'Override' } as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [
            { type: 'input', key: 'name', label: 'Name', value: 'Default' },
            { type: 'input', key: 'email', label: 'Email', value: 'default@test.com' },
          ],
        } as TestFormConfig,
        { value: valueSignal },
      );

      const entity = stateManager.entity();
      expect(entity).toEqual(
        expect.objectContaining({
          name: 'Override',
          email: 'default@test.com',
        }),
      );
    });

    it('should use only defaults when no input value is provided', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as TestFormConfig);

      const entity = stateManager.entity();
      expect(entity).toEqual(expect.objectContaining({ name: 'Default' }));
    });

    it('should filter to valid field keys only', () => {
      const valueSignal = signal({ name: 'John', extraField: 'should-be-filtered' } as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name' }],
        } as TestFormConfig,
        { value: valueSignal },
      );

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
      const valueSignal = signal({ name: 'Changed' } as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
        } as TestFormConfig,
        { value: valueSignal },
      );

      stateManager.reset();

      expect(valueSignal()).toEqual(expect.objectContaining({ name: 'Default' }));
    });
  });

  describe('clear', () => {
    it('should set value to empty object', () => {
      const valueSignal = signal({ name: 'Some Value' } as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
        } as TestFormConfig,
        { value: valueSignal },
      );

      stateManager.clear();

      expect(valueSignal()).toEqual({});
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // updateValue
  // ─────────────────────────────────────────────────────────────────────

  describe('updateValue', () => {
    it('should set the value signal correctly', () => {
      const valueSignal = signal(undefined as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name' }],
        } as TestFormConfig,
        { value: valueSignal },
      );

      stateManager.updateValue({ name: 'Updated' });

      expect(valueSignal()).toEqual({ name: 'Updated' });
    });

    it('should overwrite previous value', () => {
      const valueSignal = signal({ name: 'Old' } as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [{ type: 'input', key: 'name', label: 'Name' }],
        } as TestFormConfig,
        { value: valueSignal },
      );

      stateManager.updateValue({ name: 'New' });

      expect(valueSignal()).toEqual({ name: 'New' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Page Field Definitions
  // ─────────────────────────────────────────────────────────────────────

  describe('pageFieldDefinitions', () => {
    it('should return empty array for non-paged forms', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.pageFieldDefinitions()).toEqual([]);
    });

    it('should return page fields for paged forms', () => {
      const { stateManager } = initManager({
        fields: [
          { type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'email', label: 'Email' }] },
        ],
      } as TestFormConfig);

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
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const setup = stateManager.formSetup();
      expect(setup.mode).toBe('non-paged');
    });

    it('should populate schemaFields for non-paged forms', () => {
      const { stateManager } = initManager({
        fields: [
          { type: 'input', key: 'name', label: 'Name' },
          { type: 'input', key: 'email', label: 'Email' },
        ],
      } as TestFormConfig);

      const setup = stateManager.formSetup();
      expect(setup.schemaFields).toBeDefined();
      expect(setup.schemaFields.length).toBeGreaterThanOrEqual(2);
      const keys = setup.schemaFields.map((f) => f.key);
      expect(keys).toContain('name');
      expect(keys).toContain('email');
    });

    it('should return paged mode for paged forms', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] }],
      } as TestFormConfig);

      const setup = stateManager.formSetup();
      expect(setup.mode).toBe('paged');
    });

    it('should return empty fields array for paged forms (pages handle their own rendering)', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name', label: 'Name' }] }],
      } as TestFormConfig);

      const setup = stateManager.formSetup();
      expect(setup.fields).toEqual([]);
    });

    it('should include defaultValues computed from field definitions', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as TestFormConfig);

      const setup = stateManager.formSetup();
      expect(setup.defaultValues).toEqual(expect.objectContaining({ name: 'Default' }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // fieldLoadingErrors
  // ─────────────────────────────────────────────────────────────────────

  describe('fieldLoadingErrors', () => {
    it('should be empty after successful initialization', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.fieldLoadingErrors()).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // shouldRender / renderPhase
  // ─────────────────────────────────────────────────────────────────────

  describe('shouldRender', () => {
    it('should be true after initialization with valid config', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.shouldRender()).toBe(true);
    });
  });

  describe('renderPhase', () => {
    it('should be render after initialization', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.renderPhase()).toBe('render');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // fieldSignalContext
  // ─────────────────────────────────────────────────────────────────────

  describe('fieldSignalContext', () => {
    it('should provide an injector reference', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const context = stateManager.fieldSignalContext();
      expect(context.injector).toBeDefined();
    });

    it('should provide a form instance', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      const context = stateManager.fieldSignalContext();
      expect(context.form).toBeDefined();
    });

    it('should provide the defaultValues signal', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'MyDefault' }],
      } as TestFormConfig);

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
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Hello' }],
      } as TestFormConfig);

      const formInstance = stateManager.form()();
      expect(formInstance).toBeDefined();
      expect(formInstance.value()).toEqual(expect.objectContaining({ name: 'Hello' }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ─────────────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should not throw when called after initialization', () => {
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(() => stateManager.ngOnDestroy()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Multiple fields
  // ─────────────────────────────────────────────────────────────────────

  describe('multiple fields', () => {
    it('should handle multiple fields with different default values', () => {
      const { stateManager } = initManager({
        fields: [
          { type: 'input', key: 'firstName', label: 'First Name', value: 'John' },
          { type: 'input', key: 'lastName', label: 'Last Name', value: 'Doe' },
          { type: 'input', key: 'email', label: 'Email' },
        ],
      } as TestFormConfig);

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
      const valueSignal = signal({ firstName: 'Jane' } as Partial<TestModel> | undefined);
      const { stateManager } = initManager(
        {
          fields: [
            { type: 'input', key: 'firstName', label: 'First Name', value: 'John' },
            { type: 'input', key: 'lastName', label: 'Last Name', value: 'Doe' },
          ],
        } as TestFormConfig,
        { value: valueSignal },
      );

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
      const { stateManager } = initManager({
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
      } as TestFormConfig);

      expect(stateManager.resolvedFields()).toEqual([]);
    });
  });
});

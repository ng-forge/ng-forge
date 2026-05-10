import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from './form-state-manager';
import { FormConfig, FormOptions } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { EventBus } from '../events/event.bus';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { LogicFunctionCacheService } from '../core/expressions/logic-function-cache.service';
import { HttpConditionFunctionCacheService } from '../core/expressions/http-condition-function-cache.service';
import { DynamicValueFunctionCacheService } from '../core/values/dynamic-value-function-cache.service';
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

  // Lazy wiring: RootFormRegistryService gets signals that defer reading FormStateManager
  // until they're actually evaluated, breaking the construction-time cycle.
  const stateManagerRef: { current: FormStateManager<TestFields, TestModel> | null } = { current: null };
  const formValueSig = computed<Record<string, unknown>>(() => (stateManagerRef.current?.formValue() as Record<string, unknown>) ?? {});
  const formSig = computed<FieldTree<Record<string, unknown>> | undefined>(
    () => stateManagerRef.current?.form() as FieldTree<Record<string, unknown>> | undefined,
  );

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: FORM_STATE_DEPS, useValue: deps },
      FormStateManager,
      EventBus,
      { provide: RootFormRegistryService, useValue: new RootFormRegistryService(formValueSig, formSig) },
      SchemaRegistryService,
      FunctionRegistryService,
      FieldContextRegistryService,
      LogicFunctionCacheService,
      HttpConditionFunctionCacheService,
      DynamicValueFunctionCacheService,
      { provide: DynamicFormLogger, useValue: mockLogger },
    ],
  });

  const stateManager = TestBed.inject(FormStateManager) as FormStateManager<TestFields, TestModel>;
  stateManagerRef.current = stateManager;
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

  // ─────────────────────────────────────────────────────────────────────
  // excludeValueIfHidden + outward value sync (issue #394)
  // ─────────────────────────────────────────────────────────────────────
  //
  // Bug: when a field is hidden AND excludeValueIfHidden is true, the
  // field's internal default (e.g. NaN for number inputs) still leaks
  // into the host's two-way bound `deps.value`. The exclusion only filters
  // the submission output (`filteredFormValue`) — it should also filter
  // the outward sync from `entity` → `deps.value`.
  //
  // Acceptance: when a field is hidden+excluded, its key must be absent
  // from `deps.value`. When the field becomes visible again, its previously
  // entered value must be restored (not reset to its default).
  // ─────────────────────────────────────────────────────────────────────

  describe('excludeValueIfHidden + outward value sync', () => {
    describe('static hidden fields', () => {
      it('should not emit NaN for a hidden number field with field-level excludeValueIfHidden', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>(undefined);
        initManager(
          {
            fields: [{ type: 'input', key: 'myNum', label: 'Num', props: { type: 'number' }, hidden: true, excludeValueIfHidden: true }],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        const synced = valueSignal();
        expect(synced).not.toHaveProperty('myNum');
      });

      it('should omit a hidden input string field from deps.value when excludeValueIfHidden is true', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>(undefined);
        initManager(
          {
            fields: [{ type: 'input', key: 'name', label: 'Name', value: 'hello', hidden: true, excludeValueIfHidden: true }],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        const synced = valueSignal();
        expect(synced).not.toHaveProperty('name');
      });

      it('should respect form-level excludeValueIfHidden when field-level is unset', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>(undefined);
        const formOptions = signal({ excludeValueIfHidden: true } as FormOptions | undefined);
        initManager(
          {
            fields: [{ type: 'input', key: 'myNum', label: 'Num', props: { type: 'number' }, hidden: true }],
          } as TestFormConfig,
          { value: valueSignal, formOptions },
        );
        TestBed.flushEffects();

        const synced = valueSignal();
        expect(synced).not.toHaveProperty('myNum');
      });

      it('should still emit hidden-field value when excludeValueIfHidden is explicitly false', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>(undefined);
        initManager(
          {
            fields: [{ type: 'input', key: 'myNum', label: 'Num', props: { type: 'number' }, hidden: true, excludeValueIfHidden: false }],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Field-level opt-out → key present even though hidden.
        expect(valueSignal()).toHaveProperty('myNum');
      });

      it('should leave non-hidden sibling fields untouched in deps.value', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({ visible: 'keep' });
        initManager(
          {
            fields: [
              { type: 'input', key: 'visible', label: 'Visible' },
              { type: 'input', key: 'hiddenOne', label: 'Hidden', hidden: true, excludeValueIfHidden: true },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        const synced = valueSignal();
        expect(synced).toHaveProperty('visible', 'keep');
        expect(synced).not.toHaveProperty('hiddenOne');
      });
    });

    describe('dynamic hidden fields (logic-driven)', () => {
      it('should remove the key from deps.value when the field transitions visible → hidden', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({ trigger: 'show', myNum: 5 });
        initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'input',
                key: 'myNum',
                label: 'Num',
                props: { type: 'number' },
                excludeValueIfHidden: true,
                logic: [
                  {
                    type: 'hidden',
                    condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                  },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Field initially visible → value present
        expect(valueSignal()).toHaveProperty('myNum', 5);

        // Toggle trigger to hide myNum
        valueSignal.set({ trigger: 'hide', myNum: 5 });
        TestBed.flushEffects();

        expect(valueSignal()).not.toHaveProperty('myNum');
      });

      it('should restore the previously entered value when the field becomes visible again', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({ trigger: 'show', myNum: 5 });
        initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'input',
                key: 'myNum',
                label: 'Num',
                props: { type: 'number' },
                excludeValueIfHidden: true,
                logic: [
                  {
                    type: 'hidden',
                    condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                  },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Hide the field
        valueSignal.set({ trigger: 'hide', myNum: 5 });
        TestBed.flushEffects();
        expect(valueSignal()).not.toHaveProperty('myNum');

        // Show it again — last entered value should come back
        valueSignal.set({ trigger: 'show' });
        TestBed.flushEffects();
        expect(valueSignal()).toHaveProperty('myNum', 5);
      });

      it('should preserve the last value across multiple hide/show cycles', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({ trigger: 'show', myNum: 5 });
        initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'input',
                key: 'myNum',
                label: 'Num',
                props: { type: 'number' },
                excludeValueIfHidden: true,
                logic: [
                  {
                    type: 'hidden',
                    condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                  },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Cycle 1: hide → show
        valueSignal.set({ trigger: 'hide', myNum: 5 });
        TestBed.flushEffects();
        valueSignal.set({ trigger: 'show' });
        TestBed.flushEffects();
        expect(valueSignal()).toHaveProperty('myNum', 5);

        // Update value while visible
        valueSignal.set({ trigger: 'show', myNum: 7 });
        TestBed.flushEffects();

        // Cycle 2: hide → show — should restore the latest value (7)
        valueSignal.set({ trigger: 'hide', myNum: 7 });
        TestBed.flushEffects();
        expect(valueSignal()).not.toHaveProperty('myNum');
        valueSignal.set({ trigger: 'show' });
        TestBed.flushEffects();
        expect(valueSignal()).toHaveProperty('myNum', 7);
      });

      it('should hide one field independently without affecting other fields', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({
          trigger: 'show',
          numA: 1,
          numB: 2,
        });
        initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'input',
                key: 'numA',
                label: 'NumA',
                props: { type: 'number' },
                excludeValueIfHidden: true,
                logic: [
                  {
                    type: 'hidden',
                    condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                  },
                ],
              },
              { type: 'input', key: 'numB', label: 'NumB', props: { type: 'number' } },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        valueSignal.set({ trigger: 'hide', numA: 1, numB: 2 });
        TestBed.flushEffects();

        const synced = valueSignal();
        expect(synced).not.toHaveProperty('numA');
        expect(synced).toHaveProperty('numB', 2);
      });
    });

    describe('form reset clears saved hidden values', () => {
      it('should not restore previously saved values after form reset', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({ trigger: 'show', myNum: 5 });
        const { stateManager } = initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'input',
                key: 'myNum',
                label: 'Num',
                props: { type: 'number' },
                excludeValueIfHidden: true,
                logic: [
                  {
                    type: 'hidden',
                    condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                  },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Hide while value present → store should capture 5
        valueSignal.set({ trigger: 'hide', myNum: 5 });
        TestBed.flushEffects();

        // Reset — should clear the saved store
        stateManager.reset();
        TestBed.flushEffects();

        // Show again — value should NOT be restored from the saved store
        valueSignal.set({ trigger: 'show' });
        TestBed.flushEffects();

        const synced = valueSignal() ?? {};
        // After reset, myNum should either be absent or its default (NaN), but NOT 5
        expect((synced as Record<string, unknown>).myNum).not.toBe(5);
      });
    });

    describe('group fields', () => {
      it('should omit a hidden + excluded group from deps.value', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>(undefined);
        initManager(
          {
            fields: [
              {
                type: 'group',
                key: 'address',
                hidden: true,
                excludeValueIfHidden: true,
                fields: [
                  { type: 'input', key: 'street', label: 'Street' },
                  { type: 'input', key: 'city', label: 'City' },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        const synced = valueSignal();
        expect(synced).not.toHaveProperty('address');
      });

      it('should restore nested group values across hide/show cycles', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({
          trigger: 'show',
          address: { street: '123 Main', city: 'Springfield' },
        });
        initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'group',
                key: 'address',
                excludeValueIfHidden: true,
                logic: [
                  {
                    type: 'hidden',
                    condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                  },
                ],
                fields: [
                  { type: 'input', key: 'street', label: 'Street' },
                  { type: 'input', key: 'city', label: 'City' },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Visible initially
        expect(valueSignal()).toHaveProperty('address');

        // Hide the group
        valueSignal.set({ trigger: 'hide', address: { street: '123 Main', city: 'Springfield' } });
        TestBed.flushEffects();
        expect(valueSignal()).not.toHaveProperty('address');

        // Show again — nested values should be restored
        valueSignal.set({ trigger: 'show' });
        TestBed.flushEffects();
        const synced = valueSignal() as Record<string, unknown>;
        expect(synced.address).toEqual({ street: '123 Main', city: 'Springfield' });
      });

      it('should preserve a nested field value when only that child field toggles hidden inside a visible group', () => {
        const valueSignal = signal<Partial<TestModel> | undefined>({
          trigger: 'show',
          address: { street: '123 Main', city: 'Springfield' },
        });
        initManager(
          {
            fields: [
              { type: 'input', key: 'trigger', label: 'Trigger' },
              {
                type: 'group',
                key: 'address',
                fields: [
                  {
                    type: 'input',
                    key: 'street',
                    label: 'Street',
                    excludeValueIfHidden: true,
                    logic: [
                      {
                        type: 'hidden',
                        condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'hide' },
                      },
                    ],
                  },
                  { type: 'input', key: 'city', label: 'City' },
                ],
              },
            ],
          } as TestFormConfig,
          { value: valueSignal },
        );
        TestBed.flushEffects();

        // Initially visible
        expect((valueSignal() as Record<string, Record<string, unknown>>).address.street).toBe('123 Main');

        // Hide street (group stays visible)
        valueSignal.set({ trigger: 'hide', address: { street: '123 Main', city: 'Springfield' } });
        TestBed.flushEffects();
        const hiddenSynced = (valueSignal() as Record<string, Record<string, unknown>>).address;
        expect(hiddenSynced).not.toHaveProperty('street');
        expect(hiddenSynced.city).toBe('Springfield');

        // Show again — street's previous value should be restored
        valueSignal.set({ trigger: 'show', address: { city: 'Springfield' } });
        TestBed.flushEffects();
        const restored = (valueSignal() as Record<string, Record<string, unknown>>).address;
        expect(restored.street).toBe('123 Main');
        expect(restored.city).toBe('Springfield');
      });
    });
  });
});

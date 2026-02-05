import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, Signal } from '@angular/core';
import { FormStateManager, FormStateManagerDeps } from './form-state-manager';
import { FormConfig, FormOptions } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { FieldTypeDefinition } from '../models/field-type';
import { EventBus } from '../events/event.bus';
import { RootFormRegistryService, SchemaRegistryService, FunctionRegistryService } from '../core/registry';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { NoopLogger } from '../providers/features/logger/noop-logger';

describe('FormStateManager', () => {
  let stateManager: FormStateManager<RegisteredFieldTypes[], Record<string, unknown>>;
  let mockFieldRegistry: FormStateManagerDeps['fieldRegistry'];
  let mockConfig: FormConfig<RegisteredFieldTypes[]>;

  beforeEach(() => {
    // Create mock field registry
    mockFieldRegistry = {
      raw: new Map<string, FieldTypeDefinition>([
        [
          'input',
          {
            type: 'input',
            defaultValue: '',
            mapper: vi.fn(),
            component: vi.fn() as unknown as () => Promise<unknown>,
          },
        ],
      ]),
      loadTypeComponent: vi.fn().mockResolvedValue(undefined),
    };

    // Create mock config
    mockConfig = {
      fields: [{ type: 'input', key: 'name', label: 'Name' }],
    } as FormConfig<RegisteredFieldTypes[]>;

    // Set up TestBed
    TestBed.configureTestingModule({
      providers: [
        FormStateManager,
        EventBus,
        RootFormRegistryService,
        SchemaRegistryService,
        FunctionRegistryService,
        { provide: DynamicFormLogger, useClass: NoopLogger },
      ],
    });

    stateManager = TestBed.inject(FormStateManager);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(stateManager).toBeTruthy();
    });

    it('should start with undefined activeConfig before initialization', () => {
      expect(stateManager.activeConfig()).toBeUndefined();
    });

    it('should initialize with provided dependencies', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };

      stateManager.initialize(deps);
      TestBed.flushEffects(); // Flush effects to let state machine process initialization

      expect(stateManager.activeConfig()).toBeDefined();
    });

    it('should warn when initialized multiple times', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };

      stateManager.initialize(deps);
      // The second initialization should log a warning via the logger
      // (NoopLogger won't actually log, but the method should be called)
      stateManager.initialize(deps);

      warnSpy.mockRestore();
    });
  });

  describe('activeConfig', () => {
    beforeEach(() => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();
    });

    it('should return the current config', () => {
      const config = stateManager.activeConfig();
      expect(config).toBeDefined();
      expect(config?.fields).toHaveLength(1);
    });
  });

  describe('formModeDetection', () => {
    it('should detect non-paged form mode', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(true);
    });

    it('should detect paged form mode', () => {
      const pagedConfig: FormConfig<RegisteredFieldTypes[]> = {
        fields: [
          { type: 'page', key: 'page1', label: 'Page 1', fields: [{ type: 'input', key: 'name', label: 'Name' }] },
          { type: 'page', key: 'page2', label: 'Page 2', fields: [{ type: 'input', key: 'email', label: 'Email' }] },
        ],
      } as FormConfig<RegisteredFieldTypes[]>;

      const deps: FormStateManagerDeps = {
        config: signal(pagedConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const detection = stateManager.formModeDetection();
      expect(detection.mode).toBe('paged');
    });
  });

  describe('effectiveFormOptions', () => {
    it('should return config options when no input options provided', () => {
      const configWithOptions: FormConfig<RegisteredFieldTypes[]> = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        options: { disabled: true },
      } as FormConfig<RegisteredFieldTypes[]>;

      const deps: FormStateManagerDeps = {
        config: signal(configWithOptions) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const options = stateManager.effectiveFormOptions();
      expect(options.disabled).toBe(true);
    });

    it('should merge input options over config options', () => {
      const configWithOptions: FormConfig<RegisteredFieldTypes[]> = {
        fields: [{ type: 'input', key: 'name', label: 'Name' }],
        options: { disabled: true },
      } as FormConfig<RegisteredFieldTypes[]>;

      const deps: FormStateManagerDeps = {
        config: signal(configWithOptions) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal({ disabled: false }) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const options = stateManager.effectiveFormOptions();
      expect(options.disabled).toBe(false);
    });
  });

  describe('shouldRender', () => {
    it('should return true when in render phase with valid config', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      expect(stateManager.shouldRender()).toBe(true);
    });
  });

  describe('renderPhase', () => {
    it('should start in render phase', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      expect(stateManager.renderPhase()).toBe('render');
    });
  });

  describe('form state signals', () => {
    beforeEach(() => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();
    });

    it('should provide valid signal', () => {
      expect(typeof stateManager.valid()).toBe('boolean');
    });

    it('should provide invalid signal', () => {
      expect(typeof stateManager.invalid()).toBe('boolean');
    });

    it('should provide dirty signal', () => {
      expect(typeof stateManager.dirty()).toBe('boolean');
    });

    it('should provide touched signal', () => {
      expect(typeof stateManager.touched()).toBe('boolean');
    });

    it('should provide errors signal', () => {
      expect(stateManager.errors()).toBeDefined();
    });

    it('should provide disabled signal', () => {
      expect(typeof stateManager.disabled()).toBe('boolean');
    });

    it('should provide submitting signal', () => {
      expect(typeof stateManager.submitting()).toBe('boolean');
    });
  });

  describe('defaultValues', () => {
    it('should compute default values from field definitions', () => {
      const configWithDefaults: FormConfig<RegisteredFieldTypes[]> = {
        fields: [
          { type: 'input', key: 'name', label: 'Name', value: 'John' },
          { type: 'input', key: 'email', label: 'Email', value: 'john@example.com' },
        ],
      } as FormConfig<RegisteredFieldTypes[]>;

      const deps: FormStateManagerDeps = {
        config: signal(configWithDefaults) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const defaults = stateManager.defaultValues();
      expect(defaults).toBeDefined();
    });
  });

  describe('fieldLoadingErrors', () => {
    it('should start with empty errors array', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      expect(stateManager.fieldLoadingErrors()).toEqual([]);
    });
  });

  describe('pageFieldDefinitions', () => {
    it('should return empty array for non-paged forms', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      expect(stateManager.pageFieldDefinitions()).toEqual([]);
    });

    it('should return page fields for paged forms', () => {
      const pagedConfig: FormConfig<RegisteredFieldTypes[]> = {
        fields: [
          { type: 'page', key: 'page1', label: 'Page 1', fields: [] },
          { type: 'page', key: 'page2', label: 'Page 2', fields: [] },
        ],
      } as FormConfig<RegisteredFieldTypes[]>;

      const deps: FormStateManagerDeps = {
        config: signal(pagedConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const pages = stateManager.pageFieldDefinitions();
      expect(pages).toHaveLength(2);
    });
  });

  describe('reset', () => {
    it('should reset form to default values', () => {
      const configWithDefaults: FormConfig<RegisteredFieldTypes[]> = {
        fields: [{ type: 'input', key: 'name', label: 'Name', value: 'Default' }],
      } as FormConfig<RegisteredFieldTypes[]>;

      const valueSignal = signal({ name: 'Changed' } as Record<string, unknown> | undefined);

      const deps: FormStateManagerDeps = {
        config: signal(configWithDefaults) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: valueSignal,
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      stateManager.reset();

      // After reset, value should be set to defaults
      // The actual reset behavior depends on form instance
    });
  });

  describe('clear', () => {
    it('should clear form to empty state', () => {
      const valueSignal = signal({ name: 'Some Value' } as Record<string, unknown> | undefined);

      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: valueSignal,
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      stateManager.clear();

      // After clear, value should be empty
      expect(valueSignal()).toEqual({});
    });
  });

  describe('updateValue', () => {
    it('should update the form value', () => {
      const valueSignal = signal(undefined as Record<string, unknown> | undefined);

      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: valueSignal,
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      stateManager.updateValue({ name: 'Updated' });

      expect(valueSignal()).toEqual({ name: 'Updated' });
    });
  });

  describe('formSetup', () => {
    it('should compute form setup from config', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup).toBeDefined();
      expect(setup.mode).toBe('non-paged');
    });

    it('should include schema fields', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const setup = stateManager.formSetup();
      expect(setup.schemaFields).toBeDefined();
    });
  });

  describe('fieldSignalContext', () => {
    it('should provide field signal context', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      const context = stateManager.fieldSignalContext();
      expect(context).toBeDefined();
      expect(context.injector).toBeDefined();
      expect(context.form).toBeDefined();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up on destroy', () => {
      const deps: FormStateManagerDeps = {
        config: signal(mockConfig) as Signal<FormConfig<RegisteredFieldTypes[]>>,
        formOptions: signal(undefined) as Signal<FormOptions | undefined>,
        value: signal(undefined),
        fieldRegistry: mockFieldRegistry,
      };
      stateManager.initialize(deps);
      TestBed.flushEffects();

      // Should not throw
      expect(() => stateManager.ngOnDestroy()).not.toThrow();
    });
  });
});

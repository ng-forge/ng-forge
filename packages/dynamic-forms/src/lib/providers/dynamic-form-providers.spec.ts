import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideDynamicForm } from './dynamic-form-providers';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { WrapperTypeDefinition, WRAPPER_REGISTRY } from '../models/wrapper-type';
import { BUILT_IN_FIELDS, BUILT_IN_WRAPPERS } from './built-in-fields';
import { createWrappers } from '../wrappers/create-wrappers';
import { wrapperProps } from '../wrappers/wrapper-props';
import { withLoggerConfig } from './features/logger/with-logger-config';
import { DynamicFormLogger } from './features/logger/logger.token';
import { ConsoleLogger } from './features/logger/console-logger';
import { NoopLogger } from './features/logger/noop-logger';

// Internal Angular structure for EnvironmentProviders
interface InternalEnvironmentProviders {
  ɵproviders: Provider[];
}

// Helper to extract providers from EnvironmentProviders
function getProviders(envProviders: EnvironmentProviders): Provider[] {
  return (envProviders as unknown as InternalEnvironmentProviders).ɵproviders || [];
}

// Helper to create registry with proper injection context
function createRegistryWithInjection(envProviders: EnvironmentProviders): Map<string, FieldTypeDefinition> {
  TestBed.configureTestingModule({ providers: [envProviders] });
  return TestBed.inject(FIELD_REGISTRY);
}

// Helper to create wrapper registry with proper injection context
function createWrapperRegistryWithInjection(envProviders: EnvironmentProviders): Map<string, WrapperTypeDefinition> {
  TestBed.configureTestingModule({ providers: [envProviders] });
  return TestBed.inject(WRAPPER_REGISTRY);
}

describe('provideDynamicForm', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    TestBed.resetTestingModule();
  });

  describe('Provider structure', () => {
    it('should return EnvironmentProviders', () => {
      const result = provideDynamicForm();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should contain providers for no custom fields', () => {
      const envProviders = provideDynamicForm();
      const providers = getProviders(envProviders);

      // Logger + provideSignalFormsConfig + FIELD_REGISTRY + WRAPPER_REGISTRY + WRAPPER_AUTO_ASSOCIATIONS
      expect(providers).toHaveLength(5);
    });

    it('should contain providers for custom fields', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const envProviders = provideDynamicForm(customField);
      const providers = getProviders(envProviders);

      // Logger + provideSignalFormsConfig + FIELD_REGISTRY + WRAPPER_REGISTRY + WRAPPER_AUTO_ASSOCIATIONS
      expect(providers).toHaveLength(5);
    });
  });

  describe('FIELD_REGISTRY provider', () => {
    it('should include FIELD_REGISTRY provider', () => {
      const envProviders = provideDynamicForm();
      const providers = getProviders(envProviders);
      const registryProvider = providers.find(
        (p): p is { provide: unknown } => typeof p === 'object' && p !== null && 'provide' in p && p.provide === FIELD_REGISTRY,
      );

      expect(registryProvider).toBeDefined();
    });

    it('should have useFactory for FIELD_REGISTRY', () => {
      const envProviders = provideDynamicForm();
      const providers = getProviders(envProviders);
      const registryProvider = providers.find(
        (p): p is { provide: unknown; useFactory: () => Map<string, FieldTypeDefinition> } =>
          typeof p === 'object' && p !== null && 'provide' in p && p.provide === FIELD_REGISTRY,
      );

      expect(registryProvider?.useFactory).toBeDefined();
      expect(typeof registryProvider?.useFactory).toBe('function');
    });
  });

  describe('Built-in fields registration', () => {
    it('should register all built-in fields', () => {
      const envProviders = provideDynamicForm();
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.size).toBe(BUILT_IN_FIELDS.length);
      BUILT_IN_FIELDS.forEach((field) => {
        expect(registry.has(field.name)).toBe(true);
        expect(registry.get(field.name)).toBe(field);
      });
    });
  });

  describe('Custom fields registration', () => {
    it('should register single custom field', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const envProviders = provideDynamicForm(customField);
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.has('custom')).toBe(true);
      expect(registry.get('custom')).toBe(customField);
    });

    it('should register multiple custom fields', () => {
      const customField1: FieldTypeDefinition = {
        name: 'custom1',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const customField2: FieldTypeDefinition = {
        name: 'custom2',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'include',
      };

      const envProviders = provideDynamicForm(customField1, customField2);
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.has('custom1')).toBe(true);
      expect(registry.has('custom2')).toBe(true);
      expect(registry.get('custom1')).toBe(customField1);
      expect(registry.get('custom2')).toBe(customField2);
    });

    it('should include both built-in and custom fields', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const envProviders = provideDynamicForm(customField);
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.size).toBe(BUILT_IN_FIELDS.length + 1);
      expect(registry.has('row')).toBe(true);
      expect(registry.has('custom')).toBe(true);
    });
  });

  describe('Field overwriting', () => {
    it('should warn when overwriting built-in field', () => {
      const customRow: FieldTypeDefinition = {
        name: 'row',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      // Include withLoggerConfig() to enable logging in this test
      const envProviders = provideDynamicForm(customRow, withLoggerConfig());
      createRegistryWithInjection(envProviders);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'Field type "row" is already registered. Overwriting.');
    });

    it('should overwrite built-in field with custom field', () => {
      const customRow: FieldTypeDefinition = {
        name: 'row',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const envProviders = provideDynamicForm(customRow);
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.get('row')).toBe(customRow);
      expect(registry.get('row')?.valueHandling).toBe('exclude');
    });

    it('should warn when overwriting custom field with another custom field', () => {
      const customField1: FieldTypeDefinition = {
        name: 'myfield',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const customField2: FieldTypeDefinition = {
        name: 'myfield',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'include',
      };

      // Include withLoggerConfig() to enable logging in this test
      const envProviders = provideDynamicForm(customField1, customField2, withLoggerConfig());
      createRegistryWithInjection(envProviders);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'Field type "myfield" is already registered. Overwriting.');
    });
  });

  describe('Edge cases', () => {
    it('should handle many custom fields', () => {
      const customFields: FieldTypeDefinition[] = Array.from({ length: 10 }, (_, i) => ({
        name: `custom${i}`,
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude' as const,
      }));

      const envProviders = provideDynamicForm(...customFields);
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.size).toBe(BUILT_IN_FIELDS.length + 10);
      customFields.forEach((field) => {
        expect(registry.has(field.name)).toBe(true);
      });
    });
  });

  describe('Feature integration', () => {
    it('should accept withLoggerConfig feature alongside field types', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const envProviders = provideDynamicForm(customField, withLoggerConfig());
      const providers = getProviders(envProviders);

      // DynamicFormLogger + provideSignalFormsConfig + FIELD_REGISTRY + WRAPPER_REGISTRY + WRAPPER_AUTO_ASSOCIATIONS
      expect(providers.length).toBe(5);
    });

    it('should include logger provider when withLoggerConfig is used', () => {
      const envProviders = provideDynamicForm(withLoggerConfig());
      const providers = getProviders(envProviders);
      const loggerProvider = providers.find(
        (p): p is { provide: unknown } => typeof p === 'object' && p !== null && 'provide' in p && p.provide === DynamicFormLogger,
      );

      expect(loggerProvider).toBeDefined();
    });

    it('should use ConsoleLogger when enabled is true', () => {
      const envProviders = provideDynamicForm(withLoggerConfig(true));
      const providers = getProviders(envProviders);
      const loggerProvider = providers.find(
        (p): p is { provide: unknown; useValue: unknown } =>
          typeof p === 'object' && p !== null && 'provide' in p && p.provide === DynamicFormLogger,
      );

      expect(loggerProvider?.useValue).toBeInstanceOf(ConsoleLogger);
    });

    it('should use NoopLogger when enabled is false', () => {
      const envProviders = provideDynamicForm(withLoggerConfig(false));
      const providers = getProviders(envProviders);
      const loggerProvider = providers.find(
        (p): p is { provide: unknown; useValue: unknown } =>
          typeof p === 'object' && p !== null && 'provide' in p && p.provide === DynamicFormLogger,
      );

      expect(loggerProvider?.useValue).toBeInstanceOf(NoopLogger);
    });

    it('should separate field types from features correctly', () => {
      const customField1: FieldTypeDefinition = {
        name: 'custom1',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const customField2: FieldTypeDefinition = {
        name: 'custom2',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'include',
      };

      // Mix field types and features in different positions
      const envProviders = provideDynamicForm(customField1, withLoggerConfig(), customField2);
      const registry = createRegistryWithInjection(envProviders);

      // Both custom fields should be registered
      expect(registry.has('custom1')).toBe(true);
      expect(registry.has('custom2')).toBe(true);

      // Logger provider should exist (verified by successful registry creation)
      const logger = TestBed.inject(DynamicFormLogger);
      expect(logger).toBeDefined();
    });

    it('should allow features before field types', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      // Feature first, then field type
      const envProviders = provideDynamicForm(withLoggerConfig(), customField);
      const registry = createRegistryWithInjection(envProviders);

      expect(registry.has('custom')).toBe(true);
    });
  });

  describe('Built-in wrappers registration', () => {
    it('should register all built-in wrappers', () => {
      const envProviders = provideDynamicForm();
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.size).toBe(BUILT_IN_WRAPPERS.length);
      BUILT_IN_WRAPPERS.forEach((wrapper) => {
        expect(registry.has(wrapper.wrapperName)).toBe(true);
        expect(registry.get(wrapper.wrapperName)).toBe(wrapper);
      });
    });

    it('should register the css wrapper by default', () => {
      const envProviders = provideDynamicForm();
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.has('css')).toBe(true);
    });
  });

  describe('Custom wrappers registration', () => {
    it('should register a custom wrapper', () => {
      const customWrapper: WrapperTypeDefinition = {
        wrapperName: 'section',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const envProviders = provideDynamicForm(customWrapper);
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.has('section')).toBe(true);
      expect(registry.get('section')).toBe(customWrapper);
    });

    it('should register multiple custom wrappers', () => {
      const wrapper1: WrapperTypeDefinition = {
        wrapperName: 'section',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const wrapper2: WrapperTypeDefinition = {
        wrapperName: 'card',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const envProviders = provideDynamicForm(wrapper1, wrapper2);
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.has('section')).toBe(true);
      expect(registry.has('card')).toBe(true);
    });

    it('should include both built-in and custom wrappers', () => {
      const customWrapper: WrapperTypeDefinition = {
        wrapperName: 'section',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const envProviders = provideDynamicForm(customWrapper);
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.size).toBe(BUILT_IN_WRAPPERS.length + 1);
      expect(registry.has('css')).toBe(true);
      expect(registry.has('section')).toBe(true);
    });

    it('should warn when overwriting a built-in wrapper', () => {
      const customCss: WrapperTypeDefinition = {
        wrapperName: 'css',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const envProviders = provideDynamicForm(customCss, withLoggerConfig());
      createWrapperRegistryWithInjection(envProviders);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'Wrapper type "css" is already registered. Overwriting.');
    });
  });

  describe('createWrappers bundle', () => {
    it('should register wrappers from a bundle passed to provideDynamicForm', () => {
      interface SectionWrapperConfig {
        readonly type: 'section';
        readonly header?: string;
      }
      const bundle = createWrappers(
        {
          wrapperName: 'section',
          loadComponent: () => import('../fields/text/text-field.component'),
          props: wrapperProps<SectionWrapperConfig>(),
        },
        {
          wrapperName: 'card',
          loadComponent: () => import('../fields/text/text-field.component'),
        },
      );

      const envProviders = provideDynamicForm(bundle);
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.size).toBe(BUILT_IN_WRAPPERS.length + 2);
      expect(registry.has('section')).toBe(true);
      expect(registry.has('card')).toBe(true);
    });

    it('should merge a bundle alongside individual wrappers and field types', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom-input',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'include',
      };
      const individualWrapper: WrapperTypeDefinition = {
        wrapperName: 'solo',
        loadComponent: () => import('../fields/text/text-field.component'),
      };
      const bundle = createWrappers({
        wrapperName: 'bundled',
        loadComponent: () => import('../fields/text/text-field.component'),
      });

      const envProviders = provideDynamicForm(customField, individualWrapper, bundle);

      const fieldRegistry = createRegistryWithInjection(envProviders);
      const wrapperRegistry = TestBed.inject(WRAPPER_REGISTRY);

      expect(fieldRegistry.has('custom-input')).toBe(true);
      expect(wrapperRegistry.has('solo')).toBe(true);
      expect(wrapperRegistry.has('bundled')).toBe(true);
    });

    it('should preserve the types auto-association on the registered definition', () => {
      const bundle = createWrappers({
        wrapperName: 'highlight',
        loadComponent: () => import('../fields/text/text-field.component'),
        types: ['input', 'select'],
      });

      const envProviders = provideDynamicForm(bundle);
      const registry = createWrapperRegistryWithInjection(envProviders);

      expect(registry.get('highlight')?.types).toEqual(['input', 'select']);
    });
  });

  describe('Mixed fields and wrappers registration', () => {
    it('should register fields and wrappers passed together', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom-input',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'include',
      };

      const customWrapper: WrapperTypeDefinition = {
        wrapperName: 'section',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const envProviders = provideDynamicForm(customField, customWrapper);

      const fieldRegistry = createRegistryWithInjection(envProviders);
      const wrapperRegistry = TestBed.inject(WRAPPER_REGISTRY);

      expect(fieldRegistry.has('custom-input')).toBe(true);
      expect(wrapperRegistry.has('section')).toBe(true);
    });

    it('should correctly separate fields, wrappers, and features', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom-input',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'include',
      };

      const customWrapper: WrapperTypeDefinition = {
        wrapperName: 'section',
        loadComponent: () => import('../fields/text/text-field.component'),
      };

      const envProviders = provideDynamicForm(customField, customWrapper, withLoggerConfig());

      const fieldRegistry = createRegistryWithInjection(envProviders);
      const wrapperRegistry = TestBed.inject(WRAPPER_REGISTRY);
      const logger = TestBed.inject(DynamicFormLogger);

      // Fields registered correctly (built-in + custom, no wrappers leaking in)
      expect(fieldRegistry.has('custom-input')).toBe(true);
      expect(fieldRegistry.has('section')).toBe(false);

      // Wrappers registered correctly (built-in + custom, no fields leaking in)
      expect(wrapperRegistry.has('section')).toBe(true);
      expect(wrapperRegistry.has('custom-input')).toBe(false);

      // Feature applied
      expect(logger).toBeDefined();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideDynamicForm } from './dynamic-form-providers';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { BUILT_IN_FIELDS } from './built-in-fields';
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

      // Logger + provideSignalFormsConfig + FIELD_REGISTRY
      expect(providers).toHaveLength(3);
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

      // Logger + provideSignalFormsConfig + FIELD_REGISTRY
      expect(providers).toHaveLength(3);
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

      // Should have 3 providers: DynamicFormLogger, provideSignalFormsConfig, and FIELD_REGISTRY
      expect(providers.length).toBe(3);
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
});

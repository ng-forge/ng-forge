import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideDynamicForm } from './dynamic-form-providers';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { BUILT_IN_FIELDS } from './built-in-fields';

describe('provideDynamicForm', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Provider array structure', () => {
    it('should return an array of providers', () => {
      const providers = provideDynamicForm();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should return providers array with no custom fields', () => {
      const providers = provideDynamicForm();

      expect(providers).toHaveLength(1);
    });

    it('should return providers array with custom fields', () => {
      const customField: FieldTypeDefinition = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const providers = provideDynamicForm(customField);

      expect(providers).toHaveLength(1);
    });
  });

  describe('FIELD_REGISTRY provider', () => {
    it('should include FIELD_REGISTRY provider', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY);

      expect(registryProvider).toBeDefined();
    });

    it('should have useFactory for FIELD_REGISTRY', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      expect(registryProvider?.useFactory).toBeDefined();
      expect(typeof registryProvider?.useFactory).toBe('function');
    });
  });

  describe('Built-in fields registration', () => {
    it('should register all built-in fields', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.size).toBe(BUILT_IN_FIELDS.length);
      BUILT_IN_FIELDS.forEach((field) => {
        expect(registry.has(field.name)).toBe(true);
        expect(registry.get(field.name)).toBe(field);
      });
    });

    it('should register row field', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.has('row')).toBe(true);
    });

    it('should register group field', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.has('group')).toBe(true);
    });

    it('should register array field', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.has('array')).toBe(true);
    });

    it('should register page field', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.has('page')).toBe(true);
    });

    it('should register text field', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.has('text')).toBe(true);
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

      const providers = provideDynamicForm(customField);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

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

      const providers = provideDynamicForm(customField1, customField2);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

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

      const providers = provideDynamicForm(customField);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

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

      const providers = provideDynamicForm(customRow);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      registryProvider.useFactory();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Field type "row" is already registered. Overwriting.');
    });

    it('should overwrite built-in field with custom field', () => {
      const customRow: FieldTypeDefinition = {
        name: 'row',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude',
      };

      const providers = provideDynamicForm(customRow);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

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

      const providers = provideDynamicForm(customField1, customField2);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      registryProvider.useFactory();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Field type "myfield" is already registered. Overwriting.');
    });
  });

  describe('Registry structure', () => {
    it('should return a Map', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry).toBeInstanceOf(Map);
    });

    it('should use field names as keys', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();
      const keys = Array.from(registry.keys());

      keys.forEach((key) => {
        expect(typeof key).toBe('string');
        const field = registry.get(key);
        expect(field?.name).toBe(key);
      });
    });

    it('should store FieldTypeDefinition as values', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();
      const values = Array.from(registry.values());

      values.forEach((value) => {
        expect(value).toHaveProperty('name');
        expect(value).toHaveProperty('loadComponent');
        expect(value).toHaveProperty('mapper');
        expect(value).toHaveProperty('valueHandling');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty custom fields array', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.size).toBe(BUILT_IN_FIELDS.length);
    });

    it('should create new registry instance on each call to useFactory', () => {
      const providers = provideDynamicForm();
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry1 = registryProvider.useFactory();
      const registry2 = registryProvider.useFactory();

      expect(registry1).not.toBe(registry2);
      expect(registry1.size).toBe(registry2.size);
    });

    it('should handle many custom fields', () => {
      const customFields: FieldTypeDefinition[] = Array.from({ length: 10 }, (_, i) => ({
        name: `custom${i}`,
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude' as const,
      }));

      const providers = provideDynamicForm(...customFields);
      const registryProvider = providers.find((p) => typeof p === 'object' && 'provide' in p && p.provide === FIELD_REGISTRY) as {
        provide: unknown;
        useFactory: () => Map<string, FieldTypeDefinition>;
      };

      const registry = registryProvider.useFactory();

      expect(registry.size).toBe(BUILT_IN_FIELDS.length + 10);
      customFields.forEach((field) => {
        expect(registry.has(field.name)).toBe(true);
      });
    });
  });

  describe('Type inference', () => {
    it('should maintain type information for providers', () => {
      const providers = provideDynamicForm();

      // TypeScript should infer this as Provider[]
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should support const type parameters', () => {
      const customField = {
        name: 'custom',
        loadComponent: () => import('../fields/text/text-field.component'),
        mapper: vi.fn(),
        valueHandling: 'exclude' as const,
      } as const;

      const providers = provideDynamicForm(customField);

      expect(providers).toBeDefined();
    });
  });
});

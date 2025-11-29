import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RootFormRegistryService } from './root-form-registry.service';
import { FieldTree } from '@angular/forms/signals';

describe('RootFormRegistryService', () => {
  let service: RootFormRegistryService;

  beforeEach(() => {
    service = new RootFormRegistryService();
  });

  function createMockFieldTree(value: unknown): FieldTree<unknown> {
    return vi.fn(() => ({
      value: vi.fn(() => value),
      touched: vi.fn(() => false),
      valid: vi.fn(() => true),
    })) as unknown as FieldTree<unknown>;
  }

  describe('registerRootForm', () => {
    it('should register a root form with default id', () => {
      const mockForm = createMockFieldTree({ name: 'test' });

      service.registerRootForm(mockForm);
      const retrieved = service.getRootForm();

      expect(retrieved).toBe(mockForm);
    });

    it('should register a root form with custom id', () => {
      const mockForm = createMockFieldTree({ name: 'test' });

      service.registerRootForm(mockForm, 'customForm');
      const retrieved = service.getRootForm('customForm');

      expect(retrieved).toBe(mockForm);
    });

    it('should register multiple forms with different ids', () => {
      const form1 = createMockFieldTree({ name: 'form1' });
      const form2 = createMockFieldTree({ name: 'form2' });

      service.registerRootForm(form1, 'form1');
      service.registerRootForm(form2, 'form2');

      expect(service.getRootForm('form1')).toBe(form1);
      expect(service.getRootForm('form2')).toBe(form2);
    });

    it('should overwrite form with same id', () => {
      const form1 = createMockFieldTree({ name: 'first' });
      const form2 = createMockFieldTree({ name: 'second' });

      service.registerRootForm(form1, 'myForm');
      service.registerRootForm(form2, 'myForm');

      const retrieved = service.getRootForm('myForm');
      expect(retrieved).toBe(form2);
      expect(retrieved).not.toBe(form1);
    });
  });

  describe('getRootForm', () => {
    it('should return undefined for non-existent form', () => {
      const result = service.getRootForm('nonExistent');

      expect(result).toBeUndefined();
    });

    it('should return undefined for default form when not registered', () => {
      const result = service.getRootForm();

      expect(result).toBeUndefined();
    });

    it('should return registered form', () => {
      const mockForm = createMockFieldTree({ name: 'test' });

      service.registerRootForm(mockForm, 'testForm');
      const result = service.getRootForm('testForm');

      expect(result).toBe(mockForm);
    });

    it('should maintain form reference integrity', () => {
      const mockForm = createMockFieldTree({ name: 'test' });

      service.registerRootForm(mockForm);
      const retrieved1 = service.getRootForm();
      const retrieved2 = service.getRootForm();

      expect(retrieved1).toBe(mockForm);
      expect(retrieved2).toBe(mockForm);
      expect(retrieved1).toBe(retrieved2);
    });
  });

  describe('registerFormContext', () => {
    it('should register form context with default id', () => {
      const context = { fieldPaths: { email: 'user.email' } };

      service.registerFormContext(context);
      const retrieved = service.getFormContext();

      expect(retrieved).toEqual(context);
    });

    it('should register form context with custom id', () => {
      const context = { fieldPaths: { name: 'user.name' } };

      service.registerFormContext(context, 'customForm');
      const retrieved = service.getFormContext('customForm');

      expect(retrieved).toEqual(context);
    });

    it('should register multiple contexts with different ids', () => {
      const context1 = { fieldPaths: { field1: 'path1' } };
      const context2 = { fieldPaths: { field2: 'path2' } };

      service.registerFormContext(context1, 'form1');
      service.registerFormContext(context2, 'form2');

      expect(service.getFormContext('form1')).toEqual(context1);
      expect(service.getFormContext('form2')).toEqual(context2);
    });

    it('should overwrite context with same id', () => {
      const context1 = { fieldPaths: { old: 'oldPath' } };
      const context2 = { fieldPaths: { new: 'newPath' } };

      service.registerFormContext(context1, 'myForm');
      service.registerFormContext(context2, 'myForm');

      const retrieved = service.getFormContext('myForm');
      expect(retrieved).toEqual(context2);
      expect(retrieved).not.toEqual(context1);
    });

    it('should handle empty context object', () => {
      const context = {};

      service.registerFormContext(context);
      const retrieved = service.getFormContext();

      expect(retrieved).toEqual({});
    });

    it('should handle context with complex nested data', () => {
      const context = {
        fieldPaths: {
          email: 'user.email',
          address: 'user.address',
        },
        metadata: {
          createdAt: '2024-01-01',
          version: 1,
        },
      };

      service.registerFormContext(context);
      const retrieved = service.getFormContext();

      expect(retrieved).toEqual(context);
    });
  });

  describe('getFormContext', () => {
    it('should return empty object for non-existent context', () => {
      const result = service.getFormContext('nonExistent');

      expect(result).toEqual({});
    });

    it('should return empty object for default context when not registered', () => {
      const result = service.getFormContext();

      expect(result).toEqual({});
    });

    it('should return registered context', () => {
      const context = { fieldPaths: { test: 'test.path' } };

      service.registerFormContext(context, 'testForm');
      const result = service.getFormContext('testForm');

      expect(result).toEqual(context);
    });

    it('should maintain context reference integrity', () => {
      const context = { fieldPaths: { field: 'path' } };

      service.registerFormContext(context);
      const retrieved1 = service.getFormContext();
      const retrieved2 = service.getFormContext();

      expect(retrieved1).toBe(context);
      expect(retrieved2).toBe(context);
      expect(retrieved1).toBe(retrieved2);
    });
  });

  describe('unregisterForm', () => {
    it('should unregister form and context with default id', () => {
      const mockForm = createMockFieldTree({ name: 'test' });
      const context = { fieldPaths: {} };

      service.registerRootForm(mockForm);
      service.registerFormContext(context);

      service.unregisterForm();

      expect(service.getRootForm()).toBeUndefined();
      expect(service.getFormContext()).toEqual({});
    });

    it('should unregister form and context with custom id', () => {
      const mockForm = createMockFieldTree({ name: 'test' });
      const context = { fieldPaths: {} };

      service.registerRootForm(mockForm, 'customForm');
      service.registerFormContext(context, 'customForm');

      service.unregisterForm('customForm');

      expect(service.getRootForm('customForm')).toBeUndefined();
      expect(service.getFormContext('customForm')).toEqual({});
    });

    it('should not affect other registered forms', () => {
      const form1 = createMockFieldTree({ name: 'form1' });
      const form2 = createMockFieldTree({ name: 'form2' });

      service.registerRootForm(form1, 'form1');
      service.registerRootForm(form2, 'form2');

      service.unregisterForm('form1');

      expect(service.getRootForm('form1')).toBeUndefined();
      expect(service.getRootForm('form2')).toBe(form2);
    });

    it('should not throw when unregistering non-existent form', () => {
      expect(() => service.unregisterForm('nonExistent')).not.toThrow();
    });

    it('should allow re-registering after unregister', () => {
      const form1 = createMockFieldTree({ name: 'first' });
      const form2 = createMockFieldTree({ name: 'second' });

      service.registerRootForm(form1, 'myForm');
      service.unregisterForm('myForm');
      service.registerRootForm(form2, 'myForm');

      expect(service.getRootForm('myForm')).toBe(form2);
    });
  });

  describe('getRegisteredFormIds', () => {
    it('should return empty array when no forms registered', () => {
      const ids = service.getRegisteredFormIds();

      expect(ids).toEqual([]);
    });

    it('should return single form id', () => {
      const mockForm = createMockFieldTree({ name: 'test' });

      service.registerRootForm(mockForm, 'myForm');
      const ids = service.getRegisteredFormIds();

      expect(ids).toEqual(['myForm']);
    });

    it('should return multiple form ids', () => {
      const form1 = createMockFieldTree({ name: 'form1' });
      const form2 = createMockFieldTree({ name: 'form2' });
      const form3 = createMockFieldTree({ name: 'form3' });

      service.registerRootForm(form1, 'form1');
      service.registerRootForm(form2, 'form2');
      service.registerRootForm(form3, 'form3');

      const ids = service.getRegisteredFormIds();

      expect(ids).toHaveLength(3);
      expect(ids).toContain('form1');
      expect(ids).toContain('form2');
      expect(ids).toContain('form3');
    });

    it('should return default id when form registered without id', () => {
      const mockForm = createMockFieldTree({ name: 'test' });

      service.registerRootForm(mockForm);
      const ids = service.getRegisteredFormIds();

      expect(ids).toEqual(['default']);
    });

    it('should update after unregistering form', () => {
      const form1 = createMockFieldTree({ name: 'form1' });
      const form2 = createMockFieldTree({ name: 'form2' });

      service.registerRootForm(form1, 'form1');
      service.registerRootForm(form2, 'form2');

      service.unregisterForm('form1');
      const ids = service.getRegisteredFormIds();

      expect(ids).toEqual(['form2']);
    });
  });

  describe('clear', () => {
    it('should clear all registered forms and contexts', () => {
      const form1 = createMockFieldTree({ name: 'form1' });
      const form2 = createMockFieldTree({ name: 'form2' });
      const context1 = { fieldPaths: { field1: 'path1' } };
      const context2 = { fieldPaths: { field2: 'path2' } };

      service.registerRootForm(form1, 'form1');
      service.registerRootForm(form2, 'form2');
      service.registerFormContext(context1, 'form1');
      service.registerFormContext(context2, 'form2');

      service.clear();

      expect(service.getRegisteredFormIds()).toEqual([]);
      expect(service.getRootForm('form1')).toBeUndefined();
      expect(service.getRootForm('form2')).toBeUndefined();
      expect(service.getFormContext('form1')).toEqual({});
      expect(service.getFormContext('form2')).toEqual({});
    });

    it('should allow re-registering after clear', () => {
      const form1 = createMockFieldTree({ name: 'first' });
      const form2 = createMockFieldTree({ name: 'second' });

      service.registerRootForm(form1, 'myForm');
      service.clear();
      service.registerRootForm(form2, 'myForm');

      expect(service.getRootForm('myForm')).toBe(form2);
      expect(service.getRegisteredFormIds()).toEqual(['myForm']);
    });

    it('should not throw when clearing empty registry', () => {
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle form ids with special characters', () => {
      const mockForm = createMockFieldTree({ name: 'test' });
      const formId = 'form-with-dashes_and_underscores.and.dots';

      service.registerRootForm(mockForm, formId);
      const retrieved = service.getRootForm(formId);

      expect(retrieved).toBe(mockForm);
      expect(service.getRegisteredFormIds()).toContain(formId);
    });

    it('should handle registering form and context separately', () => {
      const mockForm = createMockFieldTree({ name: 'test' });
      const context = { fieldPaths: { field: 'path' } };

      service.registerRootForm(mockForm, 'myForm');
      expect(service.getFormContext('myForm')).toEqual({});

      service.registerFormContext(context, 'myForm');
      expect(service.getRootForm('myForm')).toBe(mockForm);
      expect(service.getFormContext('myForm')).toEqual(context);
    });

    it('should handle registering context without form', () => {
      const context = { fieldPaths: { field: 'path' } };

      service.registerFormContext(context, 'myForm');

      expect(service.getFormContext('myForm')).toEqual(context);
      expect(service.getRootForm('myForm')).toBeUndefined();
    });

    it('should handle unregistering form while keeping context isolated', () => {
      const mockForm = createMockFieldTree({ name: 'test' });
      const context = { fieldPaths: { field: 'path' } };

      service.registerRootForm(mockForm, 'form1');
      service.registerFormContext(context, 'form2');

      service.unregisterForm('form1');

      expect(service.getRootForm('form1')).toBeUndefined();
      expect(service.getFormContext('form2')).toEqual(context);
    });
  });

  describe('multiple operations workflow', () => {
    it('should handle complete lifecycle', () => {
      const mockForm = createMockFieldTree({ name: 'test' });
      const context = { fieldPaths: { email: 'user.email' } };

      // Register
      service.registerRootForm(mockForm, 'userForm');
      service.registerFormContext(context, 'userForm');

      expect(service.getRootForm('userForm')).toBe(mockForm);
      expect(service.getFormContext('userForm')).toEqual(context);
      expect(service.getRegisteredFormIds()).toContain('userForm');

      // Unregister
      service.unregisterForm('userForm');

      expect(service.getRootForm('userForm')).toBeUndefined();
      expect(service.getFormContext('userForm')).toEqual({});
      expect(service.getRegisteredFormIds()).not.toContain('userForm');

      // Re-register
      service.registerRootForm(mockForm, 'userForm');
      service.registerFormContext(context, 'userForm');

      expect(service.getRootForm('userForm')).toBe(mockForm);
      expect(service.getFormContext('userForm')).toEqual(context);

      // Clear all
      service.clear();

      expect(service.getRegisteredFormIds()).toEqual([]);
    });

    it('should handle concurrent form management', () => {
      const forms = [
        { id: 'form1', field: createMockFieldTree({ name: 'form1' }), context: { data: 'context1' } },
        { id: 'form2', field: createMockFieldTree({ name: 'form2' }), context: { data: 'context2' } },
        { id: 'form3', field: createMockFieldTree({ name: 'form3' }), context: { data: 'context3' } },
      ];

      forms.forEach((f) => {
        service.registerRootForm(f.field, f.id);
        service.registerFormContext(f.context, f.id);
      });

      expect(service.getRegisteredFormIds()).toHaveLength(3);

      service.unregisterForm('form2');

      expect(service.getRegisteredFormIds()).toHaveLength(2);
      expect(service.getRootForm('form1')).toBe(forms[0].field);
      expect(service.getRootForm('form2')).toBeUndefined();
      expect(service.getRootForm('form3')).toBe(forms[2].field);
    });
  });
});

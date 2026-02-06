import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, schema } from '@angular/forms/signals';
import { mapFieldToForm } from '../../core/form-mapping';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService, SchemaRegistryService } from '../../core/registry';

describe('Form Mapping Pipeline Integration (End-to-End)', () => {
  let injector: Injector;
  let schemaRegistry: SchemaRegistryService;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        SchemaRegistryService,
      ],
    });

    injector = TestBed.inject(Injector);
    schemaRegistry = TestBed.inject(SchemaRegistryService);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('Simple Field Mapping', () => {
    it('should map field with simple validation', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'username',
          type: 'input',
          required: true,
          minLength: 3,
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.username);
          }),
        );
        mockFormSignal.set(formInstance);

        // Should be invalid (empty + required)
        expect(formInstance().valid()).toBe(false);

        // Too short (< 3 chars)
        formValue.set({ username: 'ab' });
        expect(formInstance().valid()).toBe(false);

        // Valid
        formValue.set({ username: 'alice' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should map field with advanced validators', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'email',
          type: 'input',
          validators: [{ type: 'required' }, { type: 'email' }],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'invalid' });
        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'valid@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should map field with logic', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ show: false, field: 'test' });
        // Register the form value signal BEFORE form creation for cross-field logic

        mockEntity.set(formValue() as Record<string, unknown>);

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'field',
          type: 'input',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'show',
                operator: 'equals',
                value: false,
              },
            },
          ],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.field);
          }),
        );
        mockFormSignal.set(formInstance);

        // Hidden when show is false
        expect(formInstance.field().hidden()).toBe(true);

        formValue.set({ show: true, field: 'test' });
        expect(formInstance.field().hidden()).toBe(false);
      });
    });

    it('should map field with schemas', () => {
      runInInjectionContext(injector, () => {
        // Register a schema
        schemaRegistry.registerSchema({
          name: 'emailSchema',
          validators: [{ type: 'required' }, { type: 'email' }],
        });

        const formValue = signal({ email: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'email',
          type: 'input',
          schemas: [{ type: 'apply', schema: 'emailSchema' }],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'test@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Complex Field Mapping', () => {
    it('should map field with validators + logic + schemas', () => {
      runInInjectionContext(injector, () => {
        schemaRegistry.registerSchema({
          name: 'strongPassword',
          validators: [{ type: 'minLength', value: 8 }],
        });

        const formValue = signal({ requirePassword: true, password: '' });
        // Register the form value signal BEFORE form creation for cross-field logic

        mockEntity.set(formValue() as Record<string, unknown>);

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'password',
          type: 'input',
          validators: [{ type: 'required' }],
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'requirePassword',
                operator: 'equals',
                value: false,
              },
            },
          ],
          schemas: [{ type: 'apply', schema: 'strongPassword' }],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.password);
          }),
        );
        mockFormSignal.set(formInstance);

        // Visible and invalid (required + too short)
        expect(formInstance.password().hidden()).toBe(false);
        expect(formInstance().valid()).toBe(false);

        // Still invalid (too short)
        formValue.set({ requirePassword: true, password: 'pass' });
        expect(formInstance().valid()).toBe(false);

        // Valid
        formValue.set({ requirePassword: true, password: 'password123' });
        expect(formInstance().valid()).toBe(true);

        // Hidden but still validated
        formValue.set({ requirePassword: false, password: 'password123' });
        expect(formInstance.password().hidden()).toBe(true);
      });
    });

    it('should apply transformations in correct order', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'username',
          type: 'input',
          // Simple validators (backward compat)
          required: true,
          minLength: 3,
          // Advanced validators
          validators: [{ type: 'maxLength', value: 20 }],
          // Logic
          logic: [{ type: 'readonly', condition: false }],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.username);
          }),
        );
        mockFormSignal.set(formInstance);

        // All validators should be applied
        expect(formInstance().valid()).toBe(false);

        formValue.set({ username: 'ab' }); // Too short
        expect(formInstance().valid()).toBe(false);

        formValue.set({ username: 'alice' }); // Valid
        expect(formInstance().valid()).toBe(true);

        formValue.set({ username: 'a'.repeat(25) }); // Too long
        expect(formInstance().valid()).toBe(false);

        // Logic should be applied
        expect(formInstance.username().readonly()).toBe(false);
      });
    });
  });

  describe('Special Field Types', () => {
    it('should flatten page field children to root', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ firstName: '', lastName: '' });
        const formSchema = schema<typeof formValue>((path) => {
          const pageField: FieldDef<any> = {
            key: 'page1',
            type: 'page',
            fields: [
              {
                key: 'firstName',
                type: 'input',
                required: true,
              } as FieldDef<any> & FieldWithValidation,

              {
                key: 'lastName',
                type: 'input',
                required: true,
              } as FieldDef<any> & FieldWithValidation,
            ],
          };

          // Map page field (should flatten children)

          mapFieldToForm(pageField, path as any);
        });

        const formInstance = form(formValue, formSchema);
        mockFormSignal.set(formInstance);

        // Both fields should be required at root level
        expect(formInstance().valid()).toBe(false);

        formValue.set({ firstName: 'John', lastName: '' });
        expect(formInstance().valid()).toBe(false);

        formValue.set({ firstName: 'John', lastName: 'Doe' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should nest group field children correctly', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({
          address: { street: '', city: '' },
        });

        const formSchema = schema<typeof formValue>((path) => {
          const groupField: FieldDef<any> = {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'street',
                type: 'input',
                required: true,
              } as FieldDef<any> & FieldWithValidation,

              {
                key: 'city',
                type: 'input',
                required: true,
              } as FieldDef<any> & FieldWithValidation,
            ],
          };

          mapFieldToForm(groupField, path.address);
        });

        const formInstance = form(formValue, formSchema);
        mockFormSignal.set(formInstance);

        // Nested fields should be validated
        expect(formInstance().valid()).toBe(false);

        formValue.set({
          address: { street: '123 Main St', city: '' },
        });
        expect(formInstance().valid()).toBe(false);

        formValue.set({
          address: { street: '123 Main St', city: 'Springfield' },
        });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle row field flattening', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '', phone: '' });
        const formSchema = schema<typeof formValue>((path) => {
          const rowField: FieldDef<any> = {
            key: 'row1',
            type: 'row',
            fields: [
              {
                key: 'email',
                type: 'input',
                email: true,
              } as FieldDef<any> & FieldWithValidation,

              {
                key: 'phone',
                type: 'input',
                pattern: /^\d{10}$/,
              } as FieldDef<any> & FieldWithValidation,
            ],
          };

          mapFieldToForm(rowField, path as any);
        });

        const formInstance = form(formValue, formSchema);
        mockFormSignal.set(formInstance);

        // Invalid email and phone
        formValue.set({ email: 'invalid', phone: '123' });
        expect(formInstance().valid()).toBe(false);

        // Valid
        formValue.set({ email: 'test@example.com', phone: '1234567890' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle flat array field with primitive values', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({
          tags: ['', '', ''],
        });

        const formSchema = schema<typeof formValue>((path) => {
          const arrayField: FieldDef<any> = {
            key: 'tags',
            type: 'array',
            fields: [
              {
                key: 'tag',
                type: 'input',
                required: true,
                minLength: 2,
              } as FieldDef<any> & FieldWithValidation,
            ],
          };

          mapFieldToForm(arrayField, path.tags as any);
        });

        const formInstance = form(formValue, formSchema);
        mockFormSignal.set(formInstance);

        // Array itself is registered (no validation on empty array for now)
        // TODO: Add array-level validation (minLength, maxLength) once implemented
        expect(formInstance.tags).toBeDefined();

        // Note: Array item validation is handled dynamically by ArrayFieldComponent
        // at runtime, not during static schema creation. This test verifies that
        // the array field itself is properly registered in the form.
      });
    });

    it('should handle object array field with nested group', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({
          contacts: [
            { name: '', email: '' },
            { name: '', email: '' },
          ],
        });

        const formSchema = schema<typeof formValue>((path) => {
          const arrayField: FieldDef<any> = {
            key: 'contacts',
            type: 'array',
            fields: [
              {
                type: 'group',
                fields: [
                  {
                    key: 'name',
                    type: 'input',
                    required: true,
                  } as FieldDef<any> & FieldWithValidation,

                  {
                    key: 'email',
                    type: 'input',
                    required: true,
                    email: true,
                  } as FieldDef<any> & FieldWithValidation,
                ],
              },
            ],
          };

          mapFieldToForm(arrayField, path.contacts as any);
        });

        const formInstance = form(formValue, formSchema);
        mockFormSignal.set(formInstance);

        // Array itself is registered
        expect(formInstance.contacts).toBeDefined();

        // Note: Object array validation (for nested group fields) is handled
        // dynamically by ArrayFieldComponent at runtime. This test verifies
        // that the array field with a group template is properly registered.
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should apply simple validation rules from field properties', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        // Using deprecated properties

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'email',
          type: 'input',
          required: true,
          email: true,
          minLength: 5,
          maxLength: 50,
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'test@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should combine simple and advanced validators', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ password: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'password',
          type: 'input',
          // Old API
          required: true,
          minLength: 8,
          // New API
          validators: [{ type: 'pattern', value: /[A-Z]/ }],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.password);
          }),
        );
        mockFormSignal.set(formInstance);

        // Empty - fails required
        expect(formInstance().valid()).toBe(false);

        // Too short - fails minLength
        formValue.set({ password: 'pass' });
        expect(formInstance().valid()).toBe(false);

        // No uppercase - fails pattern
        formValue.set({ password: 'password' });
        expect(formInstance().valid()).toBe(false);

        // All validators pass
        formValue.set({ password: 'Password123' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle numeric validation properties', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ age: 0 });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'age',
          type: 'input',
          min: 18,
          max: 100,
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.age);
          }),
        );
        mockFormSignal.set(formInstance);

        // Too young
        formValue.set({ age: 10 });
        expect(formInstance().valid()).toBe(false);

        // Valid
        formValue.set({ age: 25 });
        expect(formInstance().valid()).toBe(true);

        // Too old
        formValue.set({ age: 150 });
        expect(formInstance().valid()).toBe(false);
      });
    });

    it('should apply pattern validation from field property', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ zipCode: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'zipCode',
          type: 'input',
          pattern: /^\d{5}$/,
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.zipCode);
          }),
        );
        mockFormSignal.set(formInstance);

        formValue.set({ zipCode: '123' });
        expect(formInstance().valid()).toBe(false);

        formValue.set({ zipCode: '12345' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle field with disabled property', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ field: 'test' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'field',
          type: 'input',
          disabled: true,
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.field);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.field().disabled()).toBe(true);
      });
    });

    it('should handle field with no validation', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ field: '' });

        const fieldDef: FieldDef<any> = {
          key: 'field',
          type: 'input',
        };

        // Should not throw
        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.field);
          }),
        );
        mockFormSignal.set(formInstance);

        // Should be valid (no validation rules)
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle complex nested schema structures', () => {
      runInInjectionContext(injector, () => {
        // Register nested schemas
        schemaRegistry.registerSchema({
          name: 'baseValidation',
          validators: [{ type: 'required' }],
        });

        schemaRegistry.registerSchema({
          name: 'emailValidation',
          validators: [{ type: 'email' }],
          subSchemas: [{ type: 'apply', schema: 'baseValidation' }],
        });

        const formValue = signal({ email: '' });

        const fieldDef: FieldDef<any> & FieldWithValidation = {
          key: 'email',
          type: 'input',
          schemas: [{ type: 'apply', schema: 'emailValidation' }],
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            mapFieldToForm(fieldDef, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        // Should have both required (from nested schema) and email validation
        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'invalid' });
        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'valid@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });
});

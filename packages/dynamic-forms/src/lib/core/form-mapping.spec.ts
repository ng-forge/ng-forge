import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { FieldDef } from '../definitions/base/field-def';
import { FieldWithValidation } from '../definitions/base/field-with-validation';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService, SchemaRegistryService } from './registry';
import { FormStateManager } from '../state/form-state-manager';
import { mapFieldToForm } from './form-mapping';

describe('form-mapping', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FunctionRegistryService,
        FieldContextRegistryService,
        SchemaRegistryService,
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('mapFieldToForm', () => {
    describe('field type routing', () => {
      it('should handle page fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input' },
              { key: 'field2', type: 'input' },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle group fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input' },
              { key: 'city', type: 'input' },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle regular fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('simple validation rules', () => {
      it('should handle required property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle email property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            email: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle min property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            min: 18,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle max property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            max: 120,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle minLength property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            minLength: 3,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle maxLength property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            maxLength: 20,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle pattern string without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: '^[a-z]+$',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle pattern RegExp without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: /^[a-z]+$/,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle fields with no validation properties', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'field',
            type: 'input',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.field);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('advanced validators/logic/schemas', () => {
      it('should handle advanced validators without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            validators: [{ type: 'required' }, { type: 'email' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle logic configurations without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            logic: [
              { type: 'hidden', condition: false },
              { type: 'readonly', condition: true },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle schema configurations without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            schemas: [{ type: 'apply', schema: 'emailSchema' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle combined validators, logic, and schemas', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
            validators: [{ type: 'email' }],
            logic: [{ type: 'hidden', condition: false }],
            schemas: [{ type: 'apply', schema: 'test' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('field-specific configuration', () => {
      it('should handle disabled state without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
            disabled: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle custom form configuration without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });

          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
            customFormConfig: { custom: true },
          } as FieldDef & { customFormConfig: unknown };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle fields without custom config', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('page field flattening', () => {
      it('should handle page fields with children without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { type: 'input' }, // No key
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle page fields with missing paths', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input', validators: [{ type: 'required' }] },
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle empty page fields array', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({});
          const pageField: FieldDef = {
            type: 'page',
            fields: [],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle page field without fields property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({});
          const pageField: FieldDef = {
            type: 'page',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle nested page fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              {
                type: 'page',
                fields: [{ key: 'field1', type: 'input', validators: [{ type: 'required' }] }],
              },
              { key: 'field2', type: 'input', validators: [{ type: 'email' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('group field flattening', () => {
      it('should handle group fields with children without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { type: 'input' }, // No key
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle group fields with missing nested paths', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input', validators: [{ type: 'required' }] },
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle empty group fields array', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: {} });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle group field without fields property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: {} });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle nested group fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { location: { street: '', city: '' } } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'location',
                type: 'group',
                fields: [
                  { key: 'street', type: 'input', validators: [{ type: 'required' }] },
                  { key: 'city', type: 'input', validators: [{ type: 'required' }] },
                ],
              },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });
  });
});

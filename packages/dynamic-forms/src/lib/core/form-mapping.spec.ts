import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { FieldDef, FieldWithValidation } from '../definitions';
import { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from './registry';
import { mapFieldToForm } from './form-mapping';

describe('form-mapping', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService, SchemaRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
        });
      });

      it('should log custom form configuration', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

          const fieldDef: any = {
            key: 'email',
            type: 'input',
            customFormConfig: { custom: true },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.email);
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);

          expect(consoleLogSpy).toHaveBeenCalledWith('Custom form configuration detected for field:', 'email');
          consoleLogSpy.mockRestore();
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
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
          rootFormRegistry.registerRootForm(formInstance);
        });
      });
    });
  });
});

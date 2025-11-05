import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form } from '@angular/forms/signals';
import { FieldDef, FieldWithValidation } from '../definitions';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from './registry';
import { mapFieldToForm } from './form-mapping';

describe('form-mapping', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('mapFieldToForm', () => {
    describe('field type routing', () => {
      it('should handle page fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input' },
              { key: 'field2', type: 'input' },
            ],
          };

          expect(() => {
            mapFieldToForm(pageField, formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle group fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input' },
              { key: 'city', type: 'input' },
            ],
          };

          expect(() => {
            mapFieldToForm(groupField, formInstance().controls.address);
          }).not.toThrow();
        });
      });

      it('should handle regular fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('simple validation rules', () => {
      it('should handle required property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle email property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            email: true,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle min property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            min: 18,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.age);
          }).not.toThrow();
        });
      });

      it('should handle max property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            max: 120,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.age);
          }).not.toThrow();
        });
      });

      it('should handle minLength property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            minLength: 3,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should handle maxLength property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            maxLength: 20,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should handle pattern string without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: '^[a-z]+$',
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should handle pattern RegExp without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: /^[a-z]+$/,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should handle fields with no validation properties', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'field',
            type: 'input',
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.field);
          }).not.toThrow();
        });
      });
    });

    describe('advanced validators/logic/schemas', () => {
      it('should handle advanced validators without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            validators: [{ type: 'required' }, { type: 'email' }],
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle logic configurations without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            logic: [
              { type: 'hidden', condition: false },
              { type: 'readonly', condition: true },
            ],
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle schema configurations without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            schemas: [{ type: 'apply', schema: 'emailSchema' }],
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle combined validators, logic, and schemas', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
            validators: [{ type: 'email' }],
            logic: [{ type: 'hidden', condition: false }],
            schemas: [{ type: 'apply', schema: 'test' }],
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('field-specific configuration', () => {
      it('should handle disabled state without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
            disabled: true,
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should log custom form configuration', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
          const fieldDef: any = {
            key: 'email',
            type: 'input',
            customFormConfig: { custom: true },
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(consoleLogSpy).toHaveBeenCalledWith('Custom form configuration detected for field:', 'email');
          consoleLogSpy.mockRestore();
        });
      });

      it('should handle fields without custom config', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
          };

          expect(() => {
            mapFieldToForm(fieldDef, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('page field flattening', () => {
      it('should handle page fields with children without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { type: 'input' }, // No key
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          expect(() => {
            mapFieldToForm(pageField, formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle page fields with missing paths', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input', validators: [{ type: 'required' }] },
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          expect(() => {
            mapFieldToForm(pageField, formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle empty page fields array', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({});
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const pageField: FieldDef = {
            type: 'page',
            fields: [],
          };

          expect(() => {
            mapFieldToForm(pageField, formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle page field without fields property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({});
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const pageField: FieldDef = {
            type: 'page',
          };

          expect(() => {
            mapFieldToForm(pageField, formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle nested page fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

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

          expect(() => {
            mapFieldToForm(pageField, formInstance().controls as any);
          }).not.toThrow();
        });
      });
    });

    describe('group field flattening', () => {
      it('should handle group fields with children without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { type: 'input' }, // No key
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          expect(() => {
            mapFieldToForm(groupField, formInstance().controls.address);
          }).not.toThrow();
        });
      });

      it('should handle group fields with missing nested paths', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input', validators: [{ type: 'required' }] },
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          expect(() => {
            mapFieldToForm(groupField, formInstance().controls.address);
          }).not.toThrow();
        });
      });

      it('should handle empty group fields array', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: {} });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [],
          };

          expect(() => {
            mapFieldToForm(groupField, formInstance().controls.address);
          }).not.toThrow();
        });
      });

      it('should handle group field without fields property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: {} });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
          };

          expect(() => {
            mapFieldToForm(groupField, formInstance().controls.address);
          }).not.toThrow();
        });
      });

      it('should handle nested group fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { location: { street: '', city: '' } } });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

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

          expect(() => {
            mapFieldToForm(groupField, formInstance().controls.address);
          }).not.toThrow();
        });
      });
    });
  });
});

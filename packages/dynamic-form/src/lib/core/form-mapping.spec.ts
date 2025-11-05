import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as angularSignals from '@angular/forms/signals';
import { form } from '@angular/forms/signals';
import { FieldDef, FieldWithValidation } from '../definitions';
import { RootFormRegistryService } from './registry';
import { mapFieldToForm } from './form-mapping';
import * as validatorFactory from './validation/validator-factory';
import * as logicApplicator from './logic/logic-applicator';
import * as schemaApplication from './schema-application';

describe('form-mapping', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('mapFieldToForm', () => {
    describe('field type routing', () => {
      it('should route page fields to mapPageFieldToForm', () => {
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

          // Spy on applyValidator to ensure it's called for children
          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');

          mapFieldToForm(pageField, formInstance().controls as any);

          // Page field should not apply validators directly
          // But children should be processed
          applyValidatorSpy.mockRestore();
        });
      });

      it('should route group fields to mapGroupFieldToForm', () => {
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

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');

          mapFieldToForm(groupField, formInstance().controls.address);

          // Group field processing happens
          applyValidatorSpy.mockRestore();
        });
      });

      it('should process regular fields normally', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const requiredSpy = vi.spyOn(angularSignals, 'required');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(requiredSpy).toHaveBeenCalledTimes(1);
          requiredSpy.mockRestore();
        });
      });
    });

    describe('simple validation rules (backward compatibility)', () => {
      it('should apply required from field property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const requiredSpy = vi.spyOn(angularSignals, 'required');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(requiredSpy).toHaveBeenCalledTimes(1);
          requiredSpy.mockRestore();
        });
      });

      it('should apply email from field property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const emailSpy = vi.spyOn(angularSignals, 'email');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            email: true,
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(emailSpy).toHaveBeenCalledTimes(1);
          emailSpy.mockRestore();
        });
      });

      it('should apply min from field property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            min: 18,
          };

          mapFieldToForm(fieldDef, formInstance().controls.age);

          expect(minSpy).toHaveBeenCalledWith(expect.anything(), 18);
          minSpy.mockRestore();
        });
      });

      it('should apply max from field property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const maxSpy = vi.spyOn(angularSignals, 'max');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            max: 120,
          };

          mapFieldToForm(fieldDef, formInstance().controls.age);

          expect(maxSpy).toHaveBeenCalledWith(expect.anything(), 120);
          maxSpy.mockRestore();
        });
      });

      it('should apply minLength from field property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minLengthSpy = vi.spyOn(angularSignals, 'minLength');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            minLength: 3,
          };

          mapFieldToForm(fieldDef, formInstance().controls.username);

          expect(minLengthSpy).toHaveBeenCalledWith(expect.anything(), 3);
          minLengthSpy.mockRestore();
        });
      });

      it('should apply maxLength from field property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const maxLengthSpy = vi.spyOn(angularSignals, 'maxLength');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            maxLength: 20,
          };

          mapFieldToForm(fieldDef, formInstance().controls.username);

          expect(maxLengthSpy).toHaveBeenCalledWith(expect.anything(), 20);
          maxLengthSpy.mockRestore();
        });
      });

      it('should convert pattern string to RegExp', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: '^[a-z]+$',
          };

          mapFieldToForm(fieldDef, formInstance().controls.username);

          expect(patternSpy).toHaveBeenCalledTimes(1);
          const callArgs = patternSpy.mock.calls[0];
          expect(callArgs[1]).toBeInstanceOf(RegExp);
          expect((callArgs[1] as RegExp).source).toBe('^[a-z]+$');
          patternSpy.mockRestore();
        });
      });

      it('should apply pattern RegExp directly', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const regex = /^[a-z]+$/;
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: regex,
          };

          mapFieldToForm(fieldDef, formInstance().controls.username);

          expect(patternSpy).toHaveBeenCalledWith(expect.anything(), regex);
          patternSpy.mockRestore();
        });
      });

      it('should skip validators when values are undefined', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const maxSpy = vi.spyOn(angularSignals, 'max');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'field',
            type: 'input',
            // No validation properties set
          };

          mapFieldToForm(fieldDef, formInstance().controls.field);

          expect(minSpy).not.toHaveBeenCalled();
          expect(maxSpy).not.toHaveBeenCalled();
          minSpy.mockRestore();
          maxSpy.mockRestore();
        });
      });
    });

    describe('advanced validators/logic/schemas', () => {
      it('should apply advanced validators', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            validators: [{ type: 'required' }, { type: 'email' }],
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(applyValidatorSpy).toHaveBeenCalledTimes(2);
          applyValidatorSpy.mockRestore();
        });
      });

      it('should apply logic configurations', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyLogicSpy = vi.spyOn(logicApplicator, 'applyLogic');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            logic: [
              { type: 'hidden', condition: false },
              { type: 'readonly', condition: true },
            ],
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(applyLogicSpy).toHaveBeenCalledTimes(2);
          applyLogicSpy.mockRestore();
        });
      });

      it('should apply schema configurations', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applySchemaSpy = vi.spyOn(schemaApplication, 'applySchema');
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            schemas: [{ type: 'apply', schema: 'emailSchema' }],
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(applySchemaSpy).toHaveBeenCalledTimes(1);
          applySchemaSpy.mockRestore();
        });
      });

      it('should apply validators, logic, and schemas in correct order', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const callOrder: string[] = [];
          const requiredSpy = vi.spyOn(angularSignals, 'required').mockImplementation(() => {
            callOrder.push('simple-required');
          });
          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator').mockImplementation(() => {
            callOrder.push('advanced-validator');
          });
          const applyLogicSpy = vi.spyOn(logicApplicator, 'applyLogic').mockImplementation(() => {
            callOrder.push('logic');
          });
          const applySchemaSpy = vi.spyOn(schemaApplication, 'applySchema').mockImplementation(() => {
            callOrder.push('schema');
          });

          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true, // Simple
            validators: [{ type: 'email' }], // Advanced
            logic: [{ type: 'hidden', condition: false }], // Logic
            schemas: [{ type: 'apply', schema: 'test' }], // Schema
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          // Verify order: simple → advanced → logic → schemas
          expect(callOrder).toEqual(['simple-required', 'advanced-validator', 'logic', 'schema']);

          requiredSpy.mockRestore();
          applyValidatorSpy.mockRestore();
          applyLogicSpy.mockRestore();
          applySchemaSpy.mockRestore();
        });
      });
    });

    describe('field-specific configuration', () => {
      it('should apply disabled state', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const disabledSpy = vi.spyOn(angularSignals, 'disabled');
          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
            disabled: true,
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(disabledSpy).toHaveBeenCalledTimes(1);
          disabledSpy.mockRestore();
        });
      });

      it('should log custom form configuration', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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

      it('should not log when custom form config is absent', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
          };

          mapFieldToForm(fieldDef, formInstance().controls.email);

          expect(consoleLogSpy).not.toHaveBeenCalledWith(
            'Custom form configuration detected for field:',
            expect.anything()
          );
          consoleLogSpy.mockRestore();
        });
      });
    });

    describe('page field flattening', () => {
      it('should skip child fields without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { type: 'input' }, // No key - should be skipped
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          mapFieldToForm(pageField, formInstance().controls as any);

          // Only field2 should be processed
          expect(applyValidatorSpy).toHaveBeenCalledTimes(1);
          applyValidatorSpy.mockRestore();
        });
      });

      it('should skip child fields when path is not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '' }); // field2 not in form
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input', validators: [{ type: 'required' }] },
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] }, // Not in form
            ],
          };

          mapFieldToForm(pageField, formInstance().controls as any);

          // Only field1 should be processed
          expect(applyValidatorSpy).toHaveBeenCalledTimes(1);
          applyValidatorSpy.mockRestore();
        });
      });

      it('should handle empty fields array', () => {
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

      it('should recursively map nested page fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
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

          mapFieldToForm(pageField, formInstance().controls as any);

          // Both nested and direct fields should be processed
          expect(applyValidatorSpy).toHaveBeenCalledTimes(2);
          applyValidatorSpy.mockRestore();
        });
      });
    });

    describe('group field flattening', () => {
      it('should skip child fields without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { type: 'input' }, // No key - should be skipped
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          mapFieldToForm(groupField, formInstance().controls.address);

          // Only city should be processed
          expect(applyValidatorSpy).toHaveBeenCalledTimes(1);
          applyValidatorSpy.mockRestore();
        });
      });

      it('should skip child fields when nested path is not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } }); // city not in form
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input', validators: [{ type: 'required' }] },
              { key: 'city', type: 'input', validators: [{ type: 'required' }] }, // Not in form
            ],
          };

          mapFieldToForm(groupField, formInstance().controls.address);

          // Only street should be processed
          expect(applyValidatorSpy).toHaveBeenCalledTimes(1);
          applyValidatorSpy.mockRestore();
        });
      });

      it('should handle empty fields array in group', () => {
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

      it('should recursively map nested group fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { location: { street: '', city: '' } } });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
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

          mapFieldToForm(groupField, formInstance().controls.address);

          // Both nested fields should be processed
          expect(applyValidatorSpy).toHaveBeenCalledTimes(2);
          applyValidatorSpy.mockRestore();
        });
      });
    });
  });
});

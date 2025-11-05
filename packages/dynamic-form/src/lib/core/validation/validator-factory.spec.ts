import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as angularSignals from '@angular/forms/signals';
import { form, FieldPath } from '@angular/forms/signals';
import { ValidatorConfig } from '../../models';
import { RootFormRegistryService } from '../registry';
import { applyValidator, applyValidators } from './validator-factory';

describe('validator-factory', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('applyValidator', () => {
    describe('type checking edge cases', () => {
      it('should skip min validator when value is undefined', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const config: ValidatorConfig = { type: 'min' }; // Missing value

          applyValidator(config, formInstance().controls.age);

          expect(minSpy).not.toHaveBeenCalled();
          minSpy.mockRestore();
        });
      });

      it('should skip min validator when value is wrong type (string)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const config: ValidatorConfig = { type: 'min', value: 'ten' as any };

          applyValidator(config, formInstance().controls.age);

          expect(minSpy).not.toHaveBeenCalled();
          minSpy.mockRestore();
        });
      });

      it('should skip min validator when value is null', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const config: ValidatorConfig = { type: 'min', value: null as any };

          applyValidator(config, formInstance().controls.age);

          expect(minSpy).not.toHaveBeenCalled();
          minSpy.mockRestore();
        });
      });

      it('should skip max validator when value is undefined', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const maxSpy = vi.spyOn(angularSignals, 'max');
          const config: ValidatorConfig = { type: 'max' }; // Missing value

          applyValidator(config, formInstance().controls.age);

          expect(maxSpy).not.toHaveBeenCalled();
          maxSpy.mockRestore();
        });
      });

      it('should skip minLength validator when value is undefined', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minLengthSpy = vi.spyOn(angularSignals, 'minLength');
          const config: ValidatorConfig = { type: 'minLength' }; // Missing value

          applyValidator(config, formInstance().controls.username);

          expect(minLengthSpy).not.toHaveBeenCalled();
          minLengthSpy.mockRestore();
        });
      });

      it('should skip maxLength validator when value is undefined', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const maxLengthSpy = vi.spyOn(angularSignals, 'maxLength');
          const config: ValidatorConfig = { type: 'maxLength' }; // Missing value

          applyValidator(config, formInstance().controls.username);

          expect(maxLengthSpy).not.toHaveBeenCalled();
          maxLengthSpy.mockRestore();
        });
      });

      it('should skip pattern validator when value is undefined', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const config: ValidatorConfig = { type: 'pattern' }; // Missing value

          applyValidator(config, formInstance().controls.username);

          expect(patternSpy).not.toHaveBeenCalled();
          patternSpy.mockRestore();
        });
      });

      it('should skip pattern validator when value is wrong type (number)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const config: ValidatorConfig = { type: 'pattern', value: 123 as any };

          applyValidator(config, formInstance().controls.username);

          expect(patternSpy).not.toHaveBeenCalled();
          patternSpy.mockRestore();
        });
      });
    });

    describe('expression vs static value branching', () => {
      it('should use expression when both value and expression are present for min', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const config: ValidatorConfig = {
            type: 'min',
            value: 10,
            expression: '20',
          };

          applyValidator(config, formInstance().controls.age);

          // Should be called with a function (dynamic value), not the static value
          expect(minSpy).toHaveBeenCalledTimes(1);
          const callArgs = minSpy.mock.calls[0];
          expect(typeof callArgs[1]).toBe('function'); // Second arg is a function
          minSpy.mockRestore();
        });
      });

      it('should use static value when only value is present for min', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const config: ValidatorConfig = {
            type: 'min',
            value: 10,
          };

          applyValidator(config, formInstance().controls.age);

          expect(minSpy).toHaveBeenCalledTimes(1);
          const callArgs = minSpy.mock.calls[0];
          expect(callArgs[1]).toBe(10); // Second arg is the static value
          minSpy.mockRestore();
        });
      });

      it('should skip min validator when neither value nor expression is present', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const minSpy = vi.spyOn(angularSignals, 'min');
          const config: ValidatorConfig = { type: 'min' };

          applyValidator(config, formInstance().controls.age);

          expect(minSpy).not.toHaveBeenCalled();
          minSpy.mockRestore();
        });
      });

      it('should use expression when both value and expression are present for pattern', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const config: ValidatorConfig = {
            type: 'pattern',
            value: /test/,
            expression: '/abc/',
          };

          applyValidator(config, formInstance().controls.username);

          expect(patternSpy).toHaveBeenCalledTimes(1);
          const callArgs = patternSpy.mock.calls[0];
          expect(typeof callArgs[1]).toBe('function'); // Second arg is a function
          patternSpy.mockRestore();
        });
      });
    });

    describe('pattern conversion edge cases', () => {
      it('should convert string pattern to RegExp', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const config: ValidatorConfig = {
            type: 'pattern',
            value: '^[a-z]+$',
          };

          applyValidator(config, formInstance().controls.username);

          expect(patternSpy).toHaveBeenCalledTimes(1);
          const callArgs = patternSpy.mock.calls[0];
          expect(callArgs[1]).toBeInstanceOf(RegExp);
          expect((callArgs[1] as RegExp).source).toBe('^[a-z]+$');
          patternSpy.mockRestore();
        });
      });

      it('should handle invalid regex string gracefully', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'pattern',
            value: '[unclosed',
          };

          // Should throw when trying to create RegExp from invalid pattern
          expect(() => {
            applyValidator(config, formInstance().controls.username);
          }).toThrow();
        });
      });

      it('should handle empty string pattern', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const patternSpy = vi.spyOn(angularSignals, 'pattern');
          const config: ValidatorConfig = {
            type: 'pattern',
            value: '',
          };

          applyValidator(config, formInstance().controls.username);

          expect(patternSpy).toHaveBeenCalledTimes(1);
          const callArgs = patternSpy.mock.calls[0];
          expect(callArgs[1]).toBeInstanceOf(RegExp);
          expect((callArgs[1] as RegExp).source).toBe('(?:)'); // Empty regex
          patternSpy.mockRestore();
        });
      });
    });

    describe('conditional required validator', () => {
      it('should apply required with when condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '', contactMethod: 'email' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const requiredSpy = vi.spyOn(angularSignals, 'required');
          const config: ValidatorConfig = {
            type: 'required',
            when: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'email',
            },
          };

          applyValidator(config, formInstance().controls.email);

          expect(requiredSpy).toHaveBeenCalledTimes(1);
          const callArgs = requiredSpy.mock.calls[0];
          expect(callArgs[1]).toEqual({ when: expect.any(Function) });
          requiredSpy.mockRestore();
        });
      });

      it('should apply required without when condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const requiredSpy = vi.spyOn(angularSignals, 'required');
          const config: ValidatorConfig = {
            type: 'required',
          };

          applyValidator(config, formInstance().controls.email);

          expect(requiredSpy).toHaveBeenCalledTimes(1);
          const callArgs = requiredSpy.mock.calls[0];
          expect(callArgs[1]).toBeUndefined(); // No when condition
          requiredSpy.mockRestore();
        });
      });

      it('should handle invalid when expression gracefully', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'required',
            when: {
              type: 'invalidType' as any,
            },
          };

          // Should not throw, but will create a logic function that may fail
          expect(() => {
            applyValidator(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('unknown validator type', () => {
      it('should not call any Angular API for unknown validator type', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const requiredSpy = vi.spyOn(angularSignals, 'required');
          const emailSpy = vi.spyOn(angularSignals, 'email');
          const minSpy = vi.spyOn(angularSignals, 'min');
          const maxSpy = vi.spyOn(angularSignals, 'max');
          const minLengthSpy = vi.spyOn(angularSignals, 'minLength');
          const maxLengthSpy = vi.spyOn(angularSignals, 'maxLength');
          const patternSpy = vi.spyOn(angularSignals, 'pattern');

          const config: ValidatorConfig = { type: 'customValidator' as any };

          applyValidator(config, formInstance().controls.field);

          expect(requiredSpy).not.toHaveBeenCalled();
          expect(emailSpy).not.toHaveBeenCalled();
          expect(minSpy).not.toHaveBeenCalled();
          expect(maxSpy).not.toHaveBeenCalled();
          expect(minLengthSpy).not.toHaveBeenCalled();
          expect(maxLengthSpy).not.toHaveBeenCalled();
          expect(patternSpy).not.toHaveBeenCalled();

          requiredSpy.mockRestore();
          emailSpy.mockRestore();
          minSpy.mockRestore();
          maxSpy.mockRestore();
          minLengthSpy.mockRestore();
          maxLengthSpy.mockRestore();
          patternSpy.mockRestore();
        });
      });

      it('should handle unknown type silently without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'unknownType' as any };

          expect(() => {
            applyValidator(config, formInstance().controls.field);
          }).not.toThrow();
        });
      });
    });
  });

  describe('applyValidators', () => {
    it('should apply multiple validators in sequence', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const requiredSpy = vi.spyOn(angularSignals, 'required');
        const emailSpy = vi.spyOn(angularSignals, 'email');

        const configs: ValidatorConfig[] = [{ type: 'required' }, { type: 'email' }];

        applyValidators(configs, formInstance().controls.email);

        expect(requiredSpy).toHaveBeenCalledTimes(1);
        expect(emailSpy).toHaveBeenCalledTimes(1);

        requiredSpy.mockRestore();
        emailSpy.mockRestore();
      });
    });

    it('should handle empty validator array', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const configs: ValidatorConfig[] = [];

        expect(() => {
          applyValidators(configs, formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should continue applying validators even if one fails', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const requiredSpy = vi.spyOn(angularSignals, 'required');
        const emailSpy = vi.spyOn(angularSignals, 'email');

        const configs: ValidatorConfig[] = [
          { type: 'required' },
          { type: 'unknownType' as any }, // Should be ignored
          { type: 'email' },
        ];

        applyValidators(configs, formInstance().controls.email);

        expect(requiredSpy).toHaveBeenCalledTimes(1);
        expect(emailSpy).toHaveBeenCalledTimes(1);

        requiredSpy.mockRestore();
        emailSpy.mockRestore();
      });
    });
  });
});

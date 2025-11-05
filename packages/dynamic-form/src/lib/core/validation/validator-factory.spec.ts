import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { form } from '@angular/forms/signals';
import { ValidatorConfig } from '../../models';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from '../registry';
import { applyValidator, applyValidators } from './validator-factory';

describe('validator-factory', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('applyValidator', () => {
    describe('type checking edge cases', () => {
      it('should handle min validator with undefined value without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'min' };

          expect(() => {
            applyValidator(config, formInstance().controls.age);
          }).not.toThrow();
        });
      });

      it('should handle min validator with wrong type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'min', value: 'ten' as any };

          expect(() => {
            applyValidator(config, formInstance().controls.age);
          }).not.toThrow();
        });
      });

      it('should handle pattern validator with undefined value without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'pattern' };

          expect(() => {
            applyValidator(config, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should handle pattern validator with wrong type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'pattern', value: 123 as any };

          expect(() => {
            applyValidator(config, formInstance().controls.username);
          }).not.toThrow();
        });
      });
    });

    describe('expression vs static value branching', () => {
      it('should handle min validator with both value and expression', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'min',
            value: 10,
            expression: '20',
          };

          expect(() => {
            applyValidator(config, formInstance().controls.age);
          }).not.toThrow();
        });
      });

      it('should handle min validator with only static value', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'min',
            value: 10,
          };

          expect(() => {
            applyValidator(config, formInstance().controls.age);
          }).not.toThrow();
        });
      });
    });

    describe('pattern conversion', () => {
      it('should convert string pattern to RegExp without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'pattern',
            value: '^[a-z]+$',
          };

          expect(() => {
            applyValidator(config, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should throw when pattern string is invalid regex', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'pattern',
            value: '[unclosed',
          };

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

          const config: ValidatorConfig = {
            type: 'pattern',
            value: '',
          };

          expect(() => {
            applyValidator(config, formInstance().controls.username);
          }).not.toThrow();
        });
      });

      it('should handle RegExp pattern directly', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'pattern',
            value: /^[a-z]+$/,
          };

          expect(() => {
            applyValidator(config, formInstance().controls.username);
          }).not.toThrow();
        });
      });
    });

    describe('conditional required validator', () => {
      it('should handle required with when condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '', contactMethod: 'email' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'required',
            when: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'email',
            },
          };

          expect(() => {
            applyValidator(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle required without when condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = {
            type: 'required',
          };

          expect(() => {
            applyValidator(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle invalid when expression without throwing', () => {
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

          expect(() => {
            applyValidator(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('unknown validator type', () => {
      it('should handle unknown validator type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'customValidator' as any };

          expect(() => {
            applyValidator(config, formInstance().controls.field);
          }).not.toThrow();
        });
      });
    });

    describe('email validator', () => {
      it('should handle email validator without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: ValidatorConfig = { type: 'email' };

          expect(() => {
            applyValidator(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });
  });

  describe('applyValidators', () => {
    it('should apply multiple validators without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const configs: ValidatorConfig[] = [{ type: 'required' }, { type: 'email' }];

        expect(() => {
          applyValidators(configs, formInstance().controls.email);
        }).not.toThrow();
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

    it('should handle validators with unknown types', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const configs: ValidatorConfig[] = [{ type: 'required' }, { type: 'unknownType' as any }, { type: 'email' }];

        expect(() => {
          applyValidators(configs, formInstance().controls.email);
        }).not.toThrow();
      });
    });
  });
});

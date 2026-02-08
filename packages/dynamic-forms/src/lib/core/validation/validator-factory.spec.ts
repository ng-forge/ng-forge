import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';
import { applyValidator, applyValidators } from './validator-factory';

describe('validator-factory', () => {
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
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('applyValidator', () => {
    describe('type checking edge cases', () => {
      it('should handle min validator with undefined value without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const config: ValidatorConfig = { type: 'min' };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle min validator with wrong type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });

          const config: ValidatorConfig = { type: 'min', value: 'ten' as any };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle pattern validator with undefined value without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = { type: 'pattern' };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle pattern validator with wrong type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });

          const config: ValidatorConfig = { type: 'pattern', value: 123 as any };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('expression vs static value branching', () => {
      it('should handle min validator with both value and expression', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const config: ValidatorConfig = {
            type: 'min',
            value: 18,
            expression: '21',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle min validator with only static value', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 25 });
          const config: ValidatorConfig = {
            type: 'min',
            value: 18,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('pattern conversion', () => {
      it('should convert string pattern to RegExp without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'pattern',
            value: '^[a-z]+$',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should throw when pattern string is invalid regex', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'pattern',
            value: '[unclosed',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle empty string pattern', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'pattern',
            value: '',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle RegExp pattern directly', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'pattern',
            value: /^[a-z]+$/,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('conditional required validator', () => {
      it('should handle required with when condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '', subscribeNewsletter: false });
          const config: ValidatorConfig = {
            type: 'required',
            when: {
              type: 'javascript',
              expression: 'subscribeNewsletter === true',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle required without when condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const config: ValidatorConfig = {
            type: 'required',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle invalid when expression without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const config: ValidatorConfig = {
            type: 'required',
            when: {
              type: 'javascript',
              expression: 'this.will.cause.error()',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('unknown validator type', () => {
      it('should handle unknown validator type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });

          const config: ValidatorConfig = { type: 'unknownType' as any };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.field);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('email validator', () => {
      it('should handle email validator without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: ValidatorConfig = { type: 'email' };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });
  });

  describe('applyValidators', () => {
    it('should apply multiple validators without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const configs: ValidatorConfig[] = [{ type: 'required' }, { type: 'email' }];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              applyValidators(configs, path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle empty validator array', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const configs: ValidatorConfig[] = [];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              applyValidators(configs, path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle validators with unknown types', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        const configs: ValidatorConfig[] = [{ type: 'unknown1' as any }, { type: 'unknown2' as any }];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              applyValidators(configs, path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });
  });
});

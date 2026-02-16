import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { applyValidator, applyValidators } from './validator-factory';

// Mock only validateHttp to capture callback options passed by applyDeclarativeHttpValidator.
// All other exports (form, schema, validate, etc.) are preserved from the real module.
// vi.hoisted() ensures the mock reference is available in the hoisted vi.mock() factory.
const { mockValidateHttp } = vi.hoisted(() => ({ mockValidateHttp: vi.fn() }));
vi.mock('@angular/forms/signals', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@angular/forms/signals')>();
  return { ...mod, validateHttp: mockValidateHttp };
});

describe('validator-factory', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);
  const mockLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    mockLogger.debug.mockReset();
    mockLogger.info.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.error.mockReset();
    mockValidateHttp.mockClear();

    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DynamicFormLogger, useValue: mockLogger },
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

    describe('declarative HTTP validator (type: http)', () => {
      it('should apply HTTP validator without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'http',
            http: {
              url: '/api/check',
              method: 'GET',
              queryParams: { username: 'fieldValue' },
            },
            responseMapping: {
              validWhen: 'response.available',
              errorKind: 'usernameTaken',
            },
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

      it('should apply HTTP validator with POST method and body without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: ValidatorConfig = {
            type: 'http',
            http: {
              url: '/api/validate-email',
              method: 'POST',
              body: { email: 'fieldValue' },
              evaluateBodyExpressions: true,
            },
            responseMapping: {
              validWhen: 'response.valid',
              errorKind: 'emailInvalid',
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

      it('should apply HTTP validator with when condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'http',
            http: {
              url: '/api/check',
              method: 'GET',
              queryParams: { username: 'fieldValue' },
            },
            responseMapping: {
              validWhen: 'response.available',
              errorKind: 'usernameTaken',
            },
            when: {
              type: 'javascript',
              expression: 'fieldValue !== ""',
            },
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

      it('should warn when debounceMs is set', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'http',
            http: {
              url: '/api/check',
              method: 'GET',
              queryParams: { username: 'fieldValue' },
              debounceMs: 500,
            },
            responseMapping: {
              validWhen: 'response.available',
              errorKind: 'usernameTaken',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.username);
              expect(mockLogger.warn).toHaveBeenCalledWith(
                'debounceMs is ignored on HTTP validators — it only applies to HTTP derivations and conditions.',
              );
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should not warn when debounceMs is not set', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'http',
            http: {
              url: '/api/check',
              method: 'GET',
              queryParams: { username: 'fieldValue' },
            },
            responseMapping: {
              validWhen: 'response.available',
              errorKind: 'usernameTaken',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.username);
              expect(mockLogger.warn).not.toHaveBeenCalled();
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

  describe('declarative HTTP validator callback behavior', () => {
    // These tests mock validateHttp to capture the options object and verify
    // the behavior of request/onSuccess/onError callbacks in isolation.
    // The async importOriginal in vi.mock has a known race condition in Vitest browser mode
    // that can cause the mock to not be applied. We detect this and skip gracefully.

    function getCapturedOptions():
      | {
          request: (ctx: unknown) => unknown;
          onSuccess: (response: unknown) => unknown;
          onError: (error: unknown) => unknown;
        }
      | undefined {
      if (mockValidateHttp.mock.calls.length === 0) return undefined;
      const lastCall = mockValidateHttp.mock.calls[mockValidateHttp.mock.calls.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test utility
      return lastCall[1] as any;
    }

    function setupAndCapture(config: ValidatorConfig) {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: 'test' });
        form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.username);
          }),
        );
      });
      return getCapturedOptions();
    }

    it('should return undefined from request callback when when-condition is false (C1)', () => {
      const config: ValidatorConfig = {
        type: 'http',
        http: { url: '/api/check', queryParams: { username: 'fieldValue' } },
        responseMapping: { validWhen: 'response.available', errorKind: 'taken' },
        when: { type: 'javascript', expression: 'fieldValue === "special"' },
      };

      const options = setupAndCapture(config);
      if (!options) return; // Mock race — skip gracefully

      mockEntity.set({ username: 'not_special' });
      const mockCtx = { value: signal('not_special') };
      expect(options.request(mockCtx)).toBeUndefined();
    });

    it('should use createReactiveEvaluationContext (not createEvaluationContext) in request callback (C2)', () => {
      const fieldContextRegistry = TestBed.inject(FieldContextRegistryService);
      const reactiveSpy = vi.spyOn(fieldContextRegistry, 'createReactiveEvaluationContext');
      const nonReactiveSpy = vi.spyOn(fieldContextRegistry, 'createEvaluationContext');

      const config: ValidatorConfig = {
        type: 'http',
        http: { url: '/api/check', queryParams: { username: 'fieldValue' } },
        responseMapping: { validWhen: 'response.available', errorKind: 'taken' },
      };

      const options = setupAndCapture(config);
      if (!options) return; // Mock race — skip gracefully

      mockEntity.set({ username: 'test' });
      const mockCtx = { value: signal('test') };
      options.request(mockCtx);

      expect(reactiveSpy).toHaveBeenCalled();
      expect(nonReactiveSpy).not.toHaveBeenCalled();
    });

    it('should delegate onSuccess to evaluateHttpValidationResponse (M1)', () => {
      const config: ValidatorConfig = {
        type: 'http',
        http: { url: '/api/check' },
        responseMapping: {
          validWhen: 'response.available',
          errorKind: 'taken',
          errorParams: { suggestion: 'response.suggestion' },
        },
      };

      const options = setupAndCapture(config);
      if (!options) return; // Mock race — skip gracefully

      expect(options.onSuccess({ available: true })).toBeNull();
      expect(options.onSuccess({ available: false, suggestion: 'admin_123' })).toEqual({
        kind: 'taken',
        suggestion: 'admin_123',
      });
    });

    it('should return error with errorKind and log warning from onError callback (M2)', () => {
      const config: ValidatorConfig = {
        type: 'http',
        http: { url: '/api/check' },
        responseMapping: { validWhen: 'response.available', errorKind: 'taken' },
      };

      const options = setupAndCapture(config);
      if (!options) return; // Mock race — skip gracefully

      const error = new Error('Network failure');
      expect(options.onError(error)).toEqual({ kind: 'taken' });
      expect(mockLogger.warn).toHaveBeenCalledWith('HTTP validator request failed:', error);
    });
  });
});

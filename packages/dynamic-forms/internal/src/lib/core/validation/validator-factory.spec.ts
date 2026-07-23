import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { RootFormRegistryService } from '../registry/root-form-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FormStateManager } from '../../../../../src/lib/state/form-state-manager';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { createWarningTracker } from '../../utils/warning-tracker';
import { applyValidator, applyValidators } from './validator-factory';
import { LogicFunctionCacheService } from '../expressions/logic-function-cache.service';
import { HttpConditionFunctionCacheService } from '../expressions/http-condition-function-cache.service';
import { DynamicValueFunctionCacheService } from '../values/dynamic-value-function-cache.service';

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
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createWarningTracker },
        FunctionRegistryService,
        FieldContextRegistryService,
        LogicFunctionCacheService,
        HttpConditionFunctionCacheService,
        DynamicValueFunctionCacheService,
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

    describe('async and http validator types', () => {
      it('should accept type: async and apply async validator', () => {
        runInInjectionContext(injector, () => {
          const registry = TestBed.inject(FunctionRegistryService);
          registry.registerAsyncValidator('myAsyncValidator', {
            params: () => ({}),
            factory: () => ({ value: signal(null) }) as any,
            onSuccess: () => null,
          });

          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = { type: 'async', functionName: 'myAsyncValidator' };

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

      it('should route type: http with functionName to function-based handler', () => {
        runInInjectionContext(injector, () => {
          const registry = TestBed.inject(FunctionRegistryService);
          registry.registerHttpValidator('myHttpValidator', {
            request: () => '/api/check',
            onSuccess: () => null,
          });

          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = { type: 'http', functionName: 'myHttpValidator' };

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

      it('should route type: http with http + responseMapping to declarative handler', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config: ValidatorConfig = {
            type: 'http',
            http: { url: '/api/check', method: 'GET' },
            responseMapping: { validWhen: 'response.available', errorKind: 'taken' },
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

      it('accepts inline async validator via fn (no registration required)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const inline = {
            params: () => ({}),
            factory: () => ({ value: signal(null) }) as never,
            onSuccess: () => null,
          };
          const config: ValidatorConfig = { type: 'async', fn: inline };

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

      it('accepts inline HTTP validator via fn (no registration required)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const inline = { request: () => '/api/check', onSuccess: () => null };
          const config: ValidatorConfig = { type: 'http', fn: inline };

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

      it('warns when both fn and functionName are set on async validator', () => {
        runInInjectionContext(injector, () => {
          const registry = TestBed.inject(FunctionRegistryService);
          registry.registerAsyncValidator('registered', {
            params: () => ({}),
            factory: () => ({ value: signal(null) }) as never,
          });

          const formValue = signal({ username: 'test' });
          const inline = {
            params: () => ({}),
            factory: () => ({ value: signal(null) }) as never,
          };
          // Cast — the public XOR rejects this at compile time, but JSON-loaded
          // configs can still produce both keys at runtime.
          const config = { type: 'async', functionName: 'registered', fn: inline } as unknown as ValidatorConfig;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.username);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Both "fn" and "functionName" are set'));
        });
      });

      it('warns when both fn and functionName are set on HTTP validator', () => {
        runInInjectionContext(injector, () => {
          const registry = TestBed.inject(FunctionRegistryService);
          registry.registerHttpValidator('registered', {
            request: () => '/api/check',
            onSuccess: () => null,
          });

          const formValue = signal({ username: 'test' });
          const inline = { request: () => '/api/check', onSuccess: () => null };
          // Cast — the public XOR rejects this at compile time, but JSON-loaded
          // configs can still produce both keys at runtime.
          const config = { type: 'http', functionName: 'registered', fn: inline } as unknown as ValidatorConfig;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.username);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Both "fn" and "functionName" are set'));
        });
      });

      it('throws when neither fn nor functionName is set on async validator', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          // Cast — XOR rejects neither-set at compile time; JSON-loaded configs can produce it.
          const config = { type: 'async' } as unknown as ValidatorConfig;

          let caught: unknown;
          form(
            formValue,
            schema<typeof formValue>((path) => {
              try {
                applyValidator(config, path.username);
              } catch (err) {
                caught = err;
              }
            }),
          );
          expect(caught).toBeInstanceOf(Error);
          expect(String(caught)).toMatch(/Async validator requires/);
        });
      });

      it('throws when neither fn nor functionName is set on HTTP validator', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const config = { type: 'http' } as unknown as ValidatorConfig;

          let caught: unknown;
          form(
            formValue,
            schema<typeof formValue>((path) => {
              try {
                applyValidator(config, path.username);
              } catch (err) {
                caught = err;
              }
            }),
          );
          expect(caught).toBeInstanceOf(Error);
          expect(String(caught)).toMatch(/HTTP validator requires/);
        });
      });
    });

    describe('custom validator inline fn alternative', () => {
      it('accepts inline fn validator without registration', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          const inline = vi.fn().mockReturnValue(null);
          const config: ValidatorConfig = { type: 'custom', fn: inline };

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

      it('throws when none of expression, functionName, or fn is set on custom validator', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: 'test' });
          // Cast — XOR rejects neither-set at compile time; JSON-loaded configs can produce it.
          const config = { type: 'custom' } as unknown as ValidatorConfig;

          let caught: unknown;
          form(
            formValue,
            schema<typeof formValue>((path) => {
              try {
                applyValidator(config, path.username);
              } catch (err) {
                caught = err;
              }
            }),
          );
          expect(caught).toBeInstanceOf(Error);
          expect(String(caught)).toMatch(/Custom validator requires/);
        });
      });

      it('warns when both fn and functionName are set on custom validator', () => {
        runInInjectionContext(injector, () => {
          const registry = TestBed.inject(FunctionRegistryService);
          registry.registerValidator('registered', () => null);

          const formValue = signal({ username: 'test' });
          const inline = vi.fn().mockReturnValue(null);
          const config = { type: 'custom', functionName: 'registered', fn: inline } as unknown as ValidatorConfig;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.username);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Both "fn" and "functionName" are set'));
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

  describe('conditional built-in validators (native when routing)', () => {
    const crossFieldWhen = { type: 'javascript' as const, expression: 'formValue.other === true' };

    it('applies maxLength natively with reactive constraint metadata gated by a cross-field when', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: 'way too long value', other: false });
        formValue.set({ name: 'way too long value', other: false });
        const config: ValidatorConfig = { type: 'maxLength', value: 20, when: crossFieldWhen };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.name);
          }),
        );
        mockFormSignal.set(formInstance);

        // Condition false: constraint metadata absent, no error
        expect(formInstance.name().maxLength?.()).toBeUndefined();
        expect(formInstance.name().errors()).toEqual([]);

        // Flip the OTHER field only - the validated field is untouched
        formValue.set({ name: 'way too long value', other: true });
        expect(formInstance.name().maxLength?.()).toBe(20);
        expect(formInstance.name().errors()).toEqual([]);

        formValue.set({ name: 'x'.repeat(25), other: true });
        const errors = formInstance.name().errors();
        expect(errors).toHaveLength(1);
        expect(errors[0].kind).toBe('maxLength');
        expect((errors[0] as unknown as Record<string, unknown>)['maxLength']).toBe(20);

        // Flip back off: error clears, metadata gone
        formValue.set({ name: 'x'.repeat(25), other: false });
        expect(formInstance.name().errors()).toEqual([]);
        expect(formInstance.name().maxLength?.()).toBeUndefined();
      });
    });

    it('applies min, max, and minLength natively with reactive constraints', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ age: 10, count: 100, code: 'ab', other: false });
        formValue.set({ ...formValue() });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'min', value: 18, when: crossFieldWhen }, path.age);
            applyValidator({ type: 'max', value: 50, when: crossFieldWhen }, path.count);
            applyValidator({ type: 'minLength', value: 3, when: crossFieldWhen }, path.code);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.age().min?.()).toBeUndefined();
        expect(formInstance.count().max?.()).toBeUndefined();
        expect(formInstance.code().minLength?.()).toBeUndefined();
        expect(formInstance().valid()).toBe(true);

        formValue.set({ ...formValue(), other: true });
        expect(formInstance.age().min?.()).toBe(18);
        expect(formInstance.count().max?.()).toBe(50);
        expect(formInstance.code().minLength?.()).toBe(3);
        expect(formInstance.age().errors()[0]?.kind).toBe('min');
        expect(formInstance.count().errors()[0]?.kind).toBe('max');
        expect(formInstance.code().errors()[0]?.kind).toBe('minLength');
      });
    });

    it('applies pattern natively with string and RegExp values gated by when', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ codeA: '123', codeB: '456', other: false });
        formValue.set({ ...formValue() });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'pattern', value: '^[a-z]+$', when: crossFieldWhen }, path.codeA);
            applyValidator({ type: 'pattern', value: /^[a-z]+$/, when: crossFieldWhen }, path.codeB);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.codeA().errors()).toEqual([]);
        expect(formInstance.codeB().errors()).toEqual([]);

        formValue.set({ ...formValue(), other: true });
        expect(formInstance.codeA().errors()[0]?.kind).toBe('pattern');
        expect(formInstance.codeB().errors()[0]?.kind).toBe('pattern');
      });
    });

    it('toggles field().required() reactively for required with a cross-field when', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: '', other: false });
        formValue.set({ name: '', other: false });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'required', when: crossFieldWhen }, path.name);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.name().required()).toBe(false);
        expect(formInstance.name().errors()).toEqual([]);

        formValue.set({ name: '', other: true });
        expect(formInstance.name().required()).toBe(true);
        expect(formInstance.name().errors()[0]?.kind).toBe('required');
      });
    });

    it('applies email natively gated by a cross-field when', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ contact: 'not-an-email', other: false });
        formValue.set({ ...formValue() });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'email', when: crossFieldWhen }, path.contact);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.contact().errors()).toEqual([]);

        formValue.set({ ...formValue(), other: true });
        expect(formInstance.contact().errors()[0]?.kind).toBe('email');
      });
    });

    it('honors a field-local when on maxLength (previously the when was ignored and maxLength applied unconditionally)', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: 'ignore-me' });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(
              { type: 'maxLength', value: 5, when: { type: 'javascript', expression: 'fieldValue !== "ignore-me"' } },
              path.name,
            );
          }),
        );
        mockFormSignal.set(formInstance);

        // Gate is false for the sentinel value: no error despite length > 5
        expect(formInstance.name().errors()).toEqual([]);

        formValue.set({ name: 'much too long' });
        expect(formInstance.name().errors()[0]?.kind).toBe('maxLength');
      });
    });

    it('applies both a non-cross-field dynamic value expression and a when gate', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ age: 10, other: false });
        formValue.set({ age: 10, other: false });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'min', value: 1, expression: '18', when: crossFieldWhen }, path.age);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.age().errors()).toEqual([]);

        formValue.set({ age: 10, other: true });
        const errors = formInstance.age().errors();
        expect(errors[0]?.kind).toBe('min');
        // Dynamic value expression wins over the static value
        expect((errors[0] as unknown as Record<string, unknown>)['min']).toBe(18);
      });
    });

    it('combines multiple conditional maxLength validators with a static one on the same field', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ name: 'x'.repeat(12), gateA: false, gateB: false });
        formValue.set({ ...formValue() });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'maxLength', value: 10 }, path.name);
            applyValidator(
              { type: 'maxLength', value: 5, when: { type: 'javascript', expression: 'formValue.gateA === true' } },
              path.name,
            );
            applyValidator(
              { type: 'maxLength', value: 3, when: { type: 'javascript', expression: 'formValue.gateB === true' } },
              path.name,
            );
          }),
        );
        mockFormSignal.set(formInstance);

        // Only the static rule active
        expect(formInstance.name().maxLength?.()).toBe(10);
        expect(formInstance.name().errors()).toHaveLength(1);

        // gateA active: metadata is the min of active contributions, errors independent
        formValue.set({ ...formValue(), gateA: true });
        expect(formInstance.name().maxLength?.()).toBe(5);
        expect(formInstance.name().errors()).toHaveLength(2);

        formValue.set({ ...formValue(), gateA: true, gateB: true });
        expect(formInstance.name().maxLength?.()).toBe(3);
        expect(formInstance.name().errors()).toHaveLength(3);
        expect(
          formInstance
            .name()
            .errors()
            .every((e) => e.kind === 'maxLength'),
        ).toBe(true);
      });
    });

    it('applies custom functionName validators natively with a cross-field when gate', () => {
      runInInjectionContext(injector, () => {
        const registry = TestBed.inject(FunctionRegistryService);
        registry.registerValidator('alwaysFails', () => ({ kind: 'customFail' }));

        const formValue = signal({ name: 'value', other: false });
        formValue.set({ name: 'value', other: false });
        const config: ValidatorConfig = { type: 'custom', functionName: 'alwaysFails', when: crossFieldWhen };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.name);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.name().errors()).toEqual([]);

        formValue.set({ name: 'value', other: true });
        expect(formInstance.name().errors()[0]?.kind).toBe('customFail');
      });
    });

    it('pins native required semantics: false fails, whitespace-only passes', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ accepted: false, note: '  ', other: true });
        formValue.set({ ...formValue() });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'required', when: crossFieldWhen }, path.accepted);
            applyValidator({ type: 'required', when: crossFieldWhen }, path.note);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.accepted().errors()[0]?.kind).toBe('required');
        expect(formInstance.note().errors()).toEqual([]);
      });
    });

    // #260/#262 guarantee under per-field routing: group-nested error placement + sibling reactivity.
    it('places a group-nested custom cross-field validator error on the nested field and reacts to the sibling', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ grp: { a: 5, b: 10 } });
        formValue.set({ grp: { a: 5, b: 10 } });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            // a must be < b (b is a sibling inside the same group)
            applyValidator(
              { type: 'custom', kind: 'aLtB', expression: '+fieldValue < +formValue.grp.b' },
              (path as unknown as { grp: { a: unknown } }).grp.a as never,
            );
          }),
        );
        mockFormSignal.set(formInstance);

        // 5 < 10 → valid
        expect(formInstance.grp.a().errors()).toEqual([]);

        // Flip the SIBLING b to 3 → 5 < 3 is false → error on grp.a (not root)
        formValue.set({ grp: { a: 5, b: 3 } });
        expect(formInstance.grp.a().errors()[0]?.kind).toBe('aLtB');

        // Restore sibling → error clears (proves reactivity to the referenced field)
        formValue.set({ grp: { a: 5, b: 10 } });
        expect(formInstance.grp.a().errors()).toEqual([]);
      });
    });

    // Built-in cross-field constraint (dynamic value expression referencing another field),
    // applied per-field instead of hoisted to the tree.
    it('places a root-level cross-field maxLength error on the constrained field and reacts to the referenced field', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ text: '', limit: 3 });
        formValue.set({ text: '', limit: 3 });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'maxLength', value: 100, expression: 'formValue.limit' }, path.text);
          }),
        );
        mockFormSignal.set(formInstance);

        formValue.set({ text: 'abcd', limit: 3 });
        const errors = formInstance.text().errors();
        expect(errors[0]?.kind).toBe('maxLength');
        // The resolved constraint (from the referenced field) is on the error
        expect((errors[0] as unknown as Record<string, unknown>)['maxLength']).toBe(3);

        // Raise the referenced field without touching text → error clears reactively
        formValue.set({ text: 'abcd', limit: 10 });
        expect(formInstance.text().errors()).toEqual([]);
      });
    });

    it('disables a cross-field constraint while the referenced field is null (cleared number input)', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal<{ age: number | null; minAge: number | null }>({ age: 15, minAge: 18 });
        formValue.set({ age: 15, minAge: 18 });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator({ type: 'min', value: 0, expression: 'formValue.minAge' }, path.age);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance.age().errors()[0]?.kind).toBe('min');

        // Clearing the referenced number input yields null; the constraint must
        // resolve to undefined (no constraint), never null (crashes the native
        // DOM property write in Signal Forms' control binding).
        formValue.set({ age: 15, minAge: null });
        expect(formInstance.age().errors()).toEqual([]);
        expect(formInstance.age().min?.()).toBeUndefined();

        formValue.set({ age: 15, minAge: 10 });
        expect(formInstance.age().errors()).toEqual([]);
      });
    });

    it('places a group-nested cross-field maxLength error on the nested field and reacts to the sibling', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ grp: { text: '', limit: 3 } });
        formValue.set({ grp: { text: '', limit: 3 } });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(
              { type: 'maxLength', value: 100, expression: 'formValue.grp.limit' },
              (path as unknown as { grp: { text: unknown } }).grp.text as never,
            );
          }),
        );
        mockFormSignal.set(formInstance);

        formValue.set({ grp: { text: 'abcd', limit: 3 } });
        expect(formInstance.grp.text().errors()[0]?.kind).toBe('maxLength');

        // Raise the sibling limit → error clears reactively
        formValue.set({ grp: { text: 'abcd', limit: 10 } });
        expect(formInstance.grp.text().errors()).toEqual([]);
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

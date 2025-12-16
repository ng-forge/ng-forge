import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal, ResourceRef } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form, schema, FieldContext } from '@angular/forms/signals';
import { AsyncValidatorConfig, HttpValidatorConfig } from '../../models/validation/validator-config';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from '../registry';
import { applyValidator } from './validator-factory';
import { AsyncCustomValidator, HttpCustomValidator } from './validator-types';

describe('Async and HTTP Validator Integration', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;
  let functionRegistry: FunctionRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
    functionRegistry = TestBed.inject(FunctionRegistryService);
  });

  describe('AsyncValidator', () => {
    describe('registration and retrieval', () => {
      it('should register and retrieve async validator', () => {
        const asyncValidator: AsyncCustomValidator = {
          params: (ctx) => ({ value: ctx.value() }),
          factory: vi.fn() as any,
          onSuccess: (result) => null,
        };

        functionRegistry.registerAsyncValidator('testAsync', asyncValidator);

        const retrieved = functionRegistry.getAsyncValidator('testAsync');
        expect(retrieved).toBe(asyncValidator);
      });

      it('should handle async validator with onError', () => {
        const asyncValidator: AsyncCustomValidator = {
          params: (ctx) => ({ value: ctx.value() }),
          factory: vi.fn() as any,
          onSuccess: (result) => null,
          onError: (error) => ({ kind: 'asyncError' }),
        };

        functionRegistry.registerAsyncValidator('withError', asyncValidator);

        const retrieved = functionRegistry.getAsyncValidator('withError');
        expect(retrieved?.onError).toBeDefined();
      });

      it('should handle async validator with config params', () => {
        const asyncValidator: AsyncCustomValidator = {
          params: (ctx, config) => ({
            value: ctx.value(),
            minLength: config?.minLength,
          }),
          factory: vi.fn() as any,
          onSuccess: (result) => null,
        };

        functionRegistry.registerAsyncValidator('withParams', asyncValidator);

        const retrieved = functionRegistry.getAsyncValidator('withParams');
        expect(retrieved).toBe(asyncValidator);
      });
    });

    describe('validator application', () => {
      it('should apply async validator without throwing', () => {
        runInInjectionContext(injector, () => {
          const mockResource = {
            value: () => ({ available: true }),
            status: () => 'success' as const,
            error: () => null,
            isLoading: () => false,
            reload: vi.fn(),
          } as unknown as ResourceRef<any>;

          const asyncValidator: AsyncCustomValidator = {
            params: (ctx) => ({ username: ctx.value() }),
            factory: () => mockResource,
            onSuccess: (result, ctx) => {
              return result?.available ? null : { kind: 'usernameTaken' };
            },
          };

          functionRegistry.registerAsyncValidator('checkUsername', asyncValidator);

          const formValue = signal({ username: 'testuser' });
          const config: AsyncValidatorConfig = {
            type: 'customAsync',
            functionName: 'checkUsername',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });

      it('should warn when async validator not found', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const config: AsyncValidatorConfig = {
            type: 'customAsync',
            functionName: 'nonexistent',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.field);
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[Dynamic Forms]',
          expect.stringContaining('Async validator "nonexistent" not found in registry'),
        );

        consoleWarnSpy.mockRestore();
      });

      it('should apply async validator with conditional logic', () => {
        runInInjectionContext(injector, () => {
          const mockResource = {
            value: () => null,
            status: () => 'idle' as const,
            error: () => null,
            isLoading: () => false,
            reload: vi.fn(),
          } as unknown as ResourceRef<any>;

          const asyncValidator: AsyncCustomValidator = {
            params: (ctx, config) => {
              return config?.minLength ? { value: ctx.value(), minLength: config.minLength } : undefined;
            },
            factory: () => mockResource,
            onSuccess: () => null,
          };

          functionRegistry.registerAsyncValidator('conditional', asyncValidator);

          const formValue = signal({ field: 'value' });
          const config: AsyncValidatorConfig = {
            type: 'customAsync',
            functionName: 'conditional',
            params: { minLength: 5 },
            when: {
              expression: 'formValue.field !== ""',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.field);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });
    });

    describe('cross-field async validation', () => {
      it('should support cross-field validation with valueOf', () => {
        runInInjectionContext(injector, () => {
          const mockResource = {
            value: () => ({ valid: true }),
            status: () => 'success' as const,
            error: () => null,
            isLoading: () => false,
            reload: vi.fn(),
          } as unknown as ResourceRef<any>;

          const asyncValidator: AsyncCustomValidator = {
            params: (ctx: FieldContext<string>) => ({
              password: ctx.value(),
              email: ctx.valueOf('email' as any),
            }),
            factory: () => mockResource,
            onSuccess: (result) => (result?.valid ? null : { kind: 'invalidPasswordForEmail' }),
          };

          functionRegistry.registerAsyncValidator('validatePassword', asyncValidator);

          const formValue = signal({ password: 'pass123', email: 'test@example.com' });
          const config: AsyncValidatorConfig = {
            type: 'customAsync',
            functionName: 'validatePassword',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.password);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });
    });
  });

  describe('HttpValidator', () => {
    describe('registration and retrieval', () => {
      it('should register and retrieve HTTP validator', () => {
        const httpValidator: HttpCustomValidator = {
          request: (ctx) => `/api/check?value=${ctx.value()}`,
          onSuccess: (result) => null,
        };

        functionRegistry.registerHttpValidator('testHttp', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('testHttp');
        expect(retrieved).toBe(httpValidator);
      });

      it('should handle HTTP validator with onError', () => {
        const httpValidator: HttpCustomValidator = {
          request: (ctx) => `/api/check`,
          onSuccess: (result) => null,
          onError: (error) => {
            console.error(error);
            return null;
          },
        };

        functionRegistry.registerHttpValidator('withError', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('withError');
        expect(retrieved?.onError).toBeDefined();
      });

      it('should handle HTTP validator with POST request', () => {
        const httpValidator: HttpCustomValidator = {
          request: (ctx) => ({
            url: '/api/validate',
            method: 'POST',
            body: { value: ctx.value() },
          }),
          onSuccess: (result: any) => (result?.valid ? null : { kind: 'invalid' }),
        };

        functionRegistry.registerHttpValidator('postValidator', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('postValidator');
        expect(retrieved).toBe(httpValidator);
      });

      it('should handle HTTP validator with config params', () => {
        const httpValidator: HttpCustomValidator = {
          request: (ctx, config) => {
            const endpoint = config?.endpoint || 'check';
            return `/api/${endpoint}?value=${ctx.value()}`;
          },
          onSuccess: () => null,
        };

        functionRegistry.registerHttpValidator('paramValidator', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('paramValidator');
        expect(retrieved).toBe(httpValidator);
      });
    });

    describe('validator application', () => {
      it('should apply HTTP validator without throwing', () => {
        runInInjectionContext(injector, () => {
          const httpValidator: HttpCustomValidator<string, { available: boolean }> = {
            request: (ctx) => {
              if (!ctx.value()) return undefined;
              return `/api/check-username?username=${encodeURIComponent(ctx.value())}`;
            },
            onSuccess: (result) => {
              return result.available ? null : { kind: 'usernameTaken' };
            },
          };

          functionRegistry.registerHttpValidator('checkUsername', httpValidator);

          const formValue = signal({ username: 'testuser' });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'checkUsername',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.username);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });

      it('should warn when HTTP validator not found', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'nonexistent',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyValidator(config, path.field);
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[Dynamic Forms]',
          expect.stringContaining('HTTP validator "nonexistent" not found in registry'),
        );

        consoleWarnSpy.mockRestore();
      });

      it('should apply HTTP validator with conditional logic', () => {
        runInInjectionContext(injector, () => {
          const httpValidator: HttpCustomValidator = {
            request: (ctx) => {
              const value = ctx.value();
              return value ? `/api/check?value=${value}` : undefined;
            },
            onSuccess: () => null,
          };

          functionRegistry.registerHttpValidator('conditional', httpValidator);

          const formValue = signal({ field: 'value' });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'conditional',
            when: {
              expression: 'formValue.field.length > 3',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.field);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });

      it('should handle HTTP validator returning undefined to skip validation', () => {
        runInInjectionContext(injector, () => {
          const httpValidator: HttpCustomValidator = {
            request: (ctx) => {
              // Skip validation if value is empty
              return ctx.value() ? `/api/check` : undefined;
            },
            onSuccess: () => null,
          };

          functionRegistry.registerHttpValidator('skipEmpty', httpValidator);

          const formValue = signal({ field: '' });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'skipEmpty',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.field);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });
    });

    describe('cross-field HTTP validation', () => {
      it('should support cross-field validation with POST request', () => {
        runInInjectionContext(injector, () => {
          const httpValidator: HttpCustomValidator = {
            request: (ctx: FieldContext<string>) => ({
              url: '/api/validate-address',
              method: 'POST',
              body: {
                street: ctx.valueOf('street' as any),
                city: ctx.valueOf('city' as any),
                zipCode: ctx.value(),
              },
            }),
            onSuccess: (result: any) => {
              return result?.valid ? null : { kind: 'invalidAddress' };
            },
          };

          functionRegistry.registerHttpValidator('validateAddress', httpValidator);

          const formValue = signal({
            street: '123 Main St',
            city: 'Springfield',
            zipCode: '12345',
          });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'validateAddress',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.zipCode);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });

      it('should support custom headers in HTTP request', () => {
        runInInjectionContext(injector, () => {
          const httpValidator: HttpCustomValidator = {
            request: (ctx) => ({
              url: '/api/validate',
              method: 'POST',
              body: { value: ctx.value() },
              headers: {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'test',
              },
            }),
            onSuccess: () => null,
          };

          functionRegistry.registerHttpValidator('withHeaders', httpValidator);

          const formValue = signal({ field: 'value' });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'withHeaders',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyValidator(config, path.field);
              }).not.toThrow();
            }),
          );
          rootFormRegistry.registerRootForm(formInstance);
        });
      });
    });

    describe('inverted logic onSuccess', () => {
      it('should handle onSuccess returning error for invalid response', () => {
        const httpValidator: HttpCustomValidator<string, { available: boolean }> = {
          request: (ctx) => `/api/check?username=${ctx.value()}`,
          onSuccess: (result, ctx) => {
            // Inverted logic: success response may indicate validation failure
            return result.available ? null : { kind: 'usernameTaken' };
          },
        };

        functionRegistry.registerHttpValidator('invertedLogic', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('invertedLogic');
        expect(retrieved?.onSuccess).toBeDefined();

        // Simulate onSuccess call
        const mockCtx = { value: () => 'testuser' } as any;
        const errorResult = retrieved!.onSuccess({ available: false }, mockCtx);
        const successResult = retrieved!.onSuccess({ available: true }, mockCtx);

        expect(errorResult).toEqual({ kind: 'usernameTaken' });
        expect(successResult).toBeNull();
      });

      it('should handle onSuccess returning multiple errors', () => {
        const httpValidator: HttpCustomValidator<any, { errors: string[] }> = {
          request: () => '/api/validate',
          onSuccess: (result) => {
            if (!result.errors || result.errors.length === 0) return null;
            return result.errors.map((error) => ({ kind: error }));
          },
        };

        functionRegistry.registerHttpValidator('multiError', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('multiError');
        const mockCtx = {} as any;

        const noErrors = retrieved!.onSuccess({ errors: [] }, mockCtx);
        const withErrors = retrieved!.onSuccess({ errors: ['error1', 'error2'] }, mockCtx);

        expect(noErrors).toBeNull();
        expect(withErrors).toEqual([{ kind: 'error1' }, { kind: 'error2' }]);
      });
    });
  });

  describe('Mixed validation scenarios', () => {
    it('should support both sync and async validators on same field', () => {
      runInInjectionContext(injector, () => {
        // Register sync validator
        const syncValidator = (ctx: FieldContext<string>) => {
          const value = ctx.value();
          return value && value.length >= 3 ? null : { kind: 'tooShort' };
        };
        functionRegistry.registerValidator('minLength', syncValidator);

        // Register async validator
        const mockResource = {
          value: () => ({ available: true }),
          status: () => 'success' as const,
          error: () => null,
          isLoading: () => false,
          reload: vi.fn(),
        } as unknown as ResourceRef<any>;

        const asyncValidator: AsyncCustomValidator = {
          params: (ctx) => ({ username: ctx.value() }),
          factory: () => mockResource,
          onSuccess: (result) => (result?.available ? null : { kind: 'taken' }),
        };
        functionRegistry.registerAsyncValidator('checkAvailable', asyncValidator);

        const formValue = signal({ username: 'test' });

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            // Apply both validators
            expect(() => {
              applyValidator({ type: 'custom', functionName: 'minLength' }, path.username);
              applyValidator({ type: 'customAsync', functionName: 'checkAvailable' }, path.username);
            }).not.toThrow();
          }),
        );
        rootFormRegistry.registerRootForm(formInstance);
      });
    });

    it('should support all validator types registered simultaneously', () => {
      const syncValidator = vi.fn((ctx) => null);
      const asyncValidator = { params: vi.fn(), factory: vi.fn() as any, onSuccess: vi.fn() };
      const httpValidator = { request: vi.fn(), onSuccess: vi.fn() };

      functionRegistry.registerValidator('sync', syncValidator);
      functionRegistry.registerAsyncValidator('async', asyncValidator);
      functionRegistry.registerHttpValidator('http', httpValidator);

      expect(functionRegistry.getValidator('sync')).toBe(syncValidator);
      expect(functionRegistry.getAsyncValidator('async')).toBe(asyncValidator);
      expect(functionRegistry.getHttpValidator('http')).toBe(httpValidator);
    });
  });
});

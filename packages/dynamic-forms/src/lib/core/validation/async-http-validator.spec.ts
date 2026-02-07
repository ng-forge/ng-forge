import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal, ResourceStatus } from '@angular/core';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { form, schema, FieldContext } from '@angular/forms/signals';
import { AsyncValidatorConfig, HttpValidatorConfig } from '../../models/validation/validator-config';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';
import { applyValidator } from './validator-factory';
import { AsyncCustomValidator, HttpCustomValidator } from './validator-types';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ConsoleLogger } from '../../providers/features/logger/console-logger';

// Helper type for mock ResourceRef
type MockResourceRef<T> = {
  value: () => T | null;
  status: () => ResourceStatus;
  error: () => unknown;
  isLoading: () => boolean;
  reload: Mock;
};

describe('Async and HTTP Validator Integration', () => {
  let injector: Injector;
  let functionRegistry: FunctionRegistryService;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FunctionRegistryService,
        FieldContextRegistryService,
        // Provide ConsoleLogger to enable logging in tests
        { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
      ],
    });

    injector = TestBed.inject(Injector);
    functionRegistry = TestBed.inject(FunctionRegistryService);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('AsyncValidator', () => {
    describe('registration and retrieval', () => {
      it('should register and retrieve async validator', () => {
        const asyncValidator: AsyncCustomValidator = {
          params: (ctx) => ({ value: ctx.value() }),
          factory: vi.fn() as AsyncCustomValidator['factory'],
          onSuccess: () => null,
        };

        functionRegistry.registerAsyncValidator('testAsync', asyncValidator);

        const retrieved = functionRegistry.getAsyncValidator('testAsync');
        expect(retrieved).toBe(asyncValidator);
      });

      it('should handle async validator with onError', () => {
        const asyncValidator: AsyncCustomValidator = {
          params: (ctx) => ({ value: ctx.value() }),
          factory: vi.fn() as AsyncCustomValidator['factory'],
          onSuccess: () => null,
          onError: () => ({ kind: 'asyncError' }),
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
          factory: vi.fn() as AsyncCustomValidator['factory'],
          onSuccess: () => null,
        };

        functionRegistry.registerAsyncValidator('withParams', asyncValidator);

        const retrieved = functionRegistry.getAsyncValidator('withParams');
        expect(retrieved).toBe(asyncValidator);
      });
    });

    describe('validator application', () => {
      it('should apply async validator without throwing', () => {
        runInInjectionContext(injector, () => {
          const mockResource: MockResourceRef<{ available: boolean }> = {
            value: () => ({ available: true }),
            status: () => 'idle' as ResourceStatus,
            error: () => null,
            isLoading: () => false,
            reload: vi.fn(),
          };

          const asyncValidator: AsyncCustomValidator = {
            params: (ctx) => ({ username: ctx.value() }),
            factory: () => mockResource,
            onSuccess: (result) => {
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
          mockFormSignal.set(formInstance);
        });
      });

      it('should throw error when async validator not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const config: AsyncValidatorConfig = {
            type: 'customAsync',
            functionName: 'nonexistent',
          };

          expect(() => {
            form(
              formValue,
              schema<typeof formValue>((path) => {
                applyValidator(config, path.field);
              }),
            );
          }).toThrow('[Dynamic Forms] Async validator "nonexistent" not found');
        });
      });

      it('should apply async validator with conditional logic', () => {
        runInInjectionContext(injector, () => {
          const mockResource: MockResourceRef<null> = {
            value: () => null,
            status: () => 'idle' as ResourceStatus,
            error: () => null,
            isLoading: () => false,
            reload: vi.fn(),
          };

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
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('cross-field async validation', () => {
      it('should support cross-field validation with valueOf', () => {
        runInInjectionContext(injector, () => {
          const mockResource: MockResourceRef<{ valid: boolean }> = {
            value: () => ({ valid: true }),
            status: () => 'idle' as ResourceStatus,
            error: () => null,
            isLoading: () => false,
            reload: vi.fn(),
          };

          const asyncValidator: AsyncCustomValidator = {
            params: (ctx: FieldContext<string>) => ({
              password: ctx.value(),
              // Using type assertion for cross-field access in test
              email: ctx.valueOf('email' as keyof typeof ctx),
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
          mockFormSignal.set(formInstance);
        });
      });
    });
  });

  describe('HttpValidator', () => {
    describe('registration and retrieval', () => {
      it('should register and retrieve HTTP validator', () => {
        const httpValidator: HttpCustomValidator = {
          request: (ctx) => `/api/check?value=${ctx.value()}`,
          onSuccess: () => null,
        };

        functionRegistry.registerHttpValidator('testHttp', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('testHttp');
        expect(retrieved).toBe(httpValidator);
      });

      it('should handle HTTP validator with onError', () => {
        const httpValidator: HttpCustomValidator = {
          request: () => `/api/check`,
          onSuccess: () => null,
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
          onSuccess: (result: unknown) => ((result as { valid?: boolean })?.valid ? null : { kind: 'invalid' }),
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
          mockFormSignal.set(formInstance);
        });
      });

      it('should throw error when HTTP validator not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const config: HttpValidatorConfig = {
            type: 'customHttp',
            functionName: 'nonexistent',
          };

          expect(() => {
            form(
              formValue,
              schema<typeof formValue>((path) => {
                applyValidator(config, path.field);
              }),
            );
          }).toThrow('[Dynamic Forms] HTTP validator "nonexistent" not found');
        });
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
          mockFormSignal.set(formInstance);
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
          mockFormSignal.set(formInstance);
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
                // Using type assertion for cross-field access in test
                street: ctx.valueOf('street' as keyof typeof ctx),
                city: ctx.valueOf('city' as keyof typeof ctx),
                zipCode: ctx.value(),
              },
            }),
            onSuccess: (result: unknown) => {
              return (result as { valid?: boolean })?.valid ? null : { kind: 'invalidAddress' };
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
          mockFormSignal.set(formInstance);
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
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('inverted logic onSuccess', () => {
      it('should handle onSuccess returning error for invalid response', () => {
        const httpValidator: HttpCustomValidator<string, { available: boolean }> = {
          request: (ctx) => `/api/check?username=${ctx.value()}`,
          onSuccess: (result) => {
            // Inverted logic: success response may indicate validation failure
            return result.available ? null : { kind: 'usernameTaken' };
          },
        };

        functionRegistry.registerHttpValidator('invertedLogic', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('invertedLogic');
        expect(retrieved?.onSuccess).toBeDefined();

        // Simulate onSuccess call with minimal mock context
        const mockCtx = { value: () => 'testuser' } as FieldContext<string>;
        if (retrieved) {
          const errorResult = retrieved.onSuccess({ available: false }, mockCtx);
          const successResult = retrieved.onSuccess({ available: true }, mockCtx);

          expect(errorResult).toEqual({ kind: 'usernameTaken' });
          expect(successResult).toBeNull();
        }
      });

      it('should handle onSuccess returning multiple errors', () => {
        const httpValidator: HttpCustomValidator<unknown, { errors: string[] }> = {
          request: () => '/api/validate',
          onSuccess: (result) => {
            if (!result.errors || result.errors.length === 0) return null;
            return result.errors.map((error) => ({ kind: error }));
          },
        };

        functionRegistry.registerHttpValidator('multiError', httpValidator);

        const retrieved = functionRegistry.getHttpValidator('multiError');

        // Minimal mock context for testing onSuccess callback
        const mockCtx = {} as FieldContext<unknown>;

        if (retrieved) {
          const noErrors = retrieved.onSuccess({ errors: [] }, mockCtx);
          const withErrors = retrieved.onSuccess({ errors: ['error1', 'error2'] }, mockCtx);

          expect(noErrors).toBeNull();
          expect(withErrors).toEqual([{ kind: 'error1' }, { kind: 'error2' }]);
        }
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
        const mockResource: MockResourceRef<{ available: boolean }> = {
          value: () => ({ available: true }),
          status: () => 'idle' as ResourceStatus,
          error: () => null,
          isLoading: () => false,
          reload: vi.fn(),
        };

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
        mockFormSignal.set(formInstance);
      });
    });

    it('should support all validator types registered simultaneously', () => {
      const syncValidator = vi.fn(() => null);

      const asyncValidator: AsyncCustomValidator = {
        params: vi.fn(),
        factory: vi.fn() as AsyncCustomValidator['factory'],
        onSuccess: vi.fn(),
      };
      const httpValidator: HttpCustomValidator = { request: vi.fn(), onSuccess: vi.fn() };

      functionRegistry.registerValidator('sync', syncValidator);
      functionRegistry.registerAsyncValidator('async', asyncValidator);
      functionRegistry.registerHttpValidator('http', httpValidator);

      expect(functionRegistry.getValidator('sync')).toBe(syncValidator);
      expect(functionRegistry.getAsyncValidator('async')).toBe(asyncValidator);
      expect(functionRegistry.getHttpValidator('http')).toBe(httpValidator);
    });
  });
});

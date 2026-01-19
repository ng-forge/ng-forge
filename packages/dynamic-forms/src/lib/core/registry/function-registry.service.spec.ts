import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { FunctionRegistryService } from './function-registry.service';
import { createMockLogger } from '../../../../testing/src/mock-logger';
import type { Logger } from '../../providers/features/logger/logger.interface';

describe('FunctionRegistryService', () => {
  let service: FunctionRegistryService;
  let mockContext: EvaluationContext;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = createMockLogger();

    TestBed.configureTestingModule({
      providers: [FunctionRegistryService],
    });

    service = TestBed.inject(FunctionRegistryService);
    mockContext = {
      fieldValue: 'test',
      formValue: { testField: 'test', age: 25 },
      fieldPath: 'testField',
      logger: mockLogger,
    };
  });

  describe('registerCustomFunction', () => {
    it('should register a custom function', () => {
      const testFunction = vi.fn().mockReturnValue(true);

      service.registerCustomFunction('testFn', testFunction);

      const functions = service.getCustomFunctions();
      expect(functions).toHaveProperty('testFn');
      expect(functions.testFn).toBe(testFunction);
    });

    it('should allow registering multiple functions', () => {
      const fn1 = vi.fn().mockReturnValue(true);
      const fn2 = vi.fn().mockReturnValue(false);
      const fn3 = vi.fn().mockReturnValue('result');

      service.registerCustomFunction('fn1', fn1);
      service.registerCustomFunction('fn2', fn2);
      service.registerCustomFunction('fn3', fn3);

      const functions = service.getCustomFunctions();
      expect(Object.keys(functions)).toHaveLength(3);
      expect(functions.fn1).toBe(fn1);
      expect(functions.fn2).toBe(fn2);
      expect(functions.fn3).toBe(fn3);
    });

    it('should overwrite existing function with same name', () => {
      const originalFn = vi.fn().mockReturnValue('original');
      const newFn = vi.fn().mockReturnValue('new');

      service.registerCustomFunction('sameName', originalFn);
      service.registerCustomFunction('sameName', newFn);

      const functions = service.getCustomFunctions();
      expect(Object.keys(functions)).toHaveLength(1);
      expect(functions.sameName).toBe(newFn);
      expect(functions.sameName).not.toBe(originalFn);
    });

    it('should handle function names with special characters', () => {
      const fn = vi.fn().mockReturnValue(true);

      service.registerCustomFunction('function-with-dashes', fn);
      service.registerCustomFunction('function_with_underscores', fn);
      service.registerCustomFunction('functionWithCamelCase', fn);
      service.registerCustomFunction('function.with.dots', fn);

      const functions = service.getCustomFunctions();
      expect(functions).toHaveProperty('function-with-dashes');
      expect(functions).toHaveProperty('function_with_underscores');
      expect(functions).toHaveProperty('functionWithCamelCase');
      expect(functions).toHaveProperty('function.with.dots');
    });

    it('should handle empty function name', () => {
      const fn = vi.fn().mockReturnValue(true);

      service.registerCustomFunction('', fn);

      const functions = service.getCustomFunctions();
      expect(functions).toHaveProperty('');
      expect(functions['']).toBe(fn);
    });
  });

  describe('getCustomFunctions', () => {
    it('should return empty object when no functions are registered', () => {
      const functions = service.getCustomFunctions();

      expect(functions).toEqual({});
      expect(Object.keys(functions)).toHaveLength(0);
    });

    it('should return all registered functions as object', () => {
      const fn1 = vi.fn().mockReturnValue(true);
      const fn2 = vi.fn().mockReturnValue(false);

      service.registerCustomFunction('isValid', fn1);
      service.registerCustomFunction('isInvalid', fn2);

      const functions = service.getCustomFunctions();

      expect(functions).toEqual({
        isValid: fn1,
        isInvalid: fn2,
      });
    });

    it('should return a new object instance each time', () => {
      const fn = vi.fn().mockReturnValue(true);
      service.registerCustomFunction('testFn', fn);

      const functions1 = service.getCustomFunctions();
      const functions2 = service.getCustomFunctions();

      expect(functions1).not.toBe(functions2); // Different object instances
      expect(functions1).toEqual(functions2); // Same content
    });

    it('should not allow external modification of internal function map', () => {
      const fn = vi.fn().mockReturnValue(true);
      service.registerCustomFunction('testFn', fn);

      const functions = service.getCustomFunctions();
      functions.maliciousFunction = vi.fn();

      // Internal map should not be affected
      const freshFunctions = service.getCustomFunctions();
      expect(freshFunctions).not.toHaveProperty('maliciousFunction');
      expect(Object.keys(freshFunctions)).toHaveLength(1);
    });
  });

  describe('clearCustomFunctions', () => {
    it('should remove all registered functions', () => {
      const fn1 = vi.fn().mockReturnValue(true);
      const fn2 = vi.fn().mockReturnValue(false);

      service.registerCustomFunction('fn1', fn1);
      service.registerCustomFunction('fn2', fn2);

      expect(Object.keys(service.getCustomFunctions())).toHaveLength(2);

      service.clearCustomFunctions();

      expect(service.getCustomFunctions()).toEqual({});
      expect(Object.keys(service.getCustomFunctions())).toHaveLength(0);
    });

    it('should work when no functions are registered', () => {
      expect(() => service.clearCustomFunctions()).not.toThrow();
      expect(service.getCustomFunctions()).toEqual({});
    });

    it('should allow registering new functions after clearing', () => {
      const fn1 = vi.fn().mockReturnValue(true);
      const fn2 = vi.fn().mockReturnValue(false);

      service.registerCustomFunction('fn1', fn1);
      service.clearCustomFunctions();
      service.registerCustomFunction('fn2', fn2);

      const functions = service.getCustomFunctions();
      expect(functions).toEqual({ fn2: fn2 });
      expect(functions).not.toHaveProperty('fn1');
    });
  });

  describe('function execution', () => {
    it('should execute registered functions with correct context', () => {
      const testFunction = vi.fn().mockReturnValue(true);

      service.registerCustomFunction('testFn', testFunction);
      const functions = service.getCustomFunctions();

      const result = functions.testFn(mockContext);

      expect(testFunction).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);
    });

    it('should handle functions that access context properties', () => {
      const ageValidator = vi.fn((context: EvaluationContext) => {
        return typeof context.formValue.age === 'number' && context.formValue.age >= 18;
      });

      service.registerCustomFunction('isAdult', ageValidator);
      const functions = service.getCustomFunctions();

      const result = functions.isAdult(mockContext);

      expect(ageValidator).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);
    });

    it('should handle functions that return different types', () => {
      const stringFn = vi.fn().mockReturnValue('string result');
      const numberFn = vi.fn().mockReturnValue(42);
      const booleanFn = vi.fn().mockReturnValue(true);
      const objectFn = vi.fn().mockReturnValue({ key: 'value' });
      const nullFn = vi.fn().mockReturnValue(null);
      const undefinedFn = vi.fn().mockReturnValue(undefined);

      service.registerCustomFunction('stringFn', stringFn);
      service.registerCustomFunction('numberFn', numberFn);
      service.registerCustomFunction('booleanFn', booleanFn);
      service.registerCustomFunction('objectFn', objectFn);
      service.registerCustomFunction('nullFn', nullFn);
      service.registerCustomFunction('undefinedFn', undefinedFn);

      const functions = service.getCustomFunctions();

      expect(functions.stringFn(mockContext)).toBe('string result');
      expect(functions.numberFn(mockContext)).toBe(42);
      expect(functions.booleanFn(mockContext)).toBe(true);
      expect(functions.objectFn(mockContext)).toEqual({ key: 'value' });
      expect(functions.nullFn(mockContext)).toBeNull();
      expect(functions.undefinedFn(mockContext)).toBeUndefined();
    });

    it('should handle functions that throw errors', () => {
      const throwingFunction = vi.fn(() => {
        throw new Error('Function error');
      });

      service.registerCustomFunction('throwingFn', throwingFunction);
      const functions = service.getCustomFunctions();

      expect(() => functions.throwingFn(mockContext)).toThrow('Function error');
      expect(throwingFunction).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex validation scenarios', () => {
      // Register multiple validation functions
      const isEmailValid = vi.fn((context: EvaluationContext) => {
        const email = context.fieldValue as string;
        return typeof email === 'string' && email.includes('@') && email.includes('.');
      });

      const isPasswordStrong = vi.fn((context: EvaluationContext) => {
        const password = context.fieldValue as string;
        return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
      });

      const isFormComplete = vi.fn((context: EvaluationContext) => {
        const form = context.formValue;
        return !!(form.email && form.password && form.name);
      });

      service.registerCustomFunction('isEmailValid', isEmailValid);
      service.registerCustomFunction('isPasswordStrong', isPasswordStrong);
      service.registerCustomFunction('isFormComplete', isFormComplete);

      const functions = service.getCustomFunctions();

      // Test email validation
      const emailContext: EvaluationContext = {
        fieldValue: 'test@example.com',
        formValue: {},
        fieldPath: 'email',
        logger: mockLogger,
      };
      expect(functions.isEmailValid(emailContext)).toBe(true);

      // Test password validation
      const passwordContext: EvaluationContext = {
        fieldValue: 'Password123',
        formValue: {},
        fieldPath: 'password',
        logger: mockLogger,
      };
      expect(functions.isPasswordStrong(passwordContext)).toBe(true);

      // Test form completion
      const formContext: EvaluationContext = {
        fieldValue: '',
        formValue: { email: 'test@example.com', password: 'Password123', name: 'John' },
        fieldPath: '',
        logger: mockLogger,
      };
      expect(functions.isFormComplete(formContext)).toBe(true);
    });

    it('should support function composition patterns', () => {
      const isNotEmpty = vi.fn((context: EvaluationContext) => {
        const value = context.fieldValue as string;
        return typeof value === 'string' && value.trim().length > 0;
      });

      const hasMinLength = vi.fn((context: EvaluationContext) => {
        const value = context.fieldValue as string;
        return typeof value === 'string' && value.length >= 3;
      });

      service.registerCustomFunction('isNotEmpty', isNotEmpty);
      service.registerCustomFunction('hasMinLength', hasMinLength);

      const functions = service.getCustomFunctions();

      const testContext: EvaluationContext = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'field',
        logger: mockLogger,
      };

      expect(functions.isNotEmpty(testContext)).toBe(true);
      expect(functions.hasMinLength(testContext)).toBe(true);
    });

    it('should maintain function isolation', () => {
      const statefulFunction = vi.fn(
        (() => {
          let callCount = 0;
          return () => {
            callCount++;
            return callCount;
          };
        })(),
      );

      service.registerCustomFunction('statefulFn', statefulFunction);
      const functions = service.getCustomFunctions();

      expect(functions.statefulFn(mockContext)).toBe(1);
      expect(functions.statefulFn(mockContext)).toBe(2);
      expect(functions.statefulFn(mockContext)).toBe(3);

      // Getting functions again should return the same function instance
      const functionsAgain = service.getCustomFunctions();
      expect(functionsAgain.statefulFn(mockContext)).toBe(4);
    });
  });

  describe('registerValidator', () => {
    it('should register a custom validator', () => {
      const testValidator = vi.fn().mockReturnValue({ kind: 'testError' });

      service.registerValidator('testValidator', testValidator);

      const validator = service.getValidator('testValidator');
      expect(validator).toBe(testValidator);
    });

    it('should allow registering multiple validators', () => {
      const validator1 = vi.fn().mockReturnValue({ kind: 'error1' });
      const validator2 = vi.fn().mockReturnValue({ kind: 'error2' });
      const validator3 = vi.fn().mockReturnValue(null);

      service.registerValidator('v1', validator1);
      service.registerValidator('v2', validator2);
      service.registerValidator('v3', validator3);

      expect(service.getValidator('v1')).toBe(validator1);
      expect(service.getValidator('v2')).toBe(validator2);
      expect(service.getValidator('v3')).toBe(validator3);
    });

    it('should overwrite existing validator with same name', () => {
      const originalValidator = vi.fn().mockReturnValue({ kind: 'original' });
      const newValidator = vi.fn().mockReturnValue({ kind: 'new' });

      service.registerValidator('sameName', originalValidator);
      service.registerValidator('sameName', newValidator);

      expect(service.getValidator('sameName')).toBe(newValidator);
      expect(service.getValidator('sameName')).not.toBe(originalValidator);
    });

    it('should return undefined for unregistered validator', () => {
      expect(service.getValidator('nonexistent')).toBeUndefined();
    });
  });

  describe('clearValidators', () => {
    it('should remove all registered validators', () => {
      const v1 = vi.fn().mockReturnValue({ kind: 'error1' });
      const v2 = vi.fn().mockReturnValue({ kind: 'error2' });

      service.registerValidator('v1', v1);
      service.registerValidator('v2', v2);

      expect(service.getValidator('v1')).toBeDefined();
      expect(service.getValidator('v2')).toBeDefined();

      service.clearValidators();

      expect(service.getValidator('v1')).toBeUndefined();
      expect(service.getValidator('v2')).toBeUndefined();
    });

    it('should work when no validators are registered', () => {
      expect(() => service.clearValidators()).not.toThrow();
    });
  });

  describe('registerAsyncValidator', () => {
    it('should register an async validator', () => {
      const asyncValidator = {
        params: vi.fn((ctx: unknown) => ({ value: (ctx as { value: () => unknown }).value() })),
        factory: vi.fn() as any,
        onSuccess: vi.fn(() => null),
      };

      service.registerAsyncValidator('asyncTest', asyncValidator);

      const validator = service.getAsyncValidator('asyncTest');
      expect(validator).toBe(asyncValidator);
    });

    it('should allow registering multiple async validators', () => {
      const av1 = {
        params: vi.fn(),
        factory: vi.fn(),
        onSuccess: vi.fn(),
      };
      const av2 = {
        params: vi.fn(),
        factory: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn(),
      };

      service.registerAsyncValidator('av1', av1);
      service.registerAsyncValidator('av2', av2);

      expect(service.getAsyncValidator('av1')).toBe(av1);
      expect(service.getAsyncValidator('av2')).toBe(av2);
    });

    it('should overwrite existing async validator with same name', () => {
      const original = {
        params: vi.fn(),
        factory: vi.fn(),
        onSuccess: vi.fn().mockReturnValue({ kind: 'original' }),
      };
      const replacement = {
        params: vi.fn(),
        factory: vi.fn(),
        onSuccess: vi.fn().mockReturnValue({ kind: 'new' }),
      };

      service.registerAsyncValidator('sameName', original);
      service.registerAsyncValidator('sameName', replacement);

      expect(service.getAsyncValidator('sameName')).toBe(replacement);
      expect(service.getAsyncValidator('sameName')).not.toBe(original);
    });

    it('should return undefined for unregistered async validator', () => {
      expect(service.getAsyncValidator('nonexistent')).toBeUndefined();
    });
  });

  describe('clearAsyncValidators', () => {
    it('should remove all registered async validators', () => {
      const av1 = { params: vi.fn(), factory: vi.fn(), onSuccess: vi.fn() };
      const av2 = { params: vi.fn(), factory: vi.fn(), onSuccess: vi.fn() };

      service.registerAsyncValidator('av1', av1);
      service.registerAsyncValidator('av2', av2);

      expect(service.getAsyncValidator('av1')).toBeDefined();
      expect(service.getAsyncValidator('av2')).toBeDefined();

      service.clearAsyncValidators();

      expect(service.getAsyncValidator('av1')).toBeUndefined();
      expect(service.getAsyncValidator('av2')).toBeUndefined();
    });

    it('should work when no async validators are registered', () => {
      expect(() => service.clearAsyncValidators()).not.toThrow();
    });
  });

  describe('registerHttpValidator', () => {
    it('should register an HTTP validator', () => {
      const httpValidator = {
        request: vi.fn((ctx: unknown) => `/api/check?value=${(ctx as { value: () => unknown }).value()}`),
        onSuccess: vi.fn(() => null),
      };

      service.registerHttpValidator('httpTest', httpValidator);

      const validator = service.getHttpValidator('httpTest');
      expect(validator).toBe(httpValidator);
    });

    it('should allow registering multiple HTTP validators', () => {
      const hv1 = {
        request: vi.fn(() => '/api/v1'),
        onSuccess: vi.fn(),
      };
      const hv2 = {
        request: vi.fn(() => '/api/v2'),
        onSuccess: vi.fn(),
        onError: vi.fn(),
      };

      service.registerHttpValidator('hv1', hv1);
      service.registerHttpValidator('hv2', hv2);

      expect(service.getHttpValidator('hv1')).toBe(hv1);
      expect(service.getHttpValidator('hv2')).toBe(hv2);
    });

    it('should handle HTTP validators with POST method', () => {
      const postValidator = {
        request: vi.fn((ctx: unknown) => ({
          url: '/api/validate',
          method: 'POST' as const,
          body: { value: (ctx as { value: () => unknown }).value() },
        })),
        onSuccess: vi.fn(),
      };

      service.registerHttpValidator('postValidator', postValidator);

      const validator = service.getHttpValidator('postValidator');
      expect(validator).toBe(postValidator);
    });

    it('should overwrite existing HTTP validator with same name', () => {
      const original = {
        request: vi.fn(() => '/api/original'),
        onSuccess: vi.fn(),
      };
      const replacement = {
        request: vi.fn(() => '/api/new'),
        onSuccess: vi.fn(),
      };

      service.registerHttpValidator('sameName', original);
      service.registerHttpValidator('sameName', replacement);

      expect(service.getHttpValidator('sameName')).toBe(replacement);
      expect(service.getHttpValidator('sameName')).not.toBe(original);
    });

    it('should return undefined for unregistered HTTP validator', () => {
      expect(service.getHttpValidator('nonexistent')).toBeUndefined();
    });
  });

  describe('clearHttpValidators', () => {
    it('should remove all registered HTTP validators', () => {
      const hv1 = { request: vi.fn(), onSuccess: vi.fn() };
      const hv2 = { request: vi.fn(), onSuccess: vi.fn() };

      service.registerHttpValidator('hv1', hv1);
      service.registerHttpValidator('hv2', hv2);

      expect(service.getHttpValidator('hv1')).toBeDefined();
      expect(service.getHttpValidator('hv2')).toBeDefined();

      service.clearHttpValidators();

      expect(service.getHttpValidator('hv1')).toBeUndefined();
      expect(service.getHttpValidator('hv2')).toBeUndefined();
    });

    it('should work when no HTTP validators are registered', () => {
      expect(() => service.clearHttpValidators()).not.toThrow();
    });
  });

  describe('clearAll', () => {
    it('should clear all types of registrations', () => {
      // Register one of each type
      const customFn = vi.fn();
      const validator = vi.fn();
      const asyncValidator = { params: vi.fn(), factory: vi.fn(), onSuccess: vi.fn() };
      const httpValidator = { request: vi.fn(), onSuccess: vi.fn() };

      service.registerCustomFunction('fn', customFn);
      service.registerValidator('v', validator);
      service.registerAsyncValidator('av', asyncValidator);
      service.registerHttpValidator('hv', httpValidator);

      // Verify all are registered
      expect(Object.keys(service.getCustomFunctions())).toHaveLength(1);
      expect(service.getValidator('v')).toBeDefined();
      expect(service.getAsyncValidator('av')).toBeDefined();
      expect(service.getHttpValidator('hv')).toBeDefined();

      // Clear all
      service.clearAll();

      // Verify all are cleared
      expect(service.getCustomFunctions()).toEqual({});
      expect(service.getValidator('v')).toBeUndefined();
      expect(service.getAsyncValidator('av')).toBeUndefined();
      expect(service.getHttpValidator('hv')).toBeUndefined();
    });

    it('should work when nothing is registered', () => {
      expect(() => service.clearAll()).not.toThrow();
    });

    it('should allow re-registration after clearing', () => {
      const fn = vi.fn();
      const validator = vi.fn();

      service.registerCustomFunction('fn', fn);
      service.registerValidator('v', validator);

      service.clearAll();

      const newFn = vi.fn();
      const newValidator = vi.fn();

      service.registerCustomFunction('fn', newFn);
      service.registerValidator('v', newValidator);

      expect(service.getCustomFunctions().fn).toBe(newFn);
      expect(service.getValidator('v')).toBe(newValidator);
    });
  });

  describe('validator isolation', () => {
    it('should maintain separate registries for functions and validators', () => {
      const fn = vi.fn();
      const validator = vi.fn();

      service.registerCustomFunction('sameName', fn);
      service.registerValidator('sameName', validator);

      expect(service.getCustomFunctions().sameName).toBe(fn);
      expect(service.getValidator('sameName')).toBe(validator);
    });

    it('should maintain separate registries for sync, async, and HTTP validators', () => {
      const syncValidator = vi.fn();
      const asyncValidator = { params: vi.fn(), factory: vi.fn(), onSuccess: vi.fn() };
      const httpValidator = { request: vi.fn(), onSuccess: vi.fn() };

      service.registerValidator('sameName', syncValidator);
      service.registerAsyncValidator('sameName', asyncValidator);
      service.registerHttpValidator('sameName', httpValidator);

      expect(service.getValidator('sameName')).toBe(syncValidator);
      expect(service.getAsyncValidator('sameName')).toBe(asyncValidator);
      expect(service.getHttpValidator('sameName')).toBe(httpValidator);
    });

    it('should not affect other registries when clearing one type', () => {
      const fn = vi.fn();
      const validator = vi.fn();
      const asyncValidator = { params: vi.fn(), factory: vi.fn(), onSuccess: vi.fn() };
      const httpValidator = { request: vi.fn(), onSuccess: vi.fn() };

      service.registerCustomFunction('fn', fn);
      service.registerValidator('v', validator);
      service.registerAsyncValidator('av', asyncValidator);
      service.registerHttpValidator('hv', httpValidator);

      service.clearValidators();

      expect(Object.keys(service.getCustomFunctions())).toHaveLength(1);
      expect(service.getValidator('v')).toBeUndefined();
      expect(service.getAsyncValidator('av')).toBeDefined();
      expect(service.getHttpValidator('hv')).toBeDefined();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EvaluationContext } from '../../models';
import { FunctionRegistryService } from './function-registry.service';

describe('FunctionRegistryService', () => {
  let service: FunctionRegistryService;
  let mockContext: EvaluationContext;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService],
    });

    service = TestBed.inject(FunctionRegistryService);
    mockContext = {
      fieldValue: 'test',
      formValue: { testField: 'test', age: 25 },
      fieldPath: 'testField',
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
      };
      expect(functions.isEmailValid(emailContext)).toBe(true);

      // Test password validation
      const passwordContext: EvaluationContext = {
        fieldValue: 'Password123',
        formValue: {},
        fieldPath: 'password',
      };
      expect(functions.isPasswordStrong(passwordContext)).toBe(true);

      // Test form completion
      const formContext: EvaluationContext = {
        fieldValue: '',
        formValue: { email: 'test@example.com', password: 'Password123', name: 'John' },
        fieldPath: '',
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
        })()
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
});

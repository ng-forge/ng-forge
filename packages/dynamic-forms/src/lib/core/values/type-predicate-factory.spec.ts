import { describe, it, expect, vi } from 'vitest';
import { createTypePredicateFunction } from './type-predicate-factory';

describe('createTypePredicateFunction', () => {
  describe('basic predicates', () => {
    it('should create predicate for typeof check', () => {
      const isString = createTypePredicateFunction<string>('typeof value === "string"');

      expect(isString('hello')).toBe(true);
      expect(isString(42)).toBe(false);
      expect(isString(null)).toBe(false);
    });

    it('should create predicate for number type', () => {
      const isNumber = createTypePredicateFunction<number>('typeof value === "number"');

      expect(isNumber(42)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber('42')).toBe(false);
      expect(isNumber(NaN)).toBe(true); // NaN is type number
    });

    it('should create predicate for boolean type', () => {
      const isBoolean = createTypePredicateFunction<boolean>('typeof value === "boolean"');

      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
    });

    it('should create predicate for null check', () => {
      const isNull = createTypePredicateFunction('value === null');

      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull('')).toBe(false);
    });

    it('should create predicate for undefined check', () => {
      const isUndefined = createTypePredicateFunction('value === undefined');

      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
    });
  });

  describe('complex predicates', () => {
    it('should create predicate for array check', () => {
      const isArray = createTypePredicateFunction('Array.isArray(value)');

      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray('array')).toBe(false);
      expect(isArray({})).toBe(false);
    });

    it('should create predicate for object check', () => {
      const isObject = createTypePredicateFunction('typeof value === "object" && value !== null && !Array.isArray(value)');

      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject('object')).toBe(false);
    });

    it('should create predicate for numeric string', () => {
      const isNumericString = createTypePredicateFunction('typeof value === "string" && !isNaN(Number(value))');

      expect(isNumericString('42')).toBe(true);
      expect(isNumericString('3.14')).toBe(true);
      expect(isNumericString('hello')).toBe(false);
      expect(isNumericString(42)).toBe(false);
    });

    it('should create predicate for non-empty string', () => {
      const isNonEmptyString = createTypePredicateFunction('typeof value === "string" && value.length > 0');

      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(' ')).toBe(true);
      expect(isNonEmptyString(null)).toBe(false);
    });

    it('should create predicate for positive number', () => {
      const isPositive = createTypePredicateFunction('typeof value === "number" && value > 0');

      expect(isPositive(1)).toBe(true);
      expect(isPositive(42)).toBe(true);
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-5)).toBe(false);
    });

    it('should create predicate with logical operators', () => {
      const isValidAge = createTypePredicateFunction('typeof value === "number" && value >= 0 && value <= 150');

      expect(isValidAge(25)).toBe(true);
      expect(isValidAge(0)).toBe(true);
      expect(isValidAge(150)).toBe(true);
      expect(isValidAge(-1)).toBe(false);
      expect(isValidAge(200)).toBe(false);
      expect(isValidAge('25')).toBe(false);
    });
  });

  describe('property access predicates', () => {
    it('should create predicate checking object property', () => {
      const hasName = createTypePredicateFunction('!!(value && typeof value === "object" && "name" in value)');

      expect(hasName({ name: 'John' })).toBe(true);
      expect(hasName({ age: 30 })).toBe(false);
      expect(hasName(null)).toBe(false);
    });

    it('should create predicate checking property value', () => {
      const isActiveUser = createTypePredicateFunction('!!(value && value.isActive === true)');

      expect(isActiveUser({ isActive: true })).toBe(true);
      expect(isActiveUser({ isActive: false })).toBe(false);
      expect(isActiveUser({})).toBe(false);
      expect(isActiveUser(null)).toBe(false);
    });

    it('should create predicate with nested property access', () => {
      const hasEmail = createTypePredicateFunction('!!(value && value.user && typeof value.user.email === "string")');

      expect(hasEmail({ user: { email: 'test@example.com' } })).toBe(true);
      expect(hasEmail({ user: {} })).toBe(false);
      expect(hasEmail({})).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return false for invalid predicate', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const invalidPredicate = createTypePredicateFunction('invalid javascript syntax !!!');

      const result = invalidPredicate('test');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return false when predicate throws at runtime', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const throwingPredicate = createTypePredicateFunction('value.nonExistent.method()');

      const result = throwingPredicate({});

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log error with predicate string', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const invalidPredicate = createTypePredicateFunction('!!!');

      invalidPredicate('test');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error evaluating type predicate:', '!!!', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should not throw when predicate evaluation fails', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const throwingPredicate = createTypePredicateFunction('throw new Error("test")');

      expect(() => throwingPredicate('value')).not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty predicate', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const emptyPredicate = createTypePredicateFunction('');

      const result = emptyPredicate('test');

      // Empty predicate returns undefined
      expect(result).toBe(undefined);

      consoleErrorSpy.mockRestore();
    });

    it('should handle predicate with whitespace', () => {
      const withWhitespace = createTypePredicateFunction('  typeof value === "string"  ');

      expect(withWhitespace('hello')).toBe(true);
      expect(withWhitespace(42)).toBe(false);
    });

    it('should handle predicate returning non-boolean', () => {
      const returnsNumber = createTypePredicateFunction('42');

      // Returns the actual number, not converted to boolean
      expect(returnsNumber('anything')).toBe(42);
    });

    it('should handle predicate returning falsy values', () => {
      const returnsFalsy = createTypePredicateFunction('0');

      // Returns the actual 0, not converted to false
      expect(returnsFalsy('anything')).toBe(0);
    });
  });

  describe('function reusability', () => {
    it('should create reusable predicate function', () => {
      const isString = createTypePredicateFunction<string>('typeof value === "string"');

      const values = ['hello', 42, 'world', null, 'test'];
      const strings = values.filter(isString);

      expect(strings).toEqual(['hello', 'world', 'test']);
    });

    it('should create independent predicate instances', () => {
      const pred1 = createTypePredicateFunction('value > 0');
      const pred2 = createTypePredicateFunction('value < 0');

      expect(pred1(5)).toBe(true);
      expect(pred1(-5)).toBe(false);
      expect(pred2(5)).toBe(false);
      expect(pred2(-5)).toBe(true);
    });

    it('should maintain closure scope correctly', () => {
      const isEven = createTypePredicateFunction('typeof value === "number" && value % 2 === 0');
      const isOdd = createTypePredicateFunction('typeof value === "number" && value % 2 === 1');

      const numbers = [1, 2, 3, 4, 5, 6];
      const evens = numbers.filter(isEven);
      const odds = numbers.filter(isOdd);

      expect(evens).toEqual([2, 4, 6]);
      expect(odds).toEqual([1, 3, 5]);
    });
  });

  describe('type narrowing', () => {
    it('should provide type narrowing for TypeScript', () => {
      const isString = createTypePredicateFunction<string>('typeof value === "string"');
      const value: unknown = 'hello';

      if (isString(value)) {
        // TypeScript should narrow type to string here
        const length: number = value.length;
        expect(length).toBe(5);
      }
    });

    it('should work with discriminated unions', () => {
      interface Success {
        status: 'success';
        data: string;
      }
      interface Error {
        status: 'error';
        message: string;
      }

      const isSuccess = createTypePredicateFunction<Success>('value && value.status === "success"');

      const result1: Success | Error = { status: 'success', data: 'test' };
      const result2: Success | Error = { status: 'error', message: 'failed' };

      expect(isSuccess(result1)).toBe(true);
      expect(isSuccess(result2)).toBe(false);
    });
  });

  describe('advanced JavaScript features', () => {
    it('should support instanceof checks', () => {
      const isDate = createTypePredicateFunction('value instanceof Date');

      expect(isDate(new Date())).toBe(true);
      expect(isDate('2024-01-01')).toBe(false);
      expect(isDate({})).toBe(false);
    });

    it('should support regex test', () => {
      const isEmail = createTypePredicateFunction('/^[^@]+@[^@]+\\.[^@]+$/.test(value)');

      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('invalid-email')).toBe(false);
      expect(isEmail('test@')).toBe(false);
    });

    it('should support method calls', () => {
      const startsWithHello = createTypePredicateFunction('typeof value === "string" && value.startsWith("hello")');

      expect(startsWithHello('hello world')).toBe(true);
      expect(startsWithHello('goodbye world')).toBe(false);
      expect(startsWithHello(123)).toBe(false);
    });
  });
});

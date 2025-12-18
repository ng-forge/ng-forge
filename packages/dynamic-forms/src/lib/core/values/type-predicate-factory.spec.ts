import { describe, it, expect, vi } from 'vitest';
import { createTypePredicateFunction } from './type-predicate-factory';

describe('createTypePredicateFunction', () => {
  describe('discriminated union predicates', () => {
    it('should create predicate for type property check', () => {
      const isCreditCard = createTypePredicateFunction('value && value.paymentType === "credit"');

      expect(isCreditCard({ paymentType: 'credit', cardNumber: '1234' })).toBe(true);
      expect(isCreditCard({ paymentType: 'bank', accountNumber: '5678' })).toBe(false);
      expect(isCreditCard(null)).toBe(false);
    });

    it('should create predicate for status check', () => {
      const isActive = createTypePredicateFunction('value && value.status === "active"');

      expect(isActive({ status: 'active' })).toBe(true);
      expect(isActive({ status: 'inactive' })).toBe(false);
      expect(isActive({})).toBe(false);
    });

    it('should create predicate for kind property', () => {
      const isError = createTypePredicateFunction('value && value.kind === "error"');

      expect(isError({ kind: 'error', message: 'failed' })).toBe(true);
      expect(isError({ kind: 'success', data: 'ok' })).toBe(false);
    });
  });

  describe('null and undefined checks', () => {
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

    it('should create predicate for truthy value', () => {
      const isTruthy = createTypePredicateFunction('!!value');

      expect(isTruthy('hello')).toBe(true);
      expect(isTruthy(1)).toBe(true);
      expect(isTruthy(null)).toBe(false);
      expect(isTruthy(undefined)).toBe(false);
      expect(isTruthy('')).toBe(false);
      expect(isTruthy(0)).toBe(false);
    });
  });

  describe('property access predicates', () => {
    it('should create predicate checking property existence', () => {
      const hasName = createTypePredicateFunction('!!(value && value.name !== undefined)');

      expect(hasName({ name: 'John' })).toBe(true);
      expect(hasName({ age: 30 })).toBe(false);
      expect(hasName(null)).toBe(false);
    });

    it('should create predicate checking boolean property', () => {
      const isActiveUser = createTypePredicateFunction('!!(value && value.isActive === true)');

      expect(isActiveUser({ isActive: true })).toBe(true);
      expect(isActiveUser({ isActive: false })).toBe(false);
      expect(isActiveUser({})).toBe(false);
      expect(isActiveUser(null)).toBe(false);
    });

    it('should create predicate with nested property access', () => {
      const hasEmail = createTypePredicateFunction('!!(value && value.user && value.user.email)');

      expect(hasEmail({ user: { email: 'test@example.com' } })).toBe(true);
      expect(hasEmail({ user: {} })).toBe(false);
      expect(hasEmail({})).toBe(false);
    });
  });

  describe('comparison predicates', () => {
    it('should create predicate for numeric comparison', () => {
      const isPositive = createTypePredicateFunction('value > 0');

      expect(isPositive(1)).toBe(true);
      expect(isPositive(42)).toBe(true);
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-5)).toBe(false);
    });

    it('should create predicate for range check', () => {
      const isInRange = createTypePredicateFunction('value >= 0 && value <= 100');

      expect(isInRange(50)).toBe(true);
      expect(isInRange(0)).toBe(true);
      expect(isInRange(100)).toBe(true);
      expect(isInRange(-1)).toBe(false);
      expect(isInRange(101)).toBe(false);
    });

    it('should create predicate with OR condition', () => {
      const isSpecialStatus = createTypePredicateFunction('value && (value.status === "pending" || value.status === "review")');

      expect(isSpecialStatus({ status: 'pending' })).toBe(true);
      expect(isSpecialStatus({ status: 'review' })).toBe(true);
      expect(isSpecialStatus({ status: 'active' })).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return false for invalid predicate', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const invalidPredicate = createTypePredicateFunction('value === (');

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

    it('should handle empty predicate', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const emptyPredicate = createTypePredicateFunction('');

      const result = emptyPredicate('test');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle predicate with whitespace', () => {
      const withWhitespace = createTypePredicateFunction('  value && value.type === "test"  ');

      expect(withWhitespace({ type: 'test' })).toBe(true);
      expect(withWhitespace({ type: 'other' })).toBe(false);
    });

    it('should handle predicate returning truthy non-boolean', () => {
      const returnsNumber = createTypePredicateFunction('42');

      expect(returnsNumber('anything')).toBe(true);
    });

    it('should handle predicate returning falsy value', () => {
      const returnsFalsy = createTypePredicateFunction('0');

      expect(returnsFalsy('anything')).toBe(false);
    });
  });

  describe('function reusability', () => {
    it('should create reusable predicate function', () => {
      const isSuccess = createTypePredicateFunction('value && value.status === "success"');

      const results = [
        { status: 'success', data: 'a' },
        { status: 'error', message: 'b' },
        { status: 'success', data: 'c' },
      ];
      const successes = results.filter(isSuccess);

      expect(successes).toEqual([
        { status: 'success', data: 'a' },
        { status: 'success', data: 'c' },
      ]);
    });

    it('should create independent predicate instances', () => {
      const pred1 = createTypePredicateFunction('value > 0');
      const pred2 = createTypePredicateFunction('value < 0');

      expect(pred1(5)).toBe(true);
      expect(pred1(-5)).toBe(false);
      expect(pred2(5)).toBe(false);
      expect(pred2(-5)).toBe(true);
    });
  });

  describe('type narrowing', () => {
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
});

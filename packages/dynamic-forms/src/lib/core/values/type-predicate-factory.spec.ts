import { describe, it, expect, beforeEach } from 'vitest';
import { createTypePredicateFunction } from './type-predicate-factory';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';

describe('createTypePredicateFunction', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = createMockLogger();
  });

  describe('discriminated union predicates', () => {
    it('should create predicate for type property check', () => {
      const isCreditCard = createTypePredicateFunction('value && value.paymentType === "credit"', mockLogger);

      expect(isCreditCard({ paymentType: 'credit', cardNumber: '1234' })).toBe(true);
      expect(isCreditCard({ paymentType: 'bank', accountNumber: '5678' })).toBe(false);
      expect(isCreditCard(null)).toBe(false);
    });

    it('should create predicate for status check', () => {
      const isActive = createTypePredicateFunction('value && value.status === "active"', mockLogger);

      expect(isActive({ status: 'active' })).toBe(true);
      expect(isActive({ status: 'inactive' })).toBe(false);
      expect(isActive({})).toBe(false);
    });

    it('should create predicate for kind property', () => {
      const isError = createTypePredicateFunction('value && value.kind === "error"', mockLogger);

      expect(isError({ kind: 'error', message: 'failed' })).toBe(true);
      expect(isError({ kind: 'success', data: 'ok' })).toBe(false);
    });
  });

  describe('null and undefined checks', () => {
    it('should create predicate for null check', () => {
      const isNull = createTypePredicateFunction('value === null', mockLogger);

      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull('')).toBe(false);
    });

    it('should create predicate for undefined check', () => {
      const isUndefined = createTypePredicateFunction('value === undefined', mockLogger);

      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
    });

    it('should create predicate for truthy value', () => {
      const isTruthy = createTypePredicateFunction('!!value', mockLogger);

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
      const hasName = createTypePredicateFunction('!!(value && value.name !== undefined)', mockLogger);

      expect(hasName({ name: 'John' })).toBe(true);
      expect(hasName({ age: 30 })).toBe(false);
      expect(hasName(null)).toBe(false);
    });

    it('should create predicate checking boolean property', () => {
      const isActiveUser = createTypePredicateFunction('!!(value && value.isActive === true)', mockLogger);

      expect(isActiveUser({ isActive: true })).toBe(true);
      expect(isActiveUser({ isActive: false })).toBe(false);
      expect(isActiveUser({})).toBe(false);
      expect(isActiveUser(null)).toBe(false);
    });

    it('should create predicate with nested property access', () => {
      const hasEmail = createTypePredicateFunction('!!(value && value.user && value.user.email)', mockLogger);

      expect(hasEmail({ user: { email: 'test@example.com' } })).toBe(true);
      expect(hasEmail({ user: {} })).toBe(false);
      expect(hasEmail({})).toBe(false);
    });
  });

  describe('comparison predicates', () => {
    it('should create predicate for numeric comparison', () => {
      const isPositive = createTypePredicateFunction('value > 0', mockLogger);

      expect(isPositive(1)).toBe(true);
      expect(isPositive(42)).toBe(true);
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-5)).toBe(false);
    });

    it('should create predicate for range check', () => {
      const isInRange = createTypePredicateFunction('value >= 0 && value <= 100', mockLogger);

      expect(isInRange(50)).toBe(true);
      expect(isInRange(0)).toBe(true);
      expect(isInRange(100)).toBe(true);
      expect(isInRange(-1)).toBe(false);
      expect(isInRange(101)).toBe(false);
    });

    it('should create predicate with OR condition', () => {
      const isSpecialStatus = createTypePredicateFunction('value && (value.status === "pending" || value.status === "review")', mockLogger);

      expect(isSpecialStatus({ status: 'pending' })).toBe(true);
      expect(isSpecialStatus({ status: 'review' })).toBe(true);
      expect(isSpecialStatus({ status: 'active' })).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return false for invalid predicate', () => {
      const invalidPredicate = createTypePredicateFunction('value === (', mockLogger);

      const result = invalidPredicate('test');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return false when predicate throws at runtime', () => {
      const throwingPredicate = createTypePredicateFunction('value.nonExistent.method()', mockLogger);

      const result = throwingPredicate({});

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle empty predicate', () => {
      const emptyPredicate = createTypePredicateFunction('', mockLogger);

      const result = emptyPredicate('test');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle predicate with whitespace', () => {
      const withWhitespace = createTypePredicateFunction('  value && value.type === "test"  ', mockLogger);

      expect(withWhitespace({ type: 'test' })).toBe(true);
      expect(withWhitespace({ type: 'other' })).toBe(false);
    });

    it('should handle predicate returning truthy non-boolean', () => {
      const returnsNumber = createTypePredicateFunction('42', mockLogger);

      expect(returnsNumber('anything')).toBe(true);
    });

    it('should handle predicate returning falsy value', () => {
      const returnsFalsy = createTypePredicateFunction('0', mockLogger);

      expect(returnsFalsy('anything')).toBe(false);
    });
  });

  describe('function reusability', () => {
    it('should create reusable predicate function', () => {
      const isSuccess = createTypePredicateFunction('value && value.status === "success"', mockLogger);

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
      const pred1 = createTypePredicateFunction('value > 0', mockLogger);
      const pred2 = createTypePredicateFunction('value < 0', mockLogger);

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

      const isSuccess = createTypePredicateFunction<Success>('value && value.status === "success"', mockLogger);

      const result1: Success | Error = { status: 'success', data: 'test' };
      const result2: Success | Error = { status: 'error', message: 'failed' };

      expect(isSuccess(result1)).toBe(true);
      expect(isSuccess(result2)).toBe(false);
    });
  });
});

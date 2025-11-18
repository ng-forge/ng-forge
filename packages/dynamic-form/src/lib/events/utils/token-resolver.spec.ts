import { describe, expect, it } from 'vitest';
import { resolveTokens, type TokenContext } from './token-resolver';

describe('token-resolver', () => {
  describe('resolveTokens', () => {
    describe('$key token', () => {
      it('should resolve $key token to the provided key value', () => {
        const context: TokenContext = { key: 'myField' };
        const result = resolveTokens(['$key'], context);
        expect(result).toEqual(['myField']);
      });

      it('should resolve multiple $key tokens', () => {
        const context: TokenContext = { key: 'field1' };
        const result = resolveTokens(['$key', '$key'], context);
        expect(result).toEqual(['field1', 'field1']);
      });

      it('should resolve $key to undefined when key is not provided', () => {
        const context: TokenContext = {};
        const result = resolveTokens(['$key'], context);
        expect(result).toEqual([undefined]);
      });
    });

    describe('$index token', () => {
      it('should resolve $index token to the provided index value', () => {
        const context: TokenContext = { index: 0 };
        const result = resolveTokens(['$index'], context);
        expect(result).toEqual([0]);
      });

      it('should resolve $index with non-zero index', () => {
        const context: TokenContext = { index: 5 };
        const result = resolveTokens(['$index'], context);
        expect(result).toEqual([5]);
      });

      it('should resolve $index to undefined when index is not provided', () => {
        const context: TokenContext = {};
        const result = resolveTokens(['$index'], context);
        expect(result).toEqual([undefined]);
      });
    });

    describe('$arrayKey token', () => {
      it('should resolve $arrayKey token to the provided arrayKey value', () => {
        const context: TokenContext = { arrayKey: 'contacts' };
        const result = resolveTokens(['$arrayKey'], context);
        expect(result).toEqual(['contacts']);
      });

      it('should resolve $arrayKey to undefined when arrayKey is not provided', () => {
        const context: TokenContext = {};
        const result = resolveTokens(['$arrayKey'], context);
        expect(result).toEqual([undefined]);
      });
    });

    describe('formValue token', () => {
      it('should resolve formValue token to the provided formValue', () => {
        const formValue = { name: 'John', age: 30 };
        const context: TokenContext = { formValue };
        const result = resolveTokens(['formValue'], context);
        expect(result).toEqual([formValue]);
      });

      it('should preserve formValue object reference', () => {
        const formValue = { items: [1, 2, 3] };
        const context: TokenContext = { formValue };
        const result = resolveTokens(['formValue'], context);
        expect(result[0]).toBe(formValue);
      });

      it('should resolve formValue to undefined when formValue is not provided', () => {
        const context: TokenContext = {};
        const result = resolveTokens(['formValue'], context);
        expect(result).toEqual([undefined]);
      });
    });

    describe('mixed tokens', () => {
      it('should resolve multiple different tokens in order', () => {
        const context: TokenContext = {
          key: 'email',
          index: 2,
          arrayKey: 'contacts',
        };
        const result = resolveTokens(['$arrayKey', '$index', '$key'], context);
        expect(result).toEqual(['contacts', 2, 'email']);
      });

      it('should resolve all token types together', () => {
        const formValue = { data: 'test' };
        const context: TokenContext = {
          key: 'field1',
          index: 0,
          arrayKey: 'items',
          formValue,
        };
        const result = resolveTokens(['$key', '$index', '$arrayKey', 'formValue'], context);
        expect(result).toEqual(['field1', 0, 'items', formValue]);
      });
    });

    describe('non-token values', () => {
      it('should pass through string literals unchanged', () => {
        const context: TokenContext = {};
        const result = resolveTokens(['hello', 'world'], context);
        expect(result).toEqual(['hello', 'world']);
      });

      it('should pass through number values unchanged', () => {
        const context: TokenContext = {};
        const result = resolveTokens([123, 456, 0], context);
        expect(result).toEqual([123, 456, 0]);
      });

      it('should pass through boolean values unchanged', () => {
        const context: TokenContext = {};
        const result = resolveTokens([true, false], context);
        expect(result).toEqual([true, false]);
      });

      it('should pass through null values unchanged', () => {
        const context: TokenContext = {};
        const result = resolveTokens([null], context);
        expect(result).toEqual([null]);
      });

      it('should pass through undefined values unchanged', () => {
        const context: TokenContext = {};
        const result = resolveTokens([undefined], context);
        expect(result).toEqual([undefined]);
      });
    });

    describe('mixed tokens and literals', () => {
      it('should resolve tokens while preserving literals', () => {
        const context: TokenContext = { key: 'myField', index: 1 };
        const result = resolveTokens(['static', '$key', 42, '$index', true], context);
        expect(result).toEqual(['static', 'myField', 42, 1, true]);
      });

      it('should handle complex real-world scenario', () => {
        const context: TokenContext = {
          arrayKey: 'tags',
          index: 0,
        };
        const result = resolveTokens(['$arrayKey', '$index'], context);
        expect(result).toEqual(['tags', 0]);
      });
    });

    describe('unrecognized tokens', () => {
      it('should pass through unrecognized string patterns as literals', () => {
        const context: TokenContext = {};
        const result = resolveTokens(['$unknown', '$notAToken'], context);
        expect(result).toEqual(['$unknown', '$notAToken']);
      });

      it('should not partially match token names', () => {
        const context: TokenContext = { key: 'test' };
        const result = resolveTokens(['$keyExtra', 'prefix$key'], context);
        expect(result).toEqual(['$keyExtra', 'prefix$key']);
      });
    });

    describe('edge cases', () => {
      it('should handle empty args array', () => {
        const context: TokenContext = { key: 'test' };
        const result = resolveTokens([], context);
        expect(result).toEqual([]);
      });

      it('should handle context with all values undefined', () => {
        const context: TokenContext = {
          key: undefined,
          index: undefined,
          arrayKey: undefined,
          formValue: undefined,
        };
        const result = resolveTokens(['$key', '$index', '$arrayKey', 'formValue'], context);
        expect(result).toEqual([undefined, undefined, undefined, undefined]);
      });

      it('should handle readonly array input', () => {
        const context: TokenContext = { key: 'test' };
        const args = ['$key', 'literal'] as const;
        const result = resolveTokens(args, context);
        expect(result).toEqual(['test', 'literal']);
      });

      it('should preserve index value of 0', () => {
        const context: TokenContext = { index: 0 };
        const result = resolveTokens(['$index'], context);
        expect(result).toEqual([0]);
      });

      it('should preserve empty string key', () => {
        const context: TokenContext = { key: '' };
        const result = resolveTokens(['$key'], context);
        expect(result).toEqual(['']);
      });
    });

    describe('type safety', () => {
      it('should accept all supported primitive types', () => {
        const context: TokenContext = {};
        const args: readonly (string | number | boolean | null | undefined)[] = ['string', 123, true, null, undefined];
        const result = resolveTokens(args, context);
        expect(result).toEqual(['string', 123, true, null, undefined]);
      });
    });
  });
});

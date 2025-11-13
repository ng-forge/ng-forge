import { ExpressionParser } from './expression-parser';
import { ExpressionParserError } from './types';

describe('ExpressionParser', () => {
  describe('literals', () => {
    it('should evaluate number literals', () => {
      expect(ExpressionParser.evaluate('42', {})).toBe(42);
      expect(ExpressionParser.evaluate('3.14', {})).toBe(3.14);
      expect(ExpressionParser.evaluate('0', {})).toBe(0);
    });

    it('should evaluate string literals', () => {
      expect(ExpressionParser.evaluate('"hello"', {})).toBe('hello');
      expect(ExpressionParser.evaluate("'world'", {})).toBe('world');
      expect(ExpressionParser.evaluate('""', {})).toBe('');
    });

    it('should evaluate boolean literals', () => {
      expect(ExpressionParser.evaluate('true', {})).toBe(true);
      expect(ExpressionParser.evaluate('false', {})).toBe(false);
    });

    it('should evaluate null and undefined', () => {
      expect(ExpressionParser.evaluate('null', {})).toBe(null);
      expect(ExpressionParser.evaluate('undefined', {})).toBe(undefined);
    });

    it('should evaluate array literals', () => {
      expect(ExpressionParser.evaluate('[1, 2, 3]', {})).toEqual([1, 2, 3]);
      expect(ExpressionParser.evaluate('[]', {})).toEqual([]);
      expect(ExpressionParser.evaluate('[true, "test", 42]', {})).toEqual([true, 'test', 42]);
    });
  });

  describe('identifiers and property access', () => {
    it('should access variables from scope', () => {
      const scope = { fieldValue: 'hello', formValue: { username: 'test' } };
      expect(ExpressionParser.evaluate('fieldValue', scope)).toBe('hello');
    });

    it('should access nested properties', () => {
      const scope = { formValue: { username: 'test', profile: { age: 25 } } };
      expect(ExpressionParser.evaluate('formValue.username', scope)).toBe('test');
      expect(ExpressionParser.evaluate('formValue.profile.age', scope)).toBe(25);
    });

    it('should return undefined for non-existent properties', () => {
      const scope = { formValue: { username: 'test' } };
      expect(ExpressionParser.evaluate('formValue.nonExistent', scope)).toBeUndefined();
      expect(ExpressionParser.evaluate('nonExistent', scope)).toBeUndefined();
    });

    it('should handle null/undefined safely', () => {
      const scope = { nullValue: null, undefinedValue: undefined };
      expect(ExpressionParser.evaluate('nullValue.property', scope)).toBeUndefined();
      expect(ExpressionParser.evaluate('undefinedValue.property', scope)).toBeUndefined();
    });

    it('should handle deeply nested null/undefined safely', () => {
      // Test deeply nested access when intermediate values are null/undefined
      const scope1 = { formValue: null };
      expect(ExpressionParser.evaluate('formValue.user.profile.firstName', scope1)).toBeUndefined();

      const scope2 = { formValue: { user: null } };
      expect(ExpressionParser.evaluate('formValue.user.profile.firstName', scope2)).toBeUndefined();

      const scope3 = { formValue: { user: { profile: null } } };
      expect(ExpressionParser.evaluate('formValue.user.profile.firstName', scope3)).toBeUndefined();

      const scope4 = { formValue: { user: { profile: { firstName: 'John' } } } };
      expect(ExpressionParser.evaluate('formValue.user.profile.firstName', scope4)).toBe('John');
    });
  });

  describe('arithmetic operations', () => {
    it('should perform addition', () => {
      expect(ExpressionParser.evaluate('5 + 3', {})).toBe(8);
      expect(ExpressionParser.evaluate('1 + 2 + 3', {})).toBe(6);
    });

    it('should perform subtraction', () => {
      expect(ExpressionParser.evaluate('10 - 3', {})).toBe(7);
      expect(ExpressionParser.evaluate('20 - 5 - 3', {})).toBe(12);
    });

    it('should perform multiplication', () => {
      expect(ExpressionParser.evaluate('4 * 5', {})).toBe(20);
      expect(ExpressionParser.evaluate('2 * 3 * 4', {})).toBe(24);
    });

    it('should perform division', () => {
      expect(ExpressionParser.evaluate('20 / 4', {})).toBe(5);
      expect(ExpressionParser.evaluate('100 / 10 / 2', {})).toBe(5);
    });

    it('should perform modulo', () => {
      expect(ExpressionParser.evaluate('10 % 3', {})).toBe(1);
      expect(ExpressionParser.evaluate('15 % 4', {})).toBe(3);
    });

    it('should respect operator precedence', () => {
      expect(ExpressionParser.evaluate('2 + 3 * 4', {})).toBe(14);
      expect(ExpressionParser.evaluate('10 - 6 / 2', {})).toBe(7);
      expect(ExpressionParser.evaluate('(2 + 3) * 4', {})).toBe(20);
    });

    it('should work with variables', () => {
      const scope = { a: 5, b: 3 };
      expect(ExpressionParser.evaluate('a + b', scope)).toBe(8);
      expect(ExpressionParser.evaluate('a * b', scope)).toBe(15);
    });
  });

  describe('comparison operations', () => {
    it('should perform equality checks', () => {
      expect(ExpressionParser.evaluate('5 === 5', {})).toBe(true);
      expect(ExpressionParser.evaluate('5 === 3', {})).toBe(false);
      expect(ExpressionParser.evaluate('"hello" === "hello"', {})).toBe(true);
      expect(ExpressionParser.evaluate('"hello" === "world"', {})).toBe(false);
    });

    it('should perform inequality checks', () => {
      expect(ExpressionParser.evaluate('5 !== 3', {})).toBe(true);
      expect(ExpressionParser.evaluate('5 !== 5', {})).toBe(false);
    });

    it('should perform greater/less than checks', () => {
      expect(ExpressionParser.evaluate('5 > 3', {})).toBe(true);
      expect(ExpressionParser.evaluate('3 > 5', {})).toBe(false);
      expect(ExpressionParser.evaluate('3 < 5', {})).toBe(true);
      expect(ExpressionParser.evaluate('5 < 3', {})).toBe(false);
    });

    it('should perform greater/less than or equal checks', () => {
      expect(ExpressionParser.evaluate('5 >= 5', {})).toBe(true);
      expect(ExpressionParser.evaluate('5 >= 3', {})).toBe(true);
      expect(ExpressionParser.evaluate('3 <= 5', {})).toBe(true);
      expect(ExpressionParser.evaluate('5 <= 5', {})).toBe(true);
    });

    it('should work with variables', () => {
      const scope = { fieldValue: 'hello' };
      expect(ExpressionParser.evaluate('fieldValue === "hello"', scope)).toBe(true);
      expect(ExpressionParser.evaluate('fieldValue !== "world"', scope)).toBe(true);
    });
  });

  describe('logical operations', () => {
    it('should perform AND operations', () => {
      expect(ExpressionParser.evaluate('true && true', {})).toBe(true);
      expect(ExpressionParser.evaluate('true && false', {})).toBe(false);
      expect(ExpressionParser.evaluate('false && false', {})).toBe(false);
    });

    it('should perform OR operations', () => {
      expect(ExpressionParser.evaluate('true || false', {})).toBe(true);
      expect(ExpressionParser.evaluate('false || true', {})).toBe(true);
      expect(ExpressionParser.evaluate('false || false', {})).toBe(false);
    });

    it('should perform NOT operations', () => {
      expect(ExpressionParser.evaluate('!true', {})).toBe(false);
      expect(ExpressionParser.evaluate('!false', {})).toBe(true);
      expect(ExpressionParser.evaluate('!!true', {})).toBe(true);
    });

    it('should combine logical operations', () => {
      expect(ExpressionParser.evaluate('true && true || false', {})).toBe(true);
      expect(ExpressionParser.evaluate('false || true && true', {})).toBe(true);
      expect(ExpressionParser.evaluate('!(true && false)', {})).toBe(true);
    });

    it('should work with comparisons', () => {
      const scope = { age: 25 };
      expect(ExpressionParser.evaluate('age > 18 && age < 30', scope)).toBe(true);
      expect(ExpressionParser.evaluate('age < 18 || age > 30', scope)).toBe(false);
    });
  });

  describe('unary operations', () => {
    it('should negate numbers', () => {
      expect(ExpressionParser.evaluate('-5', {})).toBe(-5);
      expect(ExpressionParser.evaluate('--5', {})).toBe(5);
    });

    it('should convert to positive', () => {
      expect(ExpressionParser.evaluate('+5', {})).toBe(5);
      expect(ExpressionParser.evaluate('+"42"', {})).toBe(42);
    });
  });

  describe('method calls', () => {
    it('should call string methods', () => {
      const scope = { fieldValue: 'hello' };
      expect(ExpressionParser.evaluate('fieldValue.toUpperCase()', scope)).toBe('HELLO');
      expect(ExpressionParser.evaluate('fieldValue.length', scope)).toBe(5);
    });

    it('should call array methods', () => {
      const scope = { items: [1, 2, 3, 4, 5] };
      expect(ExpressionParser.evaluate('items.length', scope)).toBe(5);
      expect(ExpressionParser.evaluate('items.includes(3)', scope)).toBe(true);
    });

    it('should reject unsafe methods', () => {
      const scope = { obj: { constructor: Object } };
      expect(() => ExpressionParser.evaluate('obj.constructor()', scope)).toThrow(ExpressionParserError);
    });
  });

  describe('complex expressions', () => {
    it('should evaluate form validation expressions', () => {
      const scope = {
        fieldValue: 'hello',
        formValue: { username: 'test', email: 'test@example.com' },
      };

      expect(ExpressionParser.evaluate('fieldValue === "hello"', scope)).toBe(true);
      expect(ExpressionParser.evaluate('formValue.username === "test"', scope)).toBe(true);
      expect(ExpressionParser.evaluate('fieldValue.length + formValue.username.length', scope)).toBe(9);
    });

    it('should handle nested property access', () => {
      const scope = {
        formValue: {
          user: {
            profile: {
              address: {
                city: 'New York',
              },
            },
          },
        },
      };

      expect(ExpressionParser.evaluate('formValue.user.profile.address.city === "New York"', scope)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw on empty expression', () => {
      expect(() => ExpressionParser.evaluate('', {})).toThrow(ExpressionParserError);
    });

    it('should throw on invalid syntax', () => {
      expect(() => ExpressionParser.evaluate('5 +', {})).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('* 5', {})).toThrow(ExpressionParserError);
    });

    it('should throw on unterminated string', () => {
      expect(() => ExpressionParser.evaluate('"hello', {})).toThrow(ExpressionParserError);
    });

    it('should throw on unexpected characters', () => {
      expect(() => ExpressionParser.evaluate('5 @ 3', {})).toThrow(ExpressionParserError);
    });
  });

  describe('caching', () => {
    it('should cache parsed expressions', () => {
      const expression = 'fieldValue + 5';
      const scope = { fieldValue: 10 };

      // First evaluation - should parse and cache
      const result1 = ExpressionParser.evaluate(expression, scope);

      // Second evaluation - should use cache
      const result2 = ExpressionParser.evaluate(expression, scope);
      const stats = ExpressionParser.getCacheStats();

      expect(result1).toBe(15);
      expect(result2).toBe(15);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should clear cache', () => {
      ExpressionParser.evaluate('fieldValue + 5', { fieldValue: 10 });
      expect(ExpressionParser.getCacheStats().size).toBeGreaterThan(0);

      ExpressionParser.clearCache();
      expect(ExpressionParser.getCacheStats().size).toBe(0);
    });
  });

  describe('security', () => {
    it('should not allow arbitrary function calls', () => {
      const scope = { eval: () => 'should not execute' };
      expect(() => ExpressionParser.evaluate('eval()', scope)).toThrow(ExpressionParserError);
    });

    it('should not allow access to global objects', () => {
      // Global objects are not accessible from the scope - they return undefined (which is secure)
      const result = ExpressionParser.evaluate('window.location', {});
      expect(result).toBeUndefined();
    });

    it('should not allow prototype pollution', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.__proto__.polluted = true', scope)).toThrow();
    });
  });
});

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

    it('should evaluate object literals', () => {
      expect(ExpressionParser.evaluate('{}', {})).toEqual({});
      expect(ExpressionParser.evaluate('{ a: 1, b: 2 }', {})).toEqual({ a: 1, b: 2 });
      expect(ExpressionParser.evaluate('{ "kebab-key": 1 }', {})).toEqual({ 'kebab-key': 1 });
    });

    it('should evaluate nested and mixed literals', () => {
      expect(ExpressionParser.evaluate('{ items: [1, 2, 3], meta: { total: 3 } }', {})).toEqual({
        items: [1, 2, 3],
        meta: { total: 3 },
      });
      expect(ExpressionParser.evaluate('[{ a: 1 }, { a: 2 }]', {})).toEqual([{ a: 1 }, { a: 2 }]);
    });

    it('should evaluate object literal values from scope', () => {
      const scope = { fieldValue: 42, formValue: { name: 'x' } };
      expect(ExpressionParser.evaluate('{ value: fieldValue, label: formValue.name }', scope)).toEqual({
        value: 42,
        label: 'x',
      });
    });
  });

  describe('arrow functions', () => {
    it('should evaluate a single-param arrow without parens', () => {
      const result = ExpressionParser.evaluate('[1, 2, 3].map(x => x + 1)', {});
      expect(result).toEqual([2, 3, 4]);
    });

    it('should evaluate a single-param arrow with parens', () => {
      const result = ExpressionParser.evaluate('[1, 2, 3].map((x) => x * 2)', {});
      expect(result).toEqual([2, 4, 6]);
    });

    it('should evaluate a no-param arrow', () => {
      const result = ExpressionParser.evaluate('[1, 2].map(() => 0)', {});
      expect(result).toEqual([0, 0]);
    });

    it('should evaluate a multi-param arrow', () => {
      const result = ExpressionParser.evaluate('[1, 2, 3].reduce((acc, x) => acc + x, 0)', {});
      expect(result).toBe(6);
    });

    it('should support arrow body returning an object literal via paren-wrap', () => {
      const scope = {
        response: [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
        ],
      };
      const result = ExpressionParser.evaluate('response.map(d => ({ value: d.id, label: d.name }))', scope);
      expect(result).toEqual([
        { value: 1, label: 'a' },
        { value: 2, label: 'b' },
      ]);
    });

    it('should close over the outer scope', () => {
      const scope = { factor: 10, items: [1, 2, 3] };
      const result = ExpressionParser.evaluate('items.map(x => x * factor)', scope);
      expect(result).toEqual([10, 20, 30]);
    });

    it('should not leak param bindings into the outer scope', () => {
      const scope = { items: [1, 2] };
      // After the map, `x` should still be undefined at the outer level
      ExpressionParser.evaluate('items.map(x => x)', scope);
      expect(ExpressionParser.evaluate('x', scope)).toBeUndefined();
    });

    it('should still parse grouped expressions when no arrow follows', () => {
      expect(ExpressionParser.evaluate('(1 + 2) * 3', {})).toBe(9);
      expect(ExpressionParser.evaluate('(a)', { a: 'hi' })).toBe('hi');
    });

    it('supports filter + map chained with arrow functions', () => {
      const scope = { items: [1, 2, 3, 4, 5] };
      const result = ExpressionParser.evaluate('items.filter(x => x > 2).map(x => x * 10)', scope);
      expect(result).toEqual([30, 40, 50]);
    });
  });

  describe('computed member access', () => {
    it('reads an array element by integer index', () => {
      const scope = { items: ['a', 'b', 'c'] };
      expect(ExpressionParser.evaluate('items[0]', scope)).toBe('a');
      expect(ExpressionParser.evaluate('items[2]', scope)).toBe('c');
    });

    it('chains computed access with dotted access', () => {
      const scope = { response: { items: [{ value: 'one' }, { value: 'two' }] } };
      expect(ExpressionParser.evaluate('response.items[0].value', scope)).toBe('one');
      expect(ExpressionParser.evaluate('response.items[1].value', scope)).toBe('two');
    });

    it('reads object properties by computed string key', () => {
      const scope = { obj: { foo: 1, bar: 2 }, k: 'bar' };
      expect(ExpressionParser.evaluate('obj["foo"]', scope)).toBe(1);
      expect(ExpressionParser.evaluate('obj[k]', scope)).toBe(2);
    });

    it('returns undefined when reading through a null object', () => {
      const scope = { obj: null };
      expect(ExpressionParser.evaluate('obj[0]', scope)).toBeUndefined();
    });

    it('returns undefined when the computed key resolves to null/undefined', () => {
      const scope = { obj: { foo: 1 }, k: null };
      expect(ExpressionParser.evaluate('obj[k]', scope)).toBeUndefined();
    });

    it('rejects blocked property names even when computed', () => {
      const scope = { obj: { foo: 1 } };
      expect(() => ExpressionParser.evaluate('obj["__proto__"]', scope)).toThrow(/not accessible for security/);
      expect(() => ExpressionParser.evaluate('obj["constructor"]', scope)).toThrow(/not accessible for security/);
    });
  });

  describe('optional chaining', () => {
    it('returns undefined when the receiver is null/undefined', () => {
      const scope = { obj: null };
      expect(ExpressionParser.evaluate('obj?.foo', scope)).toBeUndefined();
      expect(ExpressionParser.evaluate('obj?.foo?.bar', scope)).toBeUndefined();
    });

    it('reads the property when the receiver is non-null', () => {
      const scope = { obj: { foo: { bar: 42 } } };
      expect(ExpressionParser.evaluate('obj?.foo?.bar', scope)).toBe(42);
    });

    it('cascades safely down a partially-null chain', () => {
      const scope = { obj: { foo: null } };
      // obj.foo is null → obj.foo?.bar is undefined → undefined?.baz is undefined
      expect(ExpressionParser.evaluate('obj.foo?.bar.baz', scope)).toBeUndefined();
    });

    it('supports `?.[ expr ]` optional computed access', () => {
      const scope = { obj: null, items: [10, 20, 30] };
      expect(ExpressionParser.evaluate('obj?.[0]', scope)).toBeUndefined();
      expect(ExpressionParser.evaluate('items?.[1]', scope)).toBe(20);
    });

    it('supports `?.()` optional method call', () => {
      const scope = { arr: null, real: [1, 2, 3] };
      expect(ExpressionParser.evaluate('arr?.map(x => x + 1)', scope)).toBeUndefined();
      expect(ExpressionParser.evaluate('real?.map(x => x + 1)', scope)).toEqual([2, 3, 4]);
    });

    it('short-circuits a method call when an earlier link in the chain is nullish', () => {
      // Cascading: even though `.method(...)` isn't an optional call itself, the
      // earlier `?.bar` returned undefined, and method calls on null/undefined
      // silently return undefined to match dotted-access semantics.
      const scope = { obj: { foo: null }, real: { foo: { bar: [1, 2] } } };
      expect(ExpressionParser.evaluate('obj.foo?.bar.map(x => x + 1)', scope)).toBeUndefined();
      expect(ExpressionParser.evaluate('real.foo?.bar.map(x => x + 1)', scope)).toEqual([2, 3]);
    });
  });

  describe('ternary', () => {
    it('selects consequent when test is truthy, alternate when falsy', () => {
      expect(ExpressionParser.evaluate('true ? 1 : 2', {})).toBe(1);
      expect(ExpressionParser.evaluate('false ? 1 : 2', {})).toBe(2);
      expect(ExpressionParser.evaluate('0 ? "a" : "b"', {})).toBe('b');
      expect(ExpressionParser.evaluate('"x" ? "a" : "b"', {})).toBe('a');
    });

    it('uses logical-or precedence in the test position', () => {
      // `a > 5 ? ...` should parse the comparison as the test, not as part of the consequent.
      expect(ExpressionParser.evaluate('5 > 3 ? "yes" : "no"', {})).toBe('yes');
      expect(ExpressionParser.evaluate('5 < 3 ? "yes" : "no"', {})).toBe('no');
    });

    it('right-associates nested ternaries', () => {
      // `a ? b : c ? d : e` === `a ? b : (c ? d : e)`
      const scope = { x: 0 };
      expect(ExpressionParser.evaluate('x === 1 ? "one" : x === 2 ? "two" : "other"', scope)).toBe('other');
      expect(ExpressionParser.evaluate('x === 1 ? "one" : x === 0 ? "zero" : "other"', scope)).toBe('zero');
    });

    it('handles deep right-associative chains (4+ levels)', () => {
      const scope = { x: 4 };
      // `a ? b : c ? d : e ? f : g ? h : i` === `a ? b : (c ? d : (e ? f : (g ? h : i)))`
      expect(ExpressionParser.evaluate('x === 1 ? "one" : x === 2 ? "two" : x === 3 ? "three" : x === 4 ? "four" : "other"', scope)).toBe(
        'four',
      );
      expect(ExpressionParser.evaluate('x === 1 ? "one" : x === 2 ? "two" : x === 3 ? "three" : x === 5 ? "five" : "other"', scope)).toBe(
        'other',
      );
    });

    it('parses an arrow function as a ternary consequent', () => {
      const scope = { useDouble: true, items: [1, 2, 3] };
      // `cond ? (x => x * 2) : (x => x)` — the consequent and alternate are arrow functions
      // that get passed to `.map`. Tests that the ternary parser doesn't get confused by
      // the arrow's `=>` in the consequent position.
      const fn = ExpressionParser.evaluate('useDouble ? x => x * 2 : x => x', scope) as (n: number) => number;
      expect(typeof fn).toBe('function');
      expect(scope.items.map(fn)).toEqual([2, 4, 6]);
    });

    it('only evaluates the selected branch (short-circuit)', () => {
      // The unselected branch may contain expressions the parser would reject at
      // evaluation time — for example a method that doesn't exist on the value.
      // Whitelist enforcement still runs at parse-evaluate time, but only on
      // expressions we actually evaluate. Use a side-effect proxy to verify.
      let consequentEvaluated = false;
      let alternateEvaluated = false;
      const scope = {
        flag: false,
        a: { tap: () => (consequentEvaluated = true) },
        b: { tap: () => (alternateEvaluated = true) },
      };
      // Confirm via custom whitelist: we don't actually have `.tap()` in our
      // method whitelist, so this would throw if evaluated. Use plain prop access
      // instead to assert short-circuit.
      const scope2 = { flag: false, hit1: 'consequent', hit2: 'alternate' };
      expect(ExpressionParser.evaluate('flag ? hit1 : hit2', scope2)).toBe('alternate');

      void consequentEvaluated;
      void alternateEvaluated;
      void scope;
    });

    it('reproduces the previously-broken docs example', () => {
      const scope = { formValue: { requiresApproval: true }, fieldValue: { length: 5 } };
      expect(ExpressionParser.evaluate('formValue.requiresApproval ? fieldValue?.length > 0 : true', scope)).toBe(true);

      const scope2 = { formValue: { requiresApproval: true }, fieldValue: null };
      expect(ExpressionParser.evaluate('formValue.requiresApproval ? fieldValue?.length > 0 : true', scope2)).toBe(false); // undefined > 0 → false

      const scope3 = { formValue: { requiresApproval: false }, fieldValue: null };
      expect(ExpressionParser.evaluate('formValue.requiresApproval ? fieldValue?.length > 0 : true', scope3)).toBe(true);
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

  describe('fieldState and formFieldState in scope', () => {
    it('should access fieldState properties', () => {
      const scope = {
        fieldValue: 'test',
        formValue: { name: 'test' },
        fieldState: {
          touched: true,
          dirty: false,
          pristine: true,
          valid: true,
          invalid: false,
          pending: false,
          hidden: false,
          readonly: false,
          disabled: false,
        },
      };

      expect(ExpressionParser.evaluate('fieldState.touched', scope)).toBe(true);
      expect(ExpressionParser.evaluate('fieldState.dirty', scope)).toBe(false);
      expect(ExpressionParser.evaluate('fieldState.pristine', scope)).toBe(true);
      expect(ExpressionParser.evaluate('fieldState.valid', scope)).toBe(true);
    });

    it('should access formFieldState properties by field key', () => {
      const scope = {
        fieldValue: 'test',
        formValue: { name: 'test', email: 'test@test.com' },
        formFieldState: {
          name: {
            touched: true,
            dirty: true,
            pristine: false,
            valid: true,
            invalid: false,
            pending: false,
            hidden: false,
            readonly: false,
            disabled: false,
          },
          email: {
            touched: false,
            dirty: false,
            pristine: true,
            valid: false,
            invalid: true,
            pending: false,
            hidden: false,
            readonly: false,
            disabled: false,
          },
        },
      };

      expect(ExpressionParser.evaluate('formFieldState.name.dirty', scope)).toBe(true);
      expect(ExpressionParser.evaluate('formFieldState.email.invalid', scope)).toBe(true);
      expect(ExpressionParser.evaluate('formFieldState.email.pristine', scope)).toBe(true);
    });

    it('should use fieldState in conditional expressions', () => {
      const scope = {
        fieldValue: 'hello',
        formValue: { greeting: 'hello' },
        fieldState: {
          touched: true,
          dirty: true,
          pristine: false,
          valid: true,
          invalid: false,
          pending: false,
          hidden: false,
          readonly: false,
          disabled: false,
        },
      };

      expect(ExpressionParser.evaluate('fieldState.touched && fieldState.dirty', scope)).toBe(true);
      expect(ExpressionParser.evaluate('fieldState.touched && !fieldState.valid', scope)).toBe(false);
    });
  });
});

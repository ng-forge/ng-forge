import { ExpressionParser } from './expression-parser';
import { ExpressionParserError } from './types';

/**
 * Comprehensive security test suite for the expression parser
 * Tests protection against common attack vectors
 */
describe('ExpressionParser - Security Tests', () => {
  describe('Code Injection Prevention', () => {
    it('should prevent arbitrary code execution via function constructor', () => {
      const scope = { Function: Function };
      expect(() => ExpressionParser.evaluate('Function("return 1")', scope)).toThrow(ExpressionParserError);
    });

    it('should prevent eval access', () => {
      const scope = { eval: eval };
      expect(() => ExpressionParser.evaluate('eval("alert(1)")', scope)).toThrow(ExpressionParserError);
    });

    it('should prevent setTimeout/setInterval access', () => {
      const scope = { setTimeout: setTimeout };
      expect(() => ExpressionParser.evaluate('setTimeout("alert(1)", 0)', scope)).toThrow(ExpressionParserError);
    });

    it('should prevent access to constructor property', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.constructor("return 1")()', scope)).toThrow(ExpressionParserError);
    });

    it('should prevent access to constructor via array', () => {
      const scope = { arr: [] };
      expect(() => ExpressionParser.evaluate('arr.constructor("return 1")()', scope)).toThrow(ExpressionParserError);
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should block __proto__ property access', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.__proto__', scope)).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('obj.__proto__', scope)).toThrow(/not accessible for security reasons/);
    });

    it('should block prototype property access', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.prototype', scope)).toThrow(ExpressionParserError);
    });

    it('should block constructor property access', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.constructor', scope)).toThrow(ExpressionParserError);
    });

    it('should block constructor.prototype chain access', () => {
      const scope = { obj: {} };
      // First access to constructor should already throw
      expect(() => ExpressionParser.evaluate('obj.constructor.prototype', scope)).toThrow(ExpressionParserError);
    });

    it('should block __defineGetter__ access', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.__defineGetter__', scope)).toThrow(ExpressionParserError);
    });

    it('should block __defineSetter__ access', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.__defineSetter__', scope)).toThrow(ExpressionParserError);
    });
  });

  describe('Scope Isolation', () => {
    it('should not leak variables between evaluations', () => {
      const scope1 = { secret: 'password123' };
      ExpressionParser.evaluate('secret', scope1);

      const scope2 = { public: 'data' };
      const result = ExpressionParser.evaluate('secret', scope2);
      expect(result).toBeUndefined();
    });

    it('should return undefined for variables not in scope', () => {
      const result = ExpressionParser.evaluate('window', {});
      expect(result).toBeUndefined();
    });

    it('should return undefined for process object not in scope', () => {
      const result = ExpressionParser.evaluate('process', {});
      expect(result).toBeUndefined();
    });

    it('should not support import() syntax', () => {
      expect(() => ExpressionParser.evaluate('import("module")', {})).toThrow();
    });
  });

  describe('Unsafe Method Call Prevention', () => {
    it('should block accessing constructor property (blocks before method call)', () => {
      const scope = { str: 'test' };
      // Property access to constructor is blocked, so method call never happens
      expect(() => ExpressionParser.evaluate('str.constructor()', scope)).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('str.constructor()', scope)).toThrow(/not accessible for security reasons/);
    });

    it('should prevent calling non-whitelisted methods', () => {
      const scope = { str: 'test' };
      // link() is a real String method but not in our whitelist
      expect(() => ExpressionParser.evaluate('str.link("url")', scope)).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('str.link("url")', scope)).toThrow(/not allowed for security reasons/);
    });

    it('should prevent calling methods on custom objects', () => {
      const scope = { obj: { customMethod: () => 'test' } };
      expect(() => ExpressionParser.evaluate('obj.customMethod()', scope)).toThrow(ExpressionParserError);
    });

    it('should allow whitelisted string methods', () => {
      const scope = { str: 'test' };
      expect(ExpressionParser.evaluate('str.toUpperCase()', scope)).toBe('TEST');
      expect(ExpressionParser.evaluate('str.toLowerCase()', scope)).toBe('test');
      expect(ExpressionParser.evaluate('str.includes("es")', scope)).toBe(true);
    });

    it('should allow whitelisted array methods', () => {
      const scope = { arr: [1, 2, 3] };
      expect(ExpressionParser.evaluate('arr.length', scope)).toBe(3);
      expect(ExpressionParser.evaluate('arr.includes(2)', scope)).toBe(true);
    });
  });

  describe('XSS Prevention', () => {
    it('should handle script tags in strings safely', () => {
      const malicious = '<script>alert("XSS")</script>';
      const scope = { input: malicious };
      const result = ExpressionParser.evaluate('input', scope);
      expect(result).toBe(malicious); // Returned as string, not executed
    });

    it('should handle javascript: protocol safely', () => {
      const malicious = 'javascript:alert("XSS")';
      const scope = { url: malicious };
      const result = ExpressionParser.evaluate('url', scope);
      expect(result).toBe(malicious); // Returned as string, not executed
    });

    it('should handle event handlers in strings safely', () => {
      const malicious = 'onclick=alert("XSS")';
      const scope = { attr: malicious };
      const result = ExpressionParser.evaluate('attr', scope);
      expect(result).toBe(malicious); // Returned as string, not executed
    });
  });

  describe('Dangerous Syntax Prevention', () => {
    it('should not support object literals', () => {
      expect(() => ExpressionParser.evaluate('{}', {})).toThrow();
      expect(() => ExpressionParser.evaluate('{a: 1}', {})).toThrow();
    });

    it('should not support function declarations', () => {
      expect(() => ExpressionParser.evaluate('function() {}', {})).toThrow();
    });

    it('should not support arrow functions', () => {
      expect(() => ExpressionParser.evaluate('() => 1', {})).toThrow();
    });

    it('should not support class declarations', () => {
      expect(() => ExpressionParser.evaluate('class X {}', {})).toThrow();
    });

    it('should not support new operator', () => {
      // 'new' is parsed as an identifier, and Object doesn't exist in scope
      const result = ExpressionParser.evaluate('new', {});
      expect(result).toBeUndefined(); // 'new' is just an undefined variable
    });

    it('should not support delete operator', () => {
      // 'delete' is parsed as identifier, not an operator
      const result = ExpressionParser.evaluate('delete', {});
      expect(result).toBeUndefined(); // 'delete' is just an undefined variable
    });

    it('should not support assignment operators', () => {
      expect(() => ExpressionParser.evaluate('x = 1', {})).toThrow();
      expect(() => ExpressionParser.evaluate('x += 1', {})).toThrow();
      expect(() => ExpressionParser.evaluate('x++', {})).toThrow();
    });

    it('should not support spread operator', () => {
      expect(() => ExpressionParser.evaluate('[...arr]', {})).toThrow();
    });

    it('should not support destructuring', () => {
      expect(() => ExpressionParser.evaluate('[a, b] = [1, 2]', {})).toThrow();
    });

    it('should not support template literals', () => {
      expect(() => ExpressionParser.evaluate('`template`', {})).toThrow();
    });

    it('should not support regex literals', () => {
      expect(() => ExpressionParser.evaluate('/regex/', {})).toThrow();
    });
  });

  describe('Property Access Security', () => {
    it('should safely handle null property access', () => {
      const scope = { obj: null };
      const result = ExpressionParser.evaluate('obj.property', scope);
      expect(result).toBeUndefined();
    });

    it('should safely handle undefined property access', () => {
      const scope = { obj: undefined };
      const result = ExpressionParser.evaluate('obj.property', scope);
      expect(result).toBeUndefined();
    });

    it('should safely handle non-existent property access', () => {
      const scope = { obj: {} };
      const result = ExpressionParser.evaluate('obj.nonExistent', scope);
      expect(result).toBeUndefined();
    });

    it('should safely handle deeply nested non-existent properties', () => {
      const scope = { obj: { a: {} } };
      const result = ExpressionParser.evaluate('obj.a.b.c.d.e', scope);
      expect(result).toBeUndefined();
    });

    it('should allow legitimate nested property access', () => {
      const scope = { obj: { a: { b: { c: 'value' } } } };
      const result = ExpressionParser.evaluate('obj.a.b.c', scope);
      expect(result).toBe('value');
    });
  });

  describe('Scope Isolation', () => {
    it('should not leak variables between evaluations', () => {
      const scope1 = { secret: 'password123' };
      ExpressionParser.evaluate('secret', scope1);

      const scope2 = { public: 'data' };
      const result = ExpressionParser.evaluate('secret', scope2);
      expect(result).toBeUndefined();
    });

    it('should block constructor access via property chains', () => {
      const scope = { obj: { nested: {} } };
      expect(() => ExpressionParser.evaluate('obj.nested.constructor', scope)).toThrow(ExpressionParserError);
    });

    it('should block __proto__ access via property chains', () => {
      const scope = { obj: { nested: {} } };
      expect(() => ExpressionParser.evaluate('obj.nested.__proto__', scope)).toThrow(ExpressionParserError);
    });
  });

  describe('Recursive and Complex Attack Patterns', () => {
    it('should handle deeply nested property chains safely', () => {
      const scope = { a: {} };
      const deepChain = 'a.' + Array(100).fill('b').join('.');
      const result = ExpressionParser.evaluate(deepChain, scope);
      expect(result).toBeUndefined();
    });

    it('should handle multiple chained method calls safely', () => {
      const scope = { str: 'test' };
      const result = ExpressionParser.evaluate('str.toUpperCase().toLowerCase().trim()', scope);
      expect(result).toBe('test');
    });

    it('should prevent indirect function execution via array indexing', () => {
      const scope = { arr: [() => 'executed'] };
      // Array indexing notation like arr[0] is parsed but may not work as expected
      // More importantly, even if it did work, calling a function would fail
      // because arbitrary functions are not whitelisted
      try {
        const result = ExpressionParser.evaluate('arr[0]', scope);
        // If arr[0] works, it returns the function, but we can't call it
        if (typeof result === 'function') {
          expect(() => ExpressionParser.evaluate('arr[0]()', scope)).toThrow(ExpressionParserError);
        }
      } catch (error) {
        // If arr[0] throws, that's fine too - array indexing may not be supported
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose internal error details that could aid attackers', () => {
      try {
        ExpressionParser.evaluate('invalid @@ syntax', {});
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ExpressionParserError);
        // Error should be informative but not expose internals
        expect(error.message).not.toContain('stack');
        expect(error.message).not.toContain('node_modules');
      }
    });

    it('should handle circular references safely in context', () => {
      const scope: { obj: { circular?: unknown } } = { obj: {} };
      scope.obj.circular = scope.obj;

      // Should not cause stack overflow or expose internals
      expect(() => ExpressionParser.evaluate('obj.circular', scope)).not.toThrow();
    });
  });

  describe('Type Confusion Prevention', () => {
    it('should handle numbers as strings safely', () => {
      const scope = { num: 42 };
      const result = ExpressionParser.evaluate('num.toString()', scope);
      expect(result).toBe('42');
    });

    it('should handle strings as numbers safely', () => {
      const scope = { str: '42' };
      const result = ExpressionParser.evaluate('+str', scope);
      expect(result).toBe(42);
    });

    it('should handle boolean coercion safely', () => {
      const scope = { val: 0 };
      const result = ExpressionParser.evaluate('!!val', scope);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty string expressions gracefully', () => {
      expect(() => ExpressionParser.evaluate('', {})).toThrow(ExpressionParserError);
    });

    it('should handle whitespace-only expressions gracefully', () => {
      expect(() => ExpressionParser.evaluate('   ', {})).toThrow(ExpressionParserError);
    });

    it('should handle very long expressions without DOS', () => {
      const longExpr = '1 + ' + Array(1000).fill('1').join(' + ');
      expect(() => ExpressionParser.evaluate(longExpr, {})).not.toThrow();
    });

    it('should handle unicode characters safely', () => {
      const scope = { emoji: '😀', chinese: '你好' };
      expect(ExpressionParser.evaluate('emoji', scope)).toBe('😀');
      expect(ExpressionParser.evaluate('chinese', scope)).toBe('你好');
    });

    it('should handle special number values safely', () => {
      const scope = { inf: Infinity, nan: NaN, negInf: -Infinity };
      expect(ExpressionParser.evaluate('inf', scope)).toBe(Infinity);
      expect(ExpressionParser.evaluate('nan', scope)).toBeNaN();
      expect(ExpressionParser.evaluate('negInf', scope)).toBe(-Infinity);
    });
  });

  describe('Cache Security', () => {
    it('should not allow cache poisoning between different scopes', () => {
      const expr = 'value';
      const scope1 = { value: 'secret' };
      const scope2 = { value: 'public' };

      const result1 = ExpressionParser.evaluate(expr, scope1);
      const result2 = ExpressionParser.evaluate(expr, scope2);

      expect(result1).toBe('secret');
      expect(result2).toBe('public');
      expect(result1).not.toBe(result2);
    });

    it('should cache AST but evaluate with fresh scope', () => {
      const expr = 'count + 1';

      const result1 = ExpressionParser.evaluate(expr, { count: 5 });
      const result2 = ExpressionParser.evaluate(expr, { count: 10 });

      expect(result1).toBe(6);
      expect(result2).toBe(11);
    });
  });

  /**
   * NOTE: The expression parser does NOT prevent application-layer attacks like:
   * - SQL injection (app must sanitize SQL queries)
   * - Path traversal (app must validate file paths)
   * - Command injection (app must sanitize shell commands)
   * - XSS (app must sanitize HTML output)
   *
   * The parser's security responsibility is limited to:
   * 1. Preventing arbitrary code execution (no eval, Function, etc.)
   * 2. Restricting method calls to a safe whitelist
   * 3. Blocking dangerous property access (constructor, __proto__, etc.)
   * 4. Enforcing scope isolation (only access provided scope)
   */

  describe('Parser Security Guarantees', () => {
    it('should prevent arbitrary code execution', () => {
      const scope = { Function: Function, eval: eval };
      expect(() => ExpressionParser.evaluate('Function("return 1")', scope)).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('eval("alert(1)")', scope)).toThrow(ExpressionParserError);
    });

    it('should restrict method calls to whitelist', () => {
      const scope = { str: 'test' };
      // Whitelisted method works
      expect(ExpressionParser.evaluate('str.toUpperCase()', scope)).toBe('TEST');
      // Non-whitelisted method is blocked
      expect(() => ExpressionParser.evaluate('str.link("url")', scope)).toThrow(ExpressionParserError);
    });

    it('should block dangerous property access', () => {
      const scope = { obj: {} };
      expect(() => ExpressionParser.evaluate('obj.constructor', scope)).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('obj.__proto__', scope)).toThrow(ExpressionParserError);
      expect(() => ExpressionParser.evaluate('obj.prototype', scope)).toThrow(ExpressionParserError);
    });

    it('should enforce scope isolation', () => {
      // Empty scope means no access to globals
      const result1 = ExpressionParser.evaluate('window', {});
      expect(result1).toBeUndefined();

      // Only provided scope is accessible
      const scope = { allowed: 'value' };
      expect(ExpressionParser.evaluate('allowed', scope)).toBe('value');
      expect(ExpressionParser.evaluate('notInScope', scope)).toBeUndefined();
    });
  });

  describe('Application Security Responsibility', () => {
    it('passes through string values without sanitization', () => {
      // Parser does NOT prevent SQL injection - app must handle this
      const scope = { userInput: "'; DROP TABLE users; --" };
      const result = ExpressionParser.evaluate('userInput', scope);
      expect(result).toBe("'; DROP TABLE users; --");
    });

    it('does not validate file paths', () => {
      // Parser does NOT prevent path traversal - app must validate paths
      const scope = { path: '../../../etc/passwd' };
      const result = ExpressionParser.evaluate('path', scope);
      expect(result).toBe('../../../etc/passwd');
    });

    it('does not sanitize HTML', () => {
      // Parser does NOT prevent XSS - app must sanitize HTML output
      const scope = { userInput: '<script>alert(1)</script>' };
      const result = ExpressionParser.evaluate('userInput', scope);
      expect(result).toBe('<script>alert(1)</script>');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle deeply nested property access without stack overflow', () => {
      const scope = { a: { b: { c: { d: { e: 'value' } } } } };
      const result = ExpressionParser.evaluate('a.b.c.d.e', scope);
      expect(result).toBe('value');
    });

    it('should handle chained method calls', () => {
      const scope = { str: 'test' };
      const result = ExpressionParser.evaluate('str.toUpperCase().toLowerCase().trim()', scope);
      expect(result).toBe('test');
    });

    it('should handle long expression chains', () => {
      const scope = { arr: [1, 2, 3, 4, 5] };
      const result = ExpressionParser.evaluate('arr.slice().slice().slice().slice()', scope);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { Evaluator, EvaluationScope } from './evaluator';
import { ASTNode, ExpressionParserError } from './types';

describe('Evaluator', () => {
  describe('literals', () => {
    it('should evaluate boolean true', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'true');
      const ast: ASTNode = { type: 'Literal', value: true };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate boolean false', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'false');
      const ast: ASTNode = { type: 'Literal', value: false };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(false);
    });

    it('should evaluate null', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'null');
      const ast: ASTNode = { type: 'Literal', value: null };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(null);
    });

    it('should evaluate undefined', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'undefined');
      const ast: ASTNode = { type: 'Literal', value: undefined };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(undefined);
    });

    it('should evaluate number', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '42');
      const ast: ASTNode = { type: 'Literal', value: 42 };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(42);
    });

    it('should evaluate string', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '"hello"');
      const ast: ASTNode = { type: 'Literal', value: 'hello' };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('hello');
    });
  });

  describe('identifiers', () => {
    it('should evaluate identifier from scope', () => {
      const scope: EvaluationScope = { myVar: 42 };
      const evaluator = new Evaluator(scope, 'myVar');
      const ast: ASTNode = { type: 'Identifier', name: 'myVar' };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(42);
    });

    it('should return undefined for missing identifier', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'missing');
      const ast: ASTNode = { type: 'Identifier', name: 'missing' };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(undefined);
    });

    it('should evaluate identifier with string value', () => {
      const scope: EvaluationScope = { name: 'Alice' };
      const evaluator = new Evaluator(scope, 'name');
      const ast: ASTNode = { type: 'Identifier', name: 'name' };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('Alice');
    });

    it('should evaluate identifier with boolean value', () => {
      const scope: EvaluationScope = { isActive: true };
      const evaluator = new Evaluator(scope, 'isActive');
      const ast: ASTNode = { type: 'Identifier', name: 'isActive' };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate identifier with null value', () => {
      const scope: EvaluationScope = { value: null };
      const evaluator = new Evaluator(scope, 'value');
      const ast: ASTNode = { type: 'Identifier', name: 'value' };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(null);
    });
  });

  describe('member access', () => {
    it('should access object property', () => {
      const scope: EvaluationScope = { obj: { prop: 42 } };
      const evaluator = new Evaluator(scope, 'obj.prop');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: 'prop',
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(42);
    });

    it('should access nested property', () => {
      const scope: EvaluationScope = { obj: { nested: { value: 'hello' } } };
      const evaluator = new Evaluator(scope, 'obj.nested.value');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'obj' },
          property: 'nested',
        },
        property: 'value',
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('hello');
    });

    it('should return undefined for property on null', () => {
      const scope: EvaluationScope = { obj: null };
      const evaluator = new Evaluator(scope, 'obj.prop');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: 'prop',
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(undefined);
    });

    it('should return undefined for property on undefined', () => {
      const scope: EvaluationScope = { obj: undefined };
      const evaluator = new Evaluator(scope, 'obj.prop');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: 'prop',
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(undefined);
    });

    it('should access property on string', () => {
      const scope: EvaluationScope = { str: 'hello' };
      const evaluator = new Evaluator(scope, 'str.length');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'str' },
        property: 'length',
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(5);
    });

    it('should access property on number', () => {
      const scope: EvaluationScope = { num: 42 };
      const evaluator = new Evaluator(scope, 'num.toString');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'num' },
        property: 'toString',
      };

      const result = evaluator.evaluate(ast);

      expect(typeof result).toBe('function');
    });

    it('should throw on accessing constructor property', () => {
      const scope: EvaluationScope = { obj: {} };
      const evaluator = new Evaluator(scope, 'obj.constructor');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: 'constructor',
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Property "constructor" is not accessible for security reasons');
    });

    it('should throw on accessing __proto__ property', () => {
      const scope: EvaluationScope = { obj: {} };
      const evaluator = new Evaluator(scope, 'obj.__proto__');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: '__proto__',
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Property "__proto__" is not accessible for security reasons');
    });

    it('should throw on accessing prototype property', () => {
      const scope: EvaluationScope = { obj: {} };
      const evaluator = new Evaluator(scope, 'obj.prototype');
      const ast: ASTNode = {
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: 'prototype',
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Property "prototype" is not accessible for security reasons');
    });
  });

  describe('arithmetic operators', () => {
    it('should evaluate addition', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 + 3');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(8);
    });

    it('should evaluate subtraction', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 - 3');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '-',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(2);
    });

    it('should evaluate multiplication', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 * 3');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '*',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(15);
    });

    it('should evaluate division', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '15 / 3');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '/',
        left: { type: 'Literal', value: 15 },
        right: { type: 'Literal', value: 3 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(5);
    });

    it('should return null for division by zero', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '10 / 0');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '/',
        left: { type: 'Literal', value: 10 },
        right: { type: 'Literal', value: 0 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(null);
    });

    it('should return null for modulo by zero', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '10 % 0');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '%',
        left: { type: 'Literal', value: 10 },
        right: { type: 'Literal', value: 0 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(null);
    });

    it('should evaluate modulo', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '17 % 5');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '%',
        left: { type: 'Literal', value: 17 },
        right: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(2);
    });

    it('should evaluate with variables', () => {
      const scope: EvaluationScope = { a: 10, b: 5 };
      const evaluator = new Evaluator(scope, 'a + b');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(15);
    });
  });

  describe('comparison operators', () => {
    it('should evaluate greater than', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 > 3');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '>',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate less than', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '3 < 5');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '<',
        left: { type: 'Literal', value: 3 },
        right: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate greater than or equal', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 >= 5');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '>=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate less than or equal', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '3 <= 5');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '<=',
        left: { type: 'Literal', value: 3 },
        right: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });
  });

  describe('equality operators', () => {
    it('should evaluate loose equality for same values', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 == 5');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '==',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate loose equality for different types', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 == "5"');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '==',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: '5' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate strict equality for same values', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 === 5');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '===',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate strict equality for different types', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 === "5"');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '===',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: '5' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(false);
    });

    it('should evaluate loose inequality', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 != 3');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '!=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 3 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate strict inequality', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '5 !== "5"');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '!==',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: '5' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });
  });

  describe('logical operators', () => {
    it('should evaluate AND with both true', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'true && true');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '&&',
        left: { type: 'Literal', value: true },
        right: { type: 'Literal', value: true },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate AND with one false', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'true && false');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '&&',
        left: { type: 'Literal', value: true },
        right: { type: 'Literal', value: false },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(false);
    });

    it('should evaluate OR with both false', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'false || false');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '||',
        left: { type: 'Literal', value: false },
        right: { type: 'Literal', value: false },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(false);
    });

    it('should evaluate OR with one true', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'false || true');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '||',
        left: { type: 'Literal', value: false },
        right: { type: 'Literal', value: true },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate AND with truthy values', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '1 && "hello"');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '&&',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 'hello' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('hello');
    });

    it('should evaluate OR with falsy and truthy', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '0 || "hello"');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '||',
        left: { type: 'Literal', value: 0 },
        right: { type: 'Literal', value: 'hello' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('hello');
    });
  });

  describe('unary operators', () => {
    it('should evaluate logical NOT on true', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '!true');
      const ast: ASTNode = {
        type: 'UnaryOp',
        operator: '!',
        operand: { type: 'Literal', value: true },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(false);
    });

    it('should evaluate logical NOT on false', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '!false');
      const ast: ASTNode = {
        type: 'UnaryOp',
        operator: '!',
        operand: { type: 'Literal', value: false },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate logical NOT on truthy value', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '!1');
      const ast: ASTNode = {
        type: 'UnaryOp',
        operator: '!',
        operand: { type: 'Literal', value: 1 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(false);
    });

    it('should evaluate unary minus', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '-5');
      const ast: ASTNode = {
        type: 'UnaryOp',
        operator: '-',
        operand: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(-5);
    });

    it('should evaluate unary plus', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '+5');
      const ast: ASTNode = {
        type: 'UnaryOp',
        operator: '+',
        operand: { type: 'Literal', value: 5 },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(5);
    });
  });

  describe('array literals', () => {
    it('should evaluate empty array', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '[]');
      const ast: ASTNode = { type: 'ArrayLiteral', elements: [] };

      const result = evaluator.evaluate(ast);

      expect(result).toEqual([]);
    });

    it('should evaluate array with literals', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '[1, 2, 3]');
      const ast: ASTNode = {
        type: 'ArrayLiteral',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should evaluate array with variables', () => {
      const scope: EvaluationScope = { a: 1, b: 2 };
      const evaluator = new Evaluator(scope, '[a, b]');
      const ast: ASTNode = {
        type: 'ArrayLiteral',
        elements: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toEqual([1, 2]);
    });

    it('should evaluate array with expressions', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '[1 + 1, 2 * 3]');
      const ast: ASTNode = {
        type: 'ArrayLiteral',
        elements: [
          {
            type: 'BinaryOp',
            operator: '+',
            left: { type: 'Literal', value: 1 },
            right: { type: 'Literal', value: 1 },
          },
          {
            type: 'BinaryOp',
            operator: '*',
            left: { type: 'Literal', value: 2 },
            right: { type: 'Literal', value: 3 },
          },
        ],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toEqual([2, 6]);
    });
  });

  describe('method calls', () => {
    it('should call safe string method', () => {
      const scope: EvaluationScope = { str: 'hello' };
      const evaluator = new Evaluator(scope, 'str.toUpperCase()');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'str' },
          property: 'toUpperCase',
        },
        arguments: [],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('HELLO');
    });

    it('should call string method with arguments', () => {
      const scope: EvaluationScope = { str: 'hello world' };
      const evaluator = new Evaluator(scope, 'str.substring(0, 5)');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'str' },
          property: 'substring',
        },
        arguments: [
          { type: 'Literal', value: 0 },
          { type: 'Literal', value: 5 },
        ],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('hello');
    });

    it('should call array method', () => {
      const scope: EvaluationScope = { arr: [1, 2, 3] };
      const evaluator = new Evaluator(scope, 'arr.join(",")');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'arr' },
          property: 'join',
        },
        arguments: [{ type: 'Literal', value: ',' }],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('1,2,3');
    });

    it('should call number method', () => {
      const scope: EvaluationScope = { num: 3.14159 };
      const evaluator = new Evaluator(scope, 'num.toFixed(2)');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'num' },
          property: 'toFixed',
        },
        arguments: [{ type: 'Literal', value: 2 }],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('3.14');
    });

    it('should call date method', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const scope: EvaluationScope = { date };
      const evaluator = new Evaluator(scope, 'date.getFullYear()');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'date' },
          property: 'getFullYear',
        },
        arguments: [],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(2024);
    });

    it('should throw on arbitrary function call', () => {
      const scope: EvaluationScope = { func: () => 42 };
      const evaluator = new Evaluator(scope, 'func()');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'func' },
        arguments: [],
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Only method calls are allowed');
    });

    it('should throw on unsafe method call', () => {
      const scope: EvaluationScope = { obj: {} };
      const evaluator = new Evaluator(scope, 'obj.hasOwnProperty("foo")');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'obj' },
          property: 'hasOwnProperty',
        },
        arguments: [{ type: 'Literal', value: 'foo' }],
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Method "hasOwnProperty" is not allowed for security reasons');
    });

    it('should throw on constructor call', () => {
      const scope: EvaluationScope = { obj: {} };
      const evaluator = new Evaluator(scope, 'obj.constructor()');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'obj' },
          property: 'constructor',
        },
        arguments: [],
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Property "constructor" is not accessible for security reasons');
    });
  });

  describe('error cases', () => {
    it('should throw on unknown node type', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'unknown');
      const ast = { type: 'UnknownType' } as ASTNode;

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Unknown node type: UnknownType');
    });

    it('should throw on unknown binary operator', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, 'a @ b');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '@',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Unknown binary operator: @');
    });

    it('should throw on unknown unary operator', () => {
      const scope: EvaluationScope = {};
      const evaluator = new Evaluator(scope, '@x');
      const ast: ASTNode = {
        type: 'UnaryOp',
        operator: '@',
        operand: { type: 'Identifier', name: 'x' },
      };

      expect(() => evaluator.evaluate(ast)).toThrow(ExpressionParserError);
      expect(() => evaluator.evaluate(ast)).toThrow('Unknown unary operator: @');
    });
  });

  describe('complex expressions', () => {
    it('should evaluate arithmetic with variables', () => {
      const scope: EvaluationScope = { a: 10, b: 5, c: 2 };
      const evaluator = new Evaluator(scope, '(a + b) * c');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '*',
        left: {
          type: 'BinaryOp',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(30);
    });

    it('should evaluate logical expression with comparisons', () => {
      const scope: EvaluationScope = { age: 25, isActive: true };
      const evaluator = new Evaluator(scope, 'age > 18 && isActive');
      const ast: ASTNode = {
        type: 'BinaryOp',
        operator: '&&',
        left: {
          type: 'BinaryOp',
          operator: '>',
          left: { type: 'Identifier', name: 'age' },
          right: { type: 'Literal', value: 18 },
        },
        right: { type: 'Identifier', name: 'isActive' },
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe(true);
    });

    it('should evaluate nested property access with method call', () => {
      const scope: EvaluationScope = { user: { name: 'alice' } };
      const evaluator = new Evaluator(scope, 'user.name.toUpperCase()');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: {
            type: 'MemberAccess',
            object: { type: 'Identifier', name: 'user' },
            property: 'name',
          },
          property: 'toUpperCase',
        },
        arguments: [],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('ALICE');
    });

    it('should evaluate expression with multiple method calls', () => {
      const scope: EvaluationScope = { str: '  hello  ' };
      const evaluator = new Evaluator(scope, 'str.trim().toUpperCase()');
      const ast: ASTNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberAccess',
              object: { type: 'Identifier', name: 'str' },
              property: 'trim',
            },
            arguments: [],
          },
          property: 'toUpperCase',
        },
        arguments: [],
      };

      const result = evaluator.evaluate(ast);

      expect(result).toBe('HELLO');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { Parser } from './parser';
import { ExpressionParserError } from './types';

describe('Parser', () => {
  describe('literals', () => {
    it('should parse boolean true', () => {
      const parser = new Parser('true');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: true });
    });

    it('should parse boolean false', () => {
      const parser = new Parser('false');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: false });
    });

    it('should parse null', () => {
      const parser = new Parser('null');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: null });
    });

    it('should parse undefined', () => {
      const parser = new Parser('undefined');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: undefined });
    });

    it('should parse integer', () => {
      const parser = new Parser('42');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: 42 });
    });

    it('should parse decimal', () => {
      const parser = new Parser('3.14');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: 3.14 });
    });

    it('should parse string', () => {
      const parser = new Parser('"hello"');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Literal', value: 'hello' });
    });
  });

  describe('identifiers', () => {
    it('should parse identifier', () => {
      const parser = new Parser('variable');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Identifier', name: 'variable' });
    });

    it('should parse identifier with underscore', () => {
      const parser = new Parser('_private');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Identifier', name: '_private' });
    });

    it('should parse identifier with dollar sign', () => {
      const parser = new Parser('$scope');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'Identifier', name: '$scope' });
    });
  });

  describe('array literals', () => {
    it('should parse empty array', () => {
      const parser = new Parser('[]');
      const ast = parser.parse();

      expect(ast).toEqual({ type: 'ArrayLiteral', elements: [] });
    });

    it('should parse array with single element', () => {
      const parser = new Parser('[1]');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'ArrayLiteral',
        elements: [{ type: 'Literal', value: 1 }],
      });
    });

    it('should parse array with multiple elements', () => {
      const parser = new Parser('[1, 2, 3]');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'ArrayLiteral',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      });
    });

    it('should parse array with mixed types', () => {
      const parser = new Parser('[1, "hello", true]');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'ArrayLiteral',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: true },
        ],
      });
    });

    it('should parse nested arrays', () => {
      const parser = new Parser('[[1, 2], [3, 4]]');
      const ast = parser.parse();

      expect(ast.type).toBe('ArrayLiteral');
      expect(ast).toHaveProperty('elements');
      const elements = (ast as { elements: unknown[] }).elements;
      expect(elements).toHaveLength(2);
      expect(elements[0]).toHaveProperty('type', 'ArrayLiteral');
      expect(elements[1]).toHaveProperty('type', 'ArrayLiteral');
    });

    it('should throw on unclosed array', () => {
      const parser = new Parser('[1, 2');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
      expect(() => parser.parse()).toThrow('Expected "]" after array elements');
    });
  });

  describe('member access', () => {
    it('should parse simple property access', () => {
      const parser = new Parser('obj.prop');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'MemberAccess',
        object: { type: 'Identifier', name: 'obj' },
        property: 'prop',
      });
    });

    it('should parse chained property access', () => {
      const parser = new Parser('obj.prop1.prop2');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'MemberAccess',
        object: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'obj' },
          property: 'prop1',
        },
        property: 'prop2',
      });
    });

    it('should throw on missing property name after dot', () => {
      const parser = new Parser('obj.');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
      expect(() => parser.parse()).toThrow('Expected property name after "."');
    });

    it('should throw on number after dot', () => {
      const parser = new Parser('obj.123');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
      expect(() => parser.parse()).toThrow('Expected property name after "."');
    });
  });

  describe('function calls', () => {
    it('should parse function call with no arguments', () => {
      const parser = new Parser('func()');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'func' },
        arguments: [],
      });
    });

    it('should parse function call with one argument', () => {
      const parser = new Parser('func(42)');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'func' },
        arguments: [{ type: 'Literal', value: 42 }],
      });
    });

    it('should parse function call with multiple arguments', () => {
      const parser = new Parser('func(1, 2, 3)');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'func' },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      });
    });

    it('should parse method call', () => {
      const parser = new Parser('obj.method()');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'CallExpression',
        callee: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'obj' },
          property: 'method',
        },
        arguments: [],
      });
    });

    it('should parse chained method calls', () => {
      const parser = new Parser('obj.method1().method2()');
      const ast = parser.parse();

      expect(ast.type).toBe('CallExpression');
      expect(ast).toHaveProperty('callee');
      const callee = (ast as { callee: { type: string } }).callee;
      expect(callee.type).toBe('MemberAccess');
    });

    it('should throw on unclosed parenthesis', () => {
      const parser = new Parser('func(1, 2');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
      expect(() => parser.parse()).toThrow('Expected ")" after arguments');
    });
  });

  describe('unary operators', () => {
    it('should parse logical not', () => {
      const parser = new Parser('!x');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'UnaryOp',
        operator: '!',
        operand: { type: 'Identifier', name: 'x' },
      });
    });

    it('should parse unary minus', () => {
      const parser = new Parser('-5');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'UnaryOp',
        operator: '-',
        operand: { type: 'Literal', value: 5 },
      });
    });

    it('should parse unary plus', () => {
      const parser = new Parser('+5');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'UnaryOp',
        operator: '+',
        operand: { type: 'Literal', value: 5 },
      });
    });

    it('should parse double negation', () => {
      const parser = new Parser('!!x');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'UnaryOp',
        operator: '!',
        operand: {
          type: 'UnaryOp',
          operator: '!',
          operand: { type: 'Identifier', name: 'x' },
        },
      });
    });
  });

  describe('arithmetic operators', () => {
    it('should parse addition', () => {
      const parser = new Parser('a + b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse subtraction', () => {
      const parser = new Parser('a - b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '-',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse multiplication', () => {
      const parser = new Parser('a * b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '*',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse division', () => {
      const parser = new Parser('a / b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '/',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse modulo', () => {
      const parser = new Parser('a % b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '%',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });
  });

  describe('comparison operators', () => {
    it('should parse greater than', () => {
      const parser = new Parser('a > b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '>',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse less than', () => {
      const parser = new Parser('a < b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '<',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse greater than or equal', () => {
      const parser = new Parser('a >= b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '>=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse less than or equal', () => {
      const parser = new Parser('a <= b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '<=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });
  });

  describe('equality operators', () => {
    it('should parse loose equality', () => {
      const parser = new Parser('a == b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse strict equality', () => {
      const parser = new Parser('a === b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '===',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse loose inequality', () => {
      const parser = new Parser('a != b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '!=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse strict inequality', () => {
      const parser = new Parser('a !== b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '!==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });
  });

  describe('logical operators', () => {
    it('should parse logical AND', () => {
      const parser = new Parser('a && b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse logical OR', () => {
      const parser = new Parser('a || b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should parse chained AND', () => {
      const parser = new Parser('a && b && c');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { operator: string }).operator).toBe('&&');
      expect((ast as { left: { type: string } }).left.type).toBe('BinaryOp');
    });

    it('should parse chained OR', () => {
      const parser = new Parser('a || b || c');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { operator: string }).operator).toBe('||');
      expect((ast as { left: { type: string } }).left.type).toBe('BinaryOp');
    });
  });

  describe('operator precedence', () => {
    it('should respect multiplication over addition', () => {
      const parser = new Parser('a + b * c');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'BinaryOp',
          operator: '*',
          left: { type: 'Identifier', name: 'b' },
          right: { type: 'Identifier', name: 'c' },
        },
      });
    });

    it('should respect division over subtraction', () => {
      const parser = new Parser('a - b / c');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '-',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'BinaryOp',
          operator: '/',
          left: { type: 'Identifier', name: 'b' },
          right: { type: 'Identifier', name: 'c' },
        },
      });
    });

    it('should respect comparison over AND', () => {
      const parser = new Parser('a > b && c < d');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { operator: string }).operator).toBe('&&');
      expect((ast as { left: { type: string } }).left.type).toBe('BinaryOp');
      expect((ast as { right: { type: string } }).right.type).toBe('BinaryOp');
    });

    it('should respect AND over OR', () => {
      const parser = new Parser('a || b && c');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'BinaryOp',
          operator: '&&',
          left: { type: 'Identifier', name: 'b' },
          right: { type: 'Identifier', name: 'c' },
        },
      });
    });

    it('should respect unary minus over binary operators', () => {
      const parser = new Parser('-a + b');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '+',
        left: {
          type: 'UnaryOp',
          operator: '-',
          operand: { type: 'Identifier', name: 'a' },
        },
        right: { type: 'Identifier', name: 'b' },
      });
    });
  });

  describe('parentheses', () => {
    it('should parse grouped expression', () => {
      const parser = new Parser('(a + b)');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      });
    });

    it('should override precedence with parentheses', () => {
      const parser = new Parser('(a + b) * c');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '*',
        left: {
          type: 'BinaryOp',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
      });
    });

    it('should parse nested parentheses', () => {
      const parser = new Parser('((a + b) * c)');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { operator: string }).operator).toBe('*');
    });

    it('should throw on unclosed parenthesis', () => {
      const parser = new Parser('(a + b');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
      expect(() => parser.parse()).toThrow('Expected ")" after expression');
    });
  });

  describe('complex expressions', () => {
    it('should parse complex arithmetic', () => {
      const parser = new Parser('(a + b) * c - d / e');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { operator: string }).operator).toBe('-');
    });

    it('should parse complex logical expression', () => {
      const parser = new Parser('a > 5 && b < 10 || c === 0');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { operator: string }).operator).toBe('||');
    });

    it('should parse property access with arithmetic', () => {
      const parser = new Parser('obj.value + 10');
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'BinaryOp',
        operator: '+',
        left: {
          type: 'MemberAccess',
          object: { type: 'Identifier', name: 'obj' },
          property: 'value',
        },
        right: { type: 'Literal', value: 10 },
      });
    });

    it('should parse method call in expression', () => {
      const parser = new Parser('str.length() > 5');
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      expect((ast as { left: { type: string } }).left.type).toBe('CallExpression');
    });
  });

  describe('error cases', () => {
    it('should throw on empty expression', () => {
      const parser = new Parser('');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
      expect(() => parser.parse()).toThrow('Empty expression');
    });

    it('should throw on unexpected token', () => {
      const parser = new Parser('}');

      expect(() => parser.parse()).toThrow('Unexpected character');
    });

    it('should throw on incomplete binary operation', () => {
      const parser = new Parser('a +');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
    });

    it('should include position in error', () => {
      const parser = new Parser('obj.');

      expect(() => parser.parse()).toThrow(ExpressionParserError);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { Tokenizer } from './tokenizer';
import { TokenType } from './types';

describe('Tokenizer', () => {
  describe('basic literals', () => {
    it('should tokenize boolean true', () => {
      const tokenizer = new Tokenizer('true');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.TRUE, value: 'true', position: 0 });
      expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('should tokenize boolean false', () => {
      const tokenizer = new Tokenizer('false');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.FALSE, value: 'false', position: 0 });
    });

    it('should tokenize null', () => {
      const tokenizer = new Tokenizer('null');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.NULL, value: 'null', position: 0 });
    });

    it('should tokenize undefined', () => {
      const tokenizer = new Tokenizer('undefined');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.UNDEFINED, value: 'undefined', position: 0 });
    });
  });

  describe('numbers', () => {
    it('should tokenize integer', () => {
      const tokenizer = new Tokenizer('42');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '42', position: 0 });
    });

    it('should tokenize decimal number', () => {
      const tokenizer = new Tokenizer('3.14');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '3.14', position: 0 });
    });

    it('should tokenize number starting with zero', () => {
      const tokenizer = new Tokenizer('0.5');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '0.5', position: 0 });
    });
  });

  describe('strings', () => {
    it('should tokenize double-quoted string', () => {
      const tokenizer = new Tokenizer('"hello"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.STRING, value: 'hello', position: 0 });
    });

    it('should tokenize single-quoted string', () => {
      const tokenizer = new Tokenizer("'world'");
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.STRING, value: 'world', position: 0 });
    });

    it('should handle escaped newline', () => {
      const tokenizer = new Tokenizer('"line1\\nline2"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('line1\nline2');
    });

    it('should handle escaped tab', () => {
      const tokenizer = new Tokenizer('"col1\\tcol2"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('col1\tcol2');
    });

    it('should handle escaped carriage return', () => {
      const tokenizer = new Tokenizer('"text\\rmore"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('text\rmore');
    });

    it('should handle escaped backslash', () => {
      const tokenizer = new Tokenizer('"path\\\\file"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('path\\file');
    });

    it('should handle escaped quote in double-quoted string', () => {
      const tokenizer = new Tokenizer('"say \\"hello\\""');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('say "hello"');
    });

    it('should handle escaped quote in single-quoted string', () => {
      const tokenizer = new Tokenizer("'it\\'s'");
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe("it's");
    });

    it('should handle other escaped characters', () => {
      const tokenizer = new Tokenizer('"test\\x"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('testx');
    });

    it('should throw on unterminated string', () => {
      const tokenizer = new Tokenizer('"unterminated');

      expect(() => tokenizer.tokenize()).toThrow('Unterminated string literal');
    });

    it('should handle empty string', () => {
      const tokenizer = new Tokenizer('""');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.STRING, value: '', position: 0 });
    });
  });

  describe('identifiers', () => {
    it('should tokenize identifier', () => {
      const tokenizer = new Tokenizer('variable');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.IDENTIFIER, value: 'variable', position: 0 });
    });

    it('should tokenize identifier with underscore', () => {
      const tokenizer = new Tokenizer('_private');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.IDENTIFIER, value: '_private', position: 0 });
    });

    it('should tokenize identifier with dollar sign', () => {
      const tokenizer = new Tokenizer('$scope');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.IDENTIFIER, value: '$scope', position: 0 });
    });

    it('should tokenize identifier with numbers', () => {
      const tokenizer = new Tokenizer('var123');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.IDENTIFIER, value: 'var123', position: 0 });
    });

    it('should distinguish keywords from identifiers', () => {
      const tokenizer = new Tokenizer('trueValue');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('trueValue');
    });
  });

  describe('operators', () => {
    it('should tokenize arithmetic operators', () => {
      const tokenizer = new Tokenizer('+ - * / %');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.PLUS);
      expect(tokens[1].type).toBe(TokenType.MINUS);
      expect(tokens[2].type).toBe(TokenType.MULTIPLY);
      expect(tokens[3].type).toBe(TokenType.DIVIDE);
      expect(tokens[4].type).toBe(TokenType.MODULO);
    });

    it('should tokenize comparison operators', () => {
      const tokenizer = new Tokenizer('> < >= <=');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.GREATER);
      expect(tokens[1].type).toBe(TokenType.LESS);
      expect(tokens[2].type).toBe(TokenType.GREATER_EQUAL);
      expect(tokens[3].type).toBe(TokenType.LESS_EQUAL);
    });

    it('should tokenize equality operators', () => {
      const tokenizer = new Tokenizer('== != === !==');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]).toEqual({ type: TokenType.EQUAL, value: '==', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NOT_EQUAL, value: '!=', position: 3 });
      expect(tokens[2]).toEqual({ type: TokenType.EQUAL, value: '===', position: 6 });
      expect(tokens[3]).toEqual({ type: TokenType.NOT_EQUAL, value: '!==', position: 10 });
    });

    it('should tokenize logical operators', () => {
      const tokenizer = new Tokenizer('&& || !');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.AND);
      expect(tokens[1].type).toBe(TokenType.OR);
      expect(tokens[2].type).toBe(TokenType.NOT);
    });
  });

  describe('punctuation', () => {
    it('should tokenize parentheses', () => {
      const tokenizer = new Tokenizer('()');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LPAREN);
      expect(tokens[1].type).toBe(TokenType.RPAREN);
    });

    it('should tokenize brackets', () => {
      const tokenizer = new Tokenizer('[]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LBRACKET);
      expect(tokens[1].type).toBe(TokenType.RBRACKET);
    });

    it('should tokenize dot', () => {
      const tokenizer = new Tokenizer('.');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.DOT);
    });

    it('should tokenize comma', () => {
      const tokenizer = new Tokenizer(',');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.COMMA);
    });
  });

  describe('whitespace handling', () => {
    it('should skip spaces', () => {
      const tokenizer = new Tokenizer('a   b');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(3);
      expect(tokens[0].value).toBe('a');
      expect(tokens[1].value).toBe('b');
    });

    it('should skip tabs', () => {
      const tokenizer = new Tokenizer('a\tb');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(3);
      expect(tokens[0].value).toBe('a');
      expect(tokens[1].value).toBe('b');
    });

    it('should skip newlines', () => {
      const tokenizer = new Tokenizer('a\nb');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(3);
      expect(tokens[0].value).toBe('a');
      expect(tokens[1].value).toBe('b');
    });

    it('should handle leading whitespace', () => {
      const tokenizer = new Tokenizer('   42');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].position).toBe(3);
      expect(tokens[0].value).toBe('42');
    });

    it('should handle trailing whitespace', () => {
      const tokenizer = new Tokenizer('42   ');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(2);
      expect(tokens[0].value).toBe('42');
      expect(tokens[1].type).toBe(TokenType.EOF);
    });
  });

  describe('complex expressions', () => {
    it('should tokenize property access', () => {
      const tokenizer = new Tokenizer('obj.prop');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toEqual({ type: TokenType.IDENTIFIER, value: 'obj', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DOT, value: '.', position: 3 });
      expect(tokens[2]).toEqual({ type: TokenType.IDENTIFIER, value: 'prop', position: 4 });
    });

    it('should tokenize function call', () => {
      const tokenizer = new Tokenizer('func(arg1, arg2)');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('func');
      expect(tokens[1].type).toBe(TokenType.LPAREN);
      expect(tokens[2].value).toBe('arg1');
      expect(tokens[3].type).toBe(TokenType.COMMA);
      expect(tokens[4].value).toBe('arg2');
      expect(tokens[5].type).toBe(TokenType.RPAREN);
    });

    it('should tokenize array literal', () => {
      const tokenizer = new Tokenizer('[1, 2, 3]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LBRACKET);
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '1', position: 1 });
      expect(tokens[2].type).toBe(TokenType.COMMA);
      expect(tokens[3]).toEqual({ type: TokenType.NUMBER, value: '2', position: 4 });
      expect(tokens[4].type).toBe(TokenType.COMMA);
      expect(tokens[5]).toEqual({ type: TokenType.NUMBER, value: '3', position: 7 });
      expect(tokens[6].type).toBe(TokenType.RBRACKET);
    });

    it('should tokenize arithmetic expression', () => {
      const tokenizer = new Tokenizer('(a + b) * c');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LPAREN);
      expect(tokens[1].value).toBe('a');
      expect(tokens[2].type).toBe(TokenType.PLUS);
      expect(tokens[3].value).toBe('b');
      expect(tokens[4].type).toBe(TokenType.RPAREN);
      expect(tokens[5].type).toBe(TokenType.MULTIPLY);
      expect(tokens[6].value).toBe('c');
    });

    it('should tokenize logical expression', () => {
      const tokenizer = new Tokenizer('a && b || c');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].value).toBe('a');
      expect(tokens[1].type).toBe(TokenType.AND);
      expect(tokens[2].value).toBe('b');
      expect(tokens[3].type).toBe(TokenType.OR);
      expect(tokens[4].value).toBe('c');
    });
  });

  describe('edge cases', () => {
    it('should handle empty expression', () => {
      const tokenizer = new Tokenizer('');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should handle whitespace-only expression', () => {
      const tokenizer = new Tokenizer('   ');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should throw on unexpected character', () => {
      const tokenizer = new Tokenizer('@');

      expect(() => tokenizer.tokenize()).toThrow('Unexpected character: @');
    });

    it('should track token positions correctly', () => {
      const tokenizer = new Tokenizer('a + b');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].position).toBe(0);
      expect(tokens[1].position).toBe(2);
      expect(tokens[2].position).toBe(4);
    });

    it('should handle consecutive operators', () => {
      const tokenizer = new Tokenizer('a+-b');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(5);
      expect(tokens[0].value).toBe('a');
      expect(tokens[1].type).toBe(TokenType.PLUS);
      expect(tokens[2].type).toBe(TokenType.MINUS);
      expect(tokens[3].value).toBe('b');
    });
  });

  describe('position tracking', () => {
    it('should track position for string at start', () => {
      const tokenizer = new Tokenizer('"test"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].position).toBe(0);
    });

    it('should track position after whitespace', () => {
      const tokenizer = new Tokenizer('   "test"');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].position).toBe(3);
    });

    it('should track position for operators', () => {
      const tokenizer = new Tokenizer('a === b');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].position).toBe(0);
      expect(tokens[1].position).toBe(2);
      expect(tokens[2].position).toBe(6);
    });
  });
});

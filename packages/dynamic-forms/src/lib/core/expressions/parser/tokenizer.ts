import { Token, TokenType, ExpressionParserError } from './types';

/**
 * Tokenizes an expression string into tokens
 */
export class Tokenizer {
  private position = 0;
  private readonly expression: string;

  constructor(expression: string) {
    this.expression = expression;
  }

  /**
   * Tokenize the entire expression
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.expression.length) {
      this.skipWhitespace();

      if (this.position >= this.expression.length) {
        break;
      }

      const token = this.nextToken();
      tokens.push(token);
    }

    tokens.push({ type: TokenType.EOF, value: '', position: this.position });
    return tokens;
  }

  private skipWhitespace(): void {
    while (this.position < this.expression.length && /\s/.test(this.expression[this.position])) {
      this.position++;
    }
  }

  private nextToken(): Token {
    const char = this.expression[this.position];

    // String literals
    if (char === '"' || char === "'") {
      return this.readString(char);
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      return this.readNumber();
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
      return this.readIdentifierOrKeyword();
    }

    // Operators and punctuation
    return this.readOperatorOrPunctuation();
  }

  private readString(quote: string): Token {
    const start = this.position;
    this.position++; // Skip opening quote

    let value = '';
    while (this.position < this.expression.length) {
      const char = this.expression[this.position];

      if (char === quote) {
        this.position++; // Skip closing quote
        return { type: TokenType.STRING, value, position: start };
      }

      if (char === '\\' && this.position + 1 < this.expression.length) {
        // Handle escape sequences
        this.position++;
        const nextChar = this.expression[this.position];
        switch (nextChar) {
          case 'n':
            value += '\n';
            break;
          case 't':
            value += '\t';
            break;
          case 'r':
            value += '\r';
            break;
          case '\\':
            value += '\\';
            break;
          case quote:
            value += quote;
            break;
          default:
            value += nextChar;
        }
        this.position++;
      } else {
        value += char;
        this.position++;
      }
    }

    throw new ExpressionParserError('Unterminated string literal', start, this.expression);
  }

  private readNumber(): Token {
    const start = this.position;
    let value = '';

    while (this.position < this.expression.length && /[0-9.]/.test(this.expression[this.position])) {
      value += this.expression[this.position];
      this.position++;
    }

    return { type: TokenType.NUMBER, value, position: start };
  }

  private readIdentifierOrKeyword(): Token {
    const start = this.position;
    let value = '';

    while (this.position < this.expression.length && /[a-zA-Z0-9_$]/.test(this.expression[this.position])) {
      value += this.expression[this.position];
      this.position++;
    }

    // Check for keywords
    const type = this.getKeywordType(value);
    return { type, value, position: start };
  }

  private getKeywordType(value: string): TokenType {
    switch (value) {
      case 'true':
        return TokenType.TRUE;
      case 'false':
        return TokenType.FALSE;
      case 'null':
        return TokenType.NULL;
      case 'undefined':
        return TokenType.UNDEFINED;
      default:
        return TokenType.IDENTIFIER;
    }
  }

  private readOperatorOrPunctuation(): Token {
    const start = this.position;
    const char = this.expression[this.position];
    const nextChar = this.position + 1 < this.expression.length ? this.expression[this.position + 1] : '';
    const thirdChar = this.position + 2 < this.expression.length ? this.expression[this.position + 2] : '';

    // Three-character operators - check these first!
    const threeChar = char + nextChar + thirdChar;
    if (threeChar === '===') {
      this.position += 3;
      return { type: TokenType.EQUAL, value: '===', position: start };
    }
    if (threeChar === '!==') {
      this.position += 3;
      return { type: TokenType.NOT_EQUAL, value: '!==', position: start };
    }

    // Two-character operators
    const twoChar = char + nextChar;
    switch (twoChar) {
      case '==':
        this.position += 2;
        return { type: TokenType.EQUAL, value: '==', position: start };
      case '!=':
        this.position += 2;
        return { type: TokenType.NOT_EQUAL, value: '!=', position: start };
      case '>=':
        this.position += 2;
        return { type: TokenType.GREATER_EQUAL, value: '>=', position: start };
      case '<=':
        this.position += 2;
        return { type: TokenType.LESS_EQUAL, value: '<=', position: start };
      case '&&':
        this.position += 2;
        return { type: TokenType.AND, value: '&&', position: start };
      case '||':
        this.position += 2;
        return { type: TokenType.OR, value: '||', position: start };
    }

    // Single-character operators and punctuation
    this.position++;
    switch (char) {
      case '+':
        return { type: TokenType.PLUS, value: '+', position: start };
      case '-':
        return { type: TokenType.MINUS, value: '-', position: start };
      case '*':
        return { type: TokenType.MULTIPLY, value: '*', position: start };
      case '/':
        return { type: TokenType.DIVIDE, value: '/', position: start };
      case '%':
        return { type: TokenType.MODULO, value: '%', position: start };
      case '>':
        return { type: TokenType.GREATER, value: '>', position: start };
      case '<':
        return { type: TokenType.LESS, value: '<', position: start };
      case '!':
        return { type: TokenType.NOT, value: '!', position: start };
      case '.':
        return { type: TokenType.DOT, value: '.', position: start };
      case ',':
        return { type: TokenType.COMMA, value: ',', position: start };
      case '(':
        return { type: TokenType.LPAREN, value: '(', position: start };
      case ')':
        return { type: TokenType.RPAREN, value: ')', position: start };
      case '[':
        return { type: TokenType.LBRACKET, value: '[', position: start };
      case ']':
        return { type: TokenType.RBRACKET, value: ']', position: start };
      default:
        throw new ExpressionParserError(`Unexpected character: ${char}`, start, this.expression);
    }
  }
}

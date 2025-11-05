import { Token, TokenType, ASTNode, ExpressionParserError } from './types';
import { Tokenizer } from './tokenizer';

/**
 * Parses tokens into an Abstract Syntax Tree (AST)
 * Uses recursive descent parsing with operator precedence
 */
export class Parser {
  private tokens: Token[] = [];
  private current = 0;
  private readonly expression: string;

  constructor(expression: string) {
    this.expression = expression;
  }

  /**
   * Parse the expression into an AST
   */
  parse(): ASTNode {
    const tokenizer = new Tokenizer(this.expression);
    this.tokens = tokenizer.tokenize();
    this.current = 0;

    if (this.isAtEnd()) {
      throw new ExpressionParserError('Empty expression', 0, this.expression);
    }

    return this.parseExpression();
  }

  private parseExpression(): ASTNode {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): ASTNode {
    let node = this.parseLogicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.previous().value;
      const right = this.parseLogicalAnd();
      node = { type: 'BinaryOp', operator, left: node, right };
    }

    return node;
  }

  private parseLogicalAnd(): ASTNode {
    let node = this.parseEquality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous().value;
      const right = this.parseEquality();
      node = { type: 'BinaryOp', operator, left: node, right };
    }

    return node;
  }

  private parseEquality(): ASTNode {
    let node = this.parseComparison();

    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().value;
      const right = this.parseComparison();
      node = { type: 'BinaryOp', operator, left: node, right };
    }

    return node;
  }

  private parseComparison(): ASTNode {
    let node = this.parseAddition();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous().value;
      const right = this.parseAddition();
      node = { type: 'BinaryOp', operator, left: node, right };
    }

    return node;
  }

  private parseAddition(): ASTNode {
    let node = this.parseMultiplication();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.parseMultiplication();
      node = { type: 'BinaryOp', operator, left: node, right };
    }

    return node;
  }

  private parseMultiplication(): ASTNode {
    let node = this.parseUnary();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      node = { type: 'BinaryOp', operator, left: node, right };
    }

    return node;
  }

  private parseUnary(): ASTNode {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous().value;
      const operand = this.parseUnary();
      return { type: 'UnaryOp', operator, operand };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): ASTNode {
    let node = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.DOT)) {
        // Member access: obj.property
        if (!this.check(TokenType.IDENTIFIER)) {
          throw new ExpressionParserError('Expected property name after "."', this.peek().position, this.expression);
        }
        const property = this.advance().value;
        node = { type: 'MemberAccess', object: node, property };
      } else if (this.match(TokenType.LPAREN)) {
        // Function call: func()
        const args = this.parseArgumentList();
        this.consume(TokenType.RPAREN, 'Expected ")" after arguments');
        node = { type: 'CallExpression', callee: node, arguments: args };
      } else {
        break;
      }
    }

    return node;
  }

  private parsePrimary(): ASTNode {
    // Literals
    if (this.match(TokenType.TRUE)) {
      return { type: 'Literal', value: true };
    }

    if (this.match(TokenType.FALSE)) {
      return { type: 'Literal', value: false };
    }

    if (this.match(TokenType.NULL)) {
      return { type: 'Literal', value: null };
    }

    if (this.match(TokenType.UNDEFINED)) {
      return { type: 'Literal', value: undefined };
    }

    if (this.match(TokenType.NUMBER)) {
      return { type: 'Literal', value: parseFloat(this.previous().value) };
    }

    if (this.match(TokenType.STRING)) {
      return { type: 'Literal', value: this.previous().value };
    }

    // Array literal
    if (this.match(TokenType.LBRACKET)) {
      const elements = this.parseArrayElements();
      this.consume(TokenType.RBRACKET, 'Expected "]" after array elements');
      return { type: 'ArrayLiteral', elements };
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: this.previous().value };
    }

    // Grouped expression
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, 'Expected ")" after expression');
      return expr;
    }

    throw new ExpressionParserError(`Unexpected token: ${this.peek().value}`, this.peek().position, this.expression);
  }

  private parseArgumentList(): ASTNode[] {
    const args: ASTNode[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    return args;
  }

  private parseArrayElements(): ASTNode[] {
    const elements: ASTNode[] = [];

    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    return elements;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw new ExpressionParserError(message, this.peek().position, this.expression);
  }
}

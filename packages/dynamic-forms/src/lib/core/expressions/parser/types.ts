import { DynamicFormError } from '../../../errors/dynamic-form-error';

/**
 * Token types for expression parsing
 */
export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  NULL = 'NULL',
  UNDEFINED = 'UNDEFINED',

  // Identifiers
  IDENTIFIER = 'IDENTIFIER',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MODULO = 'MODULO',

  // Comparison
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  GREATER = 'GREATER',
  LESS = 'LESS',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',

  // Logical
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',

  // Punctuation
  DOT = 'DOT',
  COMMA = 'COMMA',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',

  // Special
  EOF = 'EOF',
}

/**
 * Token with type, value, and position
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * AST Node types
 */
export type ASTNode = LiteralNode | IdentifierNode | MemberAccessNode | BinaryOpNode | UnaryOpNode | CallExpressionNode | ArrayLiteralNode;

export interface LiteralNode {
  type: 'Literal';
  value: string | number | boolean | null | undefined;
}

export interface IdentifierNode {
  type: 'Identifier';
  name: string;
}

export interface MemberAccessNode {
  type: 'MemberAccess';
  object: ASTNode;
  property: string;
}

export interface BinaryOpNode {
  type: 'BinaryOp';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryOpNode {
  type: 'UnaryOp';
  operator: string;
  operand: ASTNode;
}

export interface CallExpressionNode {
  type: 'CallExpression';
  callee: ASTNode;
  arguments: ASTNode[];
}

export interface ArrayLiteralNode {
  type: 'ArrayLiteral';
  elements: ASTNode[];
}

/**
 * Parser error with position information
 */
export class ExpressionParserError extends DynamicFormError {
  constructor(
    message: string,
    public position: number,
    public expression: string,
  ) {
    super(`${message} at position ${position} in expression: ${expression}`);
    this.name = 'ExpressionParserError';
  }
}

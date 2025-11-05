import { ASTNode, ExpressionParserError } from './types';

/**
 * Evaluation context for safe expression evaluation
 */
export interface EvaluationScope {
  [key: string]: unknown;
}

/**
 * Whitelist of safe methods that can be called on values
 */
const SAFE_METHODS: Record<string, Set<string>> = {
  string: new Set([
    'charAt',
    'charCodeAt',
    'concat',
    'endsWith',
    'includes',
    'indexOf',
    'lastIndexOf',
    'match',
    'padEnd',
    'padStart',
    'repeat',
    'replace',
    'search',
    'slice',
    'split',
    'startsWith',
    'substring',
    'toLowerCase',
    'toUpperCase',
    'trim',
    'trimEnd',
    'trimStart',
  ]),
  number: new Set(['toExponential', 'toFixed', 'toPrecision', 'toString']),
  array: new Set([
    'concat',
    'every',
    'filter',
    'find',
    'findIndex',
    'flat',
    'flatMap',
    'includes',
    'indexOf',
    'join',
    'lastIndexOf',
    'map',
    'reduce',
    'reduceRight',
    'slice',
    'some',
    'toString',
  ]),
  date: new Set([
    'getDate',
    'getDay',
    'getFullYear',
    'getHours',
    'getMilliseconds',
    'getMinutes',
    'getMonth',
    'getSeconds',
    'getTime',
    'toDateString',
    'toISOString',
    'toJSON',
    'toLocaleDateString',
    'toLocaleString',
    'toLocaleTimeString',
    'toString',
    'toTimeString',
  ]),
};

/**
 * Safely evaluates an AST node with a given context
 */
export class Evaluator {
  private readonly scope: EvaluationScope;
  private readonly expression: string;

  constructor(scope: EvaluationScope, expression: string) {
    this.scope = scope;
    this.expression = expression;
  }

  /**
   * Evaluate an AST node
   */
  evaluate(node: ASTNode): unknown {
    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier':
        return this.evaluateIdentifier(node.name);

      case 'MemberAccess':
        return this.evaluateMemberAccess(node);

      case 'BinaryOp':
        return this.evaluateBinaryOp(node);

      case 'UnaryOp':
        return this.evaluateUnaryOp(node);

      case 'CallExpression':
        return this.evaluateCallExpression(node);

      case 'ArrayLiteral':
        return this.evaluateArrayLiteral(node);

      default:
        throw new ExpressionParserError(`Unknown node type: ${(node as { type: string }).type}`, 0, this.expression);
    }
  }

  private evaluateIdentifier(name: string): unknown {
    if (!(name in this.scope)) {
      return undefined;
    }
    return this.scope[name];
  }

  private evaluateMemberAccess(node: { object: ASTNode; property: string }): unknown {
    const obj = this.evaluate(node.object);

    if (obj === null || obj === undefined) {
      return undefined;
    }

    // Allow property access on plain objects and primitives
    if (typeof obj === 'object' || typeof obj === 'string' || typeof obj === 'number') {
      return (obj as Record<string, unknown>)[node.property];
    }

    return undefined;
  }

  private evaluateBinaryOp(node: { operator: string; left: ASTNode; right: ASTNode }): unknown {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);

    switch (node.operator) {
      // Arithmetic
      case '+':
        return (left as number) + (right as number);
      case '-':
        return (left as number) - (right as number);
      case '*':
        return (left as number) * (right as number);
      case '/':
        return (left as number) / (right as number);
      case '%':
        return (left as number) % (right as number);

      // Comparison - using == and != intentionally for loose equality
      case '==':
        return left == right;
      case '===':
        return left === right;
      case '!=':
        return left != right;
      case '!==':
        return left !== right;
      case '>':
        return (left as number) > (right as number);
      case '<':
        return (left as number) < (right as number);
      case '>=':
        return (left as number) >= (right as number);
      case '<=':
        return (left as number) <= (right as number);

      // Logical
      case '&&':
        return left && right;
      case '||':
        return left || right;

      default:
        throw new ExpressionParserError(`Unknown binary operator: ${node.operator}`, 0, this.expression);
    }
  }

  private evaluateUnaryOp(node: { operator: string; operand: ASTNode }): unknown {
    const operand = this.evaluate(node.operand);

    switch (node.operator) {
      case '!':
        return !operand;
      case '-':
        return -(operand as number);
      case '+':
        return +(operand as number);
      default:
        throw new ExpressionParserError(`Unknown unary operator: ${node.operator}`, 0, this.expression);
    }
  }

  private evaluateCallExpression(node: { callee: ASTNode; arguments: ASTNode[] }): unknown {
    // Only allow method calls (member access), not arbitrary function calls
    if (node.callee.type !== 'MemberAccess') {
      throw new ExpressionParserError('Only method calls are allowed, not arbitrary function calls', 0, this.expression);
    }

    const obj = this.evaluate(node.callee.object);
    const methodName = node.callee.property;

    // Check if the method is in the whitelist
    if (!this.isMethodSafe(obj, methodName)) {
      throw new ExpressionParserError(`Method "${methodName}" is not allowed for security reasons`, 0, this.expression);
    }

    // Evaluate arguments
    const args = node.arguments.map((arg) => this.evaluate(arg));

    // Call the method with proper `this` binding
    const method = (obj as Record<string, unknown>)[methodName];
    if (typeof method === 'function') {
      // Use .call() to properly bind `this` context
      return (method as (...args: unknown[]) => unknown).call(obj, ...args);
    }

    return undefined;
  }

  private evaluateArrayLiteral(node: { elements: ASTNode[] }): unknown {
    return node.elements.map((element) => this.evaluate(element));
  }

  private isMethodSafe(obj: unknown, methodName: string): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    const type = Array.isArray(obj) ? 'array' : obj instanceof Date ? 'date' : typeof obj;

    const safeMethods = SAFE_METHODS[type];
    if (!safeMethods) {
      return false;
    }

    return safeMethods.has(methodName);
  }
}

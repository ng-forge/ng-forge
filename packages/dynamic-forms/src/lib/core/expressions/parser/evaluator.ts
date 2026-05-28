import { ASTNode, ExpressionParserError } from './types';

/** Evaluation context for safe expression evaluation */
export interface EvaluationScope {
  [key: string]: unknown;
}

/** Security Model: Whitelist-only approach for method calls */

/**
 * Type-safe method whitelists derived from TypeScript primitive types
 * Only methods explicitly listed here are allowed - this is a whitelist-only approach
 */
const STRING_SAFE_METHODS: ReadonlyArray<keyof string> = [
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
  'toString',
] as const;

const NUMBER_SAFE_METHODS: ReadonlyArray<keyof number> = ['toExponential', 'toFixed', 'toPrecision', 'toString'] as const;

const ARRAY_SAFE_METHODS: ReadonlyArray<keyof Array<unknown>> = [
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
  'entries',
  'keys',
  'values',
] as const;

const DATE_SAFE_METHODS: ReadonlyArray<keyof Date> = [
  'getDate',
  'getDay',
  'getFullYear',
  'getHours',
  'getMilliseconds',
  'getMinutes',
  'getMonth',
  'getSeconds',
  'getTime',
  'getTimezoneOffset',
  'getUTCDate',
  'getUTCDay',
  'getUTCFullYear',
  'getUTCHours',
  'getUTCMilliseconds',
  'getUTCMinutes',
  'getUTCMonth',
  'getUTCSeconds',
  'toDateString',
  'toISOString',
  'toJSON',
  'toString',
  'toTimeString',
  'toUTCString',
] as const;

/**
 * Whitelist of safe methods that can be called on values
 * Using Set for O(1) lookup performance
 */
const SAFE_METHODS: Record<string, ReadonlySet<string>> = {
  string: new Set(STRING_SAFE_METHODS as readonly string[]),
  number: new Set(NUMBER_SAFE_METHODS as readonly string[]),
  array: new Set(ARRAY_SAFE_METHODS as readonly string[]),
  date: new Set(DATE_SAFE_METHODS as readonly string[]),
};

/**
 * Blacklist of property names that should not be accessible
 * These properties can leak information about object structure or enable attacks
 */
const BLOCKED_PROPERTIES = new Set<string>([
  'constructor',
  '__proto__',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/** Safely evaluates an AST node with a given context */
export class Evaluator {
  private readonly scope: EvaluationScope;
  private readonly expression: string;

  constructor(scope: EvaluationScope, expression: string) {
    this.scope = scope;
    this.expression = expression;
  }

  /** Evaluate an AST node */
  evaluate(node: ASTNode): unknown {
    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier':
        return this.evaluateIdentifier(node.name);

      case 'MemberAccess':
        return this.evaluateMemberAccess(node);

      case 'ComputedMemberAccess':
        return this.evaluateComputedMemberAccess(node);

      case 'BinaryOp':
        return this.evaluateBinaryOp(node);

      case 'UnaryOp':
        return this.evaluateUnaryOp(node);

      case 'CallExpression':
        return this.evaluateCallExpression(node);

      case 'Conditional':
        return this.evaluate(node.test) ? this.evaluate(node.consequent) : this.evaluate(node.alternate);

      case 'ArrayLiteral':
        return this.evaluateArrayLiteral(node);

      case 'ObjectLiteral':
        return this.evaluateObjectLiteral(node);

      case 'ArrowFunction':
        return this.evaluateArrowFunction(node);

      default:
        throw new ExpressionParserError(`Unknown node type: ${(node as { type: string }).type}`, 0, this.expression);
    }
  }

  private evaluateIdentifier(name: string): unknown {
    if (name in this.scope) {
      return this.scope[name];
    }
    return undefined;
  }

  private evaluateMemberAccess(node: { object: ASTNode; property: string }): unknown {
    const obj = this.evaluate(node.object);

    if (obj === null || obj === undefined) {
      return undefined;
    }

    // Block access to dangerous properties that could leak information or enable attacks
    if (BLOCKED_PROPERTIES.has(node.property)) {
      throw new ExpressionParserError(`Property "${node.property}" is not accessible for security reasons`, 0, this.expression);
    }

    // Allow property access on plain objects and primitives
    if (typeof obj === 'object' || typeof obj === 'string' || typeof obj === 'number') {
      return (obj as Record<string, unknown>)[node.property];
    }

    return undefined;
  }

  private evaluateComputedMemberAccess(node: { object: ASTNode; property: ASTNode; optional?: boolean }): unknown {
    const obj = this.evaluate(node.object);

    if (obj === null || obj === undefined) {
      // Both `obj?.[expr]` and `obj[expr]` short-circuit on null/undefined —
      // matches the safe-access behavior of dotted member access above.
      return undefined;
    }

    const rawKey = this.evaluate(node.property);
    if (rawKey === null || rawKey === undefined) return undefined;
    const key = String(rawKey);

    // Same blocklist as dotted access — `obj['__proto__']` must be rejected
    // even though the property name was computed.
    if (BLOCKED_PROPERTIES.has(key)) {
      throw new ExpressionParserError(`Property "${key}" is not accessible for security reasons`, 0, this.expression);
    }

    if (typeof obj === 'object' || typeof obj === 'string' || typeof obj === 'number') {
      return (obj as Record<string, unknown>)[key];
    }

    return undefined;
  }

  private evaluateBinaryOp(node: { operator: string; left: ASTNode; right: ASTNode }): unknown {
    // Handle short-circuit evaluation for logical operators
    if (node.operator === '&&') {
      const left = this.evaluate(node.left);
      return left ? this.evaluate(node.right) : left;
    }
    if (node.operator === '||') {
      const left = this.evaluate(node.left);
      return left ? left : this.evaluate(node.right);
    }

    // For all other operators, evaluate both sides
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
        if (right === 0) return null;
        return (left as number) / (right as number);
      case '%':
        if (right === 0) return null;
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

  private evaluateCallExpression(node: { callee: ASTNode; arguments: ASTNode[]; optional?: boolean }): unknown {
    // Only allow method calls (member access). Computed access (`obj['method']()`)
    // is also rejected — the security model whitelists method names statically.
    if (node.callee.type !== 'MemberAccess') {
      throw new ExpressionParserError('Only method calls are allowed, not arbitrary function calls', 0, this.expression);
    }

    const obj = this.evaluate(node.callee.object);

    // Calling a method on a nullish receiver silently returns undefined —
    // consistent with how dotted member access (`obj.prop`) treats nullish
    // receivers above. This means `a?.b()`, `a?.b.c()`, and `nullable.method()`
    // all short-circuit to undefined rather than tripping the whitelist check
    // with a misleading "method not allowed" error. The whitelist still
    // enforces strictly on non-nullish receivers.
    if (obj === null || obj === undefined) {
      return undefined;
    }

    const methodName = node.callee.property;

    // Block access to dangerous properties (must check before method call)
    if (BLOCKED_PROPERTIES.has(methodName)) {
      throw new ExpressionParserError(`Property "${methodName}" is not accessible for security reasons`, 0, this.expression);
    }

    // Check if the method is in the instance method whitelist
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

  private evaluateObjectLiteral(node: { properties: Array<{ key: string; value: ASTNode }> }): unknown {
    const result: Record<string, unknown> = {};
    for (const { key, value } of node.properties) {
      if (BLOCKED_PROPERTIES.has(key)) {
        throw new ExpressionParserError(`Property "${key}" is not allowed in object literals for security reasons`, 0, this.expression);
      }
      result[key] = this.evaluate(value);
    }
    return result;
  }

  private evaluateArrowFunction(node: { params: string[]; body: ASTNode }): unknown {
    const parentScope = this.scope;
    const expression = this.expression;
    return (...args: unknown[]) => {
      const childScope: EvaluationScope = { ...parentScope };
      for (let i = 0; i < node.params.length; i++) {
        childScope[node.params[i]] = args[i];
      }
      const childEvaluator = new Evaluator(childScope, expression);
      return childEvaluator.evaluate(node.body);
    };
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

import { ASTNode } from './types';
import { ALLOWED_METHOD_NAMES } from './evaluator';

/** Variables a condition expression can read (the keys of `EvaluationContext`). */
export const CONDITION_SCOPE_VARIABLES: ReadonlySet<string> = new Set([
  'fieldValue',
  'formValue',
  'fieldPath',
  'customFunctions',
  'groupValue',
  'rootFormValue',
  'arrayIndex',
  'arrayPath',
  'externalData',
  'fieldState',
  'formFieldState',
]);

/**
 * Finds constructs that parse but can never work at runtime: a direct function call
 * (`String(x)`), a method outside the allow-list, or a name that isn't in scope (`Math`),
 * which reads as `undefined` and makes the expression quietly wrong.
 */
export function findStaticExpressionProblems(ast: ASTNode, scope: ReadonlySet<string>): string[] {
  const problems = new Set<string>();

  const visit = (node: ASTNode, locals: ReadonlySet<string>): void => {
    switch (node.type) {
      case 'Identifier':
        if (!scope.has(node.name) && !locals.has(node.name)) problems.add(`'${node.name}' is not available in expressions`);
        return;
      case 'MemberAccess':
        visit(node.object, locals);
        return;
      case 'ComputedMemberAccess':
        visit(node.object, locals);
        visit(node.property, locals);
        return;
      case 'CallExpression':
        if (node.callee.type === 'MemberAccess') {
          if (!ALLOWED_METHOD_NAMES.has(node.callee.property)) problems.add(`method '${node.callee.property}' is not allowed`);
        } else {
          problems.add(`'${describeCallee(node.callee)}(...)' is a direct function call; only allowed methods can be called`);
        }
        visit(node.callee.type === 'MemberAccess' ? node.callee.object : node.callee, locals);
        node.arguments.forEach((arg) => visit(arg, locals));
        return;
      case 'BinaryOp':
        visit(node.left, locals);
        visit(node.right, locals);
        return;
      case 'UnaryOp':
        visit(node.operand, locals);
        return;
      case 'Conditional':
        visit(node.test, locals);
        visit(node.consequent, locals);
        visit(node.alternate, locals);
        return;
      case 'ArrayLiteral':
        node.elements.forEach((element) => visit(element, locals));
        return;
      case 'ObjectLiteral':
        node.properties.forEach((property) => visit(property.value, locals));
        return;
      case 'ArrowFunction':
        visit(node.body, new Set([...locals, ...node.params]));
        return;
      case 'Literal':
        return;
    }
  };

  visit(ast, new Set());
  return [...problems];
}

function describeCallee(node: ASTNode): string {
  return node.type === 'Identifier' ? node.name : 'expression';
}

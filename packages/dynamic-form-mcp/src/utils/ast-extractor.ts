/**
 * AST Extractor Utility
 *
 * Uses ts-morph for robust TypeScript parsing to extract FormConfig objects.
 * Handles complex patterns that regex + new Function() cannot:
 * - new Date() constructors
 * - Function references and arrow functions
 * - Regex literals
 * - External variable references
 * - Method calls like Math.floor()
 */

/**
 * Placeholder date used when encountering `new Date()` expressions.
 * Since dates are runtime values, we substitute a fixed ISO string for validation.
 */
export const DATE_PLACEHOLDER = '2024-01-01T00:00:00.000Z';

/**
 * Maximum length for source text before truncation in warnings.
 * Keeps warning messages readable while preserving context.
 */
export const MAX_SOURCE_TEXT_LENGTH = 50;

import {
  Project,
  SourceFile,
  Node,
  ObjectLiteralExpression,
  SyntaxKind,
  PropertyAssignment,
  ArrayLiteralExpression,
  SatisfiesExpression,
} from 'ts-morph';

/**
 * A candidate FormConfig object found in the source file.
 */
export interface FormConfigCandidate {
  /** Variable or property name */
  name: string;
  /** Line number where the declaration starts */
  startLine: number;
  /** The AST node for the object literal */
  objectLiteral: ObjectLiteralExpression;
  /** How this candidate was detected */
  matchReason: 'type-annotation' | 'satisfies' | 'as-cast' | 'structural';
}

/**
 * Warning about a non-serializable value that was replaced with a placeholder.
 */
export interface ExtractionWarning {
  /** Path to the property, e.g., "fields[0].props.maxDate" */
  path: string;
  /** Description of the issue */
  issue: string;
  /** Original source text */
  originalText: string;
  /** What was substituted */
  placeholder: string | number | boolean | null;
}

/**
 * Error that occurred during extraction.
 */
export interface ExtractionError {
  /** Path to the property */
  path: string;
  /** Error message */
  message: string;
}

/**
 * Result of extracting an AST node to JSON.
 */
export interface ExtractionResult {
  /** The extracted JSON-safe object */
  value: unknown;
  /** Non-fatal issues (runtime values replaced with placeholders) */
  warnings: ExtractionWarning[];
  /** Fatal issues (couldn't extract) */
  errors: ExtractionError[];
}

/**
 * Create a ts-morph Project and parse source code.
 */
export function createSourceFile(source: string, fileName = 'temp.ts'): SourceFile {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile(fileName, source);
}

/**
 * Find all potential FormConfig objects in a source file.
 *
 * Uses multiple detection strategies (in order of precedence):
 * 1. Type annotation: `const x: FormConfig = {...}` or `const x: SomeFormConfig = {...}`
 * 2. Satisfies: `const x = {...} satisfies FormConfig` or `{...} as const satisfies SomeConfig`
 * 3. As cast: `const x = {...} as FormConfig`
 * 4. Structural: Any object with `fields` array containing form-like objects
 */
export function findFormConfigCandidates(sourceFile: SourceFile): FormConfigCandidate[] {
  const candidates: FormConfigCandidate[] = [];
  const foundNames = new Set<string>();

  // Get all variable declarations
  const variableDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);

  for (const varDecl of variableDeclarations) {
    const name = varDecl.getName();
    if (foundNames.has(name)) continue;

    const startLine = varDecl.getStartLineNumber();
    const initializer = varDecl.getInitializer();

    // Strategy 1: Type annotation contains "FormConfig" (case-insensitive)
    const typeNode = varDecl.getTypeNode();
    if (typeNode) {
      const typeText = typeNode.getText();
      if (/formconfig/i.test(typeText)) {
        const objectLiteral = findObjectLiteral(initializer);
        if (objectLiteral && hasFormConfigStructure(objectLiteral)) {
          candidates.push({
            name,
            startLine,
            objectLiteral,
            matchReason: 'type-annotation',
          });
          foundNames.add(name);
          continue;
        }
      }
    }

    // Strategy 2: Check for satisfies clause
    if (initializer) {
      const satisfiesExpr = findSatisfiesExpression(initializer);
      if (satisfiesExpr) {
        const satisfiesType = satisfiesExpr.getTypeNode()?.getText() || '';
        if (/formconfig/i.test(satisfiesType)) {
          const objectLiteral = findObjectLiteralInSatisfies(satisfiesExpr);
          if (objectLiteral && hasFormConfigStructure(objectLiteral)) {
            candidates.push({
              name,
              startLine,
              objectLiteral,
              matchReason: 'satisfies',
            });
            foundNames.add(name);
            continue;
          }
        }
      }
    }

    // Strategy 3: Check for "as FormConfig" cast
    if (initializer && Node.isAsExpression(initializer)) {
      const typeText = initializer.getTypeNode()?.getText() || '';
      if (/formconfig/i.test(typeText)) {
        const expression = initializer.getExpression();
        const objectLiteral = findObjectLiteral(expression);
        if (objectLiteral && hasFormConfigStructure(objectLiteral)) {
          candidates.push({
            name,
            startLine,
            objectLiteral,
            matchReason: 'as-cast',
          });
          foundNames.add(name);
          continue;
        }
      }
    }

    // Strategy 4: Structural detection - has fields array with form-like objects
    const objectLiteral = findObjectLiteral(initializer);
    if (objectLiteral && hasFormConfigStructure(objectLiteral)) {
      candidates.push({
        name,
        startLine,
        objectLiteral,
        matchReason: 'structural',
      });
      foundNames.add(name);
    }
  }

  return candidates;
}

/**
 * Find a SatisfiesExpression in an initializer.
 * Handles both direct satisfies and "as const satisfies" patterns.
 */
function findSatisfiesExpression(node: Node | undefined): SatisfiesExpression | undefined {
  if (!node) return undefined;

  // Direct satisfies expression
  if (Node.isSatisfiesExpression(node)) {
    return node;
  }

  // "as const satisfies X" pattern - the satisfies wraps the as expression
  // Check children for satisfies
  const children = node.getChildren();
  for (const child of children) {
    if (Node.isSatisfiesExpression(child)) {
      return child;
    }
    const found = findSatisfiesExpression(child);
    if (found) return found;
  }

  return undefined;
}

/**
 * Find object literal within a satisfies expression.
 */
function findObjectLiteralInSatisfies(satisfiesExpr: SatisfiesExpression): ObjectLiteralExpression | undefined {
  const expression = satisfiesExpr.getExpression();
  if (!expression) return undefined;

  // Could be directly the object, or wrapped in "as const"
  if (Node.isObjectLiteralExpression(expression)) {
    return expression;
  }

  if (Node.isAsExpression(expression)) {
    const innerExpr = expression.getExpression();
    if (Node.isObjectLiteralExpression(innerExpr)) {
      return innerExpr;
    }
  }

  return undefined;
}

/**
 * Find an ObjectLiteralExpression in a node (handles as const, parentheses, etc.)
 */
function findObjectLiteral(node: Node | undefined): ObjectLiteralExpression | undefined {
  if (!node) return undefined;

  if (Node.isObjectLiteralExpression(node)) {
    return node;
  }

  // Handle "as const" wrapper
  if (Node.isAsExpression(node)) {
    return findObjectLiteral(node.getExpression());
  }

  // Handle satisfies wrapper
  if (Node.isSatisfiesExpression(node)) {
    return findObjectLiteral(node.getExpression());
  }

  // Handle parenthesized expression
  if (Node.isParenthesizedExpression(node)) {
    return findObjectLiteral(node.getExpression());
  }

  return undefined;
}

/**
 * Check if an object literal has the structure of a FormConfig.
 * Detection is type-agnostic - looks for structural patterns:
 * - Has a "fields" property that is an array
 * - Array elements have "key" or "type" properties
 */
function hasFormConfigStructure(node: ObjectLiteralExpression): boolean {
  const fieldsProperty = node.getProperty('fields');
  if (!fieldsProperty || !Node.isPropertyAssignment(fieldsProperty)) {
    return false;
  }

  const initializer = (fieldsProperty as PropertyAssignment).getInitializer();
  if (!initializer || !Node.isArrayLiteralExpression(initializer)) {
    return false;
  }

  const elements = (initializer as ArrayLiteralExpression).getElements();

  // Empty fields array is valid
  if (elements.length === 0) {
    return true;
  }

  // Check first element for field-like structure
  const firstElement = elements[0];
  if (!Node.isObjectLiteralExpression(firstElement)) {
    return false;
  }

  const hasKey = firstElement.getProperty('key') !== undefined;
  const hasType = firstElement.getProperty('type') !== undefined;

  return hasKey || hasType;
}

/**
 * Extract an AST node to a JSON-safe object.
 * Handles non-serializable values gracefully with placeholders and warnings.
 */
export function extractToJson(node: Node, path = ''): ExtractionResult {
  const warnings: ExtractionWarning[] = [];
  const errors: ExtractionError[] = [];

  const value = extractNode(node, path, warnings, errors);

  return { value, warnings, errors };
}

/**
 * Recursively extract a node to a JSON-safe value.
 */
function extractNode(node: Node, path: string, warnings: ExtractionWarning[], errors: ExtractionError[]): unknown {
  // String literals
  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }

  // No substitution literals (template literals without substitutions)
  if (Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralValue();
  }

  // Numeric literals
  if (Node.isNumericLiteral(node)) {
    return node.getLiteralValue();
  }

  // Boolean literals
  if (node.getKind() === SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.getKind() === SyntaxKind.FalseKeyword) {
    return false;
  }

  // Null
  if (node.getKind() === SyntaxKind.NullKeyword) {
    return null;
  }

  // Undefined
  if (node.getKind() === SyntaxKind.UndefinedKeyword) {
    warnings.push({
      path,
      issue: 'undefined value',
      originalText: 'undefined',
      placeholder: null,
    });
    return null;
  }

  // Array literals
  if (Node.isArrayLiteralExpression(node)) {
    return node.getElements().map((el: Node, i: number) => extractNode(el, `${path}[${i}]`, warnings, errors));
  }

  // Object literals
  if (Node.isObjectLiteralExpression(node)) {
    const result: Record<string, unknown> = {};

    for (const prop of node.getProperties()) {
      if (Node.isPropertyAssignment(prop)) {
        const propName = prop.getName();
        const propPath = path ? `${path}.${propName}` : propName;
        const initializer = prop.getInitializer();

        if (initializer) {
          result[propName] = extractNode(initializer, propPath, warnings, errors);
        }
      } else if (Node.isShorthandPropertyAssignment(prop)) {
        const propName = prop.getName();
        const propPath = path ? `${path}.${propName}` : propName;

        // Shorthand property - the value is an identifier
        warnings.push({
          path: propPath,
          issue: 'Shorthand property (external reference)',
          originalText: propName,
          placeholder: `__REF__:${propName}`,
        });
        result[propName] = `__REF__:${propName}`;
      } else if (Node.isSpreadAssignment(prop)) {
        const propPath = path ? `${path}.[spread]` : '[spread]';
        warnings.push({
          path: propPath,
          issue: 'Spread operator (cannot statically evaluate)',
          originalText: prop.getText(),
          placeholder: '__SPREAD__',
        });
        // We can't merge spread assignments at static analysis time
      }
    }

    return result;
  }

  // Regex literals
  if (Node.isRegularExpressionLiteral(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Regex literal converted to string',
      originalText: text,
      placeholder: text,
    });
    return text;
  }

  // new expressions (e.g., new Date())
  if (Node.isNewExpression(node)) {
    const text = node.getText();
    const className = node.getExpression().getText();

    if (className === 'Date') {
      warnings.push({
        path,
        issue: `Runtime constructor: ${className}`,
        originalText: text,
        placeholder: DATE_PLACEHOLDER,
      });
      return DATE_PLACEHOLDER;
    }

    warnings.push({
      path,
      issue: `Runtime constructor: ${className}`,
      originalText: text,
      placeholder: `__NEW__:${className}`,
    });
    return `__NEW__:${className}`;
  }

  // Arrow functions
  if (Node.isArrowFunction(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Arrow function (cannot be validated statically)',
      originalText: text.length > MAX_SOURCE_TEXT_LENGTH ? text.substring(0, MAX_SOURCE_TEXT_LENGTH) + '...' : text,
      placeholder: '__FUNCTION__',
    });
    return '__FUNCTION__';
  }

  // Function expressions
  if (Node.isFunctionExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Function expression (cannot be validated statically)',
      originalText: text.length > MAX_SOURCE_TEXT_LENGTH ? text.substring(0, MAX_SOURCE_TEXT_LENGTH) + '...' : text,
      placeholder: '__FUNCTION__',
    });
    return '__FUNCTION__';
  }

  // Call expressions (e.g., Math.floor(), someFunction())
  if (Node.isCallExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Function call (cannot be evaluated statically)',
      originalText: text.length > MAX_SOURCE_TEXT_LENGTH ? text.substring(0, MAX_SOURCE_TEXT_LENGTH) + '...' : text,
      placeholder: `__CALL__:${text}`,
    });
    return `__CALL__:${text}`;
  }

  // Property access (e.g., SomeEnum.Value)
  if (Node.isPropertyAccessExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Property access (enum or constant reference)',
      originalText: text,
      placeholder: `__REF__:${text}`,
    });
    return `__REF__:${text}`;
  }

  // Element access (e.g., arr[0])
  if (Node.isElementAccessExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Element access expression',
      originalText: text,
      placeholder: `__REF__:${text}`,
    });
    return `__REF__:${text}`;
  }

  // Identifiers (external variable references)
  if (Node.isIdentifier(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'External variable reference',
      originalText: text,
      placeholder: `__REF__:${text}`,
    });
    return `__REF__:${text}`;
  }

  // Template literals with substitutions
  if (Node.isTemplateExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Template literal with expressions',
      originalText: text.length > MAX_SOURCE_TEXT_LENGTH ? text.substring(0, MAX_SOURCE_TEXT_LENGTH) + '...' : text,
      placeholder: '__TEMPLATE__',
    });
    return '__TEMPLATE__';
  }

  // "as const" or type assertions
  if (Node.isAsExpression(node)) {
    return extractNode(node.getExpression(), path, warnings, errors);
  }

  // Satisfies expressions
  if (Node.isSatisfiesExpression(node)) {
    return extractNode(node.getExpression(), path, warnings, errors);
  }

  // Parenthesized expressions
  if (Node.isParenthesizedExpression(node)) {
    return extractNode(node.getExpression(), path, warnings, errors);
  }

  // Prefix unary expressions (e.g., -1, !true)
  if (Node.isPrefixUnaryExpression(node)) {
    const operator = node.getOperatorToken();
    const operand = node.getOperand();

    if (operator === SyntaxKind.MinusToken && Node.isNumericLiteral(operand)) {
      return -operand.getLiteralValue();
    }
    if (operator === SyntaxKind.ExclamationToken) {
      const value = extractNode(operand, path, warnings, errors);
      return !value;
    }

    const text = node.getText();
    warnings.push({
      path,
      issue: 'Unary expression',
      originalText: text,
      placeholder: `__EXPR__:${text}`,
    });
    return `__EXPR__:${text}`;
  }

  // Binary expressions (e.g., 1 + 2)
  if (Node.isBinaryExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Binary expression (cannot evaluate statically)',
      originalText: text,
      placeholder: `__EXPR__:${text}`,
    });
    return `__EXPR__:${text}`;
  }

  // Conditional/ternary expressions
  if (Node.isConditionalExpression(node)) {
    const text = node.getText();
    warnings.push({
      path,
      issue: 'Conditional expression (cannot evaluate statically)',
      originalText: text.length > MAX_SOURCE_TEXT_LENGTH ? text.substring(0, MAX_SOURCE_TEXT_LENGTH) + '...' : text,
      placeholder: '__CONDITIONAL__',
    });
    return '__CONDITIONAL__';
  }

  // Unknown node type - return placeholder
  const text = node.getText();
  warnings.push({
    path,
    issue: `Unknown syntax: ${SyntaxKind[node.getKind()]}`,
    originalText: text.length > MAX_SOURCE_TEXT_LENGTH ? text.substring(0, MAX_SOURCE_TEXT_LENGTH) + '...' : text,
    placeholder: `__UNKNOWN__:${SyntaxKind[node.getKind()]}`,
  });
  return `__UNKNOWN__:${SyntaxKind[node.getKind()]}`;
}

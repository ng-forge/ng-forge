import { Parser } from './parser';
import { Evaluator, EvaluationScope } from './evaluator';
import { ASTNode, ExpressionParserError } from './types';

/**
 * Cache for parsed AST nodes to improve performance
 */
const astCache = new Map<string, ASTNode>();

/**
 * Maximum cache size to prevent memory issues
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Secure expression parser that uses AST-based evaluation instead of eval() or new Function()
 *
 * This parser provides:
 * - Security: No arbitrary code execution, only whitelisted operations
 * - Performance: AST caching for repeated expressions
 * - Better errors: Clear error messages with position information
 * - Type safety: Strongly typed AST and evaluation
 */
export class ExpressionParser {
  /**
   * Parse an expression string into an AST
   * Results are cached for performance
   */
  static parse(expression: string): ASTNode {
    // Check cache first
    const cached = astCache.get(expression);
    if (cached) {
      return cached;
    }

    // Parse the expression
    const parser = new Parser(expression);
    const ast = parser.parse();

    // Cache the result (with size limit)
    if (astCache.size >= MAX_CACHE_SIZE) {
      // Simple FIFO cache eviction
      const firstKey = astCache.keys().next().value;
      if (firstKey) {
        astCache.delete(firstKey);
      }
    }
    astCache.set(expression, ast);

    return ast;
  }

  /**
   * Evaluate an expression with a given scope
   */
  static evaluate(expression: string, scope: EvaluationScope): unknown {
    try {
      const ast = this.parse(expression);
      const evaluator = new Evaluator(scope, expression);
      return evaluator.evaluate(ast);
    } catch (error) {
      if (error instanceof ExpressionParserError) {
        throw error;
      }
      // Wrap other errors for consistency
      throw new ExpressionParserError(
        `Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`,
        0,
        expression,
      );
    }
  }

  /**
   * Clear the AST cache
   */
  static clearCache(): void {
    astCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: astCache.size,
      maxSize: MAX_CACHE_SIZE,
    };
  }
}

import { Parser } from './parser';
import { Evaluator, EvaluationScope } from './evaluator';
import { ASTNode, ExpressionParserError } from './types';

/**
 * Maximum cache size to prevent memory issues
 */
const MAX_AST_CACHE_SIZE = 1000;

/**
 * LRU Cache implementation for AST nodes
 * Tracks access order to evict least-recently-used entries
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Delete if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end (most recently used)
    this.cache.set(key, value);

    // Evict least recently used if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Cache for parsed AST nodes to improve performance
 */
const astCache = new LRUCache<string, ASTNode>(MAX_AST_CACHE_SIZE);

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
   * Results are cached for performance using LRU eviction
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

    // Cache the result (LRU cache handles eviction automatically)
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
      maxSize: MAX_AST_CACHE_SIZE,
    };
  }
}

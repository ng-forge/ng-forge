/**
 * Centralized constants for the derivation system.
 *
 * These constants configure the behavior of derivation processing,
 * caching, and path handling. Centralizing them enables:
 * - Easy configuration changes
 * - Consistent values across all derivation modules
 * - Clear documentation of magic numbers
 *
 * @module
 */

/**
 * Maximum number of derivation iterations before stopping to prevent infinite loops.
 *
 * The value of 10 is chosen based on:
 * - Most derivation chains are 2-3 levels deep (A→B→C)
 * - Complex forms with conditional cascades rarely exceed 5-6 levels
 * - 10 provides headroom for bidirectional sync patterns (A↔B) which may need
 *   2 iterations per pair to stabilize
 * - Higher values delay detection of actual infinite loops
 * - Lower values risk false positives on legitimate deep chains
 *
 * If you hit this limit legitimately, consider:
 * 1. Restructuring derivations to reduce chain depth
 * 2. Using explicit `dependsOn` to control evaluation order
 * 3. Breaking complex derivations into computed signals outside the form
 */
export const MAX_DERIVATION_ITERATIONS = 10;

/**
 * Placeholder string for array index in derivation paths.
 *
 * Used in paths like `items.$.quantity` to represent "each item in the array".
 * The `$` is resolved to actual indices at runtime during array derivation processing.
 */
export const ARRAY_PLACEHOLDER = '.$.';

/**
 * Maximum size of the expression AST cache.
 *
 * Expressions are parsed into Abstract Syntax Trees (AST) once and cached
 * to avoid re-parsing on each evaluation. The cache uses LRU eviction.
 *
 * 1000 entries handles:
 * - Large forms with many derivation expressions
 * - Multiple form instances with different expressions
 * - Memory efficiency (AST nodes are relatively small)
 */
export const MAX_AST_CACHE_SIZE = 1000;

/**
 * Delimiter used to create unique derivation keys from source and target field keys.
 *
 * Uses null character (\x00) which is extremely unlikely to appear in field names,
 * avoiding collision issues that could occur with common delimiters like ':'.
 */
export const DERIVATION_KEY_DELIMITER = '\x00';

/**
 * Centralized constants for the derivation system.
 *
 * @module
 */

/** Maximum number of derivation iterations before stopping to prevent infinite loops. */
export const MAX_DERIVATION_ITERATIONS = 10;

/** Placeholder string for array index in derivation paths. */
export const ARRAY_PLACEHOLDER = '.$.';

/** Maximum size of the expression AST cache. */
export const MAX_AST_CACHE_SIZE = 1000;

/** Delimiter used to create unique derivation keys from source and target field keys. */
export const DERIVATION_KEY_DELIMITER = '\x00';

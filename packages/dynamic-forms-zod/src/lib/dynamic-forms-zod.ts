/**
 * @ng-forge/dynamic-forms-zod
 *
 * Zod schemas for validating @ng-forge/dynamic-forms configurations.
 * This package provides type-safe runtime validation for form configurations.
 *
 * @example
 * ```typescript
 * import { baseFormSchema } from '@ng-forge/dynamic-forms-zod';
 * import { materialFormSchema } from '@ng-forge/dynamic-forms-zod/material';
 *
 * // Validate a form configuration
 * const result = materialFormSchema.safeParse(formConfig);
 * if (!result.success) {
 *   console.error('Invalid form configuration:', result.error);
 * }
 * ```
 */

// Placeholder exports - actual schemas will be implemented in Phase 2
export const VERSION = '0.4.0';

/**
 * @ng-forge/dynamic-forms-zod
 *
 * Zod schemas for validating @ng-forge/dynamic-forms configurations.
 * This package provides type-safe runtime validation for form configurations.
 *
 * @example
 * ```typescript
 * import { BaseFormConfigSchema } from '@ng-forge/dynamic-forms-zod';
 * import { MatFormConfigSchema } from '@ng-forge/dynamic-forms-zod/material';
 *
 * // Validate a form configuration
 * const result = MatFormConfigSchema.safeParse(formConfig);
 * if (!result.success) {
 *   console.error('Invalid form configuration:', result.error);
 * }
 * ```
 */

export const VERSION = '0.4.0';

// Export all base schemas
export * from './schemas';

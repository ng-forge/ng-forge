/**
 * @ng-forge/dynamic-forms-zod/material
 *
 * Material Design specific Zod schemas for dynamic forms validation.
 * Includes schemas for Material field types (mat-input, mat-select, etc.)
 *
 * @example
 * ```typescript
 * import { MatFormConfigSchema } from '@ng-forge/dynamic-forms-zod/material';
 *
 * const result = MatFormConfigSchema.safeParse(formConfig);
 * if (result.success) {
 *   // Valid Material form config
 * }
 * ```
 */

export const MATERIAL_SCHEMA_VERSION = '0.4.0';

// Props schemas
export * from './props';

// Field schemas
export * from './fields';

// Composite schemas
export * from './mat-leaf-field.schema';
export * from './mat-field.schema';
export * from './mat-form-config.schema';

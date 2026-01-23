import { z } from 'zod';
import { MatFieldSchema } from './mat-field.schema';
import { createFormConfigSchema } from '../../src/lib/schemas/form/form-config.schema';
import { MatFormFieldAppearanceSchema, SubscriptSizingSchema, ThemePaletteSchema } from './props/mat-common-props.schema';

/**
 * Schema for Material form default props.
 *
 * These props are applied to all fields in the form unless overridden.
 */
export const MatFormDefaultPropsSchema = z.object({
  /**
   * Default form field appearance for all fields.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * Default subscript sizing for all fields.
   */
  subscriptSizing: SubscriptSizingSchema.optional(),

  /**
   * Default color theme for all fields.
   */
  color: ThemePaletteSchema.optional(),
});

/**
 * Schema for complete Material form configuration.
 *
 * This is the main schema for validating Material form configurations.
 * Use this to validate JSON configs before passing to the form builder.
 *
 * @example
 * ```typescript
 * import { MatFormConfigSchema } from '@ng-forge/dynamic-forms-zod/material';
 *
 * const config = {
 *   fields: [
 *     { key: 'email', type: 'input', label: 'Email', required: true },
 *     { key: 'password', type: 'input', label: 'Password', props: { type: 'password' } },
 *   ],
 *   defaultProps: {
 *     appearance: 'outline',
 *   },
 * };
 *
 * const result = MatFormConfigSchema.safeParse(config);
 * if (result.success) {
 *   // Use result.data with form builder
 * } else {
 *   console.error(result.error.format());
 * }
 * ```
 */
export const MatFormConfigSchema = createFormConfigSchema(MatFieldSchema, MatFormDefaultPropsSchema);

/**
 * Inferred type for Material form configuration.
 */
export type MatFormConfigSchemaType = z.infer<typeof MatFormConfigSchema>;

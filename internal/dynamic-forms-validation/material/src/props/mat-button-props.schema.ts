import { z } from 'zod';
import { ThemePaletteSchema } from './mat-common-props.schema';

/**
 * Button type options.
 */
export const ButtonTypeSchema = z.enum(['button', 'submit', 'reset']);

/**
 * Props schema for Material button field.
 *
 * Original interface:
 * ```typescript
 * interface MatButtonProps {
 *   color?: 'primary' | 'accent' | 'warn';
 *   type?: 'button' | 'submit' | 'reset';
 * }
 * ```
 */
export const MatButtonPropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * HTML button type.
   */
  type: ButtonTypeSchema.optional(),
});

export type MatButtonPropsSchemaType = z.infer<typeof MatButtonPropsSchema>;

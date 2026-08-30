import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { ThemePaletteSchema, LabelPositionSchema } from './mat-common-props.schema';

/**
 * Props schema for Material checkbox field.
 *
 * Original interface:
 * ```typescript
 * interface MatCheckboxProps {
 *   color?: ThemePalette;
 *   disableRipple?: boolean;
 *   labelPosition?: 'before' | 'after';
 *   hint?: DynamicText;
 *   indeterminate?: boolean;
 * }
 * ```
 */
export const MatCheckboxPropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),

  /**
   * Position of the label relative to the checkbox.
   */
  labelPosition: LabelPositionSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),

  /**
   * Whether the checkbox is in indeterminate state.
   */
  indeterminate: z.boolean().optional(),
});

export type MatCheckboxPropsSchemaType = z.infer<typeof MatCheckboxPropsSchema>;

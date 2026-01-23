import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { ThemePaletteSchema, LabelPositionSchema } from './mat-common-props.schema';

/**
 * Props schema for Material multi-checkbox field.
 *
 * Original interface:
 * ```typescript
 * interface MatMultiCheckboxProps {
 *   disableRipple?: boolean;
 *   tabIndex?: number;
 *   hint?: DynamicText;
 *   labelPosition?: 'before' | 'after';
 *   color?: ThemePalette;
 * }
 * ```
 */
export const MatMultiCheckboxPropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),

  /**
   * Tab index for keyboard navigation.
   */
  tabIndex: z.number().optional(),

  /**
   * Position of the labels relative to the checkboxes.
   */
  labelPosition: LabelPositionSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),
});

export type MatMultiCheckboxPropsSchemaType = z.infer<typeof MatMultiCheckboxPropsSchema>;

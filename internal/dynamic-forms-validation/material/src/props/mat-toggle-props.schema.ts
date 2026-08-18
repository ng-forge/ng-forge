import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { ThemePaletteSchema, LabelPositionSchema, MatFormFieldAppearanceSchema } from './mat-common-props.schema';

/**
 * Props schema for Material toggle (slide toggle) field.
 *
 * Original interface:
 * ```typescript
 * interface MatToggleProps {
 *   hint?: DynamicText;
 *   appearance?: MatFormFieldAppearance;
 *   color?: ThemePalette;
 *   labelPosition?: 'before' | 'after';
 *   disableRipple?: boolean;
 *   hideIcon?: boolean;
 * }
 * ```
 */
export const MatTogglePropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),

  /**
   * Position of the label relative to the toggle.
   */
  labelPosition: LabelPositionSchema.optional(),

  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),

  /**
   * Whether to hide the icon inside the toggle.
   */
  hideIcon: z.boolean().optional(),
});

export type MatTogglePropsSchemaType = z.infer<typeof MatTogglePropsSchema>;

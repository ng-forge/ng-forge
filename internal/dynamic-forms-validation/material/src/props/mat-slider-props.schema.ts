import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { ThemePaletteSchema, MatFormFieldAppearanceSchema } from './mat-common-props.schema';

/**
 * Props schema for Material slider field.
 *
 * Original interface:
 * ```typescript
 * interface MatSliderProps {
 *   hint?: DynamicText;
 *   color?: 'primary' | 'accent' | 'warn';
 *   appearance?: MatFormFieldAppearance;
 *   thumbLabel?: boolean;
 *   showThumbLabel?: boolean;
 *   tickInterval?: number | 'auto';
 *   step?: number;
 * }
 * ```
 */
export const MatSliderPropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),

  /**
   * Whether to display the thumb label.
   * @deprecated Use showThumbLabel instead
   */
  thumbLabel: z.boolean().optional(),

  /**
   * Whether to show the thumb label with the current value.
   */
  showThumbLabel: z.boolean().optional(),

  /**
   * Interval for tick marks. 'auto' spaces them automatically.
   */
  tickInterval: z.union([z.number().positive(), z.literal('auto')]).optional(),

  /**
   * Step increment for the slider.
   */
  step: z.number().positive().optional(),
});

export type MatSliderPropsSchemaType = z.infer<typeof MatSliderPropsSchema>;

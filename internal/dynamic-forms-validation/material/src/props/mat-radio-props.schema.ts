import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { ThemePaletteSchema, LabelPositionSchema } from './mat-common-props.schema';

/**
 * Props schema for Material radio field.
 *
 * Original interface:
 * ```typescript
 * interface MatRadioProps {
 *   disableRipple?: boolean;
 *   color?: ThemePalette;
 *   labelPosition?: 'before' | 'after';
 *   hint?: DynamicText;
 * }
 * ```
 */
export const MatRadioPropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),

  /**
   * Position of the label relative to the radio button.
   */
  labelPosition: LabelPositionSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),
});

export type MatRadioPropsSchemaType = z.infer<typeof MatRadioPropsSchema>;

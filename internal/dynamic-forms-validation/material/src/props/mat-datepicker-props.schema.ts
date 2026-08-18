import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { ThemePaletteSchema, MatFormFieldAppearanceSchema, SubscriptSizingSchema } from './mat-common-props.schema';

/**
 * Datepicker start view options.
 */
export const DatepickerStartViewSchema = z.enum(['month', 'year', 'multi-year']);

/**
 * Props schema for Material datepicker field.
 *
 * Original interface:
 * ```typescript
 * interface MatDatepickerProps extends DatepickerProps {
 *   appearance?: MatFormFieldAppearance;
 *   color?: 'primary' | 'accent' | 'warn';
 *   disableRipple?: boolean;
 *   subscriptSizing?: SubscriptSizing;
 *   startView?: 'month' | 'year' | 'multi-year';
 *   touchUi?: boolean;
 *   hint?: DynamicText;
 * }
 * ```
 */
export const MatDatepickerPropsSchema = z.object({
  /**
   * Placeholder text for the datepicker input.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),

  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),

  /**
   * How to size the subscript (hint/error area).
   */
  subscriptSizing: SubscriptSizingSchema.optional(),

  /**
   * Initial view when the calendar opens.
   */
  startView: DatepickerStartViewSchema.optional(),

  /**
   * Whether to use touch-friendly UI mode.
   */
  touchUi: z.boolean().optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),
});

export type MatDatepickerPropsSchemaType = z.infer<typeof MatDatepickerPropsSchema>;

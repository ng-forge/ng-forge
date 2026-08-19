import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatFormFieldAppearanceSchema, SubscriptSizingSchema } from './mat-common-props.schema';

/**
 * Resize options for textarea.
 */
export const TextareaResizeSchema = z.enum(['none', 'both', 'horizontal', 'vertical']);

/**
 * Props schema for Material textarea field.
 *
 * Original interface:
 * ```typescript
 * interface MatTextareaProps extends TextareaProps {
 *   hint?: DynamicText;
 *   appearance?: MatFormFieldAppearance;
 *   subscriptSizing?: SubscriptSizing;
 *   rows?: number;
 *   cols?: number;
 *   resize?: 'none' | 'both' | 'horizontal' | 'vertical';
 *   maxLength?: number;
 * }
 * ```
 */
export const MatTextareaPropsSchema = z.object({
  /**
   * Placeholder text for the textarea.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Number of visible text rows.
   */
  rows: z.number().positive().optional(),

  /**
   * Number of visible text columns.
   */
  cols: z.number().positive().optional(),

  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * How to size the subscript (hint/error area).
   */
  subscriptSizing: SubscriptSizingSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),

  /**
   * How the textarea can be resized.
   */
  resize: TextareaResizeSchema.optional(),

  /**
   * Maximum character length.
   */
  maxLength: z.number().positive().optional(),
});

export type MatTextareaPropsSchemaType = z.infer<typeof MatTextareaPropsSchema>;

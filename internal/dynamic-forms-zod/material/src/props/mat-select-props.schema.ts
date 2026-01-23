import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatFormFieldAppearanceSchema, SubscriptSizingSchema } from './mat-common-props.schema';

/**
 * Props schema for Material select field.
 *
 * Original interface:
 * ```typescript
 * interface MatSelectProps extends SelectProps {
 *   appearance?: MatFormFieldAppearance;
 *   multiple?: boolean;
 *   panelMaxHeight?: string;
 *   subscriptSizing?: SubscriptSizing;
 *   compareWith?: (o1: ValueType, o2: ValueType) => boolean;
 *   hint?: DynamicText;
 * }
 * ```
 *
 * Note: compareWith is a function and cannot be serialized to JSON.
 */
export const MatSelectPropsSchema = z.object({
  /**
   * Placeholder text for the select.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * Whether to allow multiple selections.
   */
  multiple: z.boolean().optional(),

  /**
   * Maximum height of the select panel (CSS value).
   */
  panelMaxHeight: z.string().optional(),

  /**
   * How to size the subscript (hint/error area).
   */
  subscriptSizing: SubscriptSizingSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),

  /**
   * Note: compareWith function must be provided at runtime.
   * It cannot be serialized in JSON configurations.
   */
});

export type MatSelectPropsSchemaType = z.infer<typeof MatSelectPropsSchema>;

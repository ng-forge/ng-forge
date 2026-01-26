import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatFormFieldAppearanceSchema, SubscriptSizingSchema } from './mat-common-props.schema';

/**
 * Input type options for Material input field.
 */
export const MatInputTypeSchema = z.enum(['text', 'email', 'password', 'number', 'tel', 'url', 'search']);

export type MatInputType = z.infer<typeof MatInputTypeSchema>;

/**
 * Props schema for Material input field.
 *
 * Original interface:
 * ```typescript
 * interface MatInputProps extends InputProps {
 *   appearance?: MatFormFieldAppearance;
 *   disableRipple?: boolean;
 *   subscriptSizing?: SubscriptSizing;
 *   type?: InputType;
 *   hint?: DynamicText;
 * }
 * ```
 */
export const MatInputPropsSchema = z.object({
  /**
   * HTML input type.
   */
  type: MatInputTypeSchema.optional(),

  /**
   * Placeholder text for the input.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),

  /**
   * How to size the subscript (hint/error area).
   */
  subscriptSizing: SubscriptSizingSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),
});

export type MatInputPropsSchemaType = z.infer<typeof MatInputPropsSchema>;

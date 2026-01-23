import { z } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';
import { LogicArraySchema } from '../logic/logic-config.schema';

/**
 * Element types for text display fields.
 */
export const TextElementTypeSchema = z.enum(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span']);

export type TextElementType = z.infer<typeof TextElementTypeSchema>;

/**
 * Props schema for TextField.
 */
export const TextPropsSchema = z.object({
  /**
   * HTML element type to render the text.
   */
  elementType: TextElementTypeSchema,
});

/**
 * Schema for TextField - display-only text content.
 *
 * Original interface:
 * ```typescript
 * interface TextField extends FieldDef<TextProps> {
 *   type: 'text';
 *   readonly logic?: LogicConfig[];
 * }
 * ```
 *
 * TextFields display translatable text content and are not user-editable.
 */
export const TextFieldSchema = BaseFieldDefSchema.extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('text'),

  /**
   * Text-specific properties.
   */
  props: TextPropsSchema.optional(),

  /**
   * Logic rules (supports conditional visibility).
   */
  logic: LogicArraySchema.optional(),
});

/**
 * Inferred type for TextField.
 */
export type TextFieldSchemaType = z.infer<typeof TextFieldSchema>;

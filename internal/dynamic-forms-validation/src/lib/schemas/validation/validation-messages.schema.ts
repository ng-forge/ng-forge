import { z } from 'zod';
import { DynamicTextSchema } from '../common/dynamic-text.schema';

/**
 * Schema for validation messages configuration.
 *
 * Original interface:
 * ```typescript
 * interface ValidationMessages {
 *   required?: DynamicText;
 *   email?: DynamicText;
 *   min?: DynamicText;
 *   max?: DynamicText;
 *   minLength?: DynamicText;
 *   maxLength?: DynamicText;
 *   pattern?: DynamicText;
 *   [key: string]: DynamicText | undefined;
 * }
 * ```
 *
 * Supports both built-in error keys and custom error keys.
 */
export const ValidationMessagesSchema = z
  .object({
    required: DynamicTextSchema.optional(),
    email: DynamicTextSchema.optional(),
    min: DynamicTextSchema.optional(),
    max: DynamicTextSchema.optional(),
    minLength: DynamicTextSchema.optional(),
    maxLength: DynamicTextSchema.optional(),
    pattern: DynamicTextSchema.optional(),
  })
  .catchall(DynamicTextSchema.optional());

/**
 * Inferred type for validation messages.
 */
export type ValidationMessagesSchemaType = z.infer<typeof ValidationMessagesSchema>;

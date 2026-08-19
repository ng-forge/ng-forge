import { z } from 'zod';
import { DynamicTextSchema } from './dynamic-text.schema';

/**
 * Schema for FieldOption<T> used in select, radio, and multi-checkbox fields.
 *
 * Original interface:
 * ```typescript
 * interface FieldOption<T = unknown> {
 *   label: DynamicText;
 *   value: T;
 *   disabled?: boolean;
 *   [key: string]: unknown; // Additional custom properties
 * }
 * ```
 */
export const FieldOptionSchema = z
  .object({
    /**
     * Display text for the option.
     */
    label: DynamicTextSchema,

    /**
     * The actual value stored when this option is selected.
     * Can be any JSON-serializable value.
     */
    value: z.unknown(),

    /**
     * Whether this option is disabled and cannot be selected.
     */
    disabled: z.boolean().optional(),
  })
  .passthrough(); // Allow additional custom properties

/**
 * Schema for an array of field options.
 */
export const FieldOptionsSchema = z.array(FieldOptionSchema);

/**
 * Inferred type for a single field option.
 */
export type FieldOptionSchemaType = z.infer<typeof FieldOptionSchema>;

/**
 * Inferred type for an array of field options.
 */
export type FieldOptionsSchemaType = z.infer<typeof FieldOptionsSchema>;

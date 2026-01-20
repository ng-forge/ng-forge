import { z } from 'zod';

/**
 * Schema for FieldMeta - allows arbitrary HTML attributes.
 *
 * Original interface:
 * ```typescript
 * interface FieldMeta {
 *   [key: `data-${string}`]: string | undefined;
 *   [key: `aria-${string}`]: string | boolean | undefined;
 *   [key: string]: string | number | boolean | undefined;
 * }
 * ```
 *
 * This schema uses passthrough to allow any key-value pairs,
 * as the original type accepts arbitrary attributes like:
 * - data-* attributes for testing
 * - aria-* attributes for accessibility
 * - Other HTML attributes (autocomplete, inputmode, spellcheck, etc.)
 */
export const FieldMetaSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.undefined()]));

/**
 * Inferred type for FieldMeta schema.
 */
export type FieldMetaSchemaType = z.infer<typeof FieldMetaSchema>;

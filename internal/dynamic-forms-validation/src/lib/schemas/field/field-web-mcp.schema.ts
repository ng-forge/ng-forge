import { z } from 'zod';

/**
 * Schema for a field's per-field WebMCP exposure policy.
 *
 * Original interface:
 * ```typescript
 * interface FieldWebMcpOptions {
 *   readable?: boolean;
 *   writable?: boolean;
 * }
 *
 * type FieldWebMcpConfig = FieldWebMcpOptions | false;
 * ```
 */
export const FieldWebMcpOptionsSchema = z.object({
  /**
   * Whether an agent may see this field's value in a tool response.
   *
   * Defaults to true, except for a `hidden` field type or an input whose
   * `props.type` is `'password'`. A withheld value is replaced by a marker
   * rather than dropped, so the agent still knows the field exists.
   */
  readable: z.boolean().optional(),

  /**
   * Whether an agent may write this field.
   *
   * Defaults to true, except for a `hidden` field type, a field with a
   * `derivation`, or one that is `readonly`.
   */
  writable: z.boolean().optional(),
});

/**
 * A field's WebMCP policy: either an override of one or both axes, or `false`
 * to hide the field from agents entirely.
 */
export const FieldWebMcpConfigSchema = z.union([FieldWebMcpOptionsSchema, z.literal(false)]);

/**
 * Inferred type for the per-field WebMCP policy.
 */
export type FieldWebMcpConfigSchemaType = z.infer<typeof FieldWebMcpConfigSchema>;

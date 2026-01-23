import { z } from 'zod';

/**
 * Schema for DynamicText in JSON configurations.
 *
 * In the runtime library, DynamicText can be:
 * - string | Observable<string> | Signal<string>
 *
 * However, for JSON-serializable configurations (MCP/LLM use cases),
 * only string values are supported. Observable and Signal types
 * cannot be serialized to JSON.
 */
export const DynamicTextSchema = z.string();

/**
 * Inferred type for DynamicText schema - always a string in JSON configs.
 */
export type DynamicTextSchemaType = z.infer<typeof DynamicTextSchema>;

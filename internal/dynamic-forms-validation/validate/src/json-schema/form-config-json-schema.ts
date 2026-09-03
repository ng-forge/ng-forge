import { z } from 'zod';

// Import form config schemas from each UI integration
import { MatFormConfigSchema } from '../../../material/src';
import { BsFormConfigSchema } from '../../../bootstrap/src';
import { PrimeFormConfigSchema } from '../../../primeng/src';
import { IonicFormConfigSchema } from '../../../ionic/src';

/**
 * Supported UI integrations for form config schemas.
 */
export type UiIntegration = 'material' | 'bootstrap' | 'primeng' | 'ionic';

/**
 * Map of UI integration to form config schema.
 */
const formConfigSchemas: Record<UiIntegration, z.ZodType> = {
  material: MatFormConfigSchema,
  bootstrap: BsFormConfigSchema,
  primeng: PrimeFormConfigSchema,
  ionic: IonicFormConfigSchema,
};

/**
 * Render a zod schema as JSON Schema.
 *
 * `draft-7` is deliberate: it names the shared subschema bucket `definitions`,
 * which is the key the previous generator emitted, so consumers reading that
 * bucket keep working. The field schemas are recursive (a container holds an
 * array of the same field schema), so the recursive part is necessarily emitted
 * as a `$ref` into that bucket. Nothing can inline a cycle.
 *
 * `io: 'input'` because these schemas answer "what may I write?" — an agent
 * authoring a config — rather than describing post-parse output.
 *
 * `unrepresentable: 'any'` keeps the previous generator's leniency. A few types
 * have no JSON Schema equivalent — `FieldMeta` permits an explicit `undefined`
 * value — and zod would otherwise refuse to emit anything at all. The purpose
 * of this output is to describe the config shape to a model, so rendering those
 * few spots as unconstrained beats emitting no schema.
 */
export function toJsonSchema(schema: z.ZodType, name: string, basePath?: string): JsonSchemaType {
  const jsonSchema = z.toJSONSchema(schema, { target: 'draft-7', io: 'input', unrepresentable: 'any' }) as JsonSchemaType;

  jsonSchema['$id'] = basePath ? `${basePath.replace(/\/$/, '')}/${name}` : name;

  return jsonSchema;
}

/**
 * Options for JSON Schema generation.
 */
export interface JsonSchemaOptions {
  /**
   * Name for the schema (used in $id).
   */
  name?: string;

  /**
   * Base URI for $ref resolution.
   */
  basePath?: string;
}

/**
 * JSON Schema type (simplified for export).
 */
export type JsonSchemaType = Record<string, unknown>;

/**
 * Get the JSON Schema for a form configuration.
 *
 * @param uiIntegration - The UI framework integration to use
 * @param options - Optional JSON Schema generation options
 * @returns JSON Schema for the form configuration
 *
 * @example
 * ```typescript
 * const jsonSchema = getFormConfigJsonSchema('material');
 * // Use in MCP tool definition or LLM prompts
 * ```
 */
export function getFormConfigJsonSchema(uiIntegration: UiIntegration, options: JsonSchemaOptions = {}): JsonSchemaType {
  const schema = formConfigSchemas[uiIntegration];

  if (!schema) {
    throw new Error(`Unknown UI integration: ${uiIntegration}. Valid options: material, bootstrap, primeng, ionic`);
  }

  return toJsonSchema(schema, options.name ?? `${uiIntegration}FormConfig`, options.basePath);
}

/**
 * Get JSON Schemas for all supported UI integrations.
 *
 * @param options - Optional JSON Schema generation options
 * @returns Map of UI integration to JSON Schema
 */
export function getAllFormConfigJsonSchemas(options: JsonSchemaOptions = {}): Record<UiIntegration, JsonSchemaType> {
  return {
    material: getFormConfigJsonSchema('material', options),
    bootstrap: getFormConfigJsonSchema('bootstrap', options),
    primeng: getFormConfigJsonSchema('primeng', options),
    ionic: getFormConfigJsonSchema('ionic', options),
  };
}

import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

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

  const { name, basePath } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = (zodToJsonSchema as any)(schema, {
    name: name ?? `${uiIntegration}FormConfig`,
    basePath: basePath ? basePath.split('/') : undefined,
    $refStrategy: 'none', // Inline all definitions for MCP compatibility
    errorMessages: true,
  });

  return jsonSchema as JsonSchemaType;
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

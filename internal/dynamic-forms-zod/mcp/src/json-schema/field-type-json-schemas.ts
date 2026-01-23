import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

// Import leaf field schemas from each UI integration
import { MatLeafFieldSchema } from '../../../material/src';
import { BsLeafFieldSchema } from '../../../bootstrap/src';
import { PrimeLeafFieldSchema } from '../../../primeng/src';
import { IonicLeafFieldSchema } from '../../../ionic/src';

import type { UiIntegration, JsonSchemaType } from './form-config-json-schema';

/**
 * Map of UI integration to leaf field schema.
 */
const leafFieldSchemas: Record<UiIntegration, z.ZodType> = {
  material: MatLeafFieldSchema,
  bootstrap: BsLeafFieldSchema,
  primeng: PrimeLeafFieldSchema,
  ionic: IonicLeafFieldSchema,
};

/**
 * Get the JSON Schema for leaf fields of a UI integration.
 *
 * @param uiIntegration - The UI framework integration
 * @returns JSON Schema for the leaf field types
 *
 * @example
 * ```typescript
 * const fieldSchema = getLeafFieldJsonSchema('material');
 * // Use to validate individual field definitions
 * ```
 */
export function getLeafFieldJsonSchema(uiIntegration: UiIntegration): JsonSchemaType {
  const schema = leafFieldSchemas[uiIntegration];

  if (!schema) {
    throw new Error(`Unknown UI integration: ${uiIntegration}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = (zodToJsonSchema as any)(schema, {
    name: `${uiIntegration}LeafField`,
    $refStrategy: 'none',
    errorMessages: true,
  });

  return jsonSchema as JsonSchemaType;
}

/**
 * Get JSON Schemas for leaf fields of all UI integrations.
 *
 * @returns Map of UI integration to leaf field JSON Schema
 */
export function getAllLeafFieldJsonSchemas(): Record<UiIntegration, JsonSchemaType> {
  return {
    material: getLeafFieldJsonSchema('material'),
    bootstrap: getLeafFieldJsonSchema('bootstrap'),
    primeng: getLeafFieldJsonSchema('primeng'),
    ionic: getLeafFieldJsonSchema('ionic'),
  };
}

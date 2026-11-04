import type { OpenAPIV3 } from 'openapi-types';
import type { SchemaObject } from '../parser/schema-walker.js';

export function isReferenceObject(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}

/** Binary file content (`format: binary`) has no field type in this release (issue #485). */
export function isBinarySchema(schema: unknown): boolean {
  return typeof schema === 'object' && schema !== null && (schema as Record<string, unknown>)['format'] === 'binary';
}

/** Object schema whose keys are all dynamic: no fixed `properties`, only additionalProperties/patternProperties. */
export function hasOnlyDynamicKeys(schema: SchemaObject): boolean {
  const s = schema as Record<string, unknown>;
  if (Object.keys(schema.properties ?? {}).length > 0 || s['allOf'] || s['oneOf'] || s['anyOf']) {
    return false;
  }
  const patternProperties = s['patternProperties'] as Record<string, unknown> | undefined;
  const additionalProperties = s['additionalProperties'];
  return Object.keys(patternProperties ?? {}).length > 0 || (additionalProperties !== undefined && additionalProperties !== false);
}

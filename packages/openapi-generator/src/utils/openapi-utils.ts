import type { OpenAPIV3 } from 'openapi-types';

export function isReferenceObject(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}

/** Binary file content (`format: binary`) has no field type in this release (issue #485). */
export function isBinarySchema(schema: unknown): boolean {
  return typeof schema === 'object' && schema !== null && (schema as Record<string, unknown>)['format'] === 'binary';
}

import type { OpenAPIV3 } from 'openapi-types';

export function isReferenceObject(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}

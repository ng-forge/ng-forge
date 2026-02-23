import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

export type OpenAPISpec = OpenAPIV3.Document | OpenAPIV3_1.Document;

export async function parseOpenAPISpec(specPath: string): Promise<OpenAPISpec> {
  const api = await SwaggerParser.dereference(specPath);
  if (!isOpenAPIV3(api)) {
    throw new Error('Only OpenAPI 3.x specifications are supported');
  }
  return api;
}

function isOpenAPIV3(api: OpenAPI.Document): api is OpenAPISpec {
  return 'openapi' in api && (api as OpenAPISpec).openapi.startsWith('3.');
}

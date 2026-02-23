import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import type { OpenAPISpec } from './openapi-parser.js';

export interface EndpointInfo {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  requestBodySchema?: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
  responseSchema?: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
  requiredFields: string[];
}

const SUPPORTED_METHODS = ['get', 'post', 'put', 'patch'] as const;

export function extractEndpoints(spec: OpenAPISpec): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem) continue;

    for (const method of SUPPORTED_METHODS) {
      const operation = (pathItem as Record<string, unknown>)[method] as OpenAPIV3.OperationObject | undefined;
      if (!operation) continue;

      const endpoint: EndpointInfo = {
        method: method.toUpperCase(),
        path,
        operationId: operation.operationId,
        summary: operation.summary,
        requiredFields: [],
      };

      // Extract request body schema (for POST/PUT/PATCH)
      if (operation.requestBody && 'content' in operation.requestBody) {
        const content = operation.requestBody.content;
        const jsonContent = content['application/json'];
        if (jsonContent?.schema && !isReferenceObject(jsonContent.schema)) {
          endpoint.requestBodySchema = jsonContent.schema;
          endpoint.requiredFields = jsonContent.schema.required ?? [];
        }
      }

      // Extract response schema (for GET — used for editable forms)
      if (method === 'get') {
        const responses = operation.responses;
        const successResponse = responses?.['200'] ?? responses?.['201'];
        if (successResponse && 'content' in successResponse) {
          const content = successResponse.content;
          const jsonContent = content?.['application/json'];
          if (jsonContent?.schema && !isReferenceObject(jsonContent.schema)) {
            endpoint.responseSchema = jsonContent.schema;
            endpoint.requiredFields = jsonContent.schema.required ?? [];
          }
        }
      }

      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function isReferenceObject(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}

export function formatEndpointLabel(endpoint: EndpointInfo): string {
  const label = `${endpoint.method} ${endpoint.path}`;
  return endpoint.summary ? `${label} — ${endpoint.summary}` : label;
}

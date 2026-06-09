import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import type { OpenAPISpec } from './openapi-parser.js';
import { isReferenceObject } from '../utils/openapi-utils.js';

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

// Request body content types in preference order. JSON wins when both are
// declared; multipart/urlencoded bodies map to forms the same way (issue #485).
const REQUEST_BODY_CONTENT_TYPES = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'] as const;

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
        for (const contentType of REQUEST_BODY_CONTENT_TYPES) {
          const mediaContent = content[contentType];
          if (mediaContent?.schema && !isReferenceObject(mediaContent.schema)) {
            endpoint.requestBodySchema = mediaContent.schema;
            endpoint.requiredFields = mediaContent.schema.required ?? [];
            break;
          }
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

export function formatEndpointLabel(endpoint: EndpointInfo): string {
  const label = `${endpoint.method} ${endpoint.path}`;
  return endpoint.summary ? `${label} — ${endpoint.summary}` : label;
}

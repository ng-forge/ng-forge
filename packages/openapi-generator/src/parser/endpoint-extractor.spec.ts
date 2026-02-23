import type { OpenAPIV3 } from 'openapi-types';
import { extractEndpoints, formatEndpointLabel } from './endpoint-extractor.js';
import type { OpenAPISpec } from './openapi-parser.js';

function createSpec(paths: OpenAPIV3.PathsObject): OpenAPISpec {
  return {
    openapi: '3.0.3',
    info: { title: 'Test', version: '1.0.0' },
    paths,
  };
}

describe('extractEndpoints', () => {
  it('should extract POST endpoint with request body schema', () => {
    const spec = createSpec({
      '/pets': {
        post: {
          operationId: 'createPet',
          summary: 'Create a pet',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', maxLength: 100 },
                    age: { type: 'integer', minimum: 0 },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
    });

    const endpoints = extractEndpoints(spec);

    expect(endpoints).toHaveLength(1);
    expect(endpoints[0].method).toBe('POST');
    expect(endpoints[0].path).toBe('/pets');
    expect(endpoints[0].operationId).toBe('createPet');
    expect(endpoints[0].summary).toBe('Create a pet');
    expect(endpoints[0].requiredFields).toEqual(['name']);
    expect(endpoints[0].requestBodySchema).toBeDefined();
    expect(endpoints[0].requestBodySchema?.properties).toHaveProperty('name');
  });

  it('should extract GET endpoint with response schema', () => {
    const spec = createSpec({
      '/pets/{id}': {
        get: {
          operationId: 'getPet',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id', 'name'],
                    properties: {
                      id: { type: 'integer' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const endpoints = extractEndpoints(spec);

    expect(endpoints).toHaveLength(1);
    expect(endpoints[0].method).toBe('GET');
    expect(endpoints[0].responseSchema).toBeDefined();
    expect(endpoints[0].requiredFields).toEqual(['id', 'name']);
  });

  it('should extract PUT and PATCH endpoints', () => {
    const spec = createSpec({
      '/pets/{id}': {
        put: {
          operationId: 'replacePet',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { name: { type: 'string' } } },
              },
            },
          },
          responses: { '200': { description: 'Updated' } },
        },
        patch: {
          operationId: 'updatePet',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { name: { type: 'string' } } },
              },
            },
          },
          responses: { '200': { description: 'Updated' } },
        },
      },
    });

    const endpoints = extractEndpoints(spec);

    expect(endpoints).toHaveLength(2);
    expect(endpoints.map((e) => e.method)).toEqual(['PUT', 'PATCH']);
  });

  it('should skip DELETE and other unsupported methods', () => {
    const spec = createSpec({
      '/pets/{id}': {
        delete: {
          operationId: 'deletePet',
          responses: { '204': { description: 'Deleted' } },
        },
      } as OpenAPIV3.PathItemObject,
    });

    const endpoints = extractEndpoints(spec);

    expect(endpoints).toHaveLength(0);
  });

  it('should handle multiple paths', () => {
    const spec = createSpec({
      '/pets': {
        get: {
          operationId: 'listPets',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/owners': {
        post: {
          operationId: 'createOwner',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { name: { type: 'string' } } },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
    });

    const endpoints = extractEndpoints(spec);

    expect(endpoints).toHaveLength(2);
    expect(endpoints[0].path).toBe('/pets');
    expect(endpoints[1].path).toBe('/owners');
  });

  it('should handle spec with empty paths', () => {
    const spec = createSpec({});

    expect(extractEndpoints(spec)).toEqual([]);
  });

  it('should handle GET with 201 response', () => {
    const spec = createSpec({
      '/pets': {
        get: {
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { id: { type: 'integer' } } },
                },
              },
            },
          },
        },
      },
    });

    const endpoints = extractEndpoints(spec);
    expect(endpoints[0].responseSchema).toBeDefined();
  });
});

describe('formatEndpointLabel', () => {
  it('should format with summary', () => {
    const label = formatEndpointLabel({
      method: 'POST',
      path: '/pets',
      summary: 'Create a pet',
      requiredFields: [],
    });

    expect(label).toBe('POST /pets — Create a pet');
  });

  it('should format without summary', () => {
    const label = formatEndpointLabel({
      method: 'GET',
      path: '/pets/{id}',
      requiredFields: [],
    });

    expect(label).toBe('GET /pets/{id}');
  });
});

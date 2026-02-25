import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';
import { parseOpenAPISpec } from './openapi-parser.js';

vi.mock('@apidevtools/swagger-parser', () => ({
  default: {
    dereference: vi.fn(),
  },
}));

const validSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {},
};

describe('parseOpenAPISpec', () => {
  it('should parse a valid OpenAPI 3.0 spec', async () => {
    vi.mocked(SwaggerParser.dereference).mockResolvedValue(validSpec);

    const result = await parseOpenAPISpec('test.yaml');

    expect(result).toBe(validSpec);
    expect(SwaggerParser.dereference).toHaveBeenCalledWith('test.yaml');
  });

  it('should parse a valid OpenAPI 3.1 spec', async () => {
    const spec31 = { ...validSpec, openapi: '3.1.0' };
    vi.mocked(SwaggerParser.dereference).mockResolvedValue(spec31);

    const result = await parseOpenAPISpec('test.yaml');

    expect(result.openapi).toBe('3.1.0');
  });

  it('should reject a Swagger 2.0 spec', async () => {
    const swagger2 = { swagger: '2.0', info: { title: 'Old', version: '1.0' }, paths: {} };
    vi.mocked(SwaggerParser.dereference).mockResolvedValue(swagger2 as unknown as OpenAPIV3.Document);

    await expect(parseOpenAPISpec('old.yaml')).rejects.toThrow('Only OpenAPI 3.x specifications are supported');
  });

  it('should propagate parser errors', async () => {
    vi.mocked(SwaggerParser.dereference).mockRejectedValue(new Error('File not found'));

    await expect(parseOpenAPISpec('missing.yaml')).rejects.toThrow('File not found');
  });
});

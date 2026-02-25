// Public API - Library exports for programmatic use
export { parseOpenAPISpec } from './parser/openapi-parser.js';
export type { OpenAPISpec } from './parser/openapi-parser.js';

export { extractEndpoints, formatEndpointLabel } from './parser/endpoint-extractor.js';
export type { EndpointInfo } from './parser/endpoint-extractor.js';

export { walkSchema } from './parser/schema-walker.js';
export type { WalkedProperty, WalkedSchema, SchemaObject } from './parser/schema-walker.js';

export { mapSchemaToFieldType } from './mapper/type-mapping.js';
export type { FieldTypeResult } from './mapper/type-mapping.js';

export { mapSchemaToValidators } from './mapper/validator-mapping.js';
export type { ValidatorConfig } from './mapper/validator-mapping.js';

export { mapSchemaToFields } from './mapper/schema-to-fields.js';
export type { FieldConfig, MappingResult, MappingOptions, AmbiguousField } from './mapper/schema-to-fields.js';

export { generateFormConfig } from './generator/form-config-generator.js';
export type { FormConfigGeneratorOptions } from './generator/form-config-generator.js';

export { generateInterface } from './generator/interface-generator.js';
export type { InterfaceGeneratorOptions } from './generator/interface-generator.js';

export { generateBarrel } from './generator/barrel-generator.js';

export { writeGeneratedFiles } from './generator/file-writer.js';
export type { GeneratedFile, WriteOptions } from './generator/file-writer.js';

export { loadConfig, saveConfig } from './config/generator-config.js';
export type { GeneratorConfig } from './config/generator-config.js';

export { isReferenceObject } from './utils/openapi-utils.js';

export { run } from './cli/cli.js';

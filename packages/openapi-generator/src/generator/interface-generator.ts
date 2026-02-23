import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { toInterfaceName, toPascalCase } from '../utils/naming.js';

type SchemaObject = OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

export interface InterfaceGeneratorOptions {
  method: string;
  path: string;
  operationId?: string;
}

export function generateInterface(schema: SchemaObject, options: InterfaceGeneratorOptions): string {
  const interfaceName = toInterfaceName(options.method, options.path, options.operationId);
  const lines: string[] = [];
  const nestedInterfaces: string[] = [];

  lines.push(`export interface ${interfaceName} {`);

  const required = new Set(schema.required ?? []);

  for (const [name, propSchema] of Object.entries(schema.properties ?? {})) {
    if (isReferenceObject(propSchema)) continue;

    const optional = required.has(name) ? '' : '?';
    const tsType = schemaToTsType(name, propSchema, interfaceName, nestedInterfaces);
    lines.push(`  ${name}${optional}: ${tsType};`);
  }

  lines.push(`}`);

  if (nestedInterfaces.length > 0) {
    return [...nestedInterfaces, '', ...lines, ''].join('\n');
  }

  lines.push('');
  return lines.join('\n');
}

function schemaToTsType(propertyName: string, schema: SchemaObject, parentName: string, nestedInterfaces: string[]): string {
  const type = schema.type as string | undefined;

  if (schema.enum) {
    return schema.enum.map((v: unknown) => `'${String(v)}'`).join(' | ');
  }

  if (type === 'string') return 'string';
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';

  // SchemaObject is a union; use bracket access for `items` on array schemas
  const arrayItems = (schema as Record<string, unknown>)['items'] as SchemaObject | undefined;
  if (type === 'array' && arrayItems) {
    const items = arrayItems;
    if (items.type === 'object' || items.properties) {
      const nestedName = `${parentName}${toPascalCase(propertyName)}Item`;
      const nestedInterface = generateNestedInterface(nestedName, items);
      nestedInterfaces.push(nestedInterface);
      return `${nestedName}[]`;
    }
    if (items.enum) {
      return `(${items.enum.map((v: unknown) => `'${String(v)}'`).join(' | ')})[]`;
    }
    return `${schemaToTsType(propertyName, items, parentName, nestedInterfaces)}[]`;
  }

  if (type === 'object' || schema.properties) {
    const nestedName = `${parentName}${toPascalCase(propertyName)}`;
    const nestedInterface = generateNestedInterface(nestedName, schema);
    nestedInterfaces.push(nestedInterface);
    return nestedName;
  }

  return 'unknown';
}

function generateNestedInterface(name: string, schema: SchemaObject): string {
  const lines: string[] = [];
  const nestedInterfaces: string[] = [];
  const required = new Set(schema.required ?? []);

  lines.push(`export interface ${name} {`);

  for (const [propName, propSchema] of Object.entries(schema.properties ?? {})) {
    if (isReferenceObject(propSchema)) continue;
    const optional = required.has(propName) ? '' : '?';
    const tsType = schemaToTsType(propName, propSchema, name, nestedInterfaces);
    lines.push(`  ${propName}${optional}: ${tsType};`);
  }

  lines.push(`}`);

  if (nestedInterfaces.length > 0) {
    return [...nestedInterfaces, '', ...lines].join('\n');
  }

  return lines.join('\n');
}

function isReferenceObject(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}

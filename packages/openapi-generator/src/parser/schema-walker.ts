import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

export type SchemaObject = OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

export interface WalkedProperty {
  name: string;
  schema: SchemaObject;
  required: boolean;
}

export interface WalkedSchema {
  properties: WalkedProperty[];
  discriminator?: {
    propertyName: string;
    mapping: Record<string, SchemaObject>;
  };
  warnings: string[];
}

export function walkSchema(schema: SchemaObject, requiredFields: string[] = []): WalkedSchema {
  const warnings: string[] = [];

  // Handle allOf — merge all schemas
  if (schema.allOf) {
    return walkAllOf(schema.allOf as SchemaObject[], requiredFields, warnings);
  }

  // Handle oneOf with discriminator
  if (schema.oneOf && schema.discriminator) {
    return walkOneOfWithDiscriminator(
      schema.oneOf as SchemaObject[],
      schema.discriminator as OpenAPIV3.DiscriminatorObject,
      requiredFields,
      warnings,
    );
  }

  // Handle anyOf — skip with warning
  if (schema.anyOf) {
    warnings.push('anyOf schemas are not supported and were skipped');
    return { properties: [], warnings };
  }

  // Handle if/then/else — skip with warning
  if ('if' in schema) {
    warnings.push('if/then/else schemas are not supported and were skipped');
    return { properties: [], warnings };
  }

  // Handle additionalProperties warning
  if (schema.additionalProperties && (schema.additionalProperties as unknown) !== false) {
    warnings.push('additionalProperties are not supported and were skipped');
  }

  // Standard object with properties
  const properties: WalkedProperty[] = [];
  const required = new Set(schema.required ?? requiredFields);

  for (const [name, propSchema] of Object.entries(schema.properties ?? {})) {
    if (isReferenceObject(propSchema)) continue;
    properties.push({
      name,
      schema: propSchema,
      required: required.has(name),
    });
  }

  return { properties, warnings };
}

function walkAllOf(schemas: SchemaObject[], requiredFields: string[], warnings: string[]): WalkedSchema {
  const mergedProperties = new Map<string, WalkedProperty>();
  const allRequired = new Set<string>(requiredFields);

  for (const schema of schemas) {
    if (isReferenceObject(schema)) continue;

    const walked = walkSchema(schema, []);
    warnings.push(...walked.warnings);

    for (const prop of walked.properties) {
      mergedProperties.set(prop.name, prop);
    }

    if (schema.required) {
      for (const r of schema.required) {
        allRequired.add(r);
      }
    }
  }

  // Update required flags
  const properties = Array.from(mergedProperties.values()).map((prop) => ({
    ...prop,
    required: allRequired.has(prop.name),
  }));

  return { properties, warnings };
}

function walkOneOfWithDiscriminator(
  schemas: SchemaObject[],
  discriminator: OpenAPIV3.DiscriminatorObject,
  _requiredFields: string[],
  warnings: string[],
): WalkedSchema {
  const mapping: Record<string, SchemaObject> = {};

  for (const schema of schemas) {
    if (isReferenceObject(schema)) continue;

    // Try to find discriminator value from the schema's properties
    const discProp = schema.properties?.[discriminator.propertyName];
    if (discProp && !isReferenceObject(discProp) && discProp.enum?.length === 1) {
      const key = String(discProp.enum[0]);
      mapping[key] = schema;
    }
  }

  // Also use explicit discriminator mapping if provided
  if (discriminator.mapping) {
    for (const [key, ref] of Object.entries(discriminator.mapping)) {
      const matchingSchema = schemas.find((s) => {
        if (isReferenceObject(s)) return false;
        return (s as SchemaObject).title === key || (s as SchemaObject).title === ref;
      });
      if (matchingSchema && !isReferenceObject(matchingSchema)) {
        mapping[key] = matchingSchema;
      }
    }
  }

  return {
    properties: [],
    discriminator: {
      propertyName: discriminator.propertyName,
      mapping,
    },
    warnings,
  };
}

function isReferenceObject(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}

import type { SchemaObject } from '../parser/schema-walker.js';

export interface ValidatorConfig {
  type: string;
  value?: unknown;
}

export function mapSchemaToValidators(schema: SchemaObject, required: boolean): ValidatorConfig[] {
  const validators: ValidatorConfig[] = [];

  if (required) {
    validators.push({ type: 'required' });
  }

  if (schema.minLength !== undefined) {
    validators.push({ type: 'minLength', value: schema.minLength });
  }

  if (schema.maxLength !== undefined) {
    validators.push({ type: 'maxLength', value: schema.maxLength });
  }

  if (schema.minimum !== undefined) {
    validators.push({ type: 'min', value: schema.minimum });
  }

  if (schema.maximum !== undefined) {
    validators.push({ type: 'max', value: schema.maximum });
  }

  // OpenAPI 3.1: exclusiveMinimum/exclusiveMaximum are numbers (strict inequality)
  // Angular's min/max validators use >= / <=, so we adjust by 1 for integer schemas.
  // For non-integer schemas this is an approximation — a custom validator would be needed for exact behavior.
  if ((schema as Record<string, unknown>)['exclusiveMinimum'] !== undefined) {
    const exclusive = (schema as Record<string, unknown>)['exclusiveMinimum'] as number;
    validators.push({ type: 'min', value: exclusive + 1 });
  }

  if ((schema as Record<string, unknown>)['exclusiveMaximum'] !== undefined) {
    const exclusive = (schema as Record<string, unknown>)['exclusiveMaximum'] as number;
    validators.push({ type: 'max', value: exclusive - 1 });
  }

  if (schema.pattern) {
    validators.push({ type: 'pattern', value: schema.pattern });
  }

  if (schema.format === 'email') {
    validators.push({ type: 'email' });
  }

  if (schema.format === 'uuid') {
    validators.push({
      type: 'pattern',
      value: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    });
  }

  return validators;
}

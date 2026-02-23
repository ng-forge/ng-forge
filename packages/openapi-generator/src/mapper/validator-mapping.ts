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

  if (schema.pattern) {
    validators.push({ type: 'pattern', value: schema.pattern });
  }

  if (schema.format === 'email') {
    validators.push({ type: 'email' });
  }

  return validators;
}

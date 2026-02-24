import type { SchemaObject } from '../parser/schema-walker.js';

export interface FieldTypeResult {
  fieldType: string;
  props?: Record<string, unknown>;
  isContainer: boolean;
  isAmbiguous: boolean;
  ambiguousScope?: string;
  defaultAlternative?: string;
}

/**
 * Maps an OpenAPI schema to a dynamic form field type.
 */
export function mapSchemaToFieldType(schema: SchemaObject): FieldTypeResult {
  const rawType = schema.type;
  const type: string | undefined = Array.isArray(rawType)
    ? ((rawType as string[]).find((t) => t !== 'null') ?? (rawType as string[])[0])
    : (rawType as string | undefined);
  const format = schema.format;

  // string + enum → select (ambiguous with radio)
  if (type === 'string' && schema.enum) {
    return {
      fieldType: 'select',
      isContainer: false,
      isAmbiguous: true,
      ambiguousScope: 'single-select',
      defaultAlternative: 'radio',
    };
  }

  // string + format
  if (type === 'string') {
    switch (format) {
      case 'email':
        return { fieldType: 'input', props: { type: 'email' }, isContainer: false, isAmbiguous: false };
      case 'uri':
      case 'url':
        return { fieldType: 'input', props: { type: 'url' }, isContainer: false, isAmbiguous: false };
      case 'date':
      case 'date-time':
        return { fieldType: 'datepicker', isContainer: false, isAmbiguous: false };
      case 'password':
        return { fieldType: 'input', props: { type: 'password' }, isContainer: false, isAmbiguous: false };
      default:
        return {
          fieldType: 'input',
          props: { type: 'text' },
          isContainer: false,
          isAmbiguous: true,
          ambiguousScope: 'text-input',
          defaultAlternative: 'textarea',
        };
    }
  }

  // integer / number → input(number) (ambiguous with slider)
  if (type === 'integer' || type === 'number') {
    return {
      fieldType: 'input',
      props: { type: 'number' },
      isContainer: false,
      isAmbiguous: true,
      ambiguousScope: 'numeric',
      defaultAlternative: 'slider',
    };
  }

  // boolean → checkbox (ambiguous with toggle)
  if (type === 'boolean') {
    return {
      fieldType: 'checkbox',
      isContainer: false,
      isAmbiguous: true,
      ambiguousScope: 'boolean',
      defaultAlternative: 'toggle',
    };
  }

  // array + items with enum → multi-checkbox
  // SchemaObject is a union; narrow to access `items` on array schemas
  const arrayItems = (schema as Record<string, unknown>)['items'] as SchemaObject | undefined;
  if (type === 'array' && arrayItems) {
    const items = arrayItems;
    if (items.enum) {
      return { fieldType: 'multi-checkbox', isContainer: false, isAmbiguous: false };
    }
    // array + items object → array container
    if (items.type === 'object' || items.properties) {
      return { fieldType: 'array', isContainer: true, isAmbiguous: false };
    }
    // array of primitives
    return { fieldType: 'input', props: { type: 'text' }, isContainer: false, isAmbiguous: false };
  }

  // object → group container
  if (type === 'object' || schema.properties) {
    return { fieldType: 'group', isContainer: true, isAmbiguous: false };
  }

  // Fallback
  return { fieldType: 'input', props: { type: 'text' }, isContainer: false, isAmbiguous: false };
}

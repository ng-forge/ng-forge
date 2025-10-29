import { FieldDef } from '../../definitions/base';
import { Binding } from '@angular/core';
import { baseFieldMapper, FieldMapperOptions } from '../../mappers';

/**
 * Main field mapper function that uses the field registry to get the appropriate mapper
 * based on the field's type property
 */
export function mapFieldToBindings<TModel = any>(
  fieldDef: FieldDef<Record<string, unknown>>,
  options?: FieldMapperOptions<TModel>
): Binding[] {
  const fieldRegistry = options?.fieldRegistry;

  if (!fieldRegistry) {
    // Fallback to base mapper if no registry provided
    return baseFieldMapper(fieldDef);
  }

  // Get the field type definition from registry
  const fieldType = fieldRegistry.get(fieldDef.type);

  if (fieldType?.mapper) {
    // Use the registered mapper for this field type
    return fieldType.mapper(fieldDef, options);
  }

  // Fallback to base mapper
  return baseFieldMapper(fieldDef);
}

import { FieldDef } from '../../definitions/base';
import { Binding } from '@angular/core';
import { FieldTypeDefinition } from '../../models/field-type';
import { baseFieldMapper } from '../../mappers';

/**
 * Main field mapper function that uses the field registry to get the appropriate mapper
 * based on the field's type property.
 *
 * This function must be called within an injection context where FIELD_SIGNAL_CONTEXT
 * is provided, as mappers inject the context to access form state.
 *
 * @param fieldDef The field definition to map
 * @param fieldRegistry The registry of field type definitions
 * @returns Array of component bindings
 */
export function mapFieldToBindings(fieldDef: FieldDef<any>, fieldRegistry: Map<string, FieldTypeDefinition>): Binding[] {
  // Get the field type definition from registry
  const fieldType = fieldRegistry.get(fieldDef.type);

  if (fieldType?.mapper) {
    // Use the registered mapper for this field type
    // Mapper will inject FIELD_SIGNAL_CONTEXT internally
    return fieldType.mapper(fieldDef);
  }

  // Fallback to base mapper with options
  return baseFieldMapper(fieldDef, options);
}

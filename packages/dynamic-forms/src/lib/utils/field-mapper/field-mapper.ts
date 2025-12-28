import { Signal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { baseFieldMapper } from '../../mappers/base/base-field-mapper';

/**
 * Main field mapper function that uses the field registry to get the appropriate mapper
 * based on the field's type property.
 *
 * This function must be called within an injection context where FIELD_SIGNAL_CONTEXT
 * is provided, as mappers inject the context to access form state.
 *
 * For componentless fields (no loadComponent and no mapper), returns undefined
 * since there's no component to bind inputs to. Callers should check for undefined
 * and skip rendering logic for such fields.
 *
 * @param fieldDef The field definition to map
 * @param fieldRegistry The registry of field type definitions
 * @returns Signal containing Record of input names to values, or undefined for componentless fields
 */
export function mapFieldToInputs(
  fieldDef: FieldDef<unknown>,
  fieldRegistry: Map<string, FieldTypeDefinition>,
): Signal<Record<string, unknown>> | undefined {
  // Get the field type definition from registry
  const fieldType = fieldRegistry.get(fieldDef.type);

  if (fieldType?.mapper) {
    // Use the registered mapper for this field type
    // Mapper will inject FIELD_SIGNAL_CONTEXT internally
    return fieldType.mapper(fieldDef);
  }

  // Componentless field (no mapper and no loadComponent) - nothing to map
  if (fieldType && !fieldType.loadComponent) {
    return undefined;
  }

  // Fallback to base mapper for fields with components but no custom mapper
  // Mapper will inject FIELD_SIGNAL_CONTEXT internally
  return baseFieldMapper(fieldDef);
}

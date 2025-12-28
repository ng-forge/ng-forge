import { Signal, signal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { baseFieldMapper } from '../../mappers/base/base-field-mapper';

/** Empty inputs signal for componentless fields */
const EMPTY_INPUTS: Signal<Record<string, unknown>> = signal({});

/**
 * Main field mapper function that uses the field registry to get the appropriate mapper
 * based on the field's type property.
 *
 * This function must be called within an injection context where FIELD_SIGNAL_CONTEXT
 * is provided, as mappers inject the context to access form state.
 *
 * For componentless fields (no loadComponent and no mapper), returns an empty signal
 * since there's no component to bind inputs to.
 *
 * @param fieldDef The field definition to map
 * @param fieldRegistry The registry of field type definitions
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function mapFieldToInputs(
  fieldDef: FieldDef<unknown>,
  fieldRegistry: Map<string, FieldTypeDefinition>,
): Signal<Record<string, unknown>> {
  // Get the field type definition from registry
  const fieldType = fieldRegistry.get(fieldDef.type);

  if (fieldType?.mapper) {
    // Use the registered mapper for this field type
    // Mapper will inject FIELD_SIGNAL_CONTEXT internally
    return fieldType.mapper(fieldDef);
  }

  // Componentless field (no mapper and no loadComponent) - return empty inputs
  if (fieldType && !fieldType.loadComponent) {
    return EMPTY_INPUTS;
  }

  // Fallback to base mapper for fields with components but no custom mapper
  // Mapper will inject FIELD_SIGNAL_CONTEXT internally
  return baseFieldMapper(fieldDef);
}

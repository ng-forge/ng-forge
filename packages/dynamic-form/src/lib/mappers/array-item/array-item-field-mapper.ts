import { Binding, inject, inputBinding } from '@angular/core';
import { FieldDef } from '../../definitions';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { baseFieldMapper } from '../base/base-field-mapper';

/**
 * Custom mapper for array item fields that handles array notation in keys.
 *
 * When a field has a key like 'tags[0]', this mapper:
 * 1. Parses the array notation to extract array name and index
 * 2. Accesses the correct field proxy using parentForm()[arrayName][index]
 * 3. Passes the correct field and form bindings to the child component
 *
 * This enables array item fields to correctly bind to and update individual
 * array elements in the parent form.
 */
export function arrayItemFieldMapper(fieldDef: FieldDef<any>): Binding[] {
  const context = inject(FIELD_SIGNAL_CONTEXT);

  // Start with base field mapper for common properties (label, className, etc.)
  const bindings: Binding[] = baseFieldMapper(fieldDef);
  const key = fieldDef.key;

  // Check if this is an array item key (e.g., 'tags[0]')
  const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);

  if (arrayMatch) {
    // Parse array notation to extract array name and index
    const [, arrayName, indexStr] = arrayMatch;
    const index = parseInt(indexStr, 10);

    // Lazily access the field proxy using Angular Signal Forms' array indexing
    // The factory function will be called when the component needs the field
    bindings.push(
      inputBinding('field', () => {
        const formRoot = context.form();
        // Access: parentForm().arrayName[index]
        // This uses Angular Signal Forms' native array support
        const arrayField = (formRoot as any)[arrayName];
        return arrayField ? arrayField[index] : undefined;
      }),
    );
  } else {
    // Standard field access for non-array keys
    bindings.push(
      inputBinding('field', () => {
        const formRoot = context.form();
        const childrenMap = (formRoot as any).structure?.childrenMap?.();
        const formField = childrenMap?.get(fieldDef.key);
        return formField?.fieldProxy;
      }),
    );
  }

  return bindings;
}

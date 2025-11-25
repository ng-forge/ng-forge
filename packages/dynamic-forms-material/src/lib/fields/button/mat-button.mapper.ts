import { baseFieldMapper, FieldDef } from '@ng-forge/dynamic-forms';
import { Binding, inputBinding } from '@angular/core';

/**
 * Generic button mapper for custom events or basic buttons.
 * For specific button types (submit, next, prev, add/remove array items),
 * use the dedicated field types and their specific mappers.
 */
export function buttonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add event binding for button events
  if ('event' in fieldDef && fieldDef.event !== undefined) {
    bindings.push(inputBinding('event', () => fieldDef.event));
  }

  // Add eventArgs binding if provided
  if ('eventArgs' in fieldDef && fieldDef.eventArgs !== undefined) {
    bindings.push(inputBinding('eventArgs', () => fieldDef.eventArgs));
  }

  return bindings;
}

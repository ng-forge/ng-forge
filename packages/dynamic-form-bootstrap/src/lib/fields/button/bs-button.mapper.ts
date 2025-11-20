import {
  baseFieldMapper,
  ArrayItemContext,
  FieldDef,
  AddArrayItemEvent,
  RemoveArrayItemEvent,
  ARRAY_CONTEXT,
} from '@ng-forge/dynamic-form';
import { Binding, inject, inputBinding } from '@angular/core';

export function buttonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Add disabled binding since baseFieldMapper excludes it
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add event binding for button events
  if ('event' in fieldDef && fieldDef.event !== undefined) {
    bindings.push(inputBinding('event', () => fieldDef.event));
  }

  // Add event args binding
  if ('eventArgs' in fieldDef && fieldDef.eventArgs !== undefined) {
    bindings.push(inputBinding('eventArgs', () => fieldDef.eventArgs));
  }

  return bindings;
}

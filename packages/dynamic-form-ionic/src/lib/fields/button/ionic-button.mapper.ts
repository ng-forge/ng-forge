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

  // Optionally inject array context if this button is rendered within an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

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

  // Build array item context for token resolution
  // Only include array context for add/remove array item buttons
  const isArrayButton = 'event' in fieldDef && (fieldDef.event === AddArrayItemEvent || fieldDef.event === RemoveArrayItemEvent);

  const eventContext: ArrayItemContext = {
    key: fieldDef.key,
    ...(isArrayButton &&
      arrayContext && {
        index: arrayContext.index,
        arrayKey: arrayContext.arrayKey,
        formValue: arrayContext.formValue,
      }),
  };

  bindings.push(inputBinding('eventContext', () => eventContext));

  return bindings;
}

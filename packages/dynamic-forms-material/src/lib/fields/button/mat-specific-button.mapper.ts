import { Binding, computed, inject, inputBinding } from '@angular/core';
import {
  AddArrayItemEvent,
  ARRAY_CONTEXT,
  ArrayItemContext,
  baseFieldMapper,
  FIELD_SIGNAL_CONTEXT,
  FieldDef,
  NextPageEvent,
  PreviousPageEvent,
  RemoveArrayItemEvent,
  SubmitEvent,
} from '@ng-forge/dynamic-forms';

/**
 * Mapper for submit button - preconfigures SubmitEvent and disables when form is invalid
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Inject field signal context to access form state
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);

  // Preconfigure the SubmitEvent
  bindings.push(inputBinding('event', () => SubmitEvent));

  // Add disabled binding - disabled if explicitly set OR if form is invalid
  const form = fieldSignalContext.form;
  bindings.push(
    inputBinding('disabled', () =>
      computed(() => {
        const explicitlyDisabled = fieldDef.disabled || false;
        const formInvalid = !form().valid();
        return explicitlyDisabled || formInvalid;
      })(),
    ),
  );

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Preconfigure the NextPageEvent
  bindings.push(inputBinding('event', () => NextPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function previousButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Preconfigure the PreviousPageEvent
  bindings.push(inputBinding('event', () => PreviousPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for add array item button - preconfigures AddArrayItemEvent with array context
 * Note: This button type should only be used inside array field templates.
 */
export function addArrayItemButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  const arrayContext = inject(ARRAY_CONTEXT);

  // Preconfigure the AddArrayItemEvent
  bindings.push(inputBinding('event', () => AddArrayItemEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add array context for token resolution
  const eventContext: ArrayItemContext = {
    key: fieldDef.key,
    index: arrayContext.index,
    arrayKey: arrayContext.arrayKey,
    formValue: arrayContext.formValue,
  };

  bindings.push(inputBinding('eventContext', () => eventContext));

  // Set default eventArgs for AddArrayItemEvent (arrayKey)
  // The array component will use its own template automatically
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  bindings.push(inputBinding('eventArgs', () => eventArgs));

  return bindings;
}

/**
 * Mapper for remove array item button - preconfigures RemoveArrayItemEvent with array context
 * Note: This button type should only be used inside array field templates.
 */
export function removeArrayItemButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  const arrayContext = inject(ARRAY_CONTEXT);

  // Preconfigure the RemoveArrayItemEvent
  bindings.push(inputBinding('event', () => RemoveArrayItemEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add array context for token resolution
  const eventContext: ArrayItemContext = {
    key: fieldDef.key,
    index: arrayContext.index,
    arrayKey: arrayContext.arrayKey,
    formValue: arrayContext.formValue,
  };

  bindings.push(inputBinding('eventContext', () => eventContext));

  // Set default eventArgs for RemoveArrayItemEvent (arrayKey, index)
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = ['$arrayKey', '$index'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  bindings.push(inputBinding('eventArgs', () => eventArgs));

  return bindings;
}

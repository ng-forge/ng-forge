import { Binding, computed, inject, inputBinding } from '@angular/core';
import {
  baseFieldMapper,
  FieldDef,
  NextPageEvent,
  PreviousPageEvent,
  SubmitEvent,
  FIELD_SIGNAL_CONTEXT,
  ARRAY_CONTEXT,
} from '@ng-forge/dynamic-form';

/**
 * Mapper for submit button - preconfigures SubmitEvent and disables when form is invalid
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Inject field signal context to access form state
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

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

  // Pass array context values if this button is rendered within an array
  if (arrayContext) {
    bindings.push(inputBinding('arrayIndex', () => arrayContext.index));
    bindings.push(inputBinding('arrayKey', () => arrayContext.arrayKey));
    bindings.push(inputBinding('formValue', () => arrayContext.formValue));
  }

  return bindings;
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Optionally inject array context if this button is rendered within an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

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

  // Pass array context values if this button is rendered within an array
  if (arrayContext) {
    bindings.push(inputBinding('arrayIndex', () => arrayContext.index));
    bindings.push(inputBinding('arrayKey', () => arrayContext.arrayKey));
    bindings.push(inputBinding('formValue', () => arrayContext.formValue));
  }

  return bindings;
}

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function previousButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Optionally inject array context if this button is rendered within an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

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

  // Pass array context values if this button is rendered within an array
  if (arrayContext) {
    bindings.push(inputBinding('arrayIndex', () => arrayContext.index));
    bindings.push(inputBinding('arrayKey', () => arrayContext.arrayKey));
    bindings.push(inputBinding('formValue', () => arrayContext.formValue));
  }

  return bindings;
}

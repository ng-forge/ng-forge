import { Binding, inject, inputBinding } from '@angular/core';
import {
  AddArrayItemEvent,
  ARRAY_CONTEXT,
  ArrayItemContext,
  baseFieldMapper,
  FIELD_SIGNAL_CONTEXT,
  FieldDef,
  FieldWithValidation,
  NextPageEvent,
  PreviousPageEvent,
  RemoveArrayItemEvent,
  resolveNextButtonDisabled,
  resolveSubmitButtonDisabled,
  SubmitEvent,
} from '@ng-forge/dynamic-forms';

/**
 * Mapper for submit button - preconfigures SubmitEvent
 *
 * Disabled state is resolved using the button-logic-resolver which considers:
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.submitButton` defaults (disableWhenInvalid, disableWhileSubmitting)
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Inject field signal context to access form state and options
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);

  bindings.push(inputBinding('event', () => SubmitEvent));

  // Use button-logic-resolver to compute disabled state
  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;
  const disabledSignal = resolveSubmitButtonDisabled({
    form: fieldSignalContext.form,
    formOptions: fieldSignalContext.formOptions,
    fieldLogic: fieldWithLogic.logic,
    explicitlyDisabled: fieldDef.disabled,
  });

  bindings.push(inputBinding('disabled', () => disabledSignal()));

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 *
 * Disabled state is resolved using the button-logic-resolver which considers:
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.nextButton` defaults (disableWhenPageInvalid, disableWhileSubmitting)
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Inject field signal context to access form state and options
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);

  bindings.push(inputBinding('event', () => NextPageEvent));

  // Use button-logic-resolver to compute disabled state
  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;
  const disabledSignal = resolveNextButtonDisabled({
    form: fieldSignalContext.form,
    formOptions: fieldSignalContext.formOptions,
    fieldLogic: fieldWithLogic.logic,
    explicitlyDisabled: fieldDef.disabled,
    currentPageValid: fieldSignalContext.currentPageValid,
  });

  bindings.push(inputBinding('disabled', () => disabledSignal()));

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

  bindings.push(inputBinding('event', () => PreviousPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for add array item button - preconfigures AddArrayItemEvent with array context
 */
export function addArrayItemButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  const arrayContext = inject(ARRAY_CONTEXT);

  bindings.push(inputBinding('event', () => AddArrayItemEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add eventArgs binding if provided in field definition
  if ('eventArgs' in fieldDef && fieldDef.eventArgs !== undefined) {
    bindings.push(inputBinding('eventArgs', () => fieldDef.eventArgs));
  }

  // Add array context for token resolution
  const eventContext: ArrayItemContext = {
    key: fieldDef.key,
    index: arrayContext.index,
    arrayKey: arrayContext.arrayKey,
    formValue: arrayContext.formValue,
  };

  bindings.push(inputBinding('eventContext', () => eventContext));

  return bindings;
}

/**
 * Mapper for remove array item button - preconfigures RemoveArrayItemEvent with array context
 */
export function removeArrayItemButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  const arrayContext = inject(ARRAY_CONTEXT);

  bindings.push(inputBinding('event', () => RemoveArrayItemEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

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

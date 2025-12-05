import { computed, inject, isSignal, Signal } from '@angular/core';
import {
  AddArrayItemEvent,
  ARRAY_CONTEXT,
  buildBaseInputs,
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
import { AddArrayItemButtonField, RemoveArrayItemButtonField } from './prime-button.type';

/**
 * Mapper for submit button - preconfigures SubmitEvent
 *
 * Disabled state is resolved using the button-logic-resolver which considers:
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.submitButton` defaults (disableWhenInvalid, disableWhileSubmitting)
 *
 * @param fieldDef The submit button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  // Inject field signal context to access form state and options
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  // Use button-logic-resolver to compute disabled state
  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;
  const disabledSignal = resolveSubmitButtonDisabled({
    form: fieldSignalContext.form,
    formOptions: fieldSignalContext.formOptions,
    fieldLogic: fieldWithLogic.logic,
    explicitlyDisabled: fieldDef.disabled,
  });

  // Return computed signal - evaluates disabledSignal inside for reactivity
  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: SubmitEvent,
      // Evaluate the signal inside the computed - component receives plain boolean
      disabled: disabledSignal(),
    };

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 *
 * Disabled state is resolved using the button-logic-resolver which considers:
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.nextButton` defaults (disableWhenPageInvalid, disableWhileSubmitting)
 *
 * @param fieldDef The next button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  // Inject field signal context to access form state and options
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  // Use button-logic-resolver to compute disabled state
  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;
  const disabledSignal = resolveNextButtonDisabled({
    form: fieldSignalContext.form,
    formOptions: fieldSignalContext.formOptions,
    fieldLogic: fieldWithLogic.logic,
    explicitlyDisabled: fieldDef.disabled,
    currentPageValid: fieldSignalContext.currentPageValid,
  });

  // Return computed signal - evaluates disabledSignal inside for reactivity
  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: NextPageEvent,
      // Evaluate the signal inside the computed - component receives plain boolean
      disabled: disabledSignal(),
    };

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 *
 * @param fieldDef The previous button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function previousButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: PreviousPageEvent,
    };

    // Add disabled binding only if explicitly set by user
    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for add array item button - preconfigures AddArrayItemEvent with array context.
 *
 * Supports two modes:
 * 1. Inside array template: Uses ARRAY_CONTEXT to determine target array
 * 2. Outside array: Uses `arrayKey` property from field definition
 *
 * @param fieldDef The add array item button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function addArrayItemButtonFieldMapper(fieldDef: AddArrayItemButtonField): Signal<Record<string, unknown>> {
  // Try to get array context (available when inside an array)
  // Use optional injection so it doesn't fail when outside an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  // Determine the target array key
  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    console.warn(
      `[Dynamic Forms] addArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  // Set default eventArgs for AddArrayItemEvent (arrayKey)
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  return computed(() => {
    // Read signal value if index is a signal (supports differential updates)
    const getIndex = () => {
      if (!arrayContext) return -1;
      return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
    };

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: AddArrayItemEvent,
      eventArgs,
      eventContext: {
        key: fieldDef.key,
        index: getIndex(),
        arrayKey: targetArrayKey ?? '',
        formValue: arrayContext?.formValue ?? {},
      },
    };

    // Add disabled binding only if explicitly set by user
    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for remove array item button - preconfigures RemoveArrayItemEvent with array context.
 *
 * Supports two modes:
 * 1. Inside array template: Uses ARRAY_CONTEXT to determine target array and removes item at current index
 * 2. Outside array: Uses `arrayKey` property from field definition, removes last item by default
 *
 * @param fieldDef The remove array item button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function removeArrayItemButtonFieldMapper(fieldDef: RemoveArrayItemButtonField): Signal<Record<string, unknown>> {
  // Try to get array context (available when inside an array)
  // Use optional injection so it doesn't fail when outside an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  // Determine the target array key
  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    console.warn(
      `[Dynamic Forms] removeArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  // Set default eventArgs for RemoveArrayItemEvent (arrayKey, index if inside array)
  // When outside array, only pass arrayKey (removes last by default)
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = arrayContext ? ['$arrayKey', '$index'] : ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  return computed(() => {
    // Read signal value if index is a signal (supports differential updates)
    const getIndex = () => {
      if (!arrayContext) return -1; // -1 means remove last (no specific index)
      return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
    };

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: RemoveArrayItemEvent,
      eventArgs,
      eventContext: {
        key: fieldDef.key,
        index: getIndex(),
        arrayKey: targetArrayKey ?? '',
        formValue: arrayContext?.formValue ?? {},
      },
    };

    // Add disabled binding only if explicitly set by user
    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

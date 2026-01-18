import { computed, inject, isSignal, Signal } from '@angular/core';
import {
  AddArrayItemEvent,
  ARRAY_CONTEXT,
  buildBaseInputs,
  DEFAULT_PROPS,
  DynamicFormLogger,
  FIELD_SIGNAL_CONTEXT,
  FieldDef,
  FieldWithValidation,
  FORM_OPTIONS,
  NextPageEvent,
  PreviousPageEvent,
  RemoveArrayItemEvent,
  resolveNextButtonDisabled,
  resolveSubmitButtonDisabled,
  RootFormRegistryService,
} from '@ng-forge/dynamic-forms';
import { AddArrayItemButtonField, RemoveArrayItemButtonField } from './bs-button.type';

/**
 * Mapper for submit button - configures native form submission via type="submit"
 *
 * Unlike other buttons, submit buttons don't dispatch events directly.
 * Instead, they trigger native form submission which the form component
 * intercepts and dispatches to the EventBus.
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
  const rootFormRegistry = inject(RootFormRegistryService);
  const defaultProps = inject(DEFAULT_PROPS);
  const formOptions = inject(FORM_OPTIONS);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());

    // Use rootFormRegistry instead of fieldSignalContext.form because when the submit button
    // is inside a group/array, fieldSignalContext.form points to the nested form tree,
    // not the root form. We need root form validity for submit button disabled state (#157).
    const disabledSignal = resolveSubmitButtonDisabled({
      form: rootFormRegistry.getRootForm()!,
      formOptions: formOptions(),
      fieldLogic: fieldWithLogic.logic,
      explicitlyDisabled: fieldDef.disabled,
    });

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      // No event - native form submit handles it via form's onNativeSubmit
      // Set type="submit" to trigger native form submission
      props: { ...(fieldDef.props as Record<string, unknown>), type: 'submit' },
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
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  const defaultProps = inject(DEFAULT_PROPS);
  const formOptions = inject(FORM_OPTIONS);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());

    const disabledSignal = resolveNextButtonDisabled({
      form: fieldSignalContext.form,
      formOptions: formOptions(),
      fieldLogic: fieldWithLogic.logic,
      explicitlyDisabled: fieldDef.disabled,
      currentPageValid: fieldSignalContext.currentPageValid,
    });

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
  const defaultProps = inject(DEFAULT_PROPS);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());

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
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });
  const logger = inject(DynamicFormLogger);
  const defaultProps = inject(DEFAULT_PROPS);

  // Determine the target array key
  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    logger.warn(
      `addArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  // Set default eventArgs for AddArrayItemEvent (arrayKey)
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());

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
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });
  const logger = inject(DynamicFormLogger);
  const defaultProps = inject(DEFAULT_PROPS);

  // Determine the target array key
  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    logger.warn(
      `removeArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  // Set default eventArgs for RemoveArrayItemEvent (arrayKey, index if inside array)
  // When outside array, only pass arrayKey (removes last by default)
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = arrayContext ? ['$arrayKey', '$index'] : ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());

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

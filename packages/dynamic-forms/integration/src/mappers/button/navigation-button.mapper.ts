import { computed, inject, Signal } from '@angular/core';
import {
  buildBaseInputs,
  DEFAULT_PROPS,
  FieldDef,
  FieldWithValidation,
  FIELD_SIGNAL_CONTEXT,
  FORM_OPTIONS,
  NextPageEvent,
  PreviousPageEvent,
  resolveNextButtonDisabled,
  resolveSubmitButtonDisabled,
  RootFormRegistryService,
} from '@ng-forge/dynamic-forms';
import { ButtonField } from '../../definitions';
import { resolveHiddenValue } from './non-field-logic.utils';

// =============================================================================
// Base Interfaces
// =============================================================================

/**
 * Base interface for navigation button fields (submit, next, previous).
 */
export type BaseNavigationButtonField<TProps = unknown> = ButtonField<TProps, SubmitEvent | NextPageEvent | PreviousPageEvent> & {
  type: string;
  /** Logic rules for dynamic disabled state */
  logic?: FieldWithValidation['logic'];
};

// =============================================================================
// Submit Button Mapper
// =============================================================================

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
 * Hidden state is resolved using the non-field-hidden resolver which considers:
 * 1. Explicit `hidden: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` conditions
 *
 * @param fieldDef The submit button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function submitButtonFieldMapper<TProps>(fieldDef: BaseNavigationButtonField<TProps>): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const defaultProps = inject(DEFAULT_PROPS);
  const formOptions = inject(FORM_OPTIONS);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.getRootForm()!;
    const formValue = rootFormRegistry.getFormValue();

    // Use rootFormRegistry instead of fieldSignalContext.form because when the submit button
    // is inside a group/array, fieldSignalContext.form points to the nested form tree,
    // not the root form. We need root form validity for submit button disabled state (#157).
    const disabled = resolveSubmitButtonDisabled({
      form: rootForm,
      formOptions: formOptions(),
      fieldLogic: fieldWithLogic.logic,
      explicitlyDisabled: fieldDef.disabled,
    })();

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      // No event - native form submit handles it via form's onNativeSubmit
      // Set type="submit" to trigger native form submission
      props: { ...(fieldDef.props as Record<string, unknown>), type: 'submit' },
      disabled,
    };

    // Resolve hidden state using non-field-hidden resolver (supports logic array)
    const hidden = resolveHiddenValue(rootForm, formValue, fieldWithLogic);
    if (hidden !== undefined) {
      inputs['hidden'] = hidden;
    }

    return inputs;
  });
}

// =============================================================================
// Next Page Button Mapper
// =============================================================================

/**
 * Mapper for next page button - preconfigures NextPageEvent
 *
 * Disabled state is resolved using the button-logic-resolver which considers:
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.nextButton` defaults (disableWhenPageInvalid, disableWhileSubmitting)
 *
 * Hidden state is resolved using the non-field-hidden resolver which considers:
 * 1. Explicit `hidden: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` conditions
 *
 * @param fieldDef The next button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function nextButtonFieldMapper<TProps>(fieldDef: BaseNavigationButtonField<TProps>): Signal<Record<string, unknown>> {
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  const rootFormRegistry = inject(RootFormRegistryService);
  const defaultProps = inject(DEFAULT_PROPS);
  const formOptions = inject(FORM_OPTIONS);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.getRootForm();
    const formValue = rootFormRegistry.getFormValue();

    const disabled = resolveNextButtonDisabled({
      form: fieldSignalContext.form,
      formOptions: formOptions(),
      fieldLogic: fieldWithLogic.logic,
      currentPageValid: fieldSignalContext.currentPageValid,
    })();

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: NextPageEvent,
      disabled,
    };

    // Resolve hidden state using non-field-hidden resolver (supports logic array)
    const hidden = resolveHiddenValue(rootForm, formValue, fieldWithLogic);
    if (hidden !== undefined) {
      inputs['hidden'] = hidden;
    }

    return inputs;
  });
}

// =============================================================================
// Previous Page Button Mapper
// =============================================================================

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 *
 * Hidden state is resolved using the non-field-hidden resolver which considers:
 * 1. Explicit `hidden: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` conditions
 *
 * @param fieldDef The previous button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function previousButtonFieldMapper<TProps>(fieldDef: BaseNavigationButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.getRootForm();
    const formValue = rootFormRegistry.getFormValue();

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: PreviousPageEvent,
    };

    // Add disabled binding only if explicitly set by user
    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    // Resolve hidden state using non-field-hidden resolver (supports logic array)
    const hidden = resolveHiddenValue(rootForm, formValue, fieldWithLogic);
    if (hidden !== undefined) {
      inputs['hidden'] = hidden;
    }

    return inputs;
  });
}

import { computed, inject, Signal } from '@angular/core';
import { FieldWithValidation, FormSubmitEvent, NextPageEvent, PreviousPageEvent } from '@ng-forge/dynamic-forms';
import {
  buildBaseInputs,
  DEFAULT_PROPS,
  FieldDef,
  injectFieldSignalContext,
  FORM_OPTIONS,
  resolveNextButtonDisabled,
  resolveSubmitButtonDisabled,
  RootFormRegistryService,
} from '@ng-forge/dynamic-forms/internal';
import { ButtonField } from '../../definitions';
import { resolveHiddenValue } from './non-field-logic.utils';

// =============================================================================
// Base Interfaces
// =============================================================================

/** Base interface for navigation button fields (submit, next, previous). */
export type BaseNavigationButtonField<TProps = unknown> = ButtonField<TProps, FormSubmitEvent | NextPageEvent | PreviousPageEvent> & {
  type: string;
  /** Logic rules for dynamic disabled state */
  logic?: FieldWithValidation['logic'];
};

// =============================================================================
// Submit Button Mapper
// =============================================================================

/**
 * Mapper for submit button — configures native form submission via type="submit".
 * Triggers native form submission rather than dispatching events directly.
 */
export function submitButtonFieldMapper<TProps>(fieldDef: BaseNavigationButtonField<TProps>): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const defaultProps = inject(DEFAULT_PROPS);
  const formOptions = inject(FORM_OPTIONS);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.rootForm();

    // Use rootForm (not fieldSignalContext.form) — submit needs root form validity (#157).
    // Before the root form is available, fall back to the explicit disabled value.
    const disabled = rootForm
      ? resolveSubmitButtonDisabled({
          form: rootForm,
          formOptions: formOptions(),
          fieldLogic: fieldWithLogic.logic,
          explicitlyDisabled: fieldDef.disabled,
        })()
      : (fieldDef.disabled ?? false);

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      // type="submit" triggers native form submission (no event dispatch needed)
      props: { ...(fieldDef.props as Record<string, unknown>), type: 'submit' },
      disabled,
    };

    const hidden = resolveHiddenValue(rootForm, fieldWithLogic);
    if (hidden !== undefined) {
      inputs['hidden'] = hidden;
    }

    return inputs;
  });
}

// =============================================================================
// Next Page Button Mapper
// =============================================================================

/** Mapper for next page button — preconfigures NextPageEvent. */
export function nextButtonFieldMapper<TProps>(fieldDef: BaseNavigationButtonField<TProps>): Signal<Record<string, unknown>> {
  const fieldSignalContext = injectFieldSignalContext();
  const rootFormRegistry = inject(RootFormRegistryService);
  const defaultProps = inject(DEFAULT_PROPS);
  const formOptions = inject(FORM_OPTIONS);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.rootForm();

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

    const hidden = resolveHiddenValue(rootForm, fieldWithLogic);
    if (hidden !== undefined) {
      inputs['hidden'] = hidden;
    }

    return inputs;
  });
}

// =============================================================================
// Previous Page Button Mapper
// =============================================================================

/** Mapper for previous page button — preconfigures PreviousPageEvent. */
export function previousButtonFieldMapper<TProps>(fieldDef: BaseNavigationButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.rootForm();

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: PreviousPageEvent,
    };

    // Add disabled binding only if explicitly set by user
    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    const hidden = resolveHiddenValue(rootForm, fieldWithLogic);
    if (hidden !== undefined) {
      inputs['hidden'] = hidden;
    }

    return inputs;
  });
}

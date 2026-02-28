import { computed, Signal } from '@angular/core';
import { FormStateManager } from '../state/form-state-manager';
import { FormOptions } from '../models/form-config';
import { ValidationMessages } from '../models/validation-types';

/**
 * Aggregates readonly signals derived from `FormStateManager.activeConfig()`.
 *
 * Provided once per `DynamicForm` instance. Replaces four individual DI tokens
 * (`DEFAULT_PROPS`, `DEFAULT_VALIDATION_MESSAGES`, `FORM_OPTIONS`, `EXTERNAL_DATA`)
 * with a single injectable class.
 *
 * Public API bridge providers for `DEFAULT_PROPS`, `DEFAULT_VALIDATION_MESSAGES`,
 * and `FORM_OPTIONS` delegate to this class so external consumers are unaffected.
 *
 * @internal
 */
export class FormDerivedState {
  readonly defaultProps: Signal<Record<string, unknown> | undefined>;
  readonly defaultValidationMessages: Signal<ValidationMessages | undefined>;
  readonly formOptions: Signal<FormOptions | undefined>;
  readonly externalData: Signal<Record<string, Signal<unknown>> | undefined>;

  constructor(stateManager: FormStateManager) {
    this.defaultProps = computed(() => stateManager.activeConfig()?.defaultProps);
    this.defaultValidationMessages = computed(() => stateManager.activeConfig()?.defaultValidationMessages);
    this.formOptions = stateManager.effectiveFormOptions;
    this.externalData = computed(() => stateManager.activeConfig()?.externalData);
  }
}

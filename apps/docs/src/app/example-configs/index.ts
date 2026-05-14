import { FormConfig } from '@ng-forge/dynamic-forms';

import { addonClearButtonConfig } from './addon-clear-button.config';
import { addonCurrencyConfig } from './addon-currency.config';
import { addonPasswordToggleConfig } from './addon-password-toggle.config';
import { ageConditionalFormConfig } from './age-conditional-form.config';
import { arrayConfig } from './array.config';
import { businessAccountFormConfig } from './business-account-form.config';
import { buttonConfig } from './button.config';
import { checkboxConfig } from './checkbox.config';
import { completeFormConfig } from './complete-form.config';
import { contactConfig } from './contact.config';
import { contactDynamicFieldsConfig } from './contact-dynamic-fields.config';
import { containerFieldConfig } from './container-field.config';
import { datepickerConfig } from './datepicker.config';
import { enterpriseFeaturesConfig } from './enterprise-features.config';
import { expressionValidatorsConfig } from './expression-validators.config';
import { groupConfig } from './group.config';
import { inputConfig } from './input.config';
import { loginConfig } from './login.config';
import { multiCheckboxConfig } from './multi-checkbox.config';
import { paginatedFormConfig } from './paginated-form.config';
import { radioConfig } from './radio.config';
import { rowConfig } from './row.config';
import { selectConfig } from './select.config';
import { shippingBillingAddressConfig } from './shipping-billing-address.config';
import { simplifiedArrayConfig } from './simplified-array.config';
import { sliderConfig } from './slider.config';
import { textareaConfig } from './textarea.config';
import { toggleConfig } from './toggle.config';
import { userRegistrationConfig } from './user-registration.config';
import { valueDerivationConfig } from './value-derivation.config';
import { wrapperArrayActionsConfig } from './wrapper-array-actions.config';
import { wrapperSectionConfig } from './wrapper-section.config';
import { zodSchemaValidationConfig } from './zod-schema-validation.config';

export { addonClearButtonConfig } from './addon-clear-button.config';
export { addonCurrencyConfig } from './addon-currency.config';
export { addonPasswordToggleConfig } from './addon-password-toggle.config';
export { ageConditionalFormConfig } from './age-conditional-form.config';
export { arrayConfig } from './array.config';
export { businessAccountFormConfig } from './business-account-form.config';
export { buttonConfig } from './button.config';
export { checkboxConfig } from './checkbox.config';
export { completeFormConfig } from './complete-form.config';
export { contactConfig } from './contact.config';
export { contactDynamicFieldsConfig } from './contact-dynamic-fields.config';
export { containerFieldConfig } from './container-field.config';
export { datepickerConfig } from './datepicker.config';
export { enterpriseFeaturesConfig } from './enterprise-features.config';
export { expressionValidatorsConfig } from './expression-validators.config';
export { groupConfig } from './group.config';
export { inputConfig } from './input.config';
export { loginConfig } from './login.config';
export { multiCheckboxConfig } from './multi-checkbox.config';
export { paginatedFormConfig } from './paginated-form.config';
export { radioConfig } from './radio.config';
export { rowConfig } from './row.config';
export { selectConfig } from './select.config';
export { shippingBillingAddressConfig } from './shipping-billing-address.config';
export { simplifiedArrayConfig } from './simplified-array.config';
export { sliderConfig } from './slider.config';
export { textareaConfig } from './textarea.config';
export { toggleConfig } from './toggle.config';
export { userRegistrationConfig } from './user-registration.config';
export { valueDerivationConfig } from './value-derivation.config';
export { wrapperArrayActionsConfig } from './wrapper-array-actions.config';
export { wrapperSectionConfig } from './wrapper-section.config';
export { zodSchemaValidationConfig } from './zod-schema-validation.config';

/**
 * Concrete adapter identifiers accepted by per-adapter config factories.
 * Mirrors the four shipped UI adapters; the docs live-example component
 * resolves `'custom'` to `'material'` before calling a factory.
 */
export type ConcreteAdapter = 'material' | 'bootstrap' | 'primeng' | 'ionic';

/**
 * Per-scenario config — either a static `FormConfig` (adapter-agnostic) or a
 * factory that returns the right config for the active adapter. Used by
 * `LiveExampleComponent.scenarioConfig` to resolve adapter-specific addon
 * `kind` values without forcing one config per adapter.
 */
export type ExampleConfigValue = FormConfig | ((adapter: ConcreteAdapter) => FormConfig);

/**
 * Map of scenario keys to FormConfig objects or per-adapter factories.
 * Keys match the scenario identifiers used in docs-live-example elements.
 */
export const EXAMPLE_CONFIGS: Record<string, ExampleConfigValue> = {
  'addon-clear-button': addonClearButtonConfig,
  'addon-currency': addonCurrencyConfig,
  'addon-password-toggle': addonPasswordToggleConfig,
  login: loginConfig,
  'login-form': loginConfig,
  contact: contactConfig,
  'contact-form': contactConfig,
  'user-registration': userRegistrationConfig,
  'paginated-form': paginatedFormConfig,
  array: arrayConfig,
  'array-form': arrayConfig,
  'simplified-array': simplifiedArrayConfig,
  'simplified-array-form': simplifiedArrayConfig,
  'business-account-form': businessAccountFormConfig,
  'age-conditional-form': ageConditionalFormConfig,
  'contact-dynamic-fields': contactDynamicFieldsConfig,
  'shipping-billing-address': shippingBillingAddressConfig,
  'value-derivation': valueDerivationConfig,
  'enterprise-features': enterpriseFeaturesConfig,
  'complete-form': completeFormConfig,
  'expression-validators-demo': expressionValidatorsConfig,
  'zod-schema-validation': zodSchemaValidationConfig,
  group: groupConfig,
  row: rowConfig,
  'container-field': containerFieldConfig,
  slider: sliderConfig,
  datepicker: datepickerConfig,
  input: inputConfig,
  textarea: textareaConfig,
  select: selectConfig,
  radio: radioConfig,
  checkbox: checkboxConfig,
  toggle: toggleConfig,
  'multi-checkbox': multiCheckboxConfig,
  button: buttonConfig,
  'wrapper-section': wrapperSectionConfig,
  'wrapper-array-actions': wrapperArrayActionsConfig,
};

export { inputScenario } from './input.scenario';
export { checkboxScenario } from './checkbox.scenario';
export { selectScenario } from './select.scenario';
export { toggleScenario } from './toggle.scenario';
export { radioScenario } from './radio.scenario';
export { multiCheckboxScenario } from './multi-checkbox.scenario';
export { textareaScenario } from './textarea.scenario';
export { datepickerScenario } from './datepicker.scenario';
export { sliderScenario } from './slider.scenario';
export { buttonScenario } from './button.scenario';
export { completeFormScenario } from './complete-form.scenario';
export { userRegistrationScenario } from './user-registration.scenario';
export { loginScenario } from './login.scenario';
export { heroDemoScenario } from './hero-demo.scenario';
export { contactScenario } from './contact.scenario';
export { paginatedFormScenario } from './paginated-form.scenario';
export { groupScenario } from './group.scenario';
export { rowScenario } from './row.scenario';
export { arrayScenario } from './array.scenario';
export { validationShowcaseScenario } from './validation-showcase.scenario';
export { defaultPropsScenario } from './default-props.scenario';
export { valueDerivationScenario } from './value-derivation.scenario';
export { zodSchemaValidationScenario } from './zod-schema-validation.scenario';
export { contactDynamicFieldsScenario } from './contact-dynamic-fields.scenario';
export { businessAccountFormScenario } from './business-account-form.scenario';
export { shippingBillingAddressScenario } from './shipping-billing-address.scenario';
export { ageConditionalFormScenario } from './age-conditional-form.scenario';
export { enterpriseFeaturesScenario } from './enterprise-features.scenario';

import { inputScenario } from './input.scenario';
import { checkboxScenario } from './checkbox.scenario';
import { selectScenario } from './select.scenario';
import { toggleScenario } from './toggle.scenario';
import { radioScenario } from './radio.scenario';
import { multiCheckboxScenario } from './multi-checkbox.scenario';
import { textareaScenario } from './textarea.scenario';
import { datepickerScenario } from './datepicker.scenario';
import { sliderScenario } from './slider.scenario';
import { buttonScenario } from './button.scenario';
import { completeFormScenario } from './complete-form.scenario';
import { userRegistrationScenario } from './user-registration.scenario';
import { loginScenario } from './login.scenario';
import { heroDemoScenario } from './hero-demo.scenario';
import { contactScenario } from './contact.scenario';
import { paginatedFormScenario } from './paginated-form.scenario';
import { groupScenario } from './group.scenario';
import { rowScenario } from './row.scenario';
import { arrayScenario } from './array.scenario';
import { validationShowcaseScenario } from './validation-showcase.scenario';
import { defaultPropsScenario } from './default-props.scenario';
import { valueDerivationScenario } from './value-derivation.scenario';
import { zodSchemaValidationScenario } from './zod-schema-validation.scenario';
import { contactDynamicFieldsScenario } from './contact-dynamic-fields.scenario';
import { businessAccountFormScenario } from './business-account-form.scenario';
import { shippingBillingAddressScenario } from './shipping-billing-address.scenario';
import { ageConditionalFormScenario } from './age-conditional-form.scenario';
import { enterpriseFeaturesScenario } from './enterprise-features.scenario';
import { ExampleScenario } from '../shared/types';

export const ALL_SCENARIOS: ExampleScenario[] = [
  inputScenario,
  checkboxScenario,
  selectScenario,
  toggleScenario,
  radioScenario,
  multiCheckboxScenario,
  textareaScenario,
  datepickerScenario,
  sliderScenario,
  buttonScenario,
  completeFormScenario,
  userRegistrationScenario,
  loginScenario,
  heroDemoScenario,
  contactScenario,
  paginatedFormScenario,
  groupScenario,
  rowScenario,
  arrayScenario,
  validationShowcaseScenario,
  defaultPropsScenario,
  valueDerivationScenario,
  zodSchemaValidationScenario,
  contactDynamicFieldsScenario,
  businessAccountFormScenario,
  shippingBillingAddressScenario,
  ageConditionalFormScenario,
  enterpriseFeaturesScenario,
];

export function getScenarioById(id: string): ExampleScenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

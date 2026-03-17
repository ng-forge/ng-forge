import { FormConfig } from '@ng-forge/dynamic-forms';

import { ageConditionalFormConfig } from './age-conditional-form.config';
import { arrayConfig } from './array.config';
import { businessAccountFormConfig } from './business-account-form.config';
import { completeFormConfig } from './complete-form.config';
import { contactConfig } from './contact.config';
import { contactDynamicFieldsConfig } from './contact-dynamic-fields.config';
import { enterpriseFeaturesConfig } from './enterprise-features.config';
import { expressionValidatorsConfig } from './expression-validators.config';
import { groupConfig } from './group.config';
import { loginConfig } from './login.config';
import { paginatedFormConfig } from './paginated-form.config';
import { rowConfig } from './row.config';
import { shippingBillingAddressConfig } from './shipping-billing-address.config';
import { simplifiedArrayConfig } from './simplified-array.config';
import { userRegistrationConfig } from './user-registration.config';
import { valueDerivationConfig } from './value-derivation.config';
import { zodSchemaValidationConfig } from './zod-schema-validation.config';

export { ageConditionalFormConfig } from './age-conditional-form.config';
export { arrayConfig } from './array.config';
export { businessAccountFormConfig } from './business-account-form.config';
export { completeFormConfig } from './complete-form.config';
export { contactConfig } from './contact.config';
export { contactDynamicFieldsConfig } from './contact-dynamic-fields.config';
export { enterpriseFeaturesConfig } from './enterprise-features.config';
export { expressionValidatorsConfig } from './expression-validators.config';
export { groupConfig } from './group.config';
export { loginConfig } from './login.config';
export { paginatedFormConfig } from './paginated-form.config';
export { rowConfig } from './row.config';
export { shippingBillingAddressConfig } from './shipping-billing-address.config';
export { simplifiedArrayConfig } from './simplified-array.config';
export { userRegistrationConfig } from './user-registration.config';
export { valueDerivationConfig } from './value-derivation.config';
export { zodSchemaValidationConfig } from './zod-schema-validation.config';

/**
 * Map of scenario keys to FormConfig objects.
 * Keys match the scenario identifiers used in docs-live-example elements.
 */
export const EXAMPLE_CONFIGS: Record<string, FormConfig> = {
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
};

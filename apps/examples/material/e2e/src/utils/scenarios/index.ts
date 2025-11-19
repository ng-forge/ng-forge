/**
 * Consolidated scenario exports for e2e testing
 *
 * All form configurations are properly typed with FormConfig and exported as const
 */

// Basic Forms
export { userProfileConfig } from './user-profile';
export { contactFormConfig } from './contact-form';
export { registrationFormConfig } from './registration-form';

// Multi-page Forms
export { registrationWizardConfig } from './registration-wizard';
export { ecommerceCheckoutConfig } from './ecommerce-checkout';

// Import for internal use
import { userProfileConfig } from './user-profile';
import { contactFormConfig } from './contact-form';
import { registrationFormConfig } from './registration-form';
import { registrationWizardConfig } from './registration-wizard';
import { ecommerceCheckoutConfig } from './ecommerce-checkout';

// Quick access scenarios for common testing patterns
export const QUICK_SCENARIOS = {
  // Basic forms
  userProfile: () => userProfileConfig,
  contactForm: () => contactFormConfig,
  registrationForm: () => registrationFormConfig,

  // Multi-page forms
  registrationWizard: () => registrationWizardConfig,
  ecommerceCheckout: () => ecommerceCheckoutConfig,
} as const;

/**
 * Test categories for organized e2e testing
 */
export const TEST_CATEGORIES = {
  BASIC_FORMS: ['userProfile', 'contactForm'] as const,
  VALIDATION_FORMS: ['registrationForm'] as const,
  MULTI_PAGE_FORMS: ['registrationWizard', 'ecommerceCheckout'] as const,
} as const;

/**
 * Helper function to get all scenarios in a category
 */
export function getScenariosByCategory(category: keyof typeof TEST_CATEGORIES) {
  return TEST_CATEGORIES[category].map((scenarioName) => ({
    name: scenarioName,
    config: QUICK_SCENARIOS[scenarioName](),
  }));
}

/**
 * Helper function to get a specific scenario by name
 */
export function getScenario(name: keyof typeof QUICK_SCENARIOS) {
  return QUICK_SCENARIOS[name]();
}

/**
 * Helper function to get all available scenario names
 */
export function getAllScenarioNames(): (keyof typeof QUICK_SCENARIOS)[] {
  return Object.keys(QUICK_SCENARIOS) as (keyof typeof QUICK_SCENARIOS)[];
}

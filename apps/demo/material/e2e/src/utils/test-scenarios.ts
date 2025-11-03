/**
 * Comprehensive test scenario configurations for e2e testing
 *
 * This module exports all the test configuration scenarios created for comprehensive
 * e2e testing of the dynamic form system. It includes single-page forms, multi-page
 * forms, translation scenarios, and realistic complex forms.
 */

// Import scenario classes for internal use
import { SinglePageScenarios } from './single-page-scenarios';
import { MultiPageScenarios } from './multi-page-scenarios';
import { TranslationScenarios } from './translation-scenarios';
import { RealisticScenarios } from './realistic-scenarios';

// Re-export all scenario classes for easy access
export { SinglePageScenarios } from './single-page-scenarios';
export { MultiPageScenarios } from './multi-page-scenarios';
export { TranslationScenarios } from './translation-scenarios';
export { RealisticScenarios, ALL_REALISTIC_SCENARIOS } from './realistic-scenarios';
export { FormConfigurationFactory } from './form-configuration-factory';
export { LayoutConfigurationBuilder } from './layout-configuration-builder';

// Quick access scenarios for common testing patterns
export const QUICK_SCENARIOS = {
  // Single-page forms
  userProfile: () => SinglePageScenarios.userProfile(),
  contactForm: () => SinglePageScenarios.contactForm(),
  registrationForm: () => SinglePageScenarios.registrationForm(),
  surveyForm: () => SinglePageScenarios.surveyForm(),
  addressForm: () => SinglePageScenarios.addressForm(),
  complexValidation: () => SinglePageScenarios.complexValidationForm(),
  gridLayout: () => SinglePageScenarios.gridLayoutForm(),

  // Multi-page forms
  registrationWizard: () => MultiPageScenarios.registrationWizard(),
  customerSurvey: () => MultiPageScenarios.customerSurvey(),
  jobApplication: () => MultiPageScenarios.jobApplication(),
  ecommerceCheckout: () => MultiPageScenarios.ecommerceCheckout(),

  // Translation scenarios
  contactFormTranslated: () => TranslationScenarios.contactFormTranslated(),
  registrationFormTranslated: () => TranslationScenarios.registrationFormTranslated(),
  dynamicSurveyTranslated: () => TranslationScenarios.dynamicSurveyTranslated(),
  multiPageRegistrationTranslated: () => TranslationScenarios.multiPageRegistrationTranslated(),

  // Realistic complex scenarios
  ecommerceRegistration: () => RealisticScenarios.ecommerceRegistration(),
  healthcareRegistration: () => RealisticScenarios.healthcareRegistration(),
  corporateEventRegistration: () => RealisticScenarios.corporateEventRegistration(),
} as const;

/**
 * Test categories for organized e2e testing
 */
export const TEST_CATEGORIES = {
  BASIC_FORMS: ['userProfile', 'contactForm'],
  VALIDATION_FORMS: ['registrationForm', 'complexValidation'],
  CONDITIONAL_FORMS: ['surveyForm', 'addressForm'],
  LAYOUT_FORMS: ['gridLayout'],
  MULTI_PAGE_FORMS: ['registrationWizard', 'customerSurvey', 'jobApplication', 'ecommerceCheckout'],
  TRANSLATION_FORMS: ['contactFormTranslated', 'registrationFormTranslated', 'dynamicSurveyTranslated', 'multiPageRegistrationTranslated'],
  REALISTIC_SCENARIOS: ['ecommerceRegistration', 'healthcareRegistration', 'corporateEventRegistration'],
} as const;

/**
 * Helper function to get all scenarios in a category
 */
export function getScenariosByCategory(category: keyof typeof TEST_CATEGORIES) {
  return TEST_CATEGORIES[category].map((scenarioName) => ({
    name: scenarioName,
    config: QUICK_SCENARIOS[scenarioName as keyof typeof QUICK_SCENARIOS](),
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

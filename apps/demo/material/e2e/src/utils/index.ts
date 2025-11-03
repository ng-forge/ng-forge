/**
 * E2E Testing Utilities for Dynamic Form Material
 *
 * This module provides comprehensive utilities for testing dynamic forms in e2e scenarios.
 * Based on existing unit test patterns from DynamicFormTestUtils and demo components.
 */

export { E2EFormConfigFactory, type E2EFormConfig } from './e2e-form-config-factory';

export { E2EFormHelpers, E2EPaginationHelpers, E2ECrossFieldValidationHelpers, E2ETranslationHelpers } from './e2e-form-helpers';

export { E2ETestHostComponent } from './e2e-test-host.component';

/**
 * Common test data and configurations for reuse across tests
 */
export const E2E_TEST_DATA = {
  users: {
    validUser: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      country: 'us',
    },
    invalidUser: {
      firstName: 'J', // Too short
      lastName: '', // Required field empty
      email: 'invalid-email', // Invalid format
      phone: 'abc', // Invalid format
      country: '',
    },
  },
  countries: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
  ],
  notifications: [
    { value: 'email', label: 'Email notifications' },
    { value: 'sms', label: 'SMS notifications' },
    { value: 'push', label: 'Push notifications' },
    { value: 'newsletter', label: 'Newsletter' },
  ],
  translations: {
    en: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      submit: 'Create Account',
    },
    es: {
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo Electrónico',
      submit: 'Crear Cuenta',
    },
    fr: {
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      email: 'Adresse e-mail',
      submit: 'Créer un compte',
    },
  },
  css: {
    classes: {
      formIntroText: 'form-intro-text',
      sectionHeader: 'section-header',
      nameRowContainer: 'name-row-container',
      firstNameInput: 'first-name-input',
      lastNameInput: 'last-name-input',
      emailInput: 'email-input',
      phoneInput: 'phone-input',
      contactInfoGroup: 'contact-info-group',
      countrySelect: 'country-select',
      termsCheckbox: 'terms-checkbox',
      submitButton: 'submit-button',
    },
  },
  viewports: {
    mobile: { width: 375, height: 667, name: 'mobile' },
    tablet: { width: 768, height: 1024, name: 'tablet' },
    desktop: { width: 1440, height: 900, name: 'desktop' },
    widescreen: { width: 1920, height: 1080, name: 'widescreen' },
  },
} as const;

/**
 * Common utility functions for e2e tests
 */
export const E2E_UTILS = {
  /**
   * Wait for form to be ready and initialized
   */
  async waitForFormReady(page: any, testId: string = 'default'): Promise<void> {
    await page.waitForSelector(`[data-testid="dynamic-form-${testId}"]`);
    await page.waitForTimeout(500); // Allow form to fully initialize
  },

  /**
   * Capture screenshot with timestamp for debugging
   */
  async captureDebugScreenshot(page: any, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `screenshots/debug-${name}-${timestamp}.png`,
      fullPage: true,
    });
  },

  /**
   * Wait for form submission event
   */
  async waitForSubmission(page: any, timeout: number = 5000): Promise<any> {
    return page.waitForEvent('console', {
      predicate: (msg: any) => msg.text().includes('Form Submitted:'),
      timeout,
    });
  },

  /**
   * Get form validation summary
   */
  async getValidationSummary(page: any): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Find all error elements
    const errorElements = await page.locator('mat-error, .error-message').all();

    for (const errorEl of errorElements) {
      const message = await errorEl.textContent();
      const fieldContainer = await errorEl.locator('..').getAttribute('data-testid');

      if (message && fieldContainer) {
        errors.push({
          field: fieldContainer,
          message: message.trim(),
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
} as const;

import { expect, test } from '@playwright/test';
import { E2ECrossFieldValidationHelpers, E2EFormHelpers } from './utils/e2e-form-helpers';
import { getScenario, getScenariosByCategory } from './utils/test-scenarios';

test.describe('Basic Form Interactions', () => {
  let formHelpers: E2EFormHelpers;
  let validationHelpers: E2ECrossFieldValidationHelpers;

  test.beforeEach(async ({ page }) => {
    formHelpers = new E2EFormHelpers(page);
    validationHelpers = new E2ECrossFieldValidationHelpers(page);
  });

  test.describe('User Profile Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      // Load user profile scenario
      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should fill and submit user profile form', async ({ page }) => {
      // Fill basic information
      await formHelpers.fillInput('firstName', 'John');
      await formHelpers.fillInput('lastName', 'Doe');
      await formHelpers.fillInput('email', 'john.doe@example.com');
      await formHelpers.fillInput('phoneNumber', '555-123-4567');

      // Fill date of birth
      await formHelpers.fillInput('dateOfBirth', '1990-01-15');

      // Select gender
      await formHelpers.selectOption('gender', 'male');

      // Fill address
      await formHelpers.fillInput('street', '123 Main St');
      await formHelpers.fillInput('city', 'Anytown');
      await formHelpers.selectOption('state', 'CA');
      await formHelpers.fillInput('zipCode', '12345');
      await formHelpers.selectOption('country', 'US');

      // Fill preferences
      await formHelpers.selectMultipleOptions('interests', ['technology', 'sports']);
      await formHelpers.toggleCheckbox('newsletter', true);

      // Submit form
      await formHelpers.clickButton('submit');

      // Verify submission
      await expect(page.locator('[data-testid="submission-log-default"]')).toBeVisible();
      const submissionElement = page.locator('[data-testid="submission-0"]');
      await expect(submissionElement).toContainText('john.doe@example.com');
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit without filling required fields
      await formHelpers.clickButton('submit');

      // Check that required field errors are displayed
      const requiredFields = ['firstName', 'lastName', 'email'];
      for (const field of requiredFields) {
        const errors = await formHelpers.getFieldErrors(field);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.toLowerCase().includes('required'))).toBeTruthy();
      }
    });

    test('should validate email format', async ({ page }) => {
      await formHelpers.fillInput('email', 'invalid-email');

      const errors = await formHelpers.getFieldErrors('email');
      expect(errors.some((error) => error.toLowerCase().includes('email'))).toBeTruthy();

      // Fix email format
      await formHelpers.fillInput('email', 'valid@example.com');

      const errorsAfter = await formHelpers.getFieldErrors('email');
      expect(errorsAfter.length).toBe(0);
    });

    test('should validate phone number format', async ({ page }) => {
      await formHelpers.fillInput('phoneNumber', '123');

      const errors = await formHelpers.getFieldErrors('phoneNumber');
      expect(errors.some((error) => error.toLowerCase().includes('phone'))).toBeTruthy();
    });
  });

  test.describe('Contact Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('contactForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should submit contact form with all fields', async ({ page }) => {
      await formHelpers.fillInput('name', 'Jane Smith');
      await formHelpers.fillInput('email', 'jane@example.com');
      await formHelpers.selectOption('subject', 'general');
      await formHelpers.fillInput('message', 'This is a test message for the contact form.');
      await formHelpers.selectOption('priority', 'medium');
      await formHelpers.toggleCheckbox('copyMe', true);

      await formHelpers.clickButton('submit');

      // Verify submission
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('jane@example.com');
    });

    test('should validate message length', async ({ page }) => {
      // Fill minimum required fields
      await formHelpers.fillInput('name', 'Test User');
      await formHelpers.fillInput('email', 'test@example.com');

      // Try with too short message
      await formHelpers.fillInput('message', 'Hi');

      const errors = await formHelpers.getFieldErrors('message');
      expect(errors.some((error) => error.includes('10'))).toBeTruthy();
    });
  });

  test.describe('Registration Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('registrationForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should validate password requirements', async ({ page }) => {
      await formHelpers.fillInput('password', 'weak');

      const errors = await formHelpers.getFieldErrors('password');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.includes('8'))).toBeTruthy();
    });

    test('should validate password confirmation', async ({ page }) => {
      await validationHelpers.validatePasswordMatch('password', 'confirmPassword');
    });

    test('should validate age requirement', async ({ page }) => {
      await formHelpers.fillInput('age', '15');

      const errors = await formHelpers.getFieldErrors('age');
      expect(errors.some((error) => error.includes('18'))).toBeTruthy();
    });

    test('should complete full registration flow', async ({ page }) => {
      await formHelpers.fillInput('username', 'newuser123');
      await formHelpers.fillInput('email', 'newuser@example.com');
      await formHelpers.fillInput('password', 'SecurePass123!');
      await formHelpers.fillInput('confirmPassword', 'SecurePass123!');
      await formHelpers.fillInput('firstName', 'New');
      await formHelpers.fillInput('lastName', 'User');
      await formHelpers.fillInput('age', '25');
      await formHelpers.toggleCheckbox('agreeToTerms', true);
      await formHelpers.toggleCheckbox('subscribeNewsletter', false);

      await formHelpers.clickButton('submit');

      // Verify successful registration
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('newuser@example.com');
    });
  });

  test.describe('Form State Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should track form validity state', async ({ page }) => {
      // Initially form should be invalid (required fields empty)
      expect(await formHelpers.isFormValid()).toBeFalsy();

      // Fill required fields
      await formHelpers.fillInput('firstName', 'John');
      await formHelpers.fillInput('lastName', 'Doe');
      await formHelpers.fillInput('email', 'john@example.com');

      // Form should now be valid
      expect(await formHelpers.isFormValid()).toBeTruthy();
    });

    test('should persist form values during interaction', async ({ page }) => {
      await formHelpers.fillInput('firstName', 'Persistent');
      await formHelpers.fillInput('lastName', 'User');

      // Navigate away and back (simulate page interaction)
      await page.locator('body').click();

      // Values should still be there
      const firstNameValue = await page.locator('[data-testid="firstName"]').inputValue();
      const lastNameValue = await page.locator('[data-testid="lastName"]').inputValue();

      expect(firstNameValue).toBe('Persistent');
      expect(lastNameValue).toBe('User');
    });

    test('should show form data in debug output', async ({ page }) => {
      await formHelpers.fillInput('firstName', 'Debug');
      await formHelpers.fillInput('lastName', 'Test');

      // Open debug details
      await page.locator('.form-state summary').click();

      // Check that form value is displayed
      const formValueElement = page.locator('[data-testid="form-value-default"]');
      await expect(formValueElement).toContainText('Debug');
      await expect(formValueElement).toContainText('Test');
    });
  });

  test.describe('All Basic Form Categories', () => {
    test('should load and interact with all basic form scenarios', async ({ page }) => {
      const basicScenarios = getScenariosByCategory('BASIC_FORMS');

      for (const scenario of basicScenarios) {
        await page.goto('/e2e-test');

        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, scenario.config);
        await page.reload();

        // Verify form loads
        await expect(page.locator('dynamic-form')).toBeVisible();

        // Verify form has interactive fields
        const inputs = page.locator('input, select, textarea');
        const inputCount = await inputs.count();
        expect(inputCount).toBeGreaterThan(0);

        console.log(`✓ Verified scenario: ${scenario.name} with ${inputCount} inputs`);
      }
    });
  });
});

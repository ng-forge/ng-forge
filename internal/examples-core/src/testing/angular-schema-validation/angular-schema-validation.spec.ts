import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Angular Schema Validation E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/angular-schema-validation');
  });

  test.describe('Password Confirmation', () => {
    test('should have submit disabled with empty fields', async ({ page, helpers }) => {
      await page.goto('/#/test/angular-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('angular-password-confirmation-test');
      await expect(scenario).toBeVisible();

      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (required validation)
      await expect(submitButton).toBeDisabled();
    });

    test('should have submit disabled with mismatched passwords', async ({ page, helpers }) => {
      await page.goto('/#/test/angular-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('angular-password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter mismatched passwords
      await helpers.fillInput(passwordInput, 'password123');
      await helpers.fillInput(confirmInput, 'different123');
      await page.waitForTimeout(300);

      // Submit should be disabled (Angular validateTree validation fails)
      await expect(submitButton).toBeDisabled();
    });

    test('should display error message for password mismatch', async ({ page, helpers }) => {
      await page.goto('/#/test/angular-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('angular-password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');

      // Enter mismatched passwords
      await helpers.fillInput(passwordInput, 'password123');
      await helpers.fillInput(confirmInput, 'different123');
      await helpers.blurInput(confirmInput);

      // Verify error is displayed on confirmPassword field
      await helpers.expectErrorVisible(scenario, 'confirmPassword');
      const errorElement = helpers.getFieldError(scenario, 'confirmPassword');
      await expect(errorElement).toContainText('Passwords must match');

      // Verify no error on password field
      await helpers.expectNoErrorVisible(scenario, 'password');
    });

    test('should have submit enabled with matching valid passwords', async ({ page, helpers }) => {
      await page.goto('/#/test/angular-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('angular-password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter valid matching passwords
      await helpers.fillInput(passwordInput, 'ValidPassword123');
      await helpers.fillInput(confirmInput, 'ValidPassword123');
      await page.waitForTimeout(300);

      // Submit should be enabled (all validations pass)
      await expect(submitButton).toBeEnabled();
    });

    test('should clear error when passwords match', async ({ page, helpers }) => {
      await page.goto('/#/test/angular-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('angular-password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');

      // Create error state
      await helpers.fillInput(passwordInput, 'password123');
      await helpers.fillInput(confirmInput, 'mismatch123');
      await helpers.blurInput(confirmInput);
      await helpers.expectErrorVisible(scenario, 'confirmPassword');

      // Fix the error
      await helpers.clearAndFill(confirmInput, 'password123');
      await helpers.blurInput(confirmInput);

      // Error should be cleared
      await helpers.expectNoErrorVisible(scenario, 'confirmPassword');
    });

    test('should disable submit when passwords become mismatched', async ({ page, helpers }) => {
      await page.goto('/#/test/angular-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('angular-password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Start with valid matching passwords
      await helpers.fillInput(passwordInput, 'ValidPassword123');
      await helpers.fillInput(confirmInput, 'ValidPassword123');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeEnabled();

      // Change password to create mismatch
      await helpers.clearAndFill(passwordInput, 'DifferentPassword456');
      await page.waitForTimeout(300);

      // Submit should be disabled again
      await expect(submitButton).toBeDisabled();

      // Fix the mismatch
      await helpers.clearAndFill(confirmInput, 'DifferentPassword456');
      await page.waitForTimeout(300);

      // Submit should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });
});

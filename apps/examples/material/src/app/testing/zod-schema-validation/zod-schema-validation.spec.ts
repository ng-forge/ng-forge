import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Zod Schema Validation E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/zod-schema-validation');
  });

  test.describe('Password Confirmation', () => {
    test('should have submit disabled with empty fields', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (required validation)
      await expect(submitButton).toBeDisabled();
    });

    test('should have submit disabled when password is too short', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter short password (less than 8 characters)
      await helpers.fillInput(passwordInput, 'short');
      await helpers.fillInput(confirmInput, 'short');
      await page.waitForTimeout(300);

      // Submit should be disabled (Zod min length validation fails)
      await expect(submitButton).toBeDisabled();
    });

    test('should have submit disabled with mismatched passwords', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter valid but mismatched passwords
      await helpers.fillInput(passwordInput, 'password123');
      await helpers.fillInput(confirmInput, 'different123');
      await page.waitForTimeout(300);

      // Submit should be disabled (Zod refine validation fails)
      await expect(submitButton).toBeDisabled();
    });

    test('should have submit enabled with matching valid passwords', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter valid matching passwords (8+ characters)
      await helpers.fillInput(passwordInput, 'ValidPassword123');
      await helpers.fillInput(confirmInput, 'ValidPassword123');
      await page.waitForTimeout(300);

      // Submit should be enabled (all validations pass)
      await expect(submitButton).toBeEnabled();
    });

    test('should disable submit when passwords become mismatched', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
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

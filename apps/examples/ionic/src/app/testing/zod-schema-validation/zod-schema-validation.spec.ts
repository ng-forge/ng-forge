import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Zod Schema Validation E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/zod-schema-validation');
  });

  test.describe('Password Confirmation', () => {
    test('should have submit disabled with empty fields', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (required validation)
      // Note: Ionic uses aria-disabled instead of standard disabled attribute
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('should have submit disabled when password is too short', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter short password (less than 8 characters)
      await helpers.fillInput(passwordInput, 'short');
      await ionBlur(passwordInput);
      await helpers.fillInput(confirmInput, 'short');
      await ionBlur(confirmInput);
      await page.waitForTimeout(300);

      // Submit should be disabled (Zod min length validation fails)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('should have submit disabled with mismatched passwords', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter valid but mismatched passwords
      await helpers.fillInput(passwordInput, 'password123');
      await ionBlur(passwordInput);
      await helpers.fillInput(confirmInput, 'different123');
      await ionBlur(confirmInput);
      await page.waitForTimeout(300);

      // Submit should be disabled (Zod refine validation fails)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('should have submit enabled with matching valid passwords', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter valid matching passwords (8+ characters)
      await helpers.fillInput(passwordInput, 'ValidPassword123');
      await ionBlur(passwordInput);
      await helpers.fillInput(confirmInput, 'ValidPassword123');
      await ionBlur(confirmInput);
      await page.waitForTimeout(300);

      // Submit should be enabled (all validations pass)
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('should disable submit when passwords become mismatched', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/password-confirmation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-confirmation-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Start with valid matching passwords
      await helpers.fillInput(passwordInput, 'ValidPassword123');
      await ionBlur(passwordInput);
      await helpers.fillInput(confirmInput, 'ValidPassword123');
      await ionBlur(confirmInput);
      await page.waitForTimeout(300);
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');

      // Change password to create mismatch
      await helpers.clearAndFill(passwordInput, 'DifferentPassword456');
      await ionBlur(passwordInput);
      await page.waitForTimeout(300);

      // Submit should be disabled again
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true');

      // Fix the mismatch
      await helpers.clearAndFill(confirmInput, 'DifferentPassword456');
      await ionBlur(confirmInput);
      await page.waitForTimeout(300);

      // Submit should be enabled again
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});

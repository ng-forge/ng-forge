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

  test.describe('Comprehensive Validation (Nested Objects & Arrays)', () => {
    test('should have submit disabled with empty form', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');
      await expect(scenario).toBeVisible();

      const submitButton = helpers.getSubmitButton(scenario);
      await expect(submitButton).toBeDisabled();
    });

    test('should display error on nested field path (user.email)', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');

      // Get nested email input (inside user group)
      const emailInput = scenario.locator('#user #email input');
      await helpers.fillInput(emailInput, 'invalid-email');

      // Verify error is displayed on email field (PrimeNG uses .p-error)
      const errorElement = scenario.locator('#user #email .p-error').first();
      await expect(errorElement).toContainText('Invalid email');
    });

    test('should display error on nested field (user.firstName)', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');

      // Get firstName input inside user group
      const firstNameInput = scenario.locator('#user #firstName input');
      await helpers.fillInput(firstNameInput, 'A');

      // Verify error is displayed
      const errorElement = scenario.locator('#user #firstName .p-error').first();
      await expect(errorElement).toContainText('at least 2 characters');
    });

    test('should display error on array item field (addresses[0].zip)', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');

      // Get ZIP input in first address (addresses array has initial empty item)
      const zipInput = scenario.locator('#addresses [id^="zip"] input').first();
      await helpers.fillInput(zipInput, '123');

      // Verify error is displayed
      const errorElement = scenario.locator('#addresses [id^="zip"] .p-error').first();
      await expect(errorElement).toContainText('5 digits');
    });

    test('should validate all fields pass and enable submit', async ({ page, helpers }) => {
      await page.goto('/#/test/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');
      const submitButton = helpers.getSubmitButton(scenario);

      // Fill user info
      const emailInput = scenario.locator('#user #email input');
      await helpers.fillInput(emailInput, 'test@example.com');

      const firstNameInput = scenario.locator('#user #firstName input');
      await helpers.fillInput(firstNameInput, 'John');

      const lastNameInput = scenario.locator('#user #lastName input');
      await helpers.fillInput(lastNameInput, 'Springfield');

      // Fill address with city matching last name (for cross-field validation)
      const streetInput = scenario.locator('#addresses [id^="street"] input').first();
      await helpers.fillInput(streetInput, '123 Main Street');

      const cityInput = scenario.locator('#addresses [id^="city"] input').first();
      await helpers.fillInput(cityInput, 'Springfield');

      const zipInput = scenario.locator('#addresses [id^="zip"] input').first();
      await helpers.fillInput(zipInput, '12345');

      await page.waitForTimeout(300);

      // All validations should pass - submit should be enabled
      await expect(submitButton).toBeEnabled();
    });
  });
});

import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/404/i, /Failed to load resource/i],
});

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

  test.describe('Comprehensive Validation (Nested Objects & Arrays)', () => {
    // Skip Firefox due to Playwright + Ionic shadow DOM input flakiness
    // Firefox's fill() method intermittently fails to set input values inside Ionic's shadow DOM
    test.skip(({ browserName }) => browserName === 'firefox', 'Firefox has flaky input handling with Ionic shadow DOM');

    test('should have submit disabled with empty form', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');
      await expect(scenario).toBeVisible();

      const submitButton = helpers.getSubmitButton(scenario);
      // Ionic uses aria-disabled instead of disabled attribute
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('should display error on nested field path (user.email)', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');

      // Get nested email input (inside user group)
      const emailInput = scenario.locator('#user #email input');
      await helpers.fillInput(emailInput, 'invalid-email');
      await ionBlur(emailInput);

      // Verify error is displayed on email field (Ionic uses ion-note for errors)
      // Schema message is "Invalid email format"
      const errorElement = scenario.locator('#user #email ion-note.df-ion-error').first();
      await expect(errorElement).toContainText('Invalid email format');
    });

    test('should display error on nested field (user.firstName)', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');

      // Get firstName input inside user group
      const firstNameInput = scenario.locator('#user #firstName input');
      await helpers.fillInput(firstNameInput, 'A');
      await ionBlur(firstNameInput);

      // Verify error is displayed (Zod min(2) validation error)
      const errorElement = scenario.locator('#user #firstName ion-note.df-ion-error').first();
      await expect(errorElement).toContainText('at least 2 characters');
    });

    test('should display error on array item field (addresses[0].zip)', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');

      // Get ZIP input in first address (addresses array has initial empty item)
      const zipInput = scenario.locator('#addresses #zip input').first();
      await helpers.fillInput(zipInput, '123');
      await ionBlur(zipInput);

      // Verify error is displayed (Zod regex validation error)
      const errorElement = scenario.locator('#addresses #zip ion-note.df-ion-error').first();
      await expect(errorElement).toContainText('5 digits');
    });

    test('should validate all fields pass and enable submit', async ({ page, helpers }) => {
      await page.goto('/#/testing/zod-schema-validation/comprehensive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comprehensive-validation-test');
      const submitButton = helpers.getSubmitButton(scenario);

      // Fill user info
      const emailInput = scenario.locator('#user #email input');
      await helpers.fillInput(emailInput, 'test@example.com');
      await ionBlur(emailInput);

      const firstNameInput = scenario.locator('#user #firstName input');
      await helpers.fillInput(firstNameInput, 'John');
      await ionBlur(firstNameInput);

      const lastNameInput = scenario.locator('#user #lastName input');
      await helpers.fillInput(lastNameInput, 'Springfield');
      await ionBlur(lastNameInput);

      // Fill address with city matching last name (for cross-field validation)
      const streetInput = scenario.locator('#addresses #street input').first();
      await helpers.fillInput(streetInput, '123 Main Street');
      await ionBlur(streetInput);

      const cityInput = scenario.locator('#addresses #city input').first();
      await helpers.fillInput(cityInput, 'Springfield');
      await ionBlur(cityInput);

      const zipInput = scenario.locator('#addresses #zip input').first();
      await helpers.fillInput(zipInput, '12345');
      await ionBlur(zipInput);

      await page.waitForTimeout(300);

      // All validations should pass - submit should be enabled
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});

import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Advanced Validation E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/advanced-validation');
  });

  test.describe('Custom Validator', () => {
    test('should validate password strength using custom validator', async ({ helpers }) => {
      const scenario = helpers.getScenario('custom-validator-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (no value)
      await expect(submitButton).toBeDisabled();

      // Try weak password (missing special character, uppercase, etc.)
      await helpers.fillInput(passwordInput, 'weak');

      // Submit should still be disabled (invalid password)
      await expect(submitButton).toBeDisabled();

      // Fill strong password that meets requirements
      await helpers.fillInput(passwordInput, 'Strong@123');

      // Submit should now be enabled (valid password)
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Cross-Field Validation', () => {
    test('should validate password matching across fields', async ({ helpers }) => {
      const scenario = helpers.getScenario('cross-field-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit disabled initially
      await expect(submitButton).toBeDisabled();

      // Enter matching passwords
      await helpers.fillInput(passwordInput, 'MyPassword123');
      await helpers.fillInput(confirmPasswordInput, 'MyPassword123');

      // Submit should be enabled (passwords match)
      await expect(submitButton).toBeEnabled();

      // Now try mismatched passwords
      await helpers.clearAndFill(confirmPasswordInput, 'DifferentPassword');

      // Submit should be disabled (passwords don't match)
      await expect(submitButton).toBeDisabled();

      // Fix the mismatch
      await helpers.clearAndFill(confirmPasswordInput, 'MyPassword123');

      // Submit should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Range Validation', () => {
    test('should validate that maximum is greater than minimum', async ({ helpers }) => {
      const scenario = helpers.getScenario('range-validation-test');
      await expect(scenario).toBeVisible();

      const minInput = helpers.getInput(scenario, 'minValue');
      const maxInput = helpers.getInput(scenario, 'maxValue');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit disabled initially
      await expect(submitButton).toBeDisabled();

      // Enter valid range
      await helpers.fillInput(minInput, '10');
      await helpers.fillInput(maxInput, '20');

      // Submit should be enabled (valid range)
      await expect(submitButton).toBeEnabled();

      // Enter invalid range (max < min)
      await helpers.clearAndFill(maxInput, '5');

      // Submit should be disabled (invalid range)
      await expect(submitButton).toBeDisabled();

      // Fix the range
      await helpers.clearAndFill(maxInput, '25');

      // Submit should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Conditional Validation', () => {
    test('should apply validators conditionally based on field values', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('conditional-validator-test');
      await expect(scenario).toBeVisible();

      const isAdultCheckbox = scenario.locator('#isAdult input[type="checkbox"]');
      const ageInput = helpers.getInput(scenario, 'age');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially, form should be valid without age (checkbox unchecked, age not required)
      await expect(submitButton).toBeEnabled();

      // Check the "I am 18 or older" checkbox
      await isAdultCheckbox.check();
      await page.waitForTimeout(500);

      // Now age is required but not filled - submit should be disabled
      await expect(submitButton).toBeDisabled();

      // Fill age less than 18 (invalid - below minimum)
      await helpers.fillInput(ageInput, '16');
      await page.waitForTimeout(300);

      // Submit should still be disabled (age below minimum)
      await expect(submitButton).toBeDisabled();

      // Fill valid age (18 or older)
      await helpers.clearAndFill(ageInput, '25');

      // Submit should now be enabled (valid age)
      await expect(submitButton).toBeEnabled();

      // Uncheck the checkbox
      await isAdultCheckbox.uncheck();
      await page.waitForTimeout(500);

      // Submit should still be enabled (age no longer required)
      await expect(submitButton).toBeEnabled();

      // Clear the age field
      await ageInput.fill('');
      await page.waitForTimeout(300);

      // Should still be enabled (age not required when checkbox unchecked)
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Multiple Validators', () => {
    test('should apply multiple validators to a single field', async ({ helpers }) => {
      const scenario = helpers.getScenario('multiple-validators-test');
      await expect(scenario).toBeVisible();

      const usernameInput = helpers.getInput(scenario, 'username');
      const submitButton = helpers.getSubmitButton(scenario);

      // Test empty (required validator) - submit should be disabled
      await expect(submitButton).toBeDisabled();

      // Test too short (minLength validator)
      await helpers.fillInput(usernameInput, 'ab');

      // Test invalid pattern (spaces not allowed)
      await helpers.clearAndFill(usernameInput, 'user name');

      // Test reserved word (custom validator)
      await helpers.clearAndFill(usernameInput, 'admin');

      // Test another reserved word
      await helpers.clearAndFill(usernameInput, 'root');

      // Test valid username - submit should be enabled
      await helpers.clearAndFill(usernameInput, 'valid_user_123');
      await expect(submitButton).toBeEnabled();
    });
  });
});

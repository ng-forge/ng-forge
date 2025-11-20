import { expect, test } from '@playwright/test';

test.describe('Advanced Validation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/#/test/advanced-validation');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Custom Validator', () => {
    test('should validate password strength using custom validator', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="custom-validator-test"]');
      await expect(scenario).toBeVisible();

      const passwordInput = scenario.locator('#password input');
      const submitButton = scenario.locator('#submit button');

      // Submit should be disabled initially (no value)
      await expect(submitButton).toBeDisabled();

      // Try weak password (missing special character, uppercase, etc.)
      await passwordInput.fill('weak');
      await page.waitForTimeout(300);

      // Submit should still be disabled (invalid password)
      await expect(submitButton).toBeDisabled();

      // Fill strong password that meets requirements
      await passwordInput.fill('Strong@123');
      await page.waitForTimeout(300);

      // Submit should now be enabled (valid password)
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Cross-Field Validation', () => {
    test('should validate password matching across fields', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="cross-field-test"]');
      await expect(scenario).toBeVisible();

      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');
      const submitButton = scenario.locator('#submit button');

      // Submit disabled initially
      await expect(submitButton).toBeDisabled();

      // Enter matching passwords
      await passwordInput.fill('MyPassword123');
      await confirmPasswordInput.fill('MyPassword123');
      await page.waitForTimeout(300);

      // Submit should be enabled (passwords match)
      await expect(submitButton).toBeEnabled();

      // Now try mismatched passwords
      await confirmPasswordInput.fill('DifferentPassword');
      await page.waitForTimeout(300);

      // Submit should be disabled (passwords don't match)
      await expect(submitButton).toBeDisabled();

      // Fix the mismatch
      await confirmPasswordInput.fill('MyPassword123');
      await page.waitForTimeout(300);

      // Submit should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Range Validation', () => {
    test('should validate that maximum is greater than minimum', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="range-validation-test"]');
      await expect(scenario).toBeVisible();

      const minInput = scenario.locator('#minValue input');
      const maxInput = scenario.locator('#maxValue input');
      const submitButton = scenario.locator('#submit button');

      // Submit disabled initially
      await expect(submitButton).toBeDisabled();

      // Enter valid range
      await minInput.fill('10');
      await maxInput.fill('20');
      await page.waitForTimeout(300);

      // Submit should be enabled (valid range)
      await expect(submitButton).toBeEnabled();

      // Enter invalid range (max < min)
      await maxInput.fill('5');
      await page.waitForTimeout(300);

      // Submit should be disabled (invalid range)
      await expect(submitButton).toBeDisabled();

      // Fix the range
      await maxInput.fill('25');
      await page.waitForTimeout(300);

      // Submit should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Conditional Validation', () => {
    test('should apply validators conditionally based on field values', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="conditional-validator-test"]');
      await expect(scenario).toBeVisible();

      const isAdultCheckbox = scenario.locator('#isAdult input[type="checkbox"]');
      const ageInput = scenario.locator('#age input');
      const submitButton = scenario.locator('#submit button');

      // Initially, form should be valid without age (checkbox unchecked, age not required)
      // Submit should be enabled
      await expect(submitButton).toBeEnabled();

      // Check the "I am 18 or older" checkbox
      await isAdultCheckbox.check();
      await page.waitForTimeout(500);

      // Now age is required but not filled - submit should be disabled
      await expect(submitButton).toBeDisabled();

      // Fill age less than 18 (invalid - below minimum)
      await ageInput.fill('16');
      await page.waitForTimeout(500);

      // Submit should still be disabled (age below minimum)
      await expect(submitButton).toBeDisabled();

      // Fill valid age (18 or older)
      await ageInput.fill('25');
      await page.waitForTimeout(300);

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
    test('should apply multiple validators to a single field', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="multiple-validators-test"]');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const submitButton = scenario.locator('#submit button');

      // Test empty (required validator) - submit should be disabled
      await expect(submitButton).toBeDisabled();

      // Test too short (minLength validator)
      await usernameInput.fill('ab');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeDisabled();

      // Test invalid pattern (spaces not allowed)
      await usernameInput.fill('user name');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeDisabled();

      // Test reserved word (custom validator)
      await usernameInput.fill('admin');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeDisabled();

      // Test another reserved word
      await usernameInput.fill('root');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeDisabled();

      // Test valid username - submit should be enabled
      await usernameInput.fill('valid_user_123');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeEnabled();
    });
  });
});

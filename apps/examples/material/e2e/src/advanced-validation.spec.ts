import { expect, test } from '@playwright/test';

test.describe('Advanced Validation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/test/advanced-validation');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Custom Validator', () => {
    test('should validate password strength using custom validator', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="custom-validator-test"]');
      await expect(scenario).toBeVisible();

      const passwordInput = scenario.locator('#password input');
      const submitButton = scenario.locator('#submit button');

      // Try weak password (missing special character, uppercase, etc.)
      await passwordInput.fill('weak');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Should show validation error
      const passwordField = scenario.locator('#password');
      await expect(passwordField.locator('mat-error')).toBeVisible();

      // Fill strong password that meets requirements
      await passwordInput.fill('Strong@123');
      await page.waitForTimeout(300);

      // Error should disappear
      await expect(passwordField.locator('mat-error')).not.toBeVisible();

      // Submit should succeed
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
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

      // Enter matching passwords
      await passwordInput.fill('MyPassword123');
      await confirmPasswordInput.fill('MyPassword123');
      await page.waitForTimeout(300);

      // Should not show error when matching
      const confirmField = scenario.locator('#confirmPassword');
      await expect(confirmField.locator('mat-error')).not.toBeVisible();

      // Submit should succeed
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Now try mismatched passwords
      await confirmPasswordInput.fill('DifferentPassword');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Should show validation error
      await expect(confirmField.locator('mat-error')).toBeVisible();

      // Fix the mismatch
      await confirmPasswordInput.fill('MyPassword123');
      await page.waitForTimeout(300);

      // Error should disappear
      await expect(confirmField.locator('mat-error')).not.toBeVisible();
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

      // Enter valid range
      await minInput.fill('10');
      await maxInput.fill('20');
      await page.waitForTimeout(300);

      // Should not show error
      const maxField = scenario.locator('#maxValue');
      await expect(maxField.locator('mat-error')).not.toBeVisible();

      // Submit should succeed
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Enter invalid range (max < min)
      await maxInput.fill('5');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Should show validation error
      await expect(maxField.locator('mat-error')).toBeVisible();

      // Fix the range
      await maxInput.fill('25');
      await page.waitForTimeout(300);

      // Error should disappear
      await expect(maxField.locator('mat-error')).not.toBeVisible();
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

      // Initially, form should be submittable without age
      await submitButton.click({ force: true });
      await page.waitForTimeout(300);

      // Check the "I am 18 or older" checkbox
      await isAdultCheckbox.check();
      await page.waitForTimeout(500);

      // Try to submit without entering age
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Should show required error
      const ageField = scenario.locator('#age');
      await expect(ageField.locator('mat-error')).toBeVisible();

      // Fill age less than 18
      await ageInput.fill('16');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Should show minimum age error
      await expect(ageField.locator('mat-error')).toBeVisible();

      // Fill valid age (18 or older)
      await ageInput.fill('25');
      await page.waitForTimeout(300);

      // Error should disappear
      await expect(ageField.locator('mat-error')).not.toBeVisible();

      // Submit should succeed
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Uncheck the checkbox
      await isAdultCheckbox.uncheck();
      await page.waitForTimeout(500);

      // Clear the age field
      await ageInput.fill('');
      await page.waitForTimeout(300);

      // Should be able to submit without age now
      await submitButton.click({ force: true });
      await page.waitForTimeout(300);
    });
  });

  test.describe('Multiple Validators', () => {
    test('should apply multiple validators to a single field', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="multiple-validators-test"]');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const submitButton = scenario.locator('#submit button');
      const usernameField = scenario.locator('#username');

      // Test empty (required validator)
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
      await expect(usernameField.locator('mat-error')).toBeVisible();

      // Test too short (minLength validator)
      await usernameInput.fill('ab');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
      await expect(usernameField.locator('mat-error')).toBeVisible();

      // Test invalid pattern (spaces not allowed)
      await usernameInput.fill('user name');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
      await expect(usernameField.locator('mat-error')).toBeVisible();

      // Test reserved word (custom validator)
      await usernameInput.fill('admin');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
      await expect(usernameField.locator('mat-error')).toBeVisible();

      // Test another reserved word
      await usernameInput.fill('root');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
      await expect(usernameField.locator('mat-error')).toBeVisible();

      // Test valid username
      await usernameInput.fill('valid_user_123');
      await page.waitForTimeout(300);
      await expect(usernameField.locator('mat-error')).not.toBeVisible();

      // Submit should succeed
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);
    });
  });
});

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

  test.describe('Expression-Based Min/Max Validators', () => {
    test('should validate age against dynamic minAge value', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/expression-based-min-max');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('expression-based-min-max-test');
      await expect(scenario).toBeVisible();

      const minAgeInput = helpers.getInput(scenario, 'minAge');
      const ageInput = helpers.getInput(scenario, 'age');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially minAge is 18 and age is empty - submit disabled (required)
      await expect(submitButton).toBeDisabled();

      // Age valid when >= minAge field value (18)
      await helpers.fillInput(ageInput, '20');
      await expect(submitButton).toBeEnabled();

      // Age invalid when < minAge field value
      await helpers.clearAndFill(ageInput, '15');
      await expect(submitButton).toBeDisabled();

      // Validation updates when minAge field changes - set minAge to 10
      await helpers.clearAndFill(minAgeInput, '10');
      await page.waitForTimeout(300);

      // Now age 15 should be valid since minAge is 10
      await expect(submitButton).toBeEnabled();

      // Change minAge back to 21
      await helpers.clearAndFill(minAgeInput, '21');
      await page.waitForTimeout(300);

      // Now age 15 should be invalid again since minAge is 21
      await expect(submitButton).toBeDisabled();

      // Set age to satisfy the new minAge
      await helpers.clearAndFill(ageInput, '25');
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Cross-Field Error Targeting', () => {
    test('should validate password confirmation matches password', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Fill matching passwords
      await helpers.fillInput(passwordInput, 'SecurePass123');
      await helpers.fillInput(confirmPasswordInput, 'SecurePass123');
      await page.waitForTimeout(300);

      // Passwords match - check if form is valid (submit may still be disabled due to other required fields)
      // Try filling other required fields
      const ageInput = helpers.getInput(scenario, 'age');
      const targetValueInput = helpers.getInput(scenario, 'targetValue');

      await helpers.fillInput(ageInput, '25'); // Above minAge (18)
      await helpers.fillInput(targetValueInput, '50'); // Between min (10) and max (100)

      await expect(submitButton).toBeEnabled();

      // Now try mismatched passwords
      await helpers.clearAndFill(confirmPasswordInput, 'DifferentPass');

      // Submit should be disabled due to password mismatch
      await expect(submitButton).toBeDisabled();
    });

    test('should validate age against dynamic minAge field', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible();

      const minAgeInput = helpers.getInput(scenario, 'minAge');
      const ageInput = helpers.getInput(scenario, 'age');
      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const targetValueInput = helpers.getInput(scenario, 'targetValue');
      const submitButton = helpers.getSubmitButton(scenario);

      // Fill all required fields with valid values
      await helpers.fillInput(passwordInput, 'Password123');
      await helpers.fillInput(confirmPasswordInput, 'Password123');
      await helpers.fillInput(targetValueInput, '50');
      await helpers.fillInput(ageInput, '25');

      await expect(submitButton).toBeEnabled();

      // Change age to below minAge
      await helpers.clearAndFill(ageInput, '15');
      await expect(submitButton).toBeDisabled();

      // Change minAge to make 15 valid
      await helpers.clearAndFill(minAgeInput, '10');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeEnabled();
    });

    test('should validate target value is within min/max range', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible();

      const minValueInput = helpers.getInput(scenario, 'minValue');
      const maxValueInput = helpers.getInput(scenario, 'maxValue');
      const targetValueInput = helpers.getInput(scenario, 'targetValue');
      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const ageInput = helpers.getInput(scenario, 'age');
      const submitButton = helpers.getSubmitButton(scenario);

      // Fill all required fields
      await helpers.fillInput(passwordInput, 'Password123');
      await helpers.fillInput(confirmPasswordInput, 'Password123');
      await helpers.fillInput(ageInput, '25');
      await helpers.fillInput(targetValueInput, '50'); // Valid: between 10 and 100

      await expect(submitButton).toBeEnabled();

      // Set target below minimum
      await helpers.clearAndFill(targetValueInput, '5');
      await expect(submitButton).toBeDisabled();

      // Set target above maximum
      await helpers.clearAndFill(targetValueInput, '150');
      await expect(submitButton).toBeDisabled();

      // Adjust min/max to make 150 valid
      await helpers.clearAndFill(maxValueInput, '200');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('When Clause with AND/OR Logic', () => {
    test('should require company name only for verified business accounts', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/when-with-and-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('when-with-and-or-test');
      await expect(scenario).toBeVisible();

      const accountTypeSelect = scenario.locator('#accountType');
      const isVerifiedCheckbox = scenario.locator('#isVerified input[type="checkbox"]');
      const companyNameInput = helpers.getInput(scenario, 'companyName');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially personal account and not verified - company name not required
      await expect(submitButton).toBeEnabled();

      // Select business account (but not verified) - still not required
      await accountTypeSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Business")').click();
      await page.waitForTimeout(500);
      await expect(submitButton).toBeEnabled();

      // Check verified - now both conditions true, company name required
      await isVerifiedCheckbox.check();
      await page.waitForTimeout(500);
      await expect(submitButton).toBeDisabled();

      // Fill company name
      await helpers.fillInput(companyNameInput, 'Acme Corp');
      await expect(submitButton).toBeEnabled();

      // Uncheck verified - company name no longer required
      await isVerifiedCheckbox.uncheck();
      await page.waitForTimeout(500);

      // Clear company name - should still be valid
      await companyNameInput.fill('');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeEnabled();
    });

    test('should require payment method for premium OR discounted orders', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/when-with-and-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('when-with-and-or-test');
      await expect(scenario).toBeVisible();

      const isPremiumCheckbox = scenario.locator('#isPremium input[type="checkbox"]');
      const hasDiscountCheckbox = scenario.locator('#hasDiscount input[type="checkbox"]');
      const paymentMethodInput = helpers.getInput(scenario, 'paymentMethod');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially neither premium nor discount - payment not required
      await expect(submitButton).toBeEnabled();

      // Check premium - payment now required (OR condition)
      await isPremiumCheckbox.check();
      await page.waitForTimeout(500);
      await expect(submitButton).toBeDisabled();

      // Fill payment method
      await helpers.fillInput(paymentMethodInput, 'Credit Card');
      await expect(submitButton).toBeEnabled();

      // Uncheck premium but check discount - still required (OR condition)
      await isPremiumCheckbox.uncheck();
      await page.waitForTimeout(300);
      await hasDiscountCheckbox.check();
      await page.waitForTimeout(500);

      // Should still be valid since payment is filled
      await expect(submitButton).toBeEnabled();

      // Clear payment method - should be invalid
      await paymentMethodInput.fill('');
      await page.waitForTimeout(300);
      await expect(submitButton).toBeDisabled();

      // Uncheck discount - payment no longer required
      await hasDiscountCheckbox.uncheck();
      await page.waitForTimeout(500);
      await expect(submitButton).toBeEnabled();
    });

    test('should apply min validator for business OR verified premium accounts', async ({ page, helpers }) => {
      await page.goto('http://localhost:4201/#/test/advanced-validation/when-with-and-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('when-with-and-or-test');
      await expect(scenario).toBeVisible();

      const accountTypeSelect = scenario.locator('#accountType');
      const isPremiumCheckbox = scenario.locator('#isPremium input[type="checkbox"]');
      const isVerifiedCheckbox = scenario.locator('#isVerified input[type="checkbox"]');
      const minOrderInput = helpers.getInput(scenario, 'minOrder');
      const orderAmountInput = helpers.getInput(scenario, 'orderAmount');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially personal account - min validation not applied
      await expect(submitButton).toBeEnabled();

      // Select business account - min validation now applies
      await accountTypeSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Business")').click();
      await page.waitForTimeout(500);

      // Fill order amount below min (50) - should be invalid
      await helpers.fillInput(orderAmountInput, '30');
      await expect(submitButton).toBeDisabled();

      // Fill order amount above min
      await helpers.clearAndFill(orderAmountInput, '60');
      await expect(submitButton).toBeEnabled();

      // Switch back to personal and test nested AND within OR
      await accountTypeSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Personal")').click();
      await page.waitForTimeout(500);

      // Clear order amount - should be valid for personal
      await orderAmountInput.fill('');
      await page.waitForTimeout(300);

      // Check premium only - nested AND not satisfied
      await isPremiumCheckbox.check();
      await page.waitForTimeout(500);
      await expect(submitButton).toBeEnabled();

      // Check verified too - now nested (premium AND verified) is true
      await isVerifiedCheckbox.check();
      await page.waitForTimeout(500);

      // Fill order below min - should be invalid
      await helpers.fillInput(orderAmountInput, '30');
      await expect(submitButton).toBeDisabled();

      // Fill order above min
      await helpers.clearAndFill(orderAmountInput, '60');
      await expect(submitButton).toBeEnabled();
    });
  });
});

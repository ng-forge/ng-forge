import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Advanced Validation E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/advanced-validation');
  });

  test.describe('Custom Validator', () => {
    test('should validate password strength using custom validator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('custom-validator-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="custom-validator-test"] #password input', { state: 'visible', timeout: 10000 });

      const passwordInput = helpers.getInput(scenario, 'password');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (no value)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Try weak password (missing special character, uppercase, etc.)
      await passwordInput.fill('weak');
      await expect(passwordInput).toHaveValue('weak', { timeout: 5000 });
      await passwordInput.blur();

      // Submit should still be disabled (invalid password)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill strong password that meets requirements
      await passwordInput.clear();
      await passwordInput.fill('Strong@123');
      await expect(passwordInput).toHaveValue('Strong@123', { timeout: 5000 });
      await passwordInput.blur();

      // Wait for form to become valid
      await page.waitForSelector('[data-testid="custom-validator-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Cross-Field Validation', () => {
    test('should validate password matching across fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('cross-field-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="cross-field-test"] #password input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-test"] #confirmPassword input', { state: 'visible', timeout: 10000 });

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit disabled initially
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Enter matching passwords
      await passwordInput.fill('MyPassword123');
      await expect(passwordInput).toHaveValue('MyPassword123', { timeout: 5000 });
      await passwordInput.blur();

      await confirmPasswordInput.fill('MyPassword123');
      await expect(confirmPasswordInput).toHaveValue('MyPassword123', { timeout: 5000 });
      await confirmPasswordInput.blur();

      // Wait for form to become valid
      await page.waitForSelector('[data-testid="cross-field-test"] #submit button:not([disabled])', { state: 'visible', timeout: 10000 });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Now try mismatched passwords
      await confirmPasswordInput.clear();
      await confirmPasswordInput.fill('DifferentPassword');
      await expect(confirmPasswordInput).toHaveValue('DifferentPassword', { timeout: 5000 });
      await confirmPasswordInput.blur();

      // Submit should be disabled (passwords don't match)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fix the mismatch
      await confirmPasswordInput.clear();
      await confirmPasswordInput.fill('MyPassword123');
      await expect(confirmPasswordInput).toHaveValue('MyPassword123', { timeout: 5000 });
      await confirmPasswordInput.blur();

      // Wait for form to become valid again
      await page.waitForSelector('[data-testid="cross-field-test"] #submit button:not([disabled])', { state: 'visible', timeout: 10000 });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Range Validation', () => {
    test('should validate that maximum is greater than minimum', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('range-validation-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="range-validation-test"] #minValue input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="range-validation-test"] #maxValue input', { state: 'visible', timeout: 10000 });

      const minInput = helpers.getInput(scenario, 'minValue');
      const maxInput = helpers.getInput(scenario, 'maxValue');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit disabled initially
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Enter valid range
      await minInput.fill('10');
      await expect(minInput).toHaveValue('10', { timeout: 5000 });
      await minInput.blur();

      await maxInput.fill('20');
      await expect(maxInput).toHaveValue('20', { timeout: 5000 });
      await maxInput.blur();

      // Wait for form to become valid
      await page.waitForSelector('[data-testid="range-validation-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Enter invalid range (max < min)
      await maxInput.clear();
      await maxInput.fill('5');
      await expect(maxInput).toHaveValue('5', { timeout: 5000 });
      await maxInput.blur();

      // Submit should be disabled (invalid range)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fix the range
      await maxInput.clear();
      await maxInput.fill('25');
      await expect(maxInput).toHaveValue('25', { timeout: 5000 });
      await maxInput.blur();

      // Wait for form to become valid again
      await page.waitForSelector('[data-testid="range-validation-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Conditional Validation', () => {
    test('should apply validators conditionally based on field values', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('conditional-validator-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="conditional-validator-test"] #isAdult input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="conditional-validator-test"] #age input', { state: 'visible', timeout: 10000 });

      const isAdultCheckbox = scenario.locator('#isAdult input[type="checkbox"]');
      const ageInput = helpers.getInput(scenario, 'age');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially, form should be valid without age (checkbox unchecked, age not required)
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check the "I am 18 or older" checkbox
      await isAdultCheckbox.check();
      await expect(isAdultCheckbox).toBeChecked({ timeout: 5000 });

      // Now age is required but not filled - submit should be disabled
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill age less than 18 (invalid - below minimum)
      await ageInput.fill('16');
      await expect(ageInput).toHaveValue('16', { timeout: 5000 });
      await ageInput.blur();

      // Submit should still be disabled (age below minimum)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill valid age (18 or older)
      await ageInput.clear();
      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ageInput.blur();

      // Wait for form to become valid
      await page.waitForSelector('[data-testid="conditional-validator-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Uncheck the checkbox
      await isAdultCheckbox.uncheck();
      await expect(isAdultCheckbox).not.toBeChecked({ timeout: 5000 });

      // Submit should still be enabled (age no longer required)
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Clear the age field
      await ageInput.fill('');
      await expect(ageInput).toHaveValue('', { timeout: 5000 });
      await ageInput.blur();

      // Should still be enabled (age not required when checkbox unchecked)
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Multiple Validators', () => {
    test('should apply multiple validators to a single field', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('multiple-validators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="multiple-validators-test"] #username input', { state: 'visible', timeout: 10000 });

      const usernameInput = helpers.getInput(scenario, 'username');
      const submitButton = helpers.getSubmitButton(scenario);

      // Test empty (required validator) - submit should be disabled
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Test too short (minLength validator)
      await usernameInput.fill('ab');
      await expect(usernameInput).toHaveValue('ab', { timeout: 5000 });
      await usernameInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Test invalid pattern (spaces not allowed)
      await usernameInput.clear();
      await usernameInput.fill('user name');
      await expect(usernameInput).toHaveValue('user name', { timeout: 5000 });
      await usernameInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Test reserved word (custom validator)
      await usernameInput.clear();
      await usernameInput.fill('admin');
      await expect(usernameInput).toHaveValue('admin', { timeout: 5000 });
      await usernameInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Test another reserved word
      await usernameInput.clear();
      await usernameInput.fill('root');
      await expect(usernameInput).toHaveValue('root', { timeout: 5000 });
      await usernameInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Test valid username - submit should be enabled
      await usernameInput.clear();
      await usernameInput.fill('valid_user_123');
      await expect(usernameInput).toHaveValue('valid_user_123', { timeout: 5000 });
      await usernameInput.blur();

      // Wait for form to become valid
      await page.waitForSelector('[data-testid="multiple-validators-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Expression-Based Min/Max Validators', () => {
    test('should validate age against dynamic minAge value', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/expression-based-min-max');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('expression-based-min-max-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="expression-based-min-max-test"] #minAge input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="expression-based-min-max-test"] #age input', { state: 'visible', timeout: 10000 });

      const minAgeInput = helpers.getInput(scenario, 'minAge');
      const ageInput = helpers.getInput(scenario, 'age');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially minAge is 18 and age is empty - submit disabled (required)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Age valid when >= minAge field value (18)
      await ageInput.fill('20');
      await expect(ageInput).toHaveValue('20', { timeout: 5000 });
      await ageInput.blur();

      await page.waitForSelector('[data-testid="expression-based-min-max-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Age invalid when < minAge field value
      await ageInput.clear();
      await ageInput.fill('15');
      await expect(ageInput).toHaveValue('15', { timeout: 5000 });
      await ageInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Validation updates when minAge field changes - set minAge to 10
      await minAgeInput.clear();
      await minAgeInput.fill('10');
      await expect(minAgeInput).toHaveValue('10', { timeout: 5000 });
      await minAgeInput.blur();

      // Now age 15 should be valid since minAge is 10 (cross-field validation needs time)
      await page.waitForSelector('[data-testid="expression-based-min-max-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Change minAge back to 21
      await minAgeInput.clear();
      await minAgeInput.fill('21');
      await expect(minAgeInput).toHaveValue('21', { timeout: 5000 });
      await minAgeInput.blur();

      // Now age 15 should be invalid again since minAge is 21 (cross-field validation needs time)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Set age to satisfy the new minAge
      await ageInput.clear();
      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ageInput.blur();

      await page.waitForSelector('[data-testid="expression-based-min-max-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Cross-Field Error Targeting', () => {
    test('should validate password confirmation matches password', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for all inputs to be visible using page.waitForSelector
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #password input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #confirmPassword input', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #age input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #targetValue input', {
        state: 'visible',
        timeout: 10000,
      });

      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const submitButton = helpers.getSubmitButton(scenario);
      const ageInput = helpers.getInput(scenario, 'age');
      const targetValueInput = helpers.getInput(scenario, 'targetValue');

      // Wait for inputs to be visible
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
      await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });

      // Fill matching passwords - confirm each value
      await passwordInput.fill('SecurePass123');
      await expect(passwordInput).toHaveValue('SecurePass123', { timeout: 5000 });
      await passwordInput.blur();

      await confirmPasswordInput.fill('SecurePass123');
      await expect(confirmPasswordInput).toHaveValue('SecurePass123', { timeout: 5000 });
      await confirmPasswordInput.blur();

      // Fill other required fields - confirm each value
      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ageInput.blur();

      await targetValueInput.fill('50');
      await expect(targetValueInput).toHaveValue('50', { timeout: 5000 });
      await targetValueInput.blur();

      // Wait for form to become valid
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Now try mismatched passwords
      await confirmPasswordInput.clear();
      await confirmPasswordInput.fill('DifferentPass');
      await expect(confirmPasswordInput).toHaveValue('DifferentPass', { timeout: 5000 });
      await confirmPasswordInput.blur();

      // Submit should be disabled due to password mismatch
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Wait for error message to appear
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #confirmPassword .p-error', {
        state: 'visible',
        timeout: 10000,
      });
      const errorMessage = helpers.getFieldError(scenario, 'confirmPassword');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toHaveText('Passwords must match');
    });

    test('should display correct error message for age validation', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #age input', { state: 'visible', timeout: 10000 });

      const ageInput = helpers.getInput(scenario, 'age');

      // Enter age below minimum (18)
      await ageInput.fill('15');
      await expect(ageInput).toHaveValue('15', { timeout: 5000 });
      await ageInput.blur();

      // Wait for error message to appear
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #age .p-error', { state: 'visible', timeout: 10000 });

      // Verify error message is displayed
      const errorMessage = helpers.getFieldError(scenario, 'age');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toHaveText('Age must be at least the minimum requirement');
    });

    test('should display correct error message for range validation', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #targetValue input', {
        state: 'visible',
        timeout: 10000,
      });

      const targetValueInput = helpers.getInput(scenario, 'targetValue');

      // Enter value outside range (min=10, max=100)
      await targetValueInput.fill('5');
      await expect(targetValueInput).toHaveValue('5', { timeout: 5000 });
      await targetValueInput.blur();

      // Wait for error message to appear
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #targetValue .p-error', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify error message is displayed
      const errorMessage = helpers.getFieldError(scenario, 'targetValue');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toHaveText('Value must be between min and max');
    });

    test('should validate age against dynamic minAge field', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for all inputs to be visible
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #minAge input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #age input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #password input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #confirmPassword input', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #targetValue input', {
        state: 'visible',
        timeout: 10000,
      });

      const minAgeInput = helpers.getInput(scenario, 'minAge');
      const ageInput = helpers.getInput(scenario, 'age');
      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const targetValueInput = helpers.getInput(scenario, 'targetValue');
      const submitButton = helpers.getSubmitButton(scenario);

      // Wait for fields to be ready
      await expect(passwordInput).toBeVisible({ timeout: 10000 });

      // Fill all required fields with valid values
      await passwordInput.fill('Password123');
      await expect(passwordInput).toHaveValue('Password123', { timeout: 5000 });
      await passwordInput.blur();

      await confirmPasswordInput.fill('Password123');
      await expect(confirmPasswordInput).toHaveValue('Password123', { timeout: 5000 });
      await confirmPasswordInput.blur();

      await targetValueInput.fill('50');
      await expect(targetValueInput).toHaveValue('50', { timeout: 5000 });
      await targetValueInput.blur();

      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ageInput.blur();

      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Change age to below minAge
      await ageInput.clear();
      await ageInput.fill('15');
      await expect(ageInput).toHaveValue('15', { timeout: 5000 });
      await ageInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Change minAge to make 15 valid (cross-field validation needs time)
      await minAgeInput.clear();
      await minAgeInput.fill('10');
      await expect(minAgeInput).toHaveValue('10', { timeout: 5000 });
      await minAgeInput.blur();

      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should validate target value is within min/max range', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/cross-field-error-targeting');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-error-targeting-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for all inputs to be visible
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #minValue input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #maxValue input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #targetValue input', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #password input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #confirmPassword input', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #age input', { state: 'visible', timeout: 10000 });

      const minValueInput = helpers.getInput(scenario, 'minValue');
      const maxValueInput = helpers.getInput(scenario, 'maxValue');
      const targetValueInput = helpers.getInput(scenario, 'targetValue');
      const passwordInput = helpers.getInput(scenario, 'password');
      const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
      const ageInput = helpers.getInput(scenario, 'age');
      const submitButton = helpers.getSubmitButton(scenario);

      // Wait for all inputs to be visible
      await expect(minValueInput).toBeVisible({ timeout: 10000 });
      await expect(maxValueInput).toBeVisible({ timeout: 10000 });
      await expect(targetValueInput).toBeVisible({ timeout: 10000 });

      // Fill all required fields
      await passwordInput.fill('Password123');
      await expect(passwordInput).toHaveValue('Password123', { timeout: 5000 });
      await passwordInput.blur();

      await confirmPasswordInput.fill('Password123');
      await expect(confirmPasswordInput).toHaveValue('Password123', { timeout: 5000 });
      await confirmPasswordInput.blur();

      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ageInput.blur();

      await targetValueInput.fill('50'); // Valid: between 10 and 100
      await expect(targetValueInput).toHaveValue('50', { timeout: 5000 });
      await targetValueInput.blur();

      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Set target below minimum
      await targetValueInput.clear();
      await targetValueInput.fill('5');
      await expect(targetValueInput).toHaveValue('5', { timeout: 5000 });
      await targetValueInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Set target above maximum
      await targetValueInput.clear();
      await targetValueInput.fill('150');
      await expect(targetValueInput).toHaveValue('150', { timeout: 5000 });
      await targetValueInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Adjust min/max to make 150 valid
      await maxValueInput.clear();
      await maxValueInput.fill('200');
      await expect(maxValueInput).toHaveValue('200', { timeout: 5000 });
      await maxValueInput.blur();

      await page.waitForSelector('[data-testid="cross-field-error-targeting-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('When Clause with AND/OR Logic', () => {
    test('should require company name only for verified business accounts', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/when-with-and-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('when-with-and-or-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #accountType', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #isVerified input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #companyName input', { state: 'visible', timeout: 10000 });

      const accountTypeSelect = helpers.getSelect(scenario, 'accountType');
      const isVerifiedCheckbox = scenario.locator('#isVerified input[type="checkbox"]');
      const companyNameInput = helpers.getInput(scenario, 'companyName');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially personal account and not verified - company name not required
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Select business account (but not verified) - still not required
      await helpers.selectOption(accountTypeSelect, 'Business');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check verified - now both conditions true, company name required
      await isVerifiedCheckbox.check();
      await expect(isVerifiedCheckbox).toBeChecked({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill company name
      await companyNameInput.fill('Acme Corp');
      await expect(companyNameInput).toHaveValue('Acme Corp', { timeout: 5000 });
      await companyNameInput.blur();

      await page.waitForSelector('[data-testid="when-with-and-or-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Uncheck verified - company name no longer required
      await isVerifiedCheckbox.uncheck();
      await expect(isVerifiedCheckbox).not.toBeChecked({ timeout: 5000 });

      // Clear company name - should still be valid
      await companyNameInput.fill('');
      await expect(companyNameInput).toHaveValue('', { timeout: 5000 });
      await companyNameInput.blur();
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should require payment method for premium OR discounted orders', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/when-with-and-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('when-with-and-or-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #isPremium input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #hasDiscount input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #paymentMethod input', { state: 'visible', timeout: 10000 });

      const isPremiumCheckbox = scenario.locator('#isPremium input[type="checkbox"]');
      const hasDiscountCheckbox = scenario.locator('#hasDiscount input[type="checkbox"]');
      const paymentMethodInput = helpers.getInput(scenario, 'paymentMethod');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially neither premium nor discount - payment not required
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check premium - payment now required (OR condition)
      await isPremiumCheckbox.check();
      await expect(isPremiumCheckbox).toBeChecked({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill payment method
      await paymentMethodInput.fill('Credit Card');
      await expect(paymentMethodInput).toHaveValue('Credit Card', { timeout: 5000 });
      await paymentMethodInput.blur();

      await page.waitForSelector('[data-testid="when-with-and-or-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Uncheck premium but check discount - still required (OR condition)
      await isPremiumCheckbox.uncheck();
      await expect(isPremiumCheckbox).not.toBeChecked({ timeout: 5000 });

      await hasDiscountCheckbox.check();
      await expect(hasDiscountCheckbox).toBeChecked({ timeout: 5000 });

      // Should still be valid since payment is filled
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Clear payment method - should be invalid
      await paymentMethodInput.fill('');
      await expect(paymentMethodInput).toHaveValue('', { timeout: 5000 });
      await paymentMethodInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Uncheck discount - payment no longer required
      await hasDiscountCheckbox.uncheck();
      await expect(hasDiscountCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should apply min validator for business OR verified premium accounts', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/when-with-and-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('when-with-and-or-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #accountType', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #isPremium input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #isVerified input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #minOrder input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="when-with-and-or-test"] #orderAmount input', { state: 'visible', timeout: 10000 });

      const accountTypeSelect = helpers.getSelect(scenario, 'accountType');
      const isPremiumCheckbox = scenario.locator('#isPremium input[type="checkbox"]');
      const isVerifiedCheckbox = scenario.locator('#isVerified input[type="checkbox"]');
      const minOrderInput = helpers.getInput(scenario, 'minOrder');
      const orderAmountInput = helpers.getInput(scenario, 'orderAmount');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially personal account - min validation not applied
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Select business account - min validation now applies
      await helpers.selectOption(accountTypeSelect, 'Business');

      // Fill order amount below min (50) - should be invalid
      await orderAmountInput.fill('30');
      await expect(orderAmountInput).toHaveValue('30', { timeout: 5000 });
      await orderAmountInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill order amount above min
      await orderAmountInput.clear();
      await orderAmountInput.fill('60');
      await expect(orderAmountInput).toHaveValue('60', { timeout: 5000 });
      await orderAmountInput.blur();

      await page.waitForSelector('[data-testid="when-with-and-or-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Switch back to personal and test nested AND within OR
      await helpers.selectOption(accountTypeSelect, 'Personal');

      // Clear order amount - should be valid for personal
      await orderAmountInput.fill('');
      await expect(orderAmountInput).toHaveValue('', { timeout: 5000 });
      await orderAmountInput.blur();

      // Fill payment method first - required when premium is checked
      const paymentMethodInput = helpers.getInput(scenario, 'paymentMethod');
      await paymentMethodInput.fill('Credit Card');
      await expect(paymentMethodInput).toHaveValue('Credit Card', { timeout: 5000 });
      await paymentMethodInput.blur();

      // Check premium only - nested AND not satisfied
      await isPremiumCheckbox.check();
      await expect(isPremiumCheckbox).toBeChecked({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check verified too - now nested (premium AND verified) is true
      await isVerifiedCheckbox.check();
      await expect(isVerifiedCheckbox).toBeChecked({ timeout: 5000 });

      // Fill order below min - should be invalid
      await orderAmountInput.fill('30');
      await expect(orderAmountInput).toHaveValue('30', { timeout: 5000 });
      await orderAmountInput.blur();
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill order above min
      await orderAmountInput.clear();
      await orderAmountInput.fill('60');
      await expect(orderAmountInput).toHaveValue('60', { timeout: 5000 });
      await orderAmountInput.blur();

      await page.waitForSelector('[data-testid="when-with-and-or-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Nested Field Paths', () => {
    test('should validate with nested field paths', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/nested-field-paths');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-field-paths-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);

      // Initially form should be valid (contact.primaryEmail has default value)
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should hide shipping zip field when sameAsBilling is checked', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/nested-field-paths');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-field-paths-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible
      await page.waitForSelector('[data-testid="nested-field-paths-test"] #sameAsBilling input[type="checkbox"]', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="nested-field-paths-test"] #shippingZip', { state: 'visible', timeout: 10000 });

      const sameAsBillingCheckbox = scenario.locator('#sameAsBilling input[type="checkbox"]');
      const shippingZipField = scenario.locator('#shippingZip').first();
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially the shipping zip field should be visible
      await expect(shippingZipField).toBeVisible({ timeout: 10000 });

      // Check sameAsBilling - field should be hidden
      await sameAsBillingCheckbox.check();
      await expect(sameAsBillingCheckbox).toBeChecked({ timeout: 5000 });
      await expect(shippingZipField).not.toBeVisible();

      // Form should still be valid
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Uncheck - field should reappear
      await sameAsBillingCheckbox.uncheck();
      await expect(sameAsBillingCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(shippingZipField).toBeVisible({ timeout: 10000 });
    });

    test('should validate shipping zip matches billing zip via nested path', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/nested-field-paths');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-field-paths-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="nested-field-paths-test"] #shippingZip input', { state: 'visible', timeout: 10000 });

      const shippingZipInput = helpers.getInput(scenario, 'shippingZip');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter different zip than billing (12345)
      await shippingZipInput.fill('99999');
      await expect(shippingZipInput).toHaveValue('99999', { timeout: 5000 });
      await shippingZipInput.blur();

      // Form should be invalid due to zip mismatch
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Wait for error message to appear
      await page.waitForSelector('[data-testid="nested-field-paths-test"] #shippingZip .p-error', { state: 'visible', timeout: 10000 });

      // Verify error message contains expected text
      const errorMessage = helpers.getFieldError(scenario, 'shippingZip');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toContainText('Shipping zip must match billing zip');

      // Enter matching zip - form should be valid
      await shippingZipInput.clear();
      await shippingZipInput.fill('12345');
      await expect(shippingZipInput).toHaveValue('12345', { timeout: 5000 });
      await shippingZipInput.blur();

      await page.waitForSelector('[data-testid="nested-field-paths-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should validate secondary email differs from nested primary email', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/nested-field-paths');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-field-paths-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="nested-field-paths-test"] #secondaryEmail input', { state: 'visible', timeout: 10000 });

      const secondaryEmailInput = helpers.getInput(scenario, 'secondaryEmail');
      const submitButton = helpers.getSubmitButton(scenario);

      // Enter same as primary (primary@example.com)
      await secondaryEmailInput.fill('primary@example.com');
      await expect(secondaryEmailInput).toHaveValue('primary@example.com', { timeout: 5000 });
      await secondaryEmailInput.blur();

      // Form should be invalid due to duplicate email
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Wait for error message to appear
      await page.waitForSelector('[data-testid="nested-field-paths-test"] #secondaryEmail .p-error', { state: 'visible', timeout: 10000 });

      // Verify error message
      const errorMessage = helpers.getFieldError(scenario, 'secondaryEmail');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toContainText('Secondary email must be different from primary email');

      // Enter different email - form should be valid
      await secondaryEmailInput.clear();
      await secondaryEmailInput.fill('secondary@example.com');
      await expect(secondaryEmailInput).toHaveValue('secondary@example.com', { timeout: 5000 });
      await secondaryEmailInput.blur();

      await page.waitForSelector('[data-testid="nested-field-paths-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should verify SMS notifications checkbox and phone field exist', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/nested-field-paths');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-field-paths-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify SMS checkbox exists and can be found
      const smsCheckbox = scenario.locator('#smsNotifications input[type="checkbox"]');
      await expect(smsCheckbox).toBeVisible({ timeout: 10000 });
      await expect(smsCheckbox).not.toBeChecked({ timeout: 5000 });

      // Verify phone field exists (hidden initially via logic condition)
      const phoneForSmsField = scenario.locator('#phoneForSms').first();
      await expect(phoneForSmsField).not.toBeVisible({ timeout: 5000 });

      // Submit should be enabled initially
      const submitButton = helpers.getSubmitButton(scenario);
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check SMS checkbox
      await smsCheckbox.check();
      await expect(smsCheckbox).toBeChecked({ timeout: 5000 });
    });
  });

  test.describe('Array Cross-Validation', () => {
    test('should validate array item with require email checkbox', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/array-cross-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('array-cross-validation-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // PrimeNG checkbox selector
      const requireEmailCheckbox = scenario.locator('#requireEmail p-checkbox input');
      const submitButton = helpers.getSubmitButton(scenario);

      // Get inputs within contacts array (name, email, role select for first item)
      const contactInputs = scenario.locator('#contacts input[type="text"]');
      const nameInput = contactInputs.first(); // First input is name
      const emailInput = contactInputs.nth(1); // Second input is email

      // Wait for array inputs to be rendered using waitForSelector
      await page.waitForSelector('[data-testid="array-cross-validation-test"] #contacts input[type="text"]', { state: 'visible' });
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // Fill required name field in the first contact
      await helpers.fillInput(nameInput, 'John Doe');

      // Wait for form state to stabilize after input
      await page.waitForSelector('[data-testid="array-cross-validation-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Initially email not required (checkbox unchecked) - form should be valid
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check require email checkbox
      await requireEmailCheckbox.check();
      await expect(requireEmailCheckbox).toBeChecked({ timeout: 5000 });

      // Fill valid email
      await helpers.fillInput(emailInput, 'john@company.com');

      // Wait for form to become valid after filling email
      await page.waitForSelector('[data-testid="array-cross-validation-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should display correct error message for email validation in array item', async ({ page, helpers }) => {
      await page.goto('/#/test/advanced-validation/array-cross-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('array-cross-validation-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkbox to be visible
      await page.waitForSelector('[data-testid="array-cross-validation-test"] #requireEmail p-checkbox input', {
        state: 'visible',
        timeout: 10000,
      });
      const requireEmailCheckbox = scenario.locator('#requireEmail p-checkbox input');

      // Wait for array inputs to be rendered - use more specific selector
      await page.waitForSelector('[data-testid="array-cross-validation-test"] #contacts input[type="text"]', {
        state: 'visible',
        timeout: 10000,
      });

      // Get both inputs from the array
      const nameInput = scenario.locator('#contacts input[type="text"]').first();
      const emailInput = scenario.locator('#contacts input[type="text"]').nth(1);

      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // Fill required name first
      await nameInput.focus();
      await nameInput.fill('John Doe');
      await expect(nameInput).toHaveValue('John Doe', { timeout: 5000 });
      await nameInput.blur();

      // Fill invalid email BEFORE checking the checkbox so the input is already touched
      await emailInput.focus();
      await emailInput.fill('invalid-email');
      await expect(emailInput).toHaveValue('invalid-email', { timeout: 5000 });
      await emailInput.blur();

      // Now check the require email checkbox - this should trigger validation on the already-filled email
      await requireEmailCheckbox.check();
      await expect(requireEmailCheckbox).toBeChecked({ timeout: 5000 });

      // Touch the email field again to ensure validation displays
      await emailInput.focus();
      await emailInput.blur();

      // Wait for error message to appear with specific text selector
      await page.waitForSelector('[data-testid="array-cross-validation-test"] .p-error:has-text("valid email")', {
        state: 'visible',
        timeout: 20000,
      });
      const errorMessage = scenario.locator('.p-error').filter({ hasText: 'valid email' });
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toHaveText('Please enter a valid email address');
    });
  });
});

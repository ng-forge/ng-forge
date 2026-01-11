import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Form Reset and Clear Events Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/form-reset-clear');
  });

  test.describe('Form Reset Functionality', () => {
    test('should reset form to default values', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-defaults');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-defaults');
      await expect(scenario).toBeVisible();

      // Verify default values are set
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      await expect(firstNameInput).toHaveValue('John');
      await expect(lastNameInput).toHaveValue('Doe');
      await expect(emailInput).toHaveValue('john.doe@example.com');

      // Modify the fields
      await firstNameInput.fill('Jane');
      await lastNameInput.fill('Smith');
      await emailInput.fill('jane.smith@example.com');

      // Verify modified values
      await expect(firstNameInput).toHaveValue('Jane');
      await expect(lastNameInput).toHaveValue('Smith');
      await expect(emailInput).toHaveValue('jane.smith@example.com');

      // Click reset button
      const resetButton = scenario.locator('#reset-button button');
      await resetButton.click();

      // Verify values are reset to defaults
      await expect(firstNameInput).toHaveValue('John');
      await expect(lastNameInput).toHaveValue('Doe');
      await expect(emailInput).toHaveValue('john.doe@example.com');
    });

    test('should reset select fields to default values', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-select');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-select');
      await expect(scenario).toBeVisible();

      const select = helpers.getSelect(scenario, 'country');

      // Verify default value is set (US)
      await expect(select).toHaveValue('us');

      // Change to UK
      await select.selectOption('uk');

      // Verify changed value
      await expect(select).toHaveValue('uk');

      // Reset
      await scenario.locator('#reset-button button').click();

      // Verify reset to default (US)
      await expect(select).toHaveValue('us');
    });

    test('should reset checkbox fields to default values', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-checkbox');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-checkbox');
      await expect(scenario).toBeVisible();

      const subscribeInput = scenario.locator('#subscribe input[type="checkbox"]');
      const termsInput = scenario.locator('#terms input[type="checkbox"]');

      // Verify default states
      await expect(subscribeInput).toBeChecked();
      await expect(termsInput).not.toBeChecked();

      // Toggle both checkboxes
      await subscribeInput.uncheck();
      await termsInput.check();

      // Verify changed states
      await expect(subscribeInput).not.toBeChecked();
      await expect(termsInput).toBeChecked();

      // Reset
      await scenario.locator('#reset-button button').click();

      // Verify reset to defaults
      await expect(subscribeInput).toBeChecked();
      await expect(termsInput).not.toBeChecked();
    });

    test('should reset form validation state', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-validation');
      await expect(scenario).toBeVisible();

      const emailInput = scenario.locator('#email input');

      // Verify default valid value
      await expect(emailInput).toHaveValue('valid@example.com');

      // Enter invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Verify invalid value is set
      await expect(emailInput).toHaveValue('invalid-email');

      // Reset form
      await scenario.locator('#reset-button button').click();

      // Verify reset to valid default
      await expect(emailInput).toHaveValue('valid@example.com');
    });
  });

  test.describe('Form Clear Functionality', () => {
    test('should clear all form fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/clear-all');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-all');
      await expect(scenario).toBeVisible();

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      // Wait for fields to be visible
      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
      await expect(emailInput).toBeVisible();

      // Fill in the fields (blur triggers form state update)
      await firstNameInput.fill('John');
      await firstNameInput.blur();
      await lastNameInput.fill('Doe');
      await lastNameInput.blur();
      await emailInput.fill('john@example.com');
      await emailInput.blur();

      // Verify filled values
      await expect(firstNameInput).toHaveValue('John');
      await expect(lastNameInput).toHaveValue('Doe');
      await expect(emailInput).toHaveValue('john@example.com');

      // Clear form
      await scenario.locator('#clear-button button').click();

      // Verify all fields are empty (use auto-waiting assertions)
      await expect(firstNameInput).toHaveValue('', { timeout: 10000 });
      await expect(lastNameInput).toHaveValue('', { timeout: 10000 });
      await expect(emailInput).toHaveValue('', { timeout: 10000 });
    });

    test('should clear select fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/clear-select');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-select');
      await expect(scenario).toBeVisible();

      const select = helpers.getSelect(scenario, 'language');

      // Select Spanish
      await select.selectOption('es');

      // Verify selected value
      await expect(select).toHaveValue('es');

      // Clear form
      await scenario.locator('#clear-button button').click();

      // Verify select is cleared (should not be 'es')
      await expect(select).not.toHaveValue('es');
    });

    test('should clear checkbox fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/clear-checkbox');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-checkbox');
      await expect(scenario).toBeVisible();

      const checkboxInput = scenario.locator('#subscribe input[type="checkbox"]');

      // Check the checkbox
      await checkboxInput.check();

      // Verify checked state
      await expect(checkboxInput).toBeChecked();

      // Clear form
      await scenario.locator('#clear-button button').click();

      // Verify checkbox is unchecked after clear
      await expect(checkboxInput).not.toBeChecked();
    });
  });

  test.describe('Reset vs Clear Behavior', () => {
    test('should differentiate between reset and clear actions', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-vs-clear');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-vs-clear');
      await expect(scenario).toBeVisible();

      const nameInput = scenario.locator('#name input');
      const emailInput = scenario.locator('#email input');

      // Verify default values
      await expect(nameInput).toHaveValue('Default Name');
      await expect(emailInput).toHaveValue('');

      // Modify both fields
      await nameInput.fill('Modified Name');
      await emailInput.fill('test@example.com');
      await expect(nameInput).toHaveValue('Modified Name');
      await expect(emailInput).toHaveValue('test@example.com');

      // Test Reset - should restore defaults (name has default, email doesn't)
      await scenario.locator('#reset-button button').click();
      await expect(nameInput).toHaveValue('Default Name');
      await expect(emailInput).toHaveValue('');

      // Modify again
      await nameInput.fill('Another Name');
      await emailInput.fill('another@example.com');

      // Test Clear - clears form value to {}, so name falls back to its default, email has none
      await scenario.locator('#clear-button button').click();
      await expect(nameInput).toHaveValue('Default Name'); // Falls back to config default
      await expect(emailInput).toHaveValue(''); // No default, so empty
    });

    test('should handle reset and clear with required fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/required-reset-clear');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('required-reset-clear');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');

      // Verify initial state - should be valid with default value
      await expect(input).toHaveValue('Initial Value');
      expect(await input.getAttribute('required')).not.toBeNull();

      // Modify the field
      await input.fill('Modified Value');
      await expect(input).toHaveValue('Modified Value');

      // Clear the form - field falls back to config default since it has one
      await scenario.locator('#clear-button button').click();
      await expect(input).toHaveValue('Initial Value'); // Falls back to config default

      // Reset should restore valid state
      await scenario.locator('#reset-button button').click();
      await expect(input).toHaveValue('Initial Value');
    });
  });

  test.describe('Complex Reset/Clear Scenarios', () => {
    test('should reset nested group fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-nested');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-nested');
      await expect(scenario).toBeVisible();

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      // Verify defaults
      await expect(firstNameInput).toHaveValue('John');
      await expect(lastNameInput).toHaveValue('Doe');

      // Modify
      await firstNameInput.fill('Jane');
      await lastNameInput.fill('Smith');

      // Reset
      await scenario.locator('#reset-button button').click();

      // Verify reset
      await expect(firstNameInput).toHaveValue('John');
      await expect(lastNameInput).toHaveValue('Doe');
    });

    test('should handle multiple reset/clear cycles', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/multiple-cycles');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multiple-cycles');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#field input');

      // Verify default
      await expect(input).toHaveValue('Default');

      // Cycle 1: Modify -> Reset
      await input.fill('Value 1');
      await scenario.locator('#reset-button button').click();
      await expect(input).toHaveValue('Default');

      // Cycle 2: Modify -> Clear (clears form value, field falls back to config default)
      await input.fill('Value 2');
      await scenario.locator('#clear-button button').click();
      await expect(input).toHaveValue('Default'); // Falls back to config default

      // Cycle 3: Reset from empty (should restore default)
      await scenario.locator('#reset-button button').click();
      await expect(input).toHaveValue('Default');

      // Cycle 4: Clear -> Reset -> Clear (all show default since field has config default)
      await scenario.locator('#clear-button button').click();
      await expect(input).toHaveValue('Default'); // Falls back to config default

      await scenario.locator('#reset-button button').click();
      await expect(input).toHaveValue('Default'); // Restores config default

      await scenario.locator('#clear-button button').click();
      await expect(input).toHaveValue('Default'); // Falls back to config default
    });
  });
});

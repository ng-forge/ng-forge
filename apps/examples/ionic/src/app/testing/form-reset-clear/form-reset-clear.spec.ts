import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Form Reset and Clear Events Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/form-reset-clear');
  });

  test.describe('Form Reset Functionality', () => {
    test('should reset form to default values', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/reset-defaults'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-defaults');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="reset-defaults"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="reset-defaults"] #lastName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="reset-defaults"] #email input', { state: 'visible', timeout: 10000 });

      // Verify default values are set
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(emailInput).toHaveValue('john.doe@example.com', { timeout: 5000 });

      // Modify the fields
      await firstNameInput.fill('Jane');
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Smith');
      await expect(lastNameInput).toHaveValue('Smith', { timeout: 5000 });
      await ionBlur(lastNameInput);
      await emailInput.fill('jane.smith@example.com');
      await expect(emailInput).toHaveValue('jane.smith@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      // Verify modified values
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Smith', { timeout: 5000 });
      await expect(emailInput).toHaveValue('jane.smith@example.com', { timeout: 5000 });

      // Click reset button
      const resetButton = scenario.locator('#reset-button ion-button');
      await resetButton.click();

      // Verify values are reset to defaults
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(emailInput).toHaveValue('john.doe@example.com', { timeout: 5000 });
    });

    test('should reset select fields to default values', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/reset-select'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-select');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for select to be visible
      await page.waitForSelector('[data-testid="reset-select"] #country', { state: 'visible', timeout: 10000 });

      const select = helpers.getSelect(scenario, 'country');

      // Verify default value is set (US) by checking displayed text
      // ion-select displays selected option text in a div inside ion-select
      await expect(select).toContainText('United States', { timeout: 5000 });

      // Change to UK
      await helpers.selectOption(select, 'United Kingdom');

      // Verify changed value
      await expect(select).toContainText('United Kingdom', { timeout: 5000 });

      // Reset
      await scenario.locator('#reset-button ion-button').click();

      // Verify reset to default (US)
      await expect(select).toContainText('United States', { timeout: 5000 });
    });

    test('should reset checkbox fields to default values', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/reset-checkbox'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-checkbox');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be visible
      await page.waitForSelector('[data-testid="reset-checkbox"] #subscribe ion-checkbox', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="reset-checkbox"] #terms ion-checkbox', { state: 'visible', timeout: 10000 });

      const subscribeInput = scenario.locator('#subscribe ion-checkbox');
      const termsInput = scenario.locator('#terms ion-checkbox');

      // Verify default states
      await expect(subscribeInput).toBeChecked({ timeout: 5000 });
      await expect(termsInput).not.toBeChecked({ timeout: 5000 });

      // Toggle both checkboxes
      await helpers.uncheckIonCheckbox(subscribeInput);
      await expect(subscribeInput).not.toBeChecked({ timeout: 5000 });
      await helpers.checkIonCheckbox(termsInput);
      await expect(termsInput).toBeChecked({ timeout: 5000 });

      // Verify changed states
      await expect(subscribeInput).not.toBeChecked({ timeout: 5000 });
      await expect(termsInput).toBeChecked({ timeout: 5000 });

      // Reset
      await scenario.locator('#reset-button ion-button').click();

      // Verify reset to defaults
      await expect(subscribeInput).toBeChecked({ timeout: 5000 });
      await expect(termsInput).not.toBeChecked({ timeout: 5000 });
    });

    test('should reset form validation state', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/reset-validation'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for email field to be visible
      await page.waitForSelector('[data-testid="reset-validation"] #email input', { state: 'visible', timeout: 10000 });

      const emailInput = scenario.locator('#email input');

      // Verify default valid value
      await expect(emailInput).toHaveValue('valid@example.com', { timeout: 5000 });

      // Enter invalid email
      await emailInput.fill('invalid-email');
      await expect(emailInput).toHaveValue('invalid-email', { timeout: 5000 });
      await ionBlur(emailInput);

      // Verify invalid value is set
      await expect(emailInput).toHaveValue('invalid-email', { timeout: 5000 });

      // Reset form
      await scenario.locator('#reset-button ion-button').click();

      // Verify reset to valid default
      await expect(emailInput).toHaveValue('valid@example.com', { timeout: 5000 });
    });
  });

  test.describe('Form Clear Functionality', () => {
    test('should clear all form fields', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/clear-all'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-all');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="clear-all"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="clear-all"] #lastName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="clear-all"] #email input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      // Wait for fields to be visible
      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // Fill in the fields (blur triggers form state update)
      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await ionBlur(lastNameInput);
      await emailInput.fill('john@example.com');
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      // Verify filled values
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });

      // Clear form
      await scenario.locator('#clear-button ion-button').click();

      // Verify all fields are empty (use auto-waiting assertions)
      await expect(firstNameInput).toHaveValue('', { timeout: 10000 });
      await expect(lastNameInput).toHaveValue('', { timeout: 10000 });
      await expect(emailInput).toHaveValue('', { timeout: 10000 });
    });

    test('should clear select fields', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/clear-select'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-select');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for select to be visible
      await page.waitForSelector('[data-testid="clear-select"] #language', { state: 'visible', timeout: 10000 });

      const select = helpers.getSelect(scenario, 'language');

      // Select Spanish
      await helpers.selectOption(select, 'Spanish');

      // Verify selected value by checking the select has 'has-value' class
      await expect(select).toHaveClass(/has-value/, { timeout: 5000 });

      // Clear form
      await scenario.locator('#clear-button ion-button').click();
      await page.waitForTimeout(300); // Wait for clear to take effect

      // Verify select is cleared by checking it no longer has 'has-value' class
      await expect(select).not.toHaveClass(/has-value/, { timeout: 5000 });
    });

    test('should clear checkbox fields', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/clear-checkbox'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-checkbox');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkbox to be visible
      await page.waitForSelector('[data-testid="clear-checkbox"] #subscribe ion-checkbox', { state: 'visible', timeout: 10000 });

      const checkboxInput = scenario.locator('#subscribe ion-checkbox');

      // Check the checkbox
      await helpers.checkIonCheckbox(checkboxInput);
      await expect(checkboxInput).toBeChecked({ timeout: 5000 });

      // Verify checked state
      await expect(checkboxInput).toBeChecked({ timeout: 5000 });

      // Clear form
      await scenario.locator('#clear-button ion-button').click();

      // Verify checkbox is unchecked after clear
      await expect(checkboxInput).not.toBeChecked({ timeout: 5000 });
    });
  });

  test.describe('Reset vs Clear Behavior', () => {
    test('should differentiate between reset and clear actions', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/reset-vs-clear'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-vs-clear');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="reset-vs-clear"] #name input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="reset-vs-clear"] #email input', { state: 'visible', timeout: 10000 });

      const nameInput = scenario.locator('#name input');
      const emailInput = scenario.locator('#email input');

      // Verify default values
      await expect(nameInput).toHaveValue('Default Name', { timeout: 5000 });
      await expect(emailInput).toHaveValue('', { timeout: 5000 });

      // Modify both fields
      await nameInput.fill('Modified Name');
      await expect(nameInput).toHaveValue('Modified Name', { timeout: 5000 });
      await ionBlur(nameInput);
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await expect(nameInput).toHaveValue('Modified Name', { timeout: 5000 });
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });

      // Test Reset - should restore defaults (name has default, email doesn't)
      await scenario.locator('#reset-button ion-button').click();
      await expect(nameInput).toHaveValue('Default Name', { timeout: 5000 });
      await expect(emailInput).toHaveValue('', { timeout: 5000 });

      // Modify again
      await nameInput.fill('Another Name');
      await expect(nameInput).toHaveValue('Another Name', { timeout: 5000 });
      await ionBlur(nameInput);
      await emailInput.fill('another@example.com');
      await expect(emailInput).toHaveValue('another@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      // Test Clear - clears form value to {}, so name falls back to its default, email has none
      await scenario.locator('#clear-button ion-button').click();
      await expect(nameInput).toHaveValue('Default Name', { timeout: 5000 }); // Falls back to config default
      await expect(emailInput).toHaveValue('', { timeout: 5000 }); // No default, so empty
    });

    test('should handle reset and clear with required fields', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/required-reset-clear'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('required-reset-clear');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible
      await page.waitForSelector('[data-testid="required-reset-clear"] #requiredField input', { state: 'visible', timeout: 10000 });

      const input = scenario.locator('#requiredField input');

      // Verify initial state - should be valid with default value
      await expect(input).toHaveValue('Initial Value', { timeout: 5000 });

      // Modify the field
      await input.fill('Modified Value');
      await expect(input).toHaveValue('Modified Value', { timeout: 5000 });
      await ionBlur(input);

      // Clear the form - field falls back to config default since it has one
      await scenario.locator('#clear-button ion-button').click();
      await expect(input).toHaveValue('Initial Value', { timeout: 5000 }); // Falls back to config default

      // Reset should restore valid state
      await scenario.locator('#reset-button ion-button').click();
      await expect(input).toHaveValue('Initial Value', { timeout: 5000 });
    });
  });

  test.describe('Complex Reset/Clear Scenarios', () => {
    test('should reset nested group fields', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/reset-nested'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-nested');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="reset-nested"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="reset-nested"] #lastName input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      // Verify defaults
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });

      // Modify
      await firstNameInput.fill('Jane');
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Smith');
      await expect(lastNameInput).toHaveValue('Smith', { timeout: 5000 });
      await ionBlur(lastNameInput);

      // Reset
      await scenario.locator('#reset-button ion-button').click();

      // Verify reset
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
    });

    test('should handle multiple reset/clear cycles', async ({ page, helpers }) => {
      await page.goto(testUrl('/form-reset-clear/multiple-cycles'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multiple-cycles');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible
      await page.waitForSelector('[data-testid="multiple-cycles"] #field input', { state: 'visible', timeout: 10000 });

      const input = scenario.locator('#field input');

      // Verify default
      await expect(input).toHaveValue('Default', { timeout: 5000 });

      // Cycle 1: Modify -> Reset
      await input.fill('Value 1');
      await expect(input).toHaveValue('Value 1', { timeout: 5000 });
      await ionBlur(input);
      await scenario.locator('#reset-button ion-button').click();
      await expect(input).toHaveValue('Default', { timeout: 5000 });

      // Cycle 2: Modify -> Clear (clears form value, field falls back to config default)
      await input.fill('Value 2');
      await expect(input).toHaveValue('Value 2', { timeout: 5000 });
      await ionBlur(input);
      await scenario.locator('#clear-button ion-button').click();
      await expect(input).toHaveValue('Default', { timeout: 5000 }); // Falls back to config default

      // Cycle 3: Reset from empty (should restore default)
      await scenario.locator('#reset-button ion-button').click();
      await expect(input).toHaveValue('Default', { timeout: 5000 });

      // Cycle 4: Clear -> Reset -> Clear (all show default since field has config default)
      await scenario.locator('#clear-button ion-button').click();
      await expect(input).toHaveValue('Default', { timeout: 5000 }); // Falls back to config default

      await scenario.locator('#reset-button ion-button').click();
      await expect(input).toHaveValue('Default', { timeout: 5000 }); // Restores config default

      await scenario.locator('#clear-button ion-button').click();
      await expect(input).toHaveValue('Default', { timeout: 5000 }); // Falls back to config default
    });
  });
});

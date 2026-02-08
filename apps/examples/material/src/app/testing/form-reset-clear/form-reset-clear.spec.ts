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

      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
      expect(await emailInput.inputValue()).toBe('john.doe@example.com');

      // Modify the fields
      await firstNameInput.fill('Jane');
      await lastNameInput.fill('Smith');
      await emailInput.fill('jane.smith@example.com');

      // Verify modified values
      expect(await firstNameInput.inputValue()).toBe('Jane');
      expect(await lastNameInput.inputValue()).toBe('Smith');
      expect(await emailInput.inputValue()).toBe('jane.smith@example.com');

      // Click reset button
      const resetButton = scenario.locator('#reset-button button');
      await resetButton.click();
      await page.waitForTimeout(300);

      // Verify values are reset to defaults
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
      expect(await emailInput.inputValue()).toBe('john.doe@example.com');
    });

    test('should reset select fields to default values', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-select');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-select');
      await expect(scenario).toBeVisible();

      // Verify default value is set (US)
      await expect(scenario.locator('#country mat-select')).toContainText('United States');

      // Change to UK
      await scenario.locator('#country mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'United Kingdom' }).click();
      await page.waitForTimeout(200);

      // Verify changed value
      await expect(scenario.locator('#country mat-select')).toContainText('United Kingdom');

      // Reset
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset to default (US)
      await expect(scenario.locator('#country mat-select')).toContainText('United States');
    });

    test('should reset checkbox fields to default values', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-checkbox');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-checkbox');
      await expect(scenario).toBeVisible();

      const subscribeCheckbox = scenario.locator('#subscribe mat-checkbox');
      const termsCheckbox = scenario.locator('#terms mat-checkbox');

      // Verify default states
      await expect(subscribeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(termsCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);

      // Toggle both checkboxes
      await subscribeCheckbox.click();
      await termsCheckbox.click();
      await page.waitForTimeout(200);

      // Verify changed states
      await expect(subscribeCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(termsCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);

      // Reset
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset to defaults
      await expect(subscribeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(termsCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
    });

    test('should reset form validation state', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-validation');
      await expect(scenario).toBeVisible();

      const emailInput = scenario.locator('#email input');

      // Verify default valid value
      expect(await emailInput.inputValue()).toBe('valid@example.com');

      // Enter invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      await page.waitForTimeout(200);

      // Verify invalid value is set
      expect(await emailInput.inputValue()).toBe('invalid-email');

      // Reset form
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset to valid default
      expect(await emailInput.inputValue()).toBe('valid@example.com');
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

      // Fill in the fields (no defaults, so they start empty)
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await emailInput.fill('john@example.com');

      // Verify filled values
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
      expect(await emailInput.inputValue()).toBe('john@example.com');

      // Clear form
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(300);

      // Verify all fields are empty
      expect(await firstNameInput.inputValue()).toBe('');
      expect(await lastNameInput.inputValue()).toBe('');
      expect(await emailInput.inputValue()).toBe('');
    });

    test('should clear select fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/clear-select');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-select');
      await expect(scenario).toBeVisible();

      // Select Spanish
      await scenario.locator('#language mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Spanish' }).click();
      await page.waitForTimeout(200);

      // Verify selected value
      await expect(scenario.locator('#language mat-select')).toContainText('Spanish');

      // Clear form
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(300);

      // Verify select is cleared (should show placeholder or be empty)
      const selectText = await scenario.locator('#language mat-select').textContent();
      // After clear, should not contain the previous value
      expect(selectText?.trim()).not.toBe('Spanish');
    });

    test('should clear checkbox fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/clear-checkbox');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-checkbox');
      await expect(scenario).toBeVisible();

      const checkbox = scenario.locator('#subscribe mat-checkbox');

      // Check the checkbox
      await checkbox.click();
      await page.waitForTimeout(200);

      // Verify checked state
      await expect(checkbox).toHaveClass(/mat-mdc-checkbox-checked/);

      // Clear form
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(300);

      // Verify checkbox is unchecked after clear
      await expect(checkbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
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
      expect(await nameInput.inputValue()).toBe('Default Name');
      expect(await emailInput.inputValue()).toBe('');

      // Modify both fields
      await nameInput.fill('Modified Name');
      await emailInput.fill('test@example.com');
      expect(await nameInput.inputValue()).toBe('Modified Name');
      expect(await emailInput.inputValue()).toBe('test@example.com');

      // Test Reset - should restore defaults (name has default, email doesn't)
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(300);
      expect(await nameInput.inputValue()).toBe('Default Name');
      expect(await emailInput.inputValue()).toBe('');

      // Modify again
      await nameInput.fill('Another Name');
      await emailInput.fill('another@example.com');

      // Test Clear - clears form value to {}, so name falls back to its default, email has none
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(300);
      expect(await nameInput.inputValue()).toBe('Default Name'); // Falls back to config default
      expect(await emailInput.inputValue()).toBe(''); // No default, so empty
    });

    test('should handle reset and clear with required fields', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/required-reset-clear');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('required-reset-clear');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');

      // Verify initial state - should be valid with default value
      expect(await input.inputValue()).toBe('Initial Value');
      expect(await input.getAttribute('required')).not.toBeNull();

      // Modify the field
      await input.fill('Modified Value');
      expect(await input.inputValue()).toBe('Modified Value');

      // Clear the form - field falls back to config default since it has one
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(300);
      expect(await input.inputValue()).toBe('Initial Value'); // Falls back to config default

      // Reset should restore valid state
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(300);
      expect(await input.inputValue()).toBe('Initial Value');
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
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');

      // Modify
      await firstNameInput.fill('Jane');
      await lastNameInput.fill('Smith');

      // Reset
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
    });

    test('should handle multiple reset/clear cycles', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/multiple-cycles');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multiple-cycles');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#field input');

      // Verify default
      expect(await input.inputValue()).toBe('Default');

      // Cycle 1: Modify -> Reset
      await input.fill('Value 1');
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default');

      // Cycle 2: Modify -> Clear (clears form value, field falls back to config default)
      await input.fill('Value 2');
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Falls back to config default

      // Cycle 3: Reset from empty (should restore default)
      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default');

      // Cycle 4: Clear -> Reset -> Clear (all show default since field has config default)
      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Falls back to config default

      await scenario.locator('#reset-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Restores config default

      await scenario.locator('#clear-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Falls back to config default
    });
  });

  test.describe('Reset Form with Groups', () => {
    test('should reset group field values to defaults', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-with-groups');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-with-groups');
      await expect(scenario).toBeVisible();

      const nameInput = scenario.locator('#name input');
      const streetInput = scenario.locator('#address #street input');
      const cityInput = scenario.locator('#address #city input');

      // Verify default values
      expect(await nameInput.inputValue()).toBe('Default Name');
      expect(await streetInput.inputValue()).toBe('123 Main St');
      expect(await cityInput.inputValue()).toBe('Springfield');

      // Modify the fields
      await nameInput.fill('New Name');
      await streetInput.fill('999 New St');
      await cityInput.fill('New York');

      // Verify modified values
      expect(await nameInput.inputValue()).toBe('New Name');
      expect(await streetInput.inputValue()).toBe('999 New St');
      expect(await cityInput.inputValue()).toBe('New York');

      // Click Reset button
      await scenario.locator('#reset-button button').click();

      // Verify values return to defaults
      await expect(nameInput).toHaveValue('Default Name', { timeout: 5000 });
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });
    });
  });

  test.describe('Reset Form with Arrays', () => {
    test('should reset array fields to initial state', async ({ page, helpers }) => {
      await page.goto('/#/test/form-reset-clear/reset-with-arrays');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-with-arrays');
      await expect(scenario).toBeVisible();

      const titleInput = scenario.locator('#title input');
      const tagInputs = scenario.locator('[id^="tag"] input');

      // Verify default values
      await expect(titleInput).toHaveValue('Default Title', { timeout: 5000 });
      await expect(tagInputs).toHaveCount(1);
      await expect(tagInputs.nth(0)).toHaveValue('initial-tag', { timeout: 5000 });

      // Modify the existing tag value
      await tagInputs.nth(0).fill('modified-tag');
      await expect(tagInputs.nth(0)).toHaveValue('modified-tag', { timeout: 5000 });

      // Add a new tag
      const addButton = scenario.locator('#addTag button');
      await addButton.click();

      // Should now have 2 tags
      await expect(tagInputs).toHaveCount(2, { timeout: 5000 });

      // Modify title
      await titleInput.fill('New Title');

      // Click Reset button
      await scenario.locator('#reset-button button').click();

      // Verify title returns to default
      await expect(titleInput).toHaveValue('Default Title', { timeout: 5000 });

      // Verify the array returns to initial state (one item with default value)
      await expect(tagInputs).toHaveCount(1, { timeout: 5000 });
      await expect(tagInputs.nth(0)).toHaveValue('initial-tag', { timeout: 5000 });
    });
  });
});

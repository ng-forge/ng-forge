/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';

test.describe('Form Reset and Clear Events Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test.describe('Form Reset Functionality', () => {
    test('should reset form to default values', async ({ page }) => {
      // Load config in browser context to access window.FormResetEvent
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'firstName',
                type: 'input',
                label: 'First Name',
                value: 'John',
                col: 6,
              },
              {
                key: 'lastName',
                type: 'input',
                label: 'Last Name',
                value: 'Doe',
                col: 6,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                value: 'john.doe@example.com',
                props: {
                  type: 'email',
                },
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset to Defaults',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'reset-defaults' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Verify default values are set
      const firstNameInput = page.locator('#firstName input');
      const lastNameInput = page.locator('#lastName input');
      const emailInput = page.locator('#email input');

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
      const resetButton = page.locator('#reset-button button');
      await resetButton.click();
      await page.waitForTimeout(300);

      // Verify values are reset to defaults
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
      expect(await emailInput.inputValue()).toBe('john.doe@example.com');
    });

    test('should reset select fields to default values', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'country',
                type: 'select',
                label: 'Country',
                value: 'us',
                options: [
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'ca', label: 'Canada' },
                ],
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'reset-select' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Verify default value is set (US)
      await expect(page.locator('#country mat-select')).toContainText('United States');

      // Change to UK
      await page.click('#country mat-select');
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'United Kingdom' }).click();
      await page.waitForTimeout(200);

      // Verify changed value
      await expect(page.locator('#country mat-select')).toContainText('United Kingdom');

      // Reset
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset to default (US)
      await expect(page.locator('#country mat-select')).toContainText('United States');
    });

    test('should reset checkbox fields to default values', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'subscribe',
                type: 'checkbox',
                label: 'Subscribe to newsletter',
                value: true,
              },
              {
                key: 'terms',
                type: 'checkbox',
                label: 'Accept terms',
                value: false,
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'reset-checkbox' },
        );
      });
      await page.waitForLoadState('networkidle');

      const subscribeCheckbox = page.locator('#subscribe mat-checkbox');
      const termsCheckbox = page.locator('#terms mat-checkbox');

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
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset to defaults
      await expect(subscribeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(termsCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
    });

    test('should reset form validation state', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                value: 'valid@example.com',
                required: true,
                email: true,
                props: {
                  type: 'email',
                },
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'reset-validation' },
        );
      });
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('#email input');

      // Verify default valid value
      expect(await emailInput.inputValue()).toBe('valid@example.com');

      // Enter invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      await page.waitForTimeout(200);

      // Verify invalid value is set
      expect(await emailInput.inputValue()).toBe('invalid-email');

      // Reset form
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset to valid default
      expect(await emailInput.inputValue()).toBe('valid@example.com');
    });
  });

  test.describe('Form Clear Functionality', () => {
    test('should clear all form fields', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'firstName',
                type: 'input',
                label: 'First Name',
                // No default value - user must fill it
              },
              {
                key: 'lastName',
                type: 'input',
                label: 'Last Name',
                // No default value - user must fill it
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                props: {
                  type: 'email',
                },
                // No default value - user must fill it
              },
              {
                key: 'clear-button',
                type: 'button',
                label: 'Clear All',
                event: (window as any).FormClearEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'clear-all' },
        );
      });
      await page.waitForLoadState('networkidle');

      const firstNameInput = page.locator('#firstName input');
      const lastNameInput = page.locator('#lastName input');
      const emailInput = page.locator('#email input');

      // Fill in the fields (no defaults, so they start empty)
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await emailInput.fill('john@example.com');

      // Verify filled values
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
      expect(await emailInput.inputValue()).toBe('john@example.com');

      // Clear form
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(300);

      // Verify all fields are empty
      expect(await firstNameInput.inputValue()).toBe('');
      expect(await lastNameInput.inputValue()).toBe('');
      expect(await emailInput.inputValue()).toBe('');
    });

    test('should clear select fields', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'language',
                type: 'select',
                label: 'Preferred Language',
                options: [
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                ],
                // No default value
              },
              {
                key: 'clear-button',
                type: 'button',
                label: 'Clear',
                event: (window as any).FormClearEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'clear-select' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Select Spanish
      await page.click('#language mat-select');
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Spanish' }).click();
      await page.waitForTimeout(200);

      // Verify selected value
      await expect(page.locator('#language mat-select')).toContainText('Spanish');

      // Clear form
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(300);

      // Verify select is cleared (should show placeholder or be empty)
      const selectText = await page.locator('#language mat-select').textContent();
      // After clear, should not contain the previous value
      expect(selectText?.trim()).not.toBe('Spanish');
    });

    test('should clear checkbox fields', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'subscribe',
                type: 'checkbox',
                label: 'Subscribe',
                // No default value - starts unchecked
              },
              {
                key: 'clear-button',
                type: 'button',
                label: 'Clear',
                event: (window as any).FormClearEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'clear-checkbox' },
        );
      });
      await page.waitForLoadState('networkidle');

      const checkbox = page.locator('#subscribe mat-checkbox');

      // Check the checkbox
      await checkbox.click();
      await page.waitForTimeout(200);

      // Verify checked state
      await expect(checkbox).toHaveClass(/mat-mdc-checkbox-checked/);

      // Clear form
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(300);

      // Verify checkbox is unchecked after clear
      await expect(checkbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
    });
  });

  test.describe('Reset vs Clear Behavior', () => {
    test('should differentiate between reset and clear actions', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Name',
                value: 'Default Name',
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email (no default)',
                props: {
                  type: 'email',
                },
                // No default value
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
              {
                key: 'clear-button',
                type: 'button',
                label: 'Clear',
                event: (window as any).FormClearEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'reset-vs-clear' },
        );
      });
      await page.waitForLoadState('networkidle');

      const nameInput = page.locator('#name input');
      const emailInput = page.locator('#email input');

      // Verify default values
      expect(await nameInput.inputValue()).toBe('Default Name');
      expect(await emailInput.inputValue()).toBe('');

      // Modify both fields
      await nameInput.fill('Modified Name');
      await emailInput.fill('test@example.com');
      expect(await nameInput.inputValue()).toBe('Modified Name');
      expect(await emailInput.inputValue()).toBe('test@example.com');

      // Test Reset - should restore defaults (name has default, email doesn't)
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(300);
      expect(await nameInput.inputValue()).toBe('Default Name');
      expect(await emailInput.inputValue()).toBe('');

      // Modify again
      await nameInput.fill('Another Name');
      await emailInput.fill('another@example.com');

      // Test Clear - clears form value to {}, so name falls back to its default, email has none
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(300);
      expect(await nameInput.inputValue()).toBe('Default Name'); // Falls back to config default
      expect(await emailInput.inputValue()).toBe(''); // No default, so empty
    });

    test('should handle reset and clear with required fields', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'requiredField',
                type: 'input',
                label: 'Required Field',
                value: 'Initial Value',
                required: true,
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
              {
                key: 'clear-button',
                type: 'button',
                label: 'Clear',
                event: (window as any).FormClearEvent,
                props: {
                  type: 'button',
                },
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Submit',
              },
            ],
          },
          { testId: 'required-reset-clear' },
        );
      });
      await page.waitForLoadState('networkidle');

      const input = page.locator('#requiredField input');

      // Verify initial state - should be valid with default value
      expect(await input.inputValue()).toBe('Initial Value');
      expect(await input.getAttribute('required')).not.toBeNull();

      // Modify the field
      await input.fill('Modified Value');
      expect(await input.inputValue()).toBe('Modified Value');

      // Clear the form - field falls back to config default since it has one
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(300);
      expect(await input.inputValue()).toBe('Initial Value'); // Falls back to config default

      // Reset should restore valid state
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(300);
      expect(await input.inputValue()).toBe('Initial Value');
    });
  });

  test.describe('Complex Reset/Clear Scenarios', () => {
    test('should reset nested group fields', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'userInfo',
                type: 'group',
                label: 'User Information',
                fields: [
                  {
                    key: 'firstName',
                    type: 'input',
                    label: 'First Name',
                    value: 'John',
                  },
                  {
                    key: 'lastName',
                    type: 'input',
                    label: 'Last Name',
                    value: 'Doe',
                  },
                ],
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'reset-nested' },
        );
      });
      await page.waitForLoadState('networkidle');

      const firstNameInput = page.locator('#firstName input');
      const lastNameInput = page.locator('#lastName input');

      // Verify defaults
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');

      // Modify
      await firstNameInput.fill('Jane');
      await lastNameInput.fill('Smith');

      // Reset
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(300);

      // Verify reset
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
    });

    test('should handle multiple reset/clear cycles', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'field',
                type: 'input',
                label: 'Field',
                value: 'Default',
              },
              {
                key: 'reset-button',
                type: 'button',
                label: 'Reset',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
              {
                key: 'clear-button',
                type: 'button',
                label: 'Clear',
                event: (window as any).FormClearEvent,
                props: {
                  type: 'button',
                },
              },
            ],
          },
          { testId: 'multiple-cycles' },
        );
      });
      await page.waitForLoadState('networkidle');

      const input = page.locator('#field input');

      // Verify default
      expect(await input.inputValue()).toBe('Default');

      // Cycle 1: Modify -> Reset
      await input.fill('Value 1');
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default');

      // Cycle 2: Modify -> Clear (clears form value, field falls back to config default)
      await input.fill('Value 2');
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Falls back to config default

      // Cycle 3: Reset from empty (should restore default)
      await page.locator('#reset-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default');

      // Cycle 4: Clear -> Reset -> Clear (all show default since field has config default)
      await page.locator('#clear-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Falls back to config default

      await page.locator('#reset-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Restores config default

      await page.locator('#clear-button button').click();
      await page.waitForTimeout(200);
      expect(await input.inputValue()).toBe('Default'); // Falls back to config default
    });
  });
});

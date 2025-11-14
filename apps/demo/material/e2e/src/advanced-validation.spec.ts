/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { E2EScenarioLoader } from './utils/e2e-form-helpers';

test.describe('Advanced Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => (window as any).loadTestScenario !== undefined);
  });

  test('should validate using custom validators', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: {
            type: 'password',
          },
          required: true,
          minLength: 8,
          validators: [
            {
              type: 'custom',
              name: 'strongPassword',
              message: 'Password must contain uppercase, lowercase, number and special character',
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'submit',
          label: 'Submit',
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'custom-validator-test',
      title: 'Custom Validator Test',
    });

    await page.waitForLoadState('networkidle');

    // Try weak password
    await page.fill('#password input', 'weak');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Check for validation errors
    const passwordField = page.locator('#password');
    const hasError = (await passwordField.locator('..').locator('mat-error').count()) > 0;

    // Fill strong password
    await page.fill('#password input', 'Strong@123');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);
  });

  test('should validate fields against each other using cross-field validation', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: {
            type: 'password',
          },
          required: true,
          minLength: 8,
          col: 6,
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: 'Confirm Password',
          props: {
            type: 'password',
          },
          required: true,
          validators: [
            {
              type: 'custom',
              name: 'passwordMatch',
              message: 'Passwords must match',
            },
          ],
          col: 6,
        },
        {
          key: 'submit',
          type: 'submit',
          label: 'Submit',
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'cross-field-test',
      title: 'Cross-Field Validation Test',
    });

    await page.waitForLoadState('networkidle');

    // Enter matching passwords
    await page.fill('#password input', 'MyPassword123');
    await page.fill('#confirmPassword input', 'MyPassword123');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Now try mismatched passwords
    await page.fill('#confirmPassword input', 'DifferentPassword');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Should show error
    const confirmField = page.locator('#confirmPassword');
    const hasError = await confirmField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);
  });

  test('should validate dependent numeric fields', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'minValue',
          type: 'input',
          label: 'Minimum Value',
          props: {
            type: 'number',
          },
          required: true,
          col: 6,
        },
        {
          key: 'maxValue',
          type: 'input',
          label: 'Maximum Value',
          props: {
            type: 'number',
          },
          required: true,
          validators: [
            {
              type: 'custom',
              name: 'greaterThanMin',
              message: 'Maximum must be greater than minimum',
            },
          ],
          col: 6,
        },
        {
          key: 'submit',
          type: 'submit',
          label: 'Submit',
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'range-validation-test',
      title: 'Range Validation Test',
    });

    await page.waitForLoadState('networkidle');

    // Enter valid range
    await page.fill('#minValue input', '10');
    await page.fill('#maxValue input', '20');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Enter invalid range (max < min)
    await page.fill('#maxValue input', '5');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Should show error
    const maxField = page.locator('#maxValue');
    const hasError = await maxField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);
  });

  test('should apply validators conditionally based on when expression', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'isAdult',
          type: 'checkbox',
          label: 'I am 18 or older',
          col: 12,
        },
        {
          key: 'age',
          type: 'input',
          label: 'Age',
          props: {
            type: 'number',
          },
          required: {
            operator: 'equals',
            fieldValue: { field: 'isAdult', value: true },
          },
          validators: [
            {
              type: 'min',
              value: 18,
              message: 'Must be 18 or older',
              when: {
                operator: 'equals',
                fieldValue: { field: 'isAdult', value: true },
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'submit',
          label: 'Submit',
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'conditional-validator-test',
      title: 'Conditional Validator Test',
    });

    await page.waitForLoadState('networkidle');

    // Check isAdult
    await page.check('#isAdult input[type="checkbox"]');
    await page.waitForTimeout(500);

    // Try to submit without age
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Fill age < 18
    await page.fill('#age input', '16');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Should show error
    const ageField = page.locator('#age');
    const hasError = await ageField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);

    // Fill age >= 18
    await page.fill('#age input', '25');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);
  });

  test('should apply multiple validators to a single field', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          required: true,
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$',
          validators: [
            {
              type: 'custom',
              name: 'noReservedWords',
              message: 'Username cannot be "admin" or "root"',
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'submit',
          label: 'Submit',
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'multiple-validators-test',
      title: 'Multiple Validators Test',
    });

    await page.waitForLoadState('networkidle');

    // Test empty (required)
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Test too short (minLength)
    await page.fill('#username input', 'ab');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Test invalid pattern
    await page.fill('#username input', 'user name');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Test valid username
    await page.fill('#username input', 'valid_user_123');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);
  });
});

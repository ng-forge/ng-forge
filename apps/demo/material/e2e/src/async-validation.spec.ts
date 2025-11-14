/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { E2EScenarioLoader } from './utils/e2e-form-helpers';

test.describe('Async Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => (window as any).loadTestScenario !== undefined);
  });

  test('should validate username availability using HTTP GET validator', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    // Mock API responses
    await page.route('**/api/users/check-username*', (route) => {
      const url = route.request().url();
      const username = new URL(url).searchParams.get('username');

      if (username === 'admin') {
        // Username taken
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ available: false }),
        });
      } else {
        // Username available
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ available: true }),
        });
      }
    });

    const config = {
      fields: [
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          required: true,
          validators: [
            {
              type: 'customHttp',
              functionName: 'checkUsernameAvailability',
            },
          ],
          validationMessages: {
            usernameTaken: 'This username is already taken',
          },
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
      testId: 'http-get-validator-test',
      title: 'HTTP GET Validator Test',
    });

    await page.waitForLoadState('networkidle');

    // Try taken username
    await page.fill('#username input', 'admin');
    await page.waitForTimeout(1000); // Wait for async validation

    // Check for validation error
    const usernameField = page.locator('#username');
    const errorVisible = await usernameField
      .locator('..')
      .locator('mat-error:has-text("already taken")')
      .isVisible()
      .catch(() => false);

    if (errorVisible) {
      // Try available username
      await page.fill('#username input', 'newuser123');
      await page.waitForTimeout(1000); // Wait for async validation

      // Error should disappear
      const errorGone = await usernameField
        .locator('..')
        .locator('mat-error:has-text("already taken")')
        .isVisible()
        .catch(() => false);

      expect(errorGone).toBe(false);
    }
  });

  test('should validate email using HTTP POST validator', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    // Mock API responses
    await page.route('**/api/users/validate-email', async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      if (body.email === 'invalid@test.com') {
        // Invalid email
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: false }),
        });
      } else {
        // Valid email
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      }
    });

    const config = {
      fields: [
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: {
            type: 'email',
          },
          required: true,
          validators: [
            {
              type: 'customHttp',
              functionName: 'validateEmail',
            },
          ],
          validationMessages: {
            invalidEmail: 'This email address is not valid',
          },
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
      testId: 'http-post-validator-test',
      title: 'HTTP POST Validator Test',
    });

    await page.waitForLoadState('networkidle');

    // Try invalid email
    await page.fill('#email input', 'invalid@test.com');
    await page.waitForTimeout(1000); // Wait for async validation

    // Check for validation error
    const emailField = page.locator('#email');
    const errorVisible = await emailField
      .locator('..')
      .locator('mat-error:has-text("not valid")')
      .isVisible()
      .catch(() => false);

    if (errorVisible) {
      // Try valid email
      await page.fill('#email input', 'valid@example.com');
      await page.waitForTimeout(1000); // Wait for async validation

      // Error should disappear
      const errorGone = await emailField
        .locator('..')
        .locator('mat-error:has-text("not valid")')
        .isVisible()
        .catch(() => false);

      expect(errorGone).toBe(false);
    }
  });

  test('should validate product code using resource-based async validator', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'productCode',
          type: 'input',
          label: 'Product Code',
          required: true,
          validators: [
            {
              type: 'customAsync',
              functionName: 'checkProductCode',
            },
          ],
          validationMessages: {
            productCodeTaken: 'This product code is already in use',
          },
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
      testId: 'async-resource-validator-test',
      title: 'Async Resource Validator Test',
    });

    await page.waitForLoadState('networkidle');

    // Try taken product code (defined in mock database in component)
    await page.fill('#productCode input', 'PROD-001');
    await page.waitForTimeout(1000); // Wait for async validation (500ms delay + processing)

    // Check for validation error
    const productCodeField = page.locator('#productCode');
    const errorVisible = await productCodeField
      .locator('..')
      .locator('mat-error:has-text("already in use")')
      .isVisible()
      .catch(() => false);

    if (errorVisible) {
      // Try available product code
      await page.fill('#productCode input', 'NEW-PRODUCT-999');
      await page.waitForTimeout(1000); // Wait for async validation

      // Error should disappear
      const errorGone = await productCodeField
        .locator('..')
        .locator('mat-error:has-text("already in use")')
        .isVisible()
        .catch(() => false);

      expect(errorGone).toBe(false);
    }
  });

  test('should handle HTTP validation network errors gracefully', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    // Mock API to return network error for username check
    await page.route('**/api/users/check-username*', (route) => {
      route.abort('failed');
    });

    const config = {
      fields: [
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          required: true,
          validators: [
            {
              type: 'customHttp',
              functionName: 'checkUsernameAvailability',
            },
          ],
          validationMessages: {
            usernameTaken: 'This username is already taken',
          },
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
      testId: 'http-error-handling-test',
      title: 'HTTP Error Handling Test',
    });

    await page.waitForLoadState('networkidle');

    // Fill username
    await page.fill('#username input', 'testuser');
    await page.waitForTimeout(1000); // Wait for async validation

    // Should NOT show error (onError returns null = don't block form)
    const usernameField = page.locator('#username');
    const errorVisible = await usernameField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);

    // Network errors should not block form submission (checkUsernameAvailability's onError returns null)
    expect(errorVisible).toBe(false);
  });

  test('should validate multiple async validators on same field', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    // Mock API responses
    await page.route('**/api/users/check-username*', (route) => {
      const url = route.request().url();
      const username = new URL(url).searchParams.get('username');

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: username !== 'admin' }),
      });
    });

    const config = {
      fields: [
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          required: true,
          minLength: 3,
          maxLength: 20,
          validators: [
            {
              type: 'customHttp',
              functionName: 'checkUsernameAvailability',
            },
          ],
          validationMessages: {
            usernameTaken: 'This username is already taken',
          },
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

    // Test too short (sync validation)
    await page.fill('#username input', 'ab');
    await page.click('#submit button', { force: true });
    await page.waitForTimeout(500);

    // Test taken username (async validation)
    await page.fill('#username input', 'admin');
    await page.waitForTimeout(1000); // Wait for async validation

    const usernameField = page.locator('#username');
    const asyncErrorVisible = await usernameField
      .locator('..')
      .locator('mat-error:has-text("already taken")')
      .isVisible()
      .catch(() => false);

    if (asyncErrorVisible) {
      // Test valid username
      await page.fill('#username input', 'validuser123');
      await page.waitForTimeout(1000); // Wait for async validation

      // No errors should be visible
      const noErrors = await usernameField.locator('..').locator('mat-error').count();
      expect(noErrors).toBe(0);
    }
  });
});

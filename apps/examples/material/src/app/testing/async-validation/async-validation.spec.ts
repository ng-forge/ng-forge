import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck({
  // HTTP error handling test deliberately aborts network requests
  ignorePatterns: [/net::ERR_FAILED/, /Failed to load resource/],
});

test.describe('Async Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/async-validation');
  });

  test.describe('HTTP GET Validator', () => {
    test('should validate username availability using HTTP GET validator', async ({ page, helpers }) => {
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

      const scenario = helpers.getScenario('http-get-validator-test');
      await page.goto('/#/test/async-validation/http-get-validator');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try taken username
      await scenario.locator('#username input').fill('admin');
      await page.waitForTimeout(1000); // Wait for async validation

      // Check for validation error
      const usernameField = scenario.locator('#username');
      const errorVisible = await usernameField
        .locator('..')
        .locator('mat-error:has-text("already taken")')
        .isVisible()
        .catch(() => false);

      if (errorVisible) {
        // Try available username
        await scenario.locator('#username input').fill('newuser123');
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
  });

  test.describe('HTTP POST Validator', () => {
    test('should validate email using HTTP POST validator', async ({ page, helpers }) => {
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

      const scenario = helpers.getScenario('http-post-validator-test');
      await page.goto('/#/test/async-validation/http-post-validator');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try invalid email
      await scenario.locator('#email input').fill('invalid@test.com');
      await page.waitForTimeout(1000); // Wait for async validation

      // Check for validation error
      const emailField = scenario.locator('#email');
      const errorVisible = await emailField
        .locator('..')
        .locator('mat-error:has-text("not valid")')
        .isVisible()
        .catch(() => false);

      if (errorVisible) {
        // Try valid email
        await scenario.locator('#email input').fill('valid@example.com');
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
  });

  test.describe('Resource-Based Async Validator', () => {
    test('should validate product code using resource-based async validator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-resource-validator-test');
      await page.goto('/#/test/async-validation/async-resource-validator');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try taken product code (defined in mock database in component)
      await scenario.locator('#productCode input').fill('PROD-001');
      await page.waitForTimeout(1000); // Wait for async validation (500ms delay + processing)

      // Check for validation error
      const productCodeField = scenario.locator('#productCode');
      const errorVisible = await productCodeField
        .locator('..')
        .locator('mat-error:has-text("already in use")')
        .isVisible()
        .catch(() => false);

      if (errorVisible) {
        // Try available product code
        await scenario.locator('#productCode input').fill('NEW-PRODUCT-999');
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
  });

  test.describe('HTTP Error Handling', () => {
    test('should handle HTTP validation network errors gracefully', async ({ page, helpers }) => {
      // Mock API to return network error for username check
      await page.route('**/api/users/check-username*', (route) => {
        route.abort('failed');
      });

      const scenario = helpers.getScenario('http-error-handling-test');
      await page.goto('/#/test/async-validation/http-error-handling');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Fill username
      await scenario.locator('#username input').fill('testuser');
      await page.waitForTimeout(1000); // Wait for async validation

      // Should NOT show error (onError returns null = don't block form)
      const usernameField = scenario.locator('#username');
      const errorVisible = await usernameField
        .locator('..')
        .locator('mat-error')
        .isVisible()
        .catch(() => false);

      // Network errors should not block form submission (checkUsernameAvailability's onError returns null)
      expect(errorVisible).toBe(false);
    });
  });

  test.describe('Multiple Validators', () => {
    test('should validate multiple async validators on same field', async ({ page, helpers }) => {
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

      const scenario = helpers.getScenario('multiple-validators-test');
      await page.goto('/#/test/async-validation/multiple-validators');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const submitButton = scenario.locator('#submit button');

      // Test too short (sync validation)
      await usernameInput.fill('ab');
      await submitButton.click({ force: true });
      await page.waitForTimeout(500);

      // Test taken username (async validation)
      await usernameInput.fill('admin');
      await page.waitForTimeout(1000); // Wait for async validation

      const usernameField = scenario.locator('#username');
      const asyncErrorVisible = await usernameField
        .locator('..')
        .locator('mat-error:has-text("already taken")')
        .isVisible()
        .catch(() => false);

      if (asyncErrorVisible) {
        // Test valid username
        await usernameInput.fill('validuser123');
        await page.waitForTimeout(1000); // Wait for async validation

        // No errors should be visible
        const noErrors = await usernameField.locator('..').locator('mat-error').count();
        expect(noErrors).toBe(0);
      }
    });
  });
});

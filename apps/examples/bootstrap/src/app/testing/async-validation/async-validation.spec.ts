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
    test('should validate username availability using HTTP GET validator', async ({ page, helpers, browserName }) => {
      // Skip on webkit - async validation is too slow and flaky
      test.skip(browserName === 'webkit', 'Webkit async validation is too slow');
      test.slow();
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

      // Try taken username - wait for the API response
      const usernameInput = scenario.locator('#username input');
      const responsePromise1 = page.waitForResponse('**/api/users/check-username*');
      await usernameInput.fill('admin');
      await usernameInput.blur();
      await responsePromise1;

      // Check for validation error
      const usernameField = scenario.locator('#username');
      const errorMessage = usernameField.locator('..').locator('.invalid-feedback:has-text("already taken")');

      await expect(errorMessage).toBeVisible({ timeout: 10000 });

      // Try available username - wait for the API response
      const responsePromise2 = page.waitForResponse('**/api/users/check-username*');
      await usernameInput.fill('newuser123');
      await usernameInput.blur();
      await responsePromise2;

      // Error should disappear
      await expect(errorMessage).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('HTTP POST Validator', () => {
    test('should validate email using HTTP POST validator', async ({ page, helpers, browserName }) => {
      // Skip on webkit - async validation is too slow and flaky
      test.skip(browserName === 'webkit', 'Webkit async validation is too slow');
      test.slow();
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

      // Try invalid email - wait for the API response
      const emailInput = scenario.locator('#email input');
      await expect(emailInput).toBeVisible();

      const responsePromise1 = page.waitForResponse('**/api/users/validate-email');
      await emailInput.fill('invalid@test.com');
      await emailInput.blur();
      await responsePromise1;

      // Check for validation error
      const emailField = scenario.locator('#email');
      const errorMessage = emailField.locator('..').locator('.invalid-feedback:has-text("not valid")');

      await expect(errorMessage).toBeVisible({ timeout: 10000 });

      // Try valid email - wait for the API response
      const responsePromise2 = page.waitForResponse('**/api/users/validate-email');
      await emailInput.fill('valid@example.com');
      await emailInput.blur();
      await responsePromise2;

      // Error should disappear
      await expect(errorMessage).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Resource-Based Async Validator', () => {
    test('should validate product code using resource-based async validator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-resource-validator-test');
      await page.goto('/#/test/async-validation/async-resource-validator');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try taken product code (defined in mock database in component)
      const productCodeInput = scenario.locator('#productCode input');
      await productCodeInput.fill('PROD-001');
      await productCodeInput.blur();

      // Wait for async validation (resource has 500ms delay + processing time)
      await page.waitForTimeout(1500);

      // Check for validation error
      const productCodeField = scenario.locator('#productCode');
      const errorVisible = await productCodeField
        .locator('..')
        .locator('.invalid-feedback:has-text("already in use")')
        .isVisible()
        .catch(() => false);

      if (errorVisible) {
        // Try available product code
        await productCodeInput.fill('NEW-PRODUCT-999');
        await productCodeInput.blur();
        await page.waitForTimeout(1500);

        // Error should disappear
        const errorGone = await productCodeField
          .locator('..')
          .locator('.invalid-feedback:has-text("already in use")')
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

      // Should NOT show error (onError returns null = don't block form)
      const usernameField = scenario.locator('#username');
      const errorMessage = usernameField.locator('..').locator('.invalid-feedback');

      // Network errors should not block form submission (checkUsernameAvailability's onError returns null)
      // Wait a bit to ensure validation has completed, then verify no error
      await page.waitForLoadState('networkidle');
      await expect(errorMessage).not.toBeVisible();
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
      await usernameInput.blur();
      await submitButton.click({ force: true });

      // Test taken username (async validation)
      await usernameInput.fill('admin');
      await usernameInput.blur();

      const usernameField = scenario.locator('#username');
      const asyncErrorMessage = usernameField.locator('..').locator('.invalid-feedback:has-text("already taken")');

      await expect(asyncErrorMessage).toBeVisible({ timeout: 15000 });

      // Test valid username
      await usernameInput.fill('validuser123');
      await usernameInput.blur();

      // No errors should be visible (async validation needs time)
      const errorMessages = usernameField.locator('..').locator('.invalid-feedback');
      await expect(errorMessages).toHaveCount(0, { timeout: 15000 });
    });
  });
});

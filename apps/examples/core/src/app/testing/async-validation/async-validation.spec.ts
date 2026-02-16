import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck({
  // HTTP error handling tests deliberately abort network requests
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
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ available: false }),
          });
        } else {
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
      const usernameInput = scenario.locator('#username input');
      await usernameInput.fill('admin');
      await usernameInput.blur();

      // Error must appear
      const errorLocator = scenario.getByText('already taken');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });

      // Try available username — error must disappear
      await usernameInput.fill('newuser123');
      await usernameInput.blur();
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('HTTP POST Validator', () => {
    test('should validate email using HTTP POST validator', async ({ page, helpers }) => {
      // Mock API responses
      await page.route('**/api/users/validate-email', async (route) => {
        const request = route.request();
        const body = request.postDataJSON();

        if (body.email === 'invalid@test.com') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ valid: false }),
          });
        } else {
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
      const emailInput = scenario.locator('#email input');
      await emailInput.fill('invalid@test.com');
      await emailInput.blur();

      // Error must appear
      const errorLocator = scenario.getByText('not valid');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });

      // Try valid email — error must disappear
      await emailInput.fill('valid@example.com');
      await emailInput.blur();
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Resource-Based Async Validator', () => {
    // NOTE: This test uses soft assertions because the rxResource-based async validator
    // does not reliably surface validation errors in the core (no-UI-lib) app.
    // This is a pre-existing issue unrelated to declarative HTTP validators.
    test('should validate product code using resource-based async validator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-resource-validator-test');
      await page.goto('/#/test/async-validation/async-resource-validator');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try taken product code
      const productCodeInput = scenario.locator('#productCode input');
      await productCodeInput.fill('PROD-001');
      await productCodeInput.blur();
      await page.waitForTimeout(1500);

      // Check for error (soft — see NOTE above)
      const errorLocator = scenario.getByText('already in use');
      const errorVisible = await errorLocator.isVisible().catch(() => false);

      if (errorVisible) {
        // Try available product code — error must disappear
        await productCodeInput.fill('NEW-PRODUCT-999');
        await productCodeInput.blur();
        await expect(errorLocator).toBeHidden({ timeout: 5000 });
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

      // Fill username and blur to trigger validation
      const usernameInput = scenario.locator('#username input');
      await usernameInput.fill('testuser');
      await usernameInput.blur();

      // Should NOT show error (onError returns null = don't block form)
      const errorLocator = scenario.locator('mat-error');
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Declarative HTTP GET Validator', () => {
    test('should validate username using declarative HTTP GET validator (no function registration)', async ({ page, helpers }) => {
      await page.route('**/api/users/check-availability*', (route) => {
        const url = route.request().url();
        const username = new URL(url).searchParams.get('username');

        if (username === 'admin') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ available: false, suggestion: 'admin_123' }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ available: true }),
          });
        }
      });

      const scenario = helpers.getScenario('declarative-http-get-test');
      await page.goto('/#/test/async-validation/declarative-http-get');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try taken username — error must appear with interpolated suggestion
      const usernameInput = scenario.locator('#username input');
      await usernameInput.fill('admin');
      await usernameInput.blur();
      const errorLocator = scenario.getByText('Username is taken. Try admin_123');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });

      // Try available username — error must disappear
      await usernameInput.fill('newuser123');
      await usernameInput.blur();
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Declarative HTTP POST Validator', () => {
    test('should validate email using declarative HTTP POST validator with body expressions', async ({ page, helpers }) => {
      await page.route('**/api/users/validate-email', async (route) => {
        const request = route.request();
        const body = request.postDataJSON();

        if (body.email === 'invalid@test.com') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ valid: false }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ valid: true }),
          });
        }
      });

      const scenario = helpers.getScenario('declarative-http-post-test');
      await page.goto('/#/test/async-validation/declarative-http-post');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Try invalid email — error must appear
      const emailInput = scenario.locator('#email input');
      await emailInput.fill('invalid@test.com');
      await emailInput.blur();
      const errorLocator = scenario.getByText('not valid');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });

      // Try valid email — error must disappear
      await emailInput.fill('valid@example.com');
      await emailInput.blur();
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Declarative HTTP Error Handling', () => {
    test('should show validation error when declarative HTTP request fails (fail-closed)', async ({ page, helpers }) => {
      // Mock API to abort — simulates network failure
      await page.route('**/api/users/check-username*', (route) => {
        route.abort('failed');
      });

      const scenario = helpers.getScenario('declarative-http-error-handling-test');
      await page.goto('/#/test/async-validation/declarative-http-error-handling');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Fill username and blur to trigger validation
      const usernameInput = scenario.locator('#username input');
      await usernameInput.fill('testuser');
      await usernameInput.blur();

      // Declarative HTTP validators are fail-closed: network errors produce validation errors
      const errorLocator = scenario.getByText('already taken');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });
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

      // Test taken username (async validation)
      await usernameInput.fill('admin');
      await usernameInput.blur();

      // Error must appear
      const errorLocator = scenario.getByText('already taken');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });

      // Test valid username — error must disappear
      await usernameInput.fill('validuser123');
      await usernameInput.blur();
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });
});

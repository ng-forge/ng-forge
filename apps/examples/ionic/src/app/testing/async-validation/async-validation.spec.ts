import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck({
  // HTTP error handling test deliberately aborts network requests
  ignorePatterns: [/net::ERR_FAILED/, /Failed to load resource/],
});

test.describe('Async Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/async-validation');
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
      await page.goto(testUrl('/async-validation/http-get-validator'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible and ready
      await page.waitForSelector('[data-testid="http-get-validator-test"] #username input', { state: 'visible', timeout: 10000 });

      // Try taken username - wait for the API response
      const usernameInput = scenario.locator('#username input');
      const responsePromise1 = page.waitForResponse('**/api/users/check-username*');
      await usernameInput.fill('admin');
      await expect(usernameInput).toHaveValue('admin', { timeout: 5000 });
      await ionBlur(usernameInput);
      await responsePromise1;

      // Check for validation error - wait for error to exist in DOM
      const usernameField = scenario.locator('#username');
      const errorMessage = usernameField.locator('ion-note[color="danger"]:has-text("already taken")');

      // Verify error exists in DOM and ion-input shows invalid state
      await page.waitForSelector('[data-testid="http-get-validator-test"] #username ion-note[color="danger"]:has-text("already taken")', {
        state: 'attached',
        timeout: 10000,
      });
      const usernameIonInput = usernameField.locator('ion-input');
      await expect(usernameIonInput).toHaveAttribute('aria-invalid', 'true', { timeout: 5000 });
      await expect(errorMessage).toHaveCount(1);

      // Try available username - wait for the API response
      const responsePromise2 = page.waitForResponse('**/api/users/check-username*');
      await usernameInput.fill('newuser123');
      await expect(usernameInput).toHaveValue('newuser123', { timeout: 5000 });
      await ionBlur(usernameInput);
      await responsePromise2;

      // Error should disappear - check count is 0
      await expect(errorMessage).toHaveCount(0, { timeout: 10000 });
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
      await page.goto(testUrl('/async-validation/http-post-validator'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible and ready
      await page.waitForSelector('[data-testid="http-post-validator-test"] #email input', { state: 'visible', timeout: 10000 });

      // Try invalid email - wait for the API response
      const emailInput = scenario.locator('#email input');
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      const responsePromise1 = page.waitForResponse('**/api/users/validate-email');
      await emailInput.fill('invalid@test.com');
      await expect(emailInput).toHaveValue('invalid@test.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await responsePromise1;

      // Check for validation error - wait for error to exist in DOM
      const emailField = scenario.locator('#email');
      const errorMessage = emailField.locator('ion-note[color="danger"]:has-text("not valid")');

      // Verify error exists in DOM and ion-input shows invalid state
      await page.waitForSelector('[data-testid="http-post-validator-test"] #email ion-note[color="danger"]:has-text("not valid")', {
        state: 'attached',
        timeout: 10000,
      });
      const emailIonInput = emailField.locator('ion-input');
      await expect(emailIonInput).toHaveAttribute('aria-invalid', 'true', { timeout: 5000 });
      await expect(errorMessage).toHaveCount(1);

      // Try valid email - wait for the API response
      const responsePromise2 = page.waitForResponse('**/api/users/validate-email');
      await emailInput.fill('valid@example.com');
      await expect(emailInput).toHaveValue('valid@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await responsePromise2;

      // Error should disappear - check count is 0
      await expect(errorMessage).toHaveCount(0, { timeout: 10000 });
    });
  });

  test.describe('Resource-Based Async Validator', () => {
    test('should validate product code using resource-based async validator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-resource-validator-test');
      await page.goto(testUrl('/async-validation/async-resource-validator'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible and ready
      await page.waitForSelector('[data-testid="async-resource-validator-test"] #productCode input', { state: 'visible', timeout: 10000 });

      // Try taken product code (defined in mock database in component)
      const productCodeInput = scenario.locator('#productCode input');
      await productCodeInput.fill('PROD-001');
      await expect(productCodeInput).toHaveValue('PROD-001', { timeout: 5000 });
      await ionBlur(productCodeInput);

      // Wait for async validation (resource has 500ms delay + processing time)
      await page.waitForTimeout(1500);

      // Check for validation error
      const productCodeField = scenario.locator('#productCode');
      const errorVisible = await productCodeField
        .locator('ion-note[color="danger"]:has-text("already in use")')
        .isVisible()
        .catch(() => false);

      if (errorVisible) {
        // Try available product code
        await productCodeInput.fill('NEW-PRODUCT-999');
        await expect(productCodeInput).toHaveValue('NEW-PRODUCT-999', { timeout: 5000 });
        await ionBlur(productCodeInput);
        await page.waitForTimeout(1500);

        // Error should disappear
        const errorGone = await productCodeField
          .locator('ion-note[color="danger"]:has-text("already in use")')
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
      await page.goto(testUrl('/async-validation/http-error-handling'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible and ready
      await page.waitForSelector('[data-testid="http-error-handling-test"] #username input', { state: 'visible', timeout: 10000 });

      // Fill username
      const usernameInput = scenario.locator('#username input');
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser', { timeout: 5000 });
      await ionBlur(usernameInput);

      // Should NOT show error (onError returns null = don't block form)
      const usernameField = scenario.locator('#username');
      const errorMessage = usernameField.locator('ion-note[color="danger"]');

      // Network errors should not block form submission (checkUsernameAvailability's onError returns null)
      // Wait a bit to ensure validation has completed, then verify no error
      await page.waitForLoadState('networkidle');
      await expect(errorMessage).toHaveCount(0, { timeout: 5000 });
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
      await page.goto(testUrl('/async-validation/multiple-validators'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be visible and ready
      await page.waitForSelector('[data-testid="multiple-validators-test"] #username input', { state: 'visible', timeout: 10000 });

      const usernameInput = scenario.locator('#username input');
      const submitButton = scenario.locator('#submit ion-button');

      // Test too short (sync validation)
      await usernameInput.fill('ab');
      await expect(usernameInput).toHaveValue('ab', { timeout: 5000 });
      await ionBlur(usernameInput);
      await submitButton.click({ force: true });

      // Test taken username (async validation)
      await usernameInput.fill('admin');
      await expect(usernameInput).toHaveValue('admin', { timeout: 5000 });
      await ionBlur(usernameInput);

      const usernameField = scenario.locator('#username');
      const asyncErrorMessage = usernameField.locator('ion-note[color="danger"]:has-text("already taken")');

      // Verify error exists in DOM and ion-input shows invalid state
      await page.waitForSelector('[data-testid="multiple-validators-test"] #username ion-note[color="danger"]:has-text("already taken")', {
        state: 'attached',
        timeout: 15000,
      });
      const usernameIonInput = usernameField.locator('ion-input');
      await expect(usernameIonInput).toHaveAttribute('aria-invalid', 'true', { timeout: 5000 });
      await expect(asyncErrorMessage).toHaveCount(1);

      // Test valid username
      await usernameInput.fill('validuser123');
      await expect(usernameInput).toHaveValue('validuser123', { timeout: 5000 });
      await ionBlur(usernameInput);

      // No errors should be visible (async validation needs time)
      const errorMessages = usernameField.locator('ion-note[color="danger"]');
      await expect(errorMessages).toHaveCount(0, { timeout: 15000 });
    });
  });
});

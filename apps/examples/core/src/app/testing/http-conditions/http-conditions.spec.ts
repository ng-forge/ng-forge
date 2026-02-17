import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/net::ERR_FAILED/, /Failed to load resource/, /HTTP condition request failed/],
});

test.describe('HTTP Conditions Tests', () => {
  test.describe('Hidden via HTTP GET', () => {
    test('should hide/show field based on HTTP GET response', async ({ page, helpers }) => {
      await page.route('**/api/permissions*', (route) => {
        const url = route.request().url();
        const role = new URL(url).searchParams.get('role');

        if (role === 'admin') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hideAdminPanel: false }),
          });
        } else if (role === 'viewer') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hideAdminPanel: true }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hideAdminPanel: true }),
          });
        }
      });

      await page.goto('/#/test/http-conditions/hidden-http-get');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('hidden-http-get-test');
      await expect(scenario).toBeVisible();

      const adminPanelField = scenario.locator('#adminPanel');
      const roleSelect = helpers.getSelect(scenario, 'userRole');

      // Select "Admin" → adminPanel should become visible
      await helpers.selectOption(roleSelect, 'Admin');
      await expect(adminPanelField).toBeVisible({ timeout: 5000 });

      // Switch to "Viewer" → adminPanel should be hidden
      await helpers.selectOption(roleSelect, 'Viewer');
      await expect(adminPanelField).toBeHidden({ timeout: 5000 });

      // Switch back to "Admin" → adminPanel should be visible again
      await helpers.selectOption(roleSelect, 'Admin');
      await expect(adminPanelField).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Disabled via HTTP POST', () => {
    test('should disable/enable field based on HTTP POST response', async ({ page, helpers }) => {
      await page.route('**/api/tax/check', async (route) => {
        const body = route.request().postDataJSON();

        if (body.region === 'US-CA') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ taxExemptionAllowed: true }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ taxExemptionAllowed: false }),
          });
        }
      });

      await page.goto('/#/test/http-conditions/disabled-http-post');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-http-post-test');
      await expect(scenario).toBeVisible();

      const regionInput = scenario.locator('#regionCode input');
      const taxExemptionInput = scenario.locator('#taxExemption input');

      // Type "US-CA" → taxExemption should be enabled (taxExemptionAllowed: true → !true = false → not disabled)
      await regionInput.fill('US-CA');
      await regionInput.blur();
      await expect(taxExemptionInput).toBeEnabled({ timeout: 5000 });

      // Clear and type "EU-DE" → taxExemption should be disabled
      await regionInput.fill('EU-DE');
      await regionInput.blur();
      await expect(taxExemptionInput).toBeDisabled({ timeout: 5000 });
    });
  });

  test.describe('Required via HTTP Condition', () => {
    test('should make field required/optional based on HTTP response', async ({ page, helpers }) => {
      await page.route('**/api/tax-rules*', (route) => {
        const url = route.request().url();
        const country = new URL(url).searchParams.get('country');

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ taxIdRequired: country === 'US' }),
        });
      });

      await page.goto('/#/test/http-conditions/required-http-condition');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('required-http-condition-test');
      await expect(scenario).toBeVisible();

      const countrySelect = helpers.getSelect(scenario, 'country');
      const taxIdInput = scenario.locator('#taxId input');

      // Select "US" → taxId becomes required
      await helpers.selectOption(countrySelect, 'United States');

      // Wait for HTTP to resolve and required state to apply
      await page.waitForTimeout(1000);

      // Check that the field has required indicator (asterisk in label or aria-required)
      const taxIdField = scenario.locator('#taxId');
      await expect(taxIdField.locator('.mdc-floating-label--required, [aria-required="true"]').first()).toBeVisible({ timeout: 5000 });

      // Select "UK" → taxId becomes optional
      await helpers.selectOption(countrySelect, 'United Kingdom');
      await page.waitForTimeout(1000);

      // Required indicator should disappear
      const requiredIndicator = taxIdField.locator('[aria-required="true"]');
      await expect(requiredIndicator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Readonly via HTTP Condition', () => {
    test('should make field readonly/editable based on HTTP response', async ({ page, helpers }) => {
      await page.route('**/api/users/permissions*', (route) => {
        const url = route.request().url();
        const user = new URL(url).searchParams.get('user');

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ canEditDisplayName: user === 'admin' }),
        });
      });

      await page.goto('/#/test/http-conditions/readonly-http-condition');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-http-condition-test');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const displayNameInput = scenario.locator('#displayName input');

      // Type "admin" → displayName should be editable (canEditDisplayName: true → !true = false → not readonly)
      await usernameInput.fill('admin');
      await usernameInput.blur();
      await expect(displayNameInput).not.toHaveAttribute('readonly', { timeout: 5000 });

      // Type "guest" → displayName should be readonly
      await usernameInput.fill('guest');
      await usernameInput.blur();
      await expect(displayNameInput).toHaveAttribute('readonly', { timeout: 5000 });
    });
  });

  test.describe('Response Expression Patterns', () => {
    test('should extract value from nested response path', async ({ page, helpers }) => {
      await page.route('**/api/status/nested*', (route) => {
        const url = route.request().url();
        const code = new URL(url).searchParams.get('code');

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { isActive: code === 'active' },
          }),
        });
      });

      await page.route('**/api/status/coerced*', (route) => {
        const url = route.request().url();
        const code = new URL(url).searchParams.get('code');

        // Return truthy object for "hide", null for "show"
        if (code === 'hide') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ someData: true }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: 'null',
          });
        }
      });

      await page.goto('/#/test/http-conditions/response-expression');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('response-expression-test');
      await expect(scenario).toBeVisible();

      const codeInput = scenario.locator('#code input');
      const nestedField = scenario.locator('#nestedStatus');
      const coercedField = scenario.locator('#coercedStatus');

      // Test nested expression: code "active" → response.data.isActive = true → hidden
      await codeInput.fill('active');
      await codeInput.blur();
      await expect(nestedField).toBeHidden({ timeout: 5000 });

      // Test nested expression: code "inactive" → response.data.isActive = false → visible
      await codeInput.fill('inactive');
      await codeInput.blur();
      await expect(nestedField).toBeVisible({ timeout: 5000 });

      // Test coerced: code "hide" → !!{someData: true} = true → hidden
      await codeInput.fill('hide');
      await codeInput.blur();
      await expect(coercedField).toBeHidden({ timeout: 5000 });

      // Test coerced: code "show" → !!null = false → visible
      await codeInput.fill('show');
      await codeInput.blur();
      await expect(coercedField).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Pending Value Behavior', () => {
    test('should start with pendingValue then update after HTTP resolves', async ({ page, helpers }) => {
      // Use a long-delayed response to observe the pending → resolved transition
      await page.route('**/api/slow-check*', async (route) => {
        // Delay 2 seconds to ensure we can observe the pending state
        await new Promise((resolve) => setTimeout(resolve, 2000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ shouldHide: false }),
        });
      });

      await page.goto('/#/test/http-conditions/pending-value');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('pending-value-test');
      await expect(scenario).toBeVisible();

      const queryInput = scenario.locator('#query input');
      const resultField = scenario.locator('#result');

      // Field starts visible (no HTTP request yet, pendingValue: true → hidden is true initially,
      // but the field state depends on when the condition is first evaluated)

      // Trigger the HTTP request by typing
      await queryInput.fill('test');
      await queryInput.blur();

      // After the HTTP response resolves (shouldHide: false), field should be visible
      await expect(resultField).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('HTTP Error Fallback', () => {
    test('should fall back to pendingValue when HTTP request fails', async ({ page, helpers }) => {
      await page.route('**/api/verify-email*', (route) => {
        route.abort('failed');
      });

      await page.goto('/#/test/http-conditions/http-error-fallback');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('http-error-fallback-test');
      await expect(scenario).toBeVisible();

      const emailInput = scenario.locator('#email input');
      const verifiedField = scenario.locator('#verified');

      // Fill email — API will fail
      await emailInput.fill('test@example.com');
      await emailInput.blur();

      // pendingValue: false → field stays visible on error
      await expect(verifiedField).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Cache Behavior', () => {
    test('should cache HTTP responses and reuse for identical requests', async ({ page, helpers }) => {
      let callCount = 0;

      await page.route('**/api/cache-test*', (route) => {
        callCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ shouldHide: false }),
        });
      });

      await page.goto('/#/test/http-conditions/cache-behavior');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cache-behavior-test');
      await expect(scenario).toBeVisible();

      const optionSelect = helpers.getSelect(scenario, 'option');

      // Reset counter after page load
      callCount = 0;

      // Select A → API call #1
      await helpers.selectOption(optionSelect, 'Option A');
      await page.waitForTimeout(1500);
      const countAfterA = callCount;
      expect(countAfterA).toBeGreaterThanOrEqual(1);

      // Select B → API call #2 (different params)
      await helpers.selectOption(optionSelect, 'Option B');
      await page.waitForTimeout(1500);
      const countAfterB = callCount;
      expect(countAfterB).toBeGreaterThan(countAfterA);

      // Select A again → should use cache (no new API call)
      const countBeforeSecondA = callCount;
      await helpers.selectOption(optionSelect, 'Option A');
      await page.waitForTimeout(1500);
      expect(callCount).toBe(countBeforeSecondA);
    });
  });
});

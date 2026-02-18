import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/net::ERR_FAILED/, /Failed to load resource/, /HTTP condition request failed/],
});

test.describe('HTTP Path Params Tests', () => {
  test.describe('HTTP Condition with Path Params', () => {
    test('should interpolate path params in HTTP condition URL', async ({ page, helpers }) => {
      await page.route('**/api/users/*/permissions*', (route) => {
        const url = new URL(route.request().url(), 'http://localhost');
        const segments = url.pathname.split('/');
        // URL pattern: /api/users/:userId/permissions
        const userId = segments[segments.indexOf('users') + 1];

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ hideAdmin: userId !== 'alice' }),
        });
      });

      await page.goto('/#/test/http-path-params/condition-path-params');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('condition-path-params-test');
      await expect(scenario).toBeVisible();

      const adminField = scenario.locator('#adminSettings');
      const userSelect = helpers.getSelect(scenario, 'userId');

      // Select Alice (admin) → adminSettings should become visible
      const responseAlice = page.waitForResponse((r) => r.url().includes('/api/users/alice/permissions'));
      await helpers.selectOption(userSelect, 'Alice (admin)');
      await responseAlice;
      await expect(adminField).toBeVisible({ timeout: 5000 });

      // Switch to Bob (viewer) → adminSettings should be hidden
      const responseBob = page.waitForResponse((r) => r.url().includes('/api/users/bob/permissions'));
      await helpers.selectOption(userSelect, 'Bob (viewer)');
      await responseBob;
      await expect(adminField).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('HTTP Derivation with Path Params', () => {
    test('should interpolate path params in HTTP derivation URL', async ({ page, helpers }) => {
      await page.route('**/api/rates/*', (route) => {
        const url = new URL(route.request().url(), 'http://localhost');
        const segments = url.pathname.split('/');
        const currency = segments[segments.indexOf('rates') + 1];

        const rates: Record<string, number> = { EUR: 0.85, GBP: 0.73 };
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ rate: rates[currency] ?? 1 }),
        });
      });

      await page.goto('/#/test/http-path-params/derivation-path-params');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('derivation-path-params-test');
      await expect(scenario).toBeVisible();

      const rateInput = scenario.locator('#exchangeRate input');
      const currencySelect = helpers.getSelect(scenario, 'currency');

      // Select EUR → rate should be derived via /api/rates/EUR
      const responseEur = page.waitForResponse((r) => r.url().includes('/api/rates/EUR'));
      await helpers.selectOption(currencySelect, 'Euro (EUR)');
      await responseEur;
      await expect(rateInput).toHaveValue('0.85', { timeout: 5000 });

      // Switch to GBP → rate should update via /api/rates/GBP
      const responseGbp = page.waitForResponse((r) => r.url().includes('/api/rates/GBP'));
      await helpers.selectOption(currencySelect, 'British Pound (GBP)');
      await responseGbp;
      await expect(rateInput).toHaveValue('0.73', { timeout: 5000 });
    });
  });

  test.describe('HTTP Validator with Path Params', () => {
    test('should interpolate path params combined with query params in HTTP validator URL', async ({ page, helpers }) => {
      await page.route('**/api/users/*/check-email*', (route) => {
        const url = new URL(route.request().url(), 'http://localhost');
        const segments = url.pathname.split('/');
        const userId = segments[segments.indexOf('users') + 1];
        const email = url.searchParams.get('email');

        // user-1 already has taken@test.com registered
        const taken = userId === 'user-1' && email === 'taken@test.com';
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ available: !taken }),
        });
      });

      await page.goto('/#/test/http-path-params/validator-path-params');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('validator-path-params-test');
      await expect(scenario).toBeVisible();

      const emailInput = scenario.locator('#email input');

      // Enter taken email → should show validation error
      // URL should be /api/users/user-1/check-email?email=taken@test.com
      await emailInput.fill('taken@test.com');
      await emailInput.blur();
      const errorLocator = scenario.getByText('This email is already in use');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });

      // Enter available email → error should disappear
      await emailInput.fill('available@test.com');
      await emailInput.blur();
      await expect(errorLocator).toBeHidden({ timeout: 5000 });
    });
  });
});

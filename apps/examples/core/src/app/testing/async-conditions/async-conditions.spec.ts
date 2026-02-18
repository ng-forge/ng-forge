import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/Async condition function .* failed/],
});

test.describe('Async Conditions Tests', () => {
  test.describe('Hidden via Async', () => {
    test('should hide/show field based on async condition', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/hidden-async'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('hidden-async-test');
      await expect(scenario).toBeVisible();

      const adminPanelField = scenario.locator('#adminPanel');
      const roleSelect = helpers.getSelect(scenario, 'userRole');

      // Select "Admin" → checkAdminHidden returns false → field visible
      await helpers.selectOption(roleSelect, 'Admin');
      await page.waitForTimeout(1000);
      await expect(adminPanelField).toBeVisible({ timeout: 5000 });

      // Switch to "Viewer" → checkAdminHidden returns true → field hidden
      await helpers.selectOption(roleSelect, 'Viewer');
      await page.waitForTimeout(1000);
      await expect(adminPanelField).toBeHidden({ timeout: 5000 });

      // Switch back to "Admin" → visible again
      await helpers.selectOption(roleSelect, 'Admin');
      await page.waitForTimeout(1000);
      await expect(adminPanelField).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Disabled via Async', () => {
    test('should disable/enable field based on async condition', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/disabled-async'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-async-test');
      await expect(scenario).toBeVisible();

      const regionInput = scenario.locator('#regionCode input');
      const taxExemptionInput = scenario.locator('#taxExemption input');

      // Type "US-CA" → checkDisabled returns false → field enabled
      await regionInput.fill('US-CA');
      await regionInput.blur();
      await page.waitForTimeout(1000);
      await expect(taxExemptionInput).toBeEnabled({ timeout: 5000 });

      // Type "EU-DE" → checkDisabled returns true → field disabled
      await regionInput.fill('EU-DE');
      await regionInput.blur();
      await page.waitForTimeout(1000);
      await expect(taxExemptionInput).toBeDisabled({ timeout: 5000 });
    });
  });

  test.describe('Required via Async', () => {
    test('should make field required/optional based on async condition', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/required-async'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('required-async-test');
      await expect(scenario).toBeVisible();

      const countrySelect = helpers.getSelect(scenario, 'country');
      const taxIdField = scenario.locator('#taxId');

      // Select "US" → checkTaxIdRequired returns true → taxId required
      await helpers.selectOption(countrySelect, 'United States');
      await page.waitForTimeout(1000);
      await expect(taxIdField.locator('.mdc-floating-label--required, [aria-required="true"]').first()).toBeVisible({ timeout: 5000 });

      // Select "UK" → checkTaxIdRequired returns false → taxId optional
      await helpers.selectOption(countrySelect, 'United Kingdom');
      await page.waitForTimeout(1000);
      const requiredIndicator = taxIdField.locator('[aria-required="true"]');
      await expect(requiredIndicator).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Readonly via Async', () => {
    test('should make field readonly/editable based on async condition', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/readonly-async'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-async-test');
      await expect(scenario).toBeVisible();

      const roleSelect = helpers.getSelect(scenario, 'role');
      const salaryInput = scenario.locator('#salary input');

      // Select "Admin" → checkReadonly returns false → salary editable
      await helpers.selectOption(roleSelect, 'Admin');
      await page.waitForTimeout(1000);
      await expect(salaryInput).not.toHaveAttribute('readonly', { timeout: 5000 });

      // Select "Viewer" → checkReadonly returns true → salary readonly
      await helpers.selectOption(roleSelect, 'Viewer');
      await page.waitForTimeout(1000);
      await expect(salaryInput).toHaveAttribute('readonly', { timeout: 5000 });
    });
  });

  test.describe('Async Error Fallback', () => {
    test('should fall back to pendingValue when async function errors', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/async-error-fallback'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('async-error-fallback-test');
      await expect(scenario).toBeVisible();

      const resultField = scenario.locator('#result');

      // pendingValue: false → field stays visible even after function errors
      await expect(resultField).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Async Pending Value', () => {
    test('should start with pendingValue then update after async resolves', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/async-pending-value'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('async-pending-value-test');
      await expect(scenario).toBeVisible();

      const resultField = scenario.locator('#result');

      // After async resolves (shouldHide: false), field should be visible
      await expect(resultField).toBeVisible({ timeout: 10000 });
    });
  });
});

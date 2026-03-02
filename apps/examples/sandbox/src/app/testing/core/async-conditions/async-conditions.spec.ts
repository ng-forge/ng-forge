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
      await expect(adminPanelField).toBeVisible({ timeout: 5000 });

      // Switch to "Viewer" → checkAdminHidden returns true → field hidden
      await helpers.selectOption(roleSelect, 'Viewer');
      await expect(adminPanelField).toBeHidden({ timeout: 5000 });

      // Switch back to "Admin" → visible again
      await helpers.selectOption(roleSelect, 'Admin');
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
      await expect(taxExemptionInput).toBeEnabled({ timeout: 5000 });

      // Type "EU-DE" → checkDisabled returns true → field disabled
      await regionInput.fill('EU-DE');
      await regionInput.blur();
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
      await expect(taxIdField.locator('.mdc-floating-label--required, [aria-required="true"]').first()).toBeVisible({ timeout: 5000 });

      // Select "UK" → checkTaxIdRequired returns false → taxId optional
      await helpers.selectOption(countrySelect, 'United Kingdom');
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
      await expect(salaryInput).not.toHaveAttribute('readonly', { timeout: 5000 });

      // Select "Viewer" → checkReadonly returns true → salary readonly
      await helpers.selectOption(roleSelect, 'Viewer');
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

  test.describe('Multiple Logic Types with Async', () => {
    test('should apply independent async hidden + sync disabled on same field', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/async-conditions/composite-async'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('composite-async-test');
      await expect(scenario).toBeVisible();

      const roleSelect = helpers.getSelect(scenario, 'userRole');
      const toggleField = scenario.locator('#featureFlag');
      const advancedPanel = scenario.locator('#advancedPanel');
      const advancedInput = scenario.locator('#advancedPanel input');

      // Select "Admin" → async returns false (show) + toggle on (enabled)
      await helpers.selectOption(roleSelect, 'Admin');
      await expect(advancedPanel).toBeVisible({ timeout: 5000 });
      await expect(advancedInput).toBeEnabled({ timeout: 5000 });

      // Disable editing toggle → sync disabled kicks in
      await toggleField.locator('button[role="switch"]').click();
      await expect(advancedPanel).toBeVisible({ timeout: 5000 });
      await expect(advancedInput).toBeDisabled({ timeout: 5000 });

      // Select "Viewer" → async returns true (hide), disabled state irrelevant
      await helpers.selectOption(roleSelect, 'Viewer');
      await expect(advancedPanel).toBeHidden({ timeout: 5000 });

      // Select "Editor" → async returns false (show), toggle still off → disabled
      await helpers.selectOption(roleSelect, 'Editor');
      await expect(advancedPanel).toBeVisible({ timeout: 5000 });
      await expect(advancedInput).toBeDisabled({ timeout: 5000 });
    });
  });
});

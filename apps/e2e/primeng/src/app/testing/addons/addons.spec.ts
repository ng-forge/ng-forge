import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Addons', () => {
  test.describe('Icon prefix', () => {
    test('renders a pi-* icon in the input prefix slot', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/icon-prefix');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('icon-prefix');
      await expect(scenario).toBeVisible();

      // pi-icon kind renders <i class="pi pi-search">
      const prefixIcon = scenario.locator('p-inputgroup-addon').first().locator('i.pi.pi-search');
      await expect(prefixIcon).toBeVisible();

      await expect(scenario).toHaveScreenshot('icon-prefix.png');
    });
  });

  test.describe('Clear button (canonical preset)', () => {
    test('renders prefix icon and suffix button', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/clear-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-button');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('input[pInputText]');
      await expect(input).toHaveValue('initial value');

      // Suffix slot contains the clear <p-button> with aria-label 'Clear'
      const clearButton = scenario.locator('p-button[aria-label="Clear"] button').first();
      await expect(clearButton).toBeVisible();

      await expect(scenario).toHaveScreenshot('clear-button-with-value.png');
    });

    test('clicking the clear button empties the input value', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/clear-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-button');
      const input = scenario.locator('input[pInputText]');
      const clearButton = scenario.locator('p-button[aria-label="Clear"] button').first();

      await expect(input).toHaveValue('initial value');
      await clearButton.click();
      await expect(input).toHaveValue('');

      await expect(scenario).toHaveScreenshot('clear-button-after-clear.png');
    });
  });

  test.describe('Text addons (currency)', () => {
    test('renders text in both prefix and suffix slots', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/text-currency');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('text-currency');
      await expect(scenario).toBeVisible();

      const addons = scenario.locator('p-inputgroup-addon');
      // Prefix '$' first, suffix 'USD' last — array order = render order.
      await expect(addons.first()).toContainText('$');
      await expect(addons.last()).toContainText('USD');

      await expect(scenario).toHaveScreenshot('text-currency.png');
    });
  });

  test.describe('Password visibility toggle', () => {
    test('input starts as type=password and flips on toggle', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/password-toggle');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-toggle');
      const input = scenario.locator('input[pInputText]');
      const toggle = scenario.locator('p-button[aria-label="Toggle password visibility"] button').first();

      await expect(input).toHaveAttribute('type', 'password');
      await expect(scenario).toHaveScreenshot('password-toggle-hidden.png');

      await toggle.click();
      await expect(input).toHaveAttribute('type', 'text');
      await expect(scenario).toHaveScreenshot('password-toggle-visible.png');

      await toggle.click();
      await expect(input).toHaveAttribute('type', 'password');
    });
  });
});

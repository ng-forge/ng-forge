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

  test.describe('Multiple addons', () => {
    test('renders prefix + suffix addons in declaration order', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/multi-addons');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-addons');
      await expect(scenario).toBeVisible();

      const addons = scenario.locator('p-inputgroup-addon');
      await expect(addons).toHaveCount(4);
      await expect(addons.nth(0).locator('i.pi.pi-dollar')).toBeVisible();
      await expect(addons.nth(1)).toContainText('$');
      await expect(addons.nth(2)).toContainText('USD');
      await expect(addons.nth(3).locator('p-button[aria-label="Clear"]')).toBeVisible();

      await expect(scenario).toHaveScreenshot('multi-addons.png');
    });
  });

  test.describe('pi-button severity variants', () => {
    test('renders every PrimeNG severity colour', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/severity-variants');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('severity-variants');
      await expect(scenario).toBeVisible();
      // 8 severities → 8 inputs → 8 suffix buttons.
      await expect(scenario.locator('p-inputgroup-addon p-button')).toHaveCount(8);

      await expect(scenario).toHaveScreenshot('severity-variants.png');
    });
  });

  test.describe('Labelled pi-button', () => {
    test('renders both icon and label on the same button', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/labelled-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('labelled-button');
      const button = scenario.locator('p-button:has-text("Search")').first();
      await expect(button).toBeVisible();
      // PrimeNG renders [icon] as a <span class="pi pi-search">, not <i>.
      await expect(button.locator('.pi.pi-search')).toBeVisible();
      await expect(button).toContainText('Search');

      await expect(scenario).toHaveScreenshot('labelled-button.png');
    });
  });

  test.describe('Disabled addon', () => {
    test('renders the button in a disabled state and click is a no-op', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/disabled-addon');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-addon');
      const input = scenario.locator('input[pInputText]');
      const button = scenario.locator('p-button[aria-label="Clear"] button').first();

      await expect(input).toHaveValue('locked');
      await expect(button).toBeDisabled();
      await button.click({ force: true }).catch(() => {
        /* disabled — click ignored by browser */
      });
      // Value unchanged.
      await expect(input).toHaveValue('locked');

      await expect(scenario).toHaveScreenshot('disabled-addon.png');
    });
  });

  test.describe('Reset preset', () => {
    test('clicking reset restores the configured default value', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/reset-preset');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-preset');
      const input = scenario.locator('input[pInputText]');
      const resetButton = scenario.locator('p-button[aria-label="Reset"] button').first();

      await expect(input).toHaveValue('default');
      await input.fill('changed');
      await expect(input).toHaveValue('changed');
      await expect(scenario).toHaveScreenshot('reset-preset-modified.png');

      await resetButton.click();
      await expect(input).toHaveValue('default');
      await expect(scenario).toHaveScreenshot('reset-preset-restored.png');
    });
  });

  test.describe('Decorative button', () => {
    test('renders with no click handler — click is a silent no-op', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/decorative-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('decorative-button');
      const button = scenario.locator('p-button:has-text("Info") button').first();
      await expect(button).toBeVisible();
      await button.click();
      // No value change — there's no field value either, just the click being absorbed.

      await expect(scenario).toHaveScreenshot('decorative-button.png');
    });
  });

  test.describe('Inline action', () => {
    test('clicking the button runs the inline handler and mutates the value', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/inline-action');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('inline-action');
      const input = scenario.locator('input[pInputText]');
      const addButton = scenario.locator('p-button[aria-label="Add"] button').first();

      await expect(input).toHaveValue('');
      await addButton.click();
      await expect(input).toHaveValue('+');
      await addButton.click();
      await expect(input).toHaveValue('++');

      await expect(scenario).toHaveScreenshot('inline-action.png');
    });
  });

  test.describe('actionRef (registered handler)', () => {
    test('dispatches through the addon-action registry to the named handler', async ({ page, helpers }) => {
      await page.goto('/#/test/addons/action-ref');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('action-ref');
      const input = scenario.locator('input[pInputText]');
      const starButton = scenario.locator('p-button[aria-label="Star"] button').first();

      await expect(input).toHaveValue('');
      await starButton.click();
      await expect(input).toHaveValue('*');
      await starButton.click();
      await expect(input).toHaveValue('**');

      await expect(scenario).toHaveScreenshot('action-ref.png');
    });
  });
});

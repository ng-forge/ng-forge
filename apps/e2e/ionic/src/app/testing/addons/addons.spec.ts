import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Addons', () => {
  test.describe('Icon prefix', () => {
    test('renders an ion-icon in the input prefix slot', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/icon-prefix');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('icon-prefix');
      await expect(scenario).toBeVisible();

      // ion-icon kind renders <ion-icon name="search-outline"> projected into the start slot.
      const prefixIcon = scenario.locator('ion-input span[slot="start"] df-ion-icon-addon ion-icon[name="search-outline"]');
      await expect(prefixIcon).toBeVisible();
    });
  });

  test.describe('Clear button (canonical preset)', () => {
    test('renders prefix icon and suffix button', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/clear-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-button');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('ion-input input');
      await expect(input).toHaveValue('initial value');

      // Suffix slot contains the clear <ion-button> with aria-label 'Clear'.
      const clearButton = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Clear"]');
      await expect(clearButton).toBeVisible();
    });

    test('clicking the clear button empties the input value', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/clear-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-button');
      const input = scenario.locator('ion-input input');
      const clearButton = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Clear"]');

      await expect(input).toHaveValue('initial value');
      await clearButton.click();
      await expect(input).toHaveValue('');
    });
  });

  test.describe('Text addons (currency)', () => {
    test('renders text in both prefix and suffix slots', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/text-currency');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('text-currency');
      await expect(scenario).toBeVisible();

      // Prefix '$' in start slot, suffix 'USD' in end slot — array order = render order.
      await expect(scenario.locator('ion-input span[slot="start"]').first()).toContainText('$');
      await expect(scenario.locator('ion-input span[slot="end"]').last()).toContainText('USD');
    });
  });

  test.describe('Password visibility toggle', () => {
    test('input starts as type=password and flips on toggle', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/password-toggle');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-toggle');
      const input = scenario.locator('ion-input input');
      const toggle = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Toggle password visibility"]');

      await expect(input).toHaveAttribute('type', 'password');

      await toggle.click();
      await expect(input).toHaveAttribute('type', 'text');

      await toggle.click();
      await expect(input).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Multiple addons', () => {
    test('renders prefix + suffix addons in declaration order', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/multi-addons');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-addons');
      await expect(scenario).toBeVisible();

      const prefixAddons = scenario.locator('ion-input span[slot="start"]');
      const suffixAddons = scenario.locator('ion-input span[slot="end"]');

      await expect(prefixAddons).toHaveCount(2);
      await expect(suffixAddons).toHaveCount(2);

      await expect(prefixAddons.nth(0).locator('ion-icon[name="cash-outline"]')).toBeVisible();
      await expect(prefixAddons.nth(1)).toContainText('$');
      await expect(suffixAddons.nth(0)).toContainText('USD');
      await expect(suffixAddons.nth(1).locator('ion-button[aria-label="Clear"]')).toBeVisible();
    });
  });

  test.describe('ion-button colour variants', () => {
    test('renders every Ionic colour', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/severity-variants');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('severity-variants');
      await expect(scenario).toBeVisible();
      // 9 colours → 9 inputs → 9 suffix buttons.
      await expect(scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button')).toHaveCount(9);
    });
  });

  test.describe('Labelled ion-button', () => {
    test('renders both icon and label on the same button', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/labelled-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('labelled-button');
      const button = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button');
      await expect(button).toBeVisible();
      // Labeled branch uses slot="start" for the icon, label as text.
      await expect(button.locator('ion-icon[name="search-outline"][slot="start"]')).toBeVisible();
      await expect(button).toContainText('Search');
    });
  });

  test.describe('Disabled addon', () => {
    test('renders the button in a disabled state and click is a no-op', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/disabled-addon');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-addon');
      const input = scenario.locator('ion-input input');
      const button = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Clear"]');

      await expect(input).toHaveValue('locked');
      // ion-button reflects disabled via aria-disabled / disabled property on the host.
      await expect(button).toHaveAttribute('disabled', /.*/);

      await button.click({ force: true }).catch(() => {
        /* disabled — click ignored */
      });
      await expect(input).toHaveValue('locked');
    });
  });

  test.describe('Reset preset', () => {
    test('clicking reset restores the configured default value', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/reset-preset');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-preset');
      const input = scenario.locator('ion-input input');
      const resetButton = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Reset"]');

      await expect(input).toHaveValue('default');
      await helpers.clearAndFill(input, 'changed');
      await expect(input).toHaveValue('changed');

      await resetButton.click();
      await expect(input).toHaveValue('default');
    });
  });

  test.describe('Decorative button', () => {
    test('renders with no click handler — click is a silent no-op', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/decorative-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('decorative-button');
      const button = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button');
      await expect(button).toBeVisible();
      await expect(button).toContainText('Info');
      await button.click();
      // No value change — there's no field value either, just the click being absorbed.
    });
  });

  test.describe('Inline action', () => {
    test('clicking the button runs the inline handler and mutates the value', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/inline-action');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('inline-action');
      const input = scenario.locator('ion-input input');
      const addButton = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Add"]');

      await expect(input).toHaveValue('');
      await addButton.click();
      await expect(input).toHaveValue('+');
      await addButton.click();
      await expect(input).toHaveValue('++');
    });
  });

  test.describe('actionRef (registered handler)', () => {
    test('dispatches through the addon-action registry to the named handler', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/action-ref');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('action-ref');
      const input = scenario.locator('ion-input input');
      const sendButton = scenario.locator('ion-input span[slot="end"] df-ion-button-addon ion-button[aria-label="Send"]');

      await expect(input).toHaveValue('');
      await sendButton.click();
      await expect(input).toHaveValue('!');
      await sendButton.click();
      await expect(input).toHaveValue('!!');
    });
  });
});

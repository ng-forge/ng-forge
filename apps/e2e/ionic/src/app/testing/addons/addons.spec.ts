import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

// Ionic ion-button addons render INSIDE <ion-input> as native
// ion-button[df-ion-button-addon slot=start|end] via an attribute-selector
// component (IonInlineButtonAddonComponent), so Ionic's
// `::slotted(ion-button[slot=start|end])` shadow CSS fires natively.
// Decorative kinds (icon/text/template/component) render via the universal
// df-addon-slot dispatcher wrapped in <span slot="start|end">. Selectors
// use the accessibility tree (getByRole) because <ion-button> forwards
// aria-label into shadow DOM rather than exposing it on the host.
//
// Intentionally functional-only (no `toHaveScreenshot` calls): Ionic's
// shadow-DOM rendering produces subtle anti-aliasing differences between
// runs that don't reflect real UI changes. Material / Bootstrap / PrimeNG
// rely on shadow-free DOM and stable pixels; Ionic relies on accessibility-
// tree + behavior assertions instead. The /addons/ snapshots directory is
// deliberately absent.

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

      const clearButton = scenario.getByRole('button', { name: 'Clear' });
      await expect(clearButton).toBeVisible();
    });

    test('clicking the clear button empties the input value', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/clear-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('clear-button');
      const input = scenario.locator('ion-input input');
      const clearButton = scenario.getByRole('button', { name: 'Clear' });

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
      const toggle = scenario.getByRole('button', { name: 'Toggle password visibility' });

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

      // Decorative addons (icon + text) render via df-addon-slot wrapped in
      // <span slot="start|end">; ion-button addons render as native
      // <ion-button slot="start|end"> via the attribute-selector component.
      const prefixDecorative = scenario.locator('ion-input span[slot="start"]');
      const suffixDecorative = scenario.locator('ion-input span[slot="end"]');

      await expect(prefixDecorative).toHaveCount(2);
      await expect(prefixDecorative.nth(0).locator('ion-icon[name="cash-outline"]')).toBeVisible();
      await expect(prefixDecorative.nth(1)).toContainText('$');

      await expect(suffixDecorative).toHaveCount(1);
      await expect(suffixDecorative.first()).toContainText('USD');

      await expect(scenario.getByRole('button', { name: 'Clear' })).toBeVisible();
    });
  });

  test.describe('ion-button colour variants', () => {
    test('renders every Ionic colour', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/severity-variants');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('severity-variants');
      await expect(scenario).toBeVisible();
      // 9 colours → 9 inputs → 9 suffix ion-button addons rendered inline.
      await expect(scenario.locator('ion-button[df-ion-button-addon]')).toHaveCount(9);
    });
  });

  test.describe('Labelled ion-button', () => {
    test('renders both icon and label on the same button', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/labelled-button');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('labelled-button');
      const button = scenario.locator('ion-button[df-ion-button-addon]');
      await expect(button).toBeVisible();
      // Labeled branch uses slot="start" for the icon (inside ion-button), label as text.
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
      const button = scenario.getByRole('button', { name: 'Clear' });

      await expect(input).toHaveValue('locked');
      await expect(button).toBeDisabled();
    });
  });

  test.describe('Reset preset', () => {
    test('clicking reset restores the configured default value', async ({ page, helpers }) => {
      await page.goto('/#/testing/addons/reset-preset');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('reset-preset');
      const input = scenario.locator('ion-input input');
      const resetButton = scenario.getByRole('button', { name: 'Reset' });

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
      const button = scenario.locator('ion-button[df-ion-button-addon]');
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
      const addButton = scenario.getByRole('button', { name: 'Add' });

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
      const sendButton = scenario.getByRole('button', { name: 'Send' });

      await expect(input).toHaveValue('');
      await sendButton.click();
      await expect(input).toHaveValue('!');
      await sendButton.click();
      await expect(input).toHaveValue('!!');
    });
  });
});

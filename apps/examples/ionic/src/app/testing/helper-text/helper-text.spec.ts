import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Helper Text Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/helper-text');
  });

  test.describe('Helper Text Fields Test', () => {
    test('should display helper text on all field types', async ({ page, helpers }) => {
      await page.goto('/#/testing/helper-text/helper-text-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('helper-text-fields-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Visual regression: helper text visible on all fields
      await helpers.expectScreenshotMatch(scenario, 'ionic-helper-text-all-fields');

      // Verify toggle helper text is visible
      await page.waitForSelector('[data-testid="helper-text-fields-test"] #toggleWithHint', { state: 'visible', timeout: 10000 });
      const toggleHint = scenario.locator('#toggleWithHint .df-ion-hint');
      await expect(toggleHint).toBeVisible({ timeout: 5000 });
      await expect(toggleHint).toContainText('Enable this option to activate the feature');

      // Verify checkbox helper text is visible
      const checkboxHint = scenario.locator('#checkboxWithHint .df-ion-hint');
      await expect(checkboxHint).toBeVisible({ timeout: 5000 });
      await expect(checkboxHint).toContainText('Check this box to agree to the terms');

      // Verify slider helper text is visible
      const sliderHint = scenario.locator('#sliderWithHint .df-ion-hint');
      await expect(sliderHint).toBeVisible({ timeout: 5000 });
      await expect(sliderHint).toContainText('Adjust the slider to set your preference');

      // Verify select helper text is visible
      const selectHint = scenario.locator('#selectWithHint .df-ion-hint');
      await expect(selectHint).toBeVisible({ timeout: 5000 });
      await expect(selectHint).toContainText('Choose one option from the dropdown');

      // Verify radio helper text is visible
      const radioHint = scenario.locator('#radioWithHint .df-ion-hint');
      await expect(radioHint).toBeVisible({ timeout: 5000 });
      await expect(radioHint).toContainText('Select one of the available choices');

      // Verify multi-checkbox helper text is visible
      const multiCheckboxHint = scenario.locator('#multiCheckboxWithHint .df-ion-hint');
      await expect(multiCheckboxHint).toBeVisible({ timeout: 5000 });
      await expect(multiCheckboxHint).toContainText('Select all that apply');

      // Verify datepicker helper text is visible
      const datepickerHint = scenario.locator('#datepickerWithHint .df-ion-hint');
      await expect(datepickerHint).toBeVisible({ timeout: 5000 });
      await expect(datepickerHint).toContainText('Select your preferred date');
    });

    test('should verify hint elements have correct IDs for accessibility linking', async ({ page, helpers }) => {
      await page.goto('/#/testing/helper-text/helper-text-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('helper-text-fields-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for all fields to render
      await page.waitForSelector('[data-testid="helper-text-fields-test"] #toggleWithHint', { state: 'visible', timeout: 10000 });

      // Verify each hint element has the correct ID for aria-describedby linking
      // The IDs follow the pattern: {fieldKey}-hint

      // Toggle hint ID
      const toggleHint = scenario.locator('#toggleWithHint .df-ion-hint');
      await expect(toggleHint).toHaveAttribute('id', 'toggleWithHint-hint');

      // Checkbox hint ID
      const checkboxHint = scenario.locator('#checkboxWithHint .df-ion-hint');
      await expect(checkboxHint).toHaveAttribute('id', 'checkboxWithHint-hint');

      // Slider hint ID
      const sliderHint = scenario.locator('#sliderWithHint .df-ion-hint');
      await expect(sliderHint).toHaveAttribute('id', 'sliderWithHint-hint');

      // Select hint ID
      const selectHint = scenario.locator('#selectWithHint .df-ion-hint');
      await expect(selectHint).toHaveAttribute('id', 'selectWithHint-hint');

      // Radio hint ID
      const radioHint = scenario.locator('#radioWithHint .df-ion-hint');
      await expect(radioHint).toHaveAttribute('id', 'radioWithHint-hint');

      // Multi-checkbox hint ID
      const multiCheckboxHint = scenario.locator('#multiCheckboxWithHint .df-ion-hint');
      await expect(multiCheckboxHint).toHaveAttribute('id', 'multiCheckboxWithHint-hint');

      // Datepicker hint ID
      const datepickerHint = scenario.locator('#datepickerWithHint .df-ion-hint');
      await expect(datepickerHint).toHaveAttribute('id', 'datepickerWithHint-hint');
    });

    test('should interact with fields while helper text is displayed', async ({ page, helpers }) => {
      await page.goto('/#/testing/helper-text/helper-text-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('helper-text-fields-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="helper-text-fields-test"] #toggleWithHint', { state: 'visible', timeout: 10000 });

      // Interact with toggle - helper text should remain visible
      const toggle = scenario.locator('#toggleWithHint ion-toggle');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });

      // Verify helper text is still visible after interaction
      const toggleHint = scenario.locator('#toggleWithHint .df-ion-hint');
      await expect(toggleHint).toBeVisible();

      // Interact with checkbox
      const checkbox = scenario.locator('#checkboxWithHint ion-checkbox');
      await checkbox.click();
      await expect(checkbox).toBeChecked({ timeout: 5000 });

      // Verify helper text is still visible
      const checkboxHint = scenario.locator('#checkboxWithHint .df-ion-hint');
      await expect(checkboxHint).toBeVisible();

      // Select an option from select
      await helpers.selectOption(scenario.locator('#selectWithHint ion-select'), 'Option 2');

      // Verify helper text is still visible
      const selectHint = scenario.locator('#selectWithHint .df-ion-hint');
      await expect(selectHint).toBeVisible();

      // Select a radio option
      await helpers.selectRadio(scenario, 'radioWithHint', 'Choice B');

      // Verify helper text is still visible
      const radioHint = scenario.locator('#radioWithHint .df-ion-hint');
      await expect(radioHint).toBeVisible();

      // Visual regression: form after interactions with helper text still visible
      await helpers.expectScreenshotMatch(scenario, 'ionic-helper-text-after-interactions');
    });
  });
});

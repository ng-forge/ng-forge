import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Wrapper Fields E2E Tests', () => {
  test.describe('CSS wrapper', () => {
    test('applies cssClasses to a wrapper element around the field', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('wrapper-css');
      await page.goto('/#/test/wrapper-fields/wrapper-css');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Plain field has no css-wrapper ancestor.
      const plainField = scenario.locator('#plain');
      await expect(plainField).toBeVisible({ timeout: 5000 });
      await expect(plainField.locator('xpath=ancestor::df-css-wrapper')).toHaveCount(0);

      // Wrapped field: its ancestor df-css-wrapper carries the configured class.
      const wrappedField = scenario.locator('#wrapped');
      await expect(wrappedField).toBeVisible({ timeout: 5000 });
      const wrapperHost = wrappedField.locator('xpath=ancestor::df-css-wrapper').first();
      await expect(wrapperHost).toHaveCount(1);
      await expect(wrapperHost).toHaveClass(/highlight-demo/);

      await helpers.expectScreenshotMatch(scenario, 'primeng-wrapper-css');
    });
  });

  test.describe('Custom section wrapper', () => {
    test('renders a titled card around each wrapped field', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('wrapper-section');
      await page.goto('/#/test/wrapper-fields/wrapper-section');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Two section wrappers, two headers with the configured titles.
      const sectionWrappers = scenario.locator('demo-section-wrapper');
      await expect(sectionWrappers).toHaveCount(2);

      await expect(sectionWrappers.nth(0).locator('.demo-section__header')).toHaveText(/primary contact/i);
      await expect(sectionWrappers.nth(1).locator('.demo-section__header')).toHaveText(/contact details/i);

      // The wrapped field inputs still render inside their wrappers.
      await expect(sectionWrappers.nth(0).locator('#contact input')).toBeVisible({ timeout: 5000 });
      await expect(sectionWrappers.nth(1).locator('#email input')).toBeVisible({ timeout: 5000 });

      await helpers.expectScreenshotMatch(scenario, 'primeng-wrapper-section');
    });
  });

  test.describe('Default wrappers + opt-out', () => {
    test('applies defaults to every field except the one opting out', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('wrapper-defaults');
      await page.goto('/#/test/wrapper-fields/wrapper-defaults');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Default-wrapped field: inherits the form-level css wrapper with the demo class.
      const inherits = scenario.locator('#inheritsDefault');
      await expect(inherits).toBeVisible({ timeout: 5000 });
      const inheritsHost = inherits.locator('xpath=ancestor::df-css-wrapper').first();
      await expect(inheritsHost).toHaveClass(/default-wrapper-demo/);

      // Stacked field: default css wrapper is OUTER, section wrapper is INNER
      // (field-level entries are innermost in the merge).
      const stacked = scenario.locator('#stacked');
      await expect(stacked).toBeVisible({ timeout: 5000 });
      const stackedCss = stacked.locator('xpath=ancestor::df-css-wrapper').first();
      const stackedSection = stacked.locator('xpath=ancestor::demo-section-wrapper').first();
      await expect(stackedCss).toHaveClass(/default-wrapper-demo/);
      await expect(stackedSection.locator('.demo-section__header')).toHaveText(/on top of default/i);
      // DOM order: css-wrapper contains section-wrapper (css outer, section inner).
      await expect(stackedCss.locator('demo-section-wrapper')).toHaveCount(1);

      // Opt-out: no wrapper ancestors at all.
      const optOut = scenario.locator('#optOut');
      await expect(optOut).toBeVisible({ timeout: 5000 });
      await expect(optOut.locator('xpath=ancestor::df-css-wrapper')).toHaveCount(0);
      await expect(optOut.locator('xpath=ancestor::demo-section-wrapper')).toHaveCount(0);

      await helpers.expectScreenshotMatch(scenario, 'primeng-wrapper-defaults');
    });
  });
});

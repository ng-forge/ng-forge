import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

/**
 * Regression coverage for issue #507 — `hidden` logic on layout containers must be
 * evaluated with `externalData` and `custom` functions in scope, exactly like leaf
 * fields. Before the fix, the container children stayed visible and the registered
 * custom function was never invoked.
 */
test.describe('Container Hidden Logic with External Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/test/external-data/containers');
    await page.waitForLoadState('networkidle');
  });

  test('hides top-level and nested containers when externalData/custom conditions are met', async ({ page, helpers }) => {
    const scenario = helpers.getScenario('container-external-data-test');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // mode === 'active' → leaf field and every container hide (children removed).
    // Note the nested child id is `outerGroup_nestedChild` — the flatten `row` adds a
    // host element but does not namespace the value path.
    await expect(scenario.locator('#leafField input')).not.toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#jsGroup_jsChild input')).not.toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#customGroup_customChild input')).not.toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#outerGroup_nestedChild input')).not.toBeVisible({ timeout: 5000 });
    // Generic adapter button, hidden via a custom function.
    await expect(scenario.locator('#actionButton button')).not.toBeVisible({ timeout: 5000 });
  });

  test('shows containers again when the condition flips', async ({ page, helpers }) => {
    const scenario = helpers.getScenario('container-external-data-test');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    await scenario.locator('[data-testid="toggle-mode"]').click();
    await page.waitForTimeout(300);

    // mode === 'idle' → leaf field and every container become visible.
    await expect(scenario.locator('#leafField input')).toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#jsGroup_jsChild input')).toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#customGroup_customChild input')).toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#outerGroup_nestedChild input')).toBeVisible({ timeout: 5000 });
    await expect(scenario.locator('#actionButton button')).toBeVisible({ timeout: 5000 });
  });
});

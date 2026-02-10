import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Performance E2E Tests', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance tests only run on Chromium');
  });

  test.describe('Flat Field Rendering', () => {
    test('should render 100 flat input fields within budget', async ({ page, helpers }) => {
      await page.goto('/#/test/performance/perf-100-flat-fields');
      await page.waitForLoadState('networkidle');
      const startTime = Date.now();
      const scenario = helpers.getScenario('perf-100-flat-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const inputs = scenario.locator('df-mat-input');
      await expect(inputs.first()).toBeVisible({ timeout: 5000 });
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(100);

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 100 flat fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(3000);
    });

    test('should render 200 flat input fields within budget', async ({ page, helpers }) => {
      await page.goto('/#/test/performance/perf-200-flat-fields');
      await page.waitForLoadState('networkidle');
      const startTime = Date.now();
      const scenario = helpers.getScenario('perf-200-flat-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const inputs = scenario.locator('df-mat-input');
      await expect(inputs.first()).toBeVisible({ timeout: 5000 });
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(200);

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 200 flat fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(5000);
    });
  });

  test.describe('Mixed Field Rendering', () => {
    test('should render 100 mixed field types within budget', async ({ page, helpers }) => {
      await page.goto('/#/test/performance/perf-100-mixed-fields');
      await page.waitForLoadState('networkidle');
      const startTime = Date.now();
      const scenario = helpers.getScenario('perf-100-mixed-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 5000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 100 mixed fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(4000);
    });
  });

  test.describe('Conditional Field Rendering', () => {
    test('should render 50 fields with 25 conditionals within budget', async ({ page, helpers }) => {
      await page.goto('/#/test/performance/perf-50-with-conditionals');
      await page.waitForLoadState('networkidle');
      const startTime = Date.now();
      const scenario = helpers.getScenario('perf-50-with-conditionals');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 5000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 50 fields with conditionals rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(3000);
    });
  });

  test.describe('Array Rendering', () => {
    test('should render array with 20 items x 5 fields within budget', async ({ page, helpers }) => {
      await page.goto('/#/test/performance/perf-array-20-items');
      await page.waitForLoadState('networkidle');
      const startTime = Date.now();
      const scenario = helpers.getScenario('perf-array-20-items');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 5000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] Array 20x5 rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(4000);
    });
  });

  test.describe('Multi-Page Rendering', () => {
    test('should render 10 pages x 10 fields within budget', async ({ page, helpers }) => {
      await page.goto('/#/test/performance/perf-10-pages-10-fields');
      await page.waitForLoadState('networkidle');
      const startTime = Date.now();
      const scenario = helpers.getScenario('perf-10-pages-10-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 5000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 10 pages x 10 fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(3000);
    });
  });

  test.describe('Config Swap with Large Forms', () => {
    test('should swap between two 100-field configs multiple times within budget', async ({ page }) => {
      await page.goto('/#/test/performance/perf-config-swap');
      await page.waitForLoadState('networkidle');
      const scenario = page.locator('[data-testid="perf-config-swap"]');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial render
      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 5000 });

      const swapButton = (key: string) => scenario.locator(`[data-testid="switch-to-${key}"]`);

      // Detect swap completion by checking for field types unique to each config:
      // - Initial config: 100 flat inputs (no checkboxes)
      // - Alternate config: mixed types including checkboxes
      const mixedFieldIndicator = scenario.locator('df-mat-checkbox');
      const flatFieldIndicator = scenario.locator('df-mat-input');

      // Swap to alternate (100 mixed fields)
      const swap1Start = Date.now();
      await swapButton('alternate').click();
      await expect(mixedFieldIndicator.first()).toBeVisible({ timeout: 5000 });
      const swap1Time = Date.now() - swap1Start;
      console.log(`  [PERF] Config swap 1 (initial→alternate): ${swap1Time}ms`);

      // Swap back to initial (100 flat inputs)
      const swap2Start = Date.now();
      await swapButton('initial').click();
      await expect(mixedFieldIndicator).toHaveCount(0, { timeout: 5000 });
      await expect(flatFieldIndicator.first()).toBeVisible({ timeout: 5000 });
      const swap2Time = Date.now() - swap2Start;
      console.log(`  [PERF] Config swap 2 (alternate→initial): ${swap2Time}ms`);

      // Swap again to alternate
      const swap3Start = Date.now();
      await swapButton('alternate').click();
      await expect(mixedFieldIndicator.first()).toBeVisible({ timeout: 5000 });
      const swap3Time = Date.now() - swap3Start;
      console.log(`  [PERF] Config swap 3 (initial→alternate): ${swap3Time}ms`);

      // Swap back one more time
      const swap4Start = Date.now();
      await swapButton('initial').click();
      await expect(mixedFieldIndicator).toHaveCount(0, { timeout: 5000 });
      await expect(flatFieldIndicator.first()).toBeVisible({ timeout: 5000 });
      const swap4Time = Date.now() - swap4Start;
      console.log(`  [PERF] Config swap 4 (alternate→initial): ${swap4Time}ms`);

      // Each swap should complete within 3s
      expect(swap1Time).toBeLessThan(3000);
      expect(swap2Time).toBeLessThan(3000);
      expect(swap3Time).toBeLessThan(3000);
      expect(swap4Time).toBeLessThan(3000);
    });
  });
});

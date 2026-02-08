import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

// Performance tests are opt-in and chromium-only
const skipPerf = !process.env['E2E_PERF'];

test.describe('Performance E2E Tests', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance tests only run on Chromium');
    test.skip(skipPerf, 'Set E2E_PERF=true to run performance tests');
  });

  test.describe('Flat Field Rendering', () => {
    test('should render 100 flat input fields within budget', async ({ page, helpers }) => {
      const startTime = Date.now();
      await page.goto('/#/test/performance/perf-100-flat-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('perf-100-flat-fields');
      await expect(scenario).toBeVisible({ timeout: 15000 });

      // Wait for all fields to render
      const inputs = scenario.locator('df-mat-input');
      await expect(inputs.first()).toBeVisible({ timeout: 10000 });
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(100);

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 100 flat fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(5000); // 5s budget
    });

    test('should render 200 flat input fields within budget', async ({ page, helpers }) => {
      const startTime = Date.now();
      await page.goto('/#/test/performance/perf-200-flat-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('perf-200-flat-fields');
      await expect(scenario).toBeVisible({ timeout: 20000 });

      const inputs = scenario.locator('df-mat-input');
      await expect(inputs.first()).toBeVisible({ timeout: 15000 });
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(200);

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 200 flat fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(10000); // 10s budget
    });
  });

  test.describe('Mixed Field Rendering', () => {
    test('should render 100 mixed field types within budget', async ({ page, helpers }) => {
      const startTime = Date.now();
      await page.goto('/#/test/performance/perf-100-mixed-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('perf-100-mixed-fields');
      await expect(scenario).toBeVisible({ timeout: 15000 });

      // Wait for form to be present
      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 10000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 100 mixed fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(8000); // 8s budget (mixed types are heavier)
    });
  });

  test.describe('Conditional Field Rendering', () => {
    test('should render 50 fields with 25 conditionals within budget', async ({ page, helpers }) => {
      const startTime = Date.now();
      await page.goto('/#/test/performance/perf-50-with-conditionals');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('perf-50-with-conditionals');
      await expect(scenario).toBeVisible({ timeout: 15000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 10000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 50 fields with conditionals rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(5000); // 5s budget
    });
  });

  test.describe('Array Rendering', () => {
    test('should render array with 20 items x 5 fields within budget', async ({ page, helpers }) => {
      const startTime = Date.now();
      await page.goto('/#/test/performance/perf-array-20-items');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('perf-array-20-items');
      await expect(scenario).toBeVisible({ timeout: 15000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 10000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] Array 20x5 rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(8000); // 8s budget
    });
  });

  test.describe('Multi-Page Rendering', () => {
    test('should render 10 pages x 10 fields within budget', async ({ page, helpers }) => {
      const startTime = Date.now();
      await page.goto('/#/test/performance/perf-10-pages-10-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('perf-10-pages-10-fields');
      await expect(scenario).toBeVisible({ timeout: 15000 });

      const form = scenario.locator('form');
      await expect(form).toBeVisible({ timeout: 10000 });

      const renderTime = Date.now() - startTime;
      console.log(`  [PERF] 10 pages x 10 fields rendered in ${renderTime}ms`);
      expect(renderTime).toBeLessThan(5000); // 5s budget
    });
  });
});

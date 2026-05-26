import { test, expect } from '@playwright/test';
import { assertPerf, runPerfBench } from '@ng-forge/examples-shared-testing/perf-spec';

const ROUTES = [
  { variant: 'flat', path: '/#/test/performance/perf-stress-flat' },
  { variant: 'paged', path: '/#/test/performance/perf-stress-paged' },
];

test.describe('Bootstrap — full-API perf stress', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Perf bench only runs on Chromium (uses ng.ɵsetProfiler + LoAF APIs)');
  });

  for (const { variant, path } of ROUTES) {
    test(`stays under regression thresholds (${variant})`, async ({ page }) => {
      test.setTimeout(60_000); // bench runs 3 trials × ~5s each + warmup + settle
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      const result = await runPerfBench(page);
      // eslint-disable-next-line no-console
      console.log(
        `[bootstrap/${variant}] keystroke median=${result.keystrokes.perKeystrokeMs?.median}ms p95=${result.keystrokes.perKeystrokeMs?.p95}ms ` +
          `loaf=${result.longAnimationFrames.countPerTrial?.median ?? 0} longTasks=${result.longTasksCountPerTrial?.median ?? 0} ` +
          `totalCD=${result.cdTimePerTrialBreakdown.allTemplatesTotalMedian}ms (forge=${result.cdTimePerTrialBreakdown.forgeCoreTotalMedian}ms adapter=${result.cdTimePerTrialBreakdown.adapterComponentsTotalMedian}ms)`,
      );
      assertPerf(result, { label: `bootstrap/${variant}` });
      expect(result.keystrokes.totalSampled).toBeGreaterThan(0);
    });
  }
});

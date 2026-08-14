import { test, expect } from '@playwright/test';
import { assertPerf, runPerfBench, type BenchResult } from '@ng-forge/examples-shared-testing/perf-spec';

/**
 * Regression gates for the two large-form scaling features:
 * - Field windowing (opt-in @defer-on-viewport for large flat forms)
 * - Page preload window (paged forms mount only nearby pages)
 *
 * Both keep a large form cheap by mounting only a bounded subset of fields. The
 * gates below break if that bound is lost (all fields mount again). Only runs on
 * Chromium — the harness needs ng.ɵsetProfiler + Long Animation Frame APIs.
 */

const cdPerTrial = (r: BenchResult): number => r.cdTimePerTrialBreakdown.allTemplatesTotalMedian;
const loafPerTrial = (r: BenchResult): number => r.longAnimationFrames.countPerTrial?.median ?? 0;

async function bench(page: import('@playwright/test').Page, path: string): Promise<BenchResult> {
  await page.goto(path, { waitUntil: 'networkidle' });
  // Let @defer + form resolution settle before benching.
  await page.waitForTimeout(2500);
  return runPerfBench(page);
}

test.describe('Material — field windowing perf', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Perf bench only runs on Chromium (uses ng.ɵsetProfiler + LoAF APIs)');
  });

  test('windowing bounds the mounted field count on a large flat form', async ({ page }) => {
    test.setTimeout(90_000);

    // Windowing's benefit is initial render — only the eager head plus whatever
    // is in the viewport mounts, instead of every field. The reliable,
    // machine-independent signal for that is the mounted DOM count, not
    // per-keystroke timing (the aggregate form-value recompute is O(N) either
    // way, so windowed and un-windowed keystroke cost are effectively equal).
    await page.goto('/#/test/performance/perf-flat-300', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const plainInputs = await page.locator('input').count();

    await page.goto('/#/test/performance/perf-flat-300-windowed', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const windowedInputs = await page.locator('input').count();

    console.log(`[windowing] plain mounted inputs=${plainInputs} | windowed mounted inputs=${windowedInputs}`);

    // Sanity: the un-windowed form mounts the full field set.
    expect(plainInputs).toBeGreaterThan(200);
    // Windowing must bound what mounts. If it breaks and every field mounts, this
    // jumps to ~plainInputs. A quarter of the full set is a wide, viewport-safe
    // bound (windowed mounts a couple dozen; the full form is ~240+).
    expect(windowedInputs, `windowed mounted ${windowedInputs} inputs; should be a small fraction of the full ${plainInputs}`).toBeLessThan(
      plainInputs * 0.25,
    );

    // Per-keystroke behaviour must still stay under the loose absolute thresholds.
    const windowed = await bench(page, '/#/test/performance/perf-flat-300-windowed');
    assertPerf(windowed, { label: 'flat-300-windowed' });
  });
});

test.describe('Material — page preload perf', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Perf bench only runs on Chromium (uses ng.ɵsetProfiler + LoAF APIs)');
  });

  test('a 50-page form stays cheap with the preload window active', async ({ page }) => {
    test.setTimeout(60_000);

    const result = await bench(page, '/#/test/performance/perf-stress-standard');

    console.log(
      `[preload] stress-standard (50 pages) CD=${cdPerTrial(result)}ms keystroke median=${result.keystrokes.perKeystrokeMs?.median}ms loaf=${loafPerTrial(result)}`,
    );

    // Only the current page ± preload window mounts. If preload breaks and all 50
    // pages mount, CD/keystroke/LoAF exceed the thresholds and this fails.
    assertPerf(result, { label: 'stress-standard-50pages' });
  });
});

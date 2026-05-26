import type { Page } from '@playwright/test';
import { BENCH_HARNESS_SOURCE, benchOptionsInitScript, PERF_THRESHOLDS, type BenchOptions, type BenchResult } from './bench-harness';

/**
 * Drive the in-browser bench harness against the already-navigated page.
 * Caller is responsible for navigating and waiting for the form to be ready.
 */
export async function runPerfBench(page: Page, opts: BenchOptions = {}): Promise<BenchResult> {
  // Pre-set window.__benchOpts so the IIFE can read them
  await page.evaluate(benchOptionsInitScript({ trials: 3, warmupTrials: 1, charPerTrial: 25, ...opts }));
  return (await page.evaluate(BENCH_HARNESS_SOURCE)) as BenchResult;
}

export type AssertPerfOpts = Partial<typeof PERF_THRESHOLDS> & { label?: string };

/**
 * Assert a bench result against perf thresholds. Loose by default — intended to
 * catch catastrophic regressions, not subtle drift. Adapter specs can override
 * any threshold.
 */
export function assertPerf(result: BenchResult, opts: AssertPerfOpts = {}): void {
  const thresholds = { ...PERF_THRESHOLDS, ...opts };
  const label = opts.label || 'perf';
  const fail = (msg: string) => {
    throw new Error(`[${label}] ${msg}\nFull result: ${JSON.stringify(result, null, 2)}`);
  };

  const ks = result.keystrokes.perKeystrokeMs;
  if (!ks) fail('keystrokes.perKeystrokeMs missing');
  else {
    if (ks.median > thresholds.perKeystrokeMedianMs)
      fail(`per-keystroke median ${ks.median}ms exceeds threshold ${thresholds.perKeystrokeMedianMs}ms`);
    if (ks.p95 > thresholds.perKeystrokeP95Ms) fail(`per-keystroke p95 ${ks.p95}ms exceeds threshold ${thresholds.perKeystrokeP95Ms}ms`);
  }

  const loaf = result.longAnimationFrames.countPerTrial?.median ?? 0;
  if (loaf > thresholds.loafCountPerTrial) fail(`LoAF count/trial ${loaf} exceeds threshold ${thresholds.loafCountPerTrial}`);

  const lt = result.longTasksCountPerTrial?.median ?? 0;
  if (lt > thresholds.longTasksCountPerTrial) fail(`longTask count/trial ${lt} exceeds threshold ${thresholds.longTasksCountPerTrial}`);

  const cd = result.cdTimePerTrialBreakdown.allTemplatesTotalMedian;
  if (cd > thresholds.totalCDPerTrialMs) fail(`total CD per trial ${cd}ms exceeds threshold ${thresholds.totalCDPerTrialMs}ms`);
}

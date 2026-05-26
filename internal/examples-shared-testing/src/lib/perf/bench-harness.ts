/**
 * In-browser perf harness, used both by the standalone cross-adapter runner
 * (scripts/cross-adapter-bench.mjs) AND by per-adapter CI specs. Exported as
 * a JS source string so we can pass it to `page.evaluate(...)` regardless of
 * whether the caller can serialize closures.
 *
 * Captures per trial:
 *   - per-keystroke wall-clock (paint-aligned via double-rAF)
 *   - Long Animation Frames + Long Tasks
 *   - Angular ɵsetProfiler events for templates / CD / lifecycle / dynamic-component
 *
 * Across trials reports median + p25/p75 + p95 for each metric. Discards `warmupTrials`
 * initial trials.
 *
 * Supports both standard HTMLInputElement targets (Material/Bootstrap/PrimeNG) and
 * Ionic web components via shadow-DOM traversal + ionInput CustomEvent dispatch.
 */
export const BENCH_HARNESS_SOURCE = `(async () => {
  const opts = window.__benchOpts || {};
  const charPerTrial = opts.charPerTrial || 25;
  const trials = opts.trials || 5;
  const warmupTrials = opts.warmupTrials ?? 1;
  const targetFieldKey = opts.targetFieldKey || null;
  // Field keys whose values gate visibility/derivation logic in the full-surface
  // stress configs. Picking one of these would mutate the form's hidden-condition
  // state mid-trial (see fullSurfaceStressConfigPagedMostlyHidden), so they're
  // skipped when no explicit targetFieldKey is given.
  const TRIGGER_KEYS = new Set(['accountType', 'region', 'tier', 'plan', 'currency']);
  const isTriggerInput = (el) => {
    const id = el && el.id;
    if (!id || !id.endsWith('-input')) return false;
    return TRIGGER_KEYS.has(id.slice(0, -'-input'.length));
  };
  const isHostTriggerInput = (host) => {
    const id = host && host.id;
    if (!id || !id.endsWith('-input')) return false;
    return TRIGGER_KEYS.has(id.slice(0, -'-input'.length));
  };

  function findInput() {
    if (targetFieldKey) {
      const expectedId = targetFieldKey + '-input';
      const byId = document.querySelector('input[id="' + expectedId + '"],textarea[id="' + expectedId + '"]');
      if (byId && byId.offsetParent !== null) return { el: byId, mode: 'standard' };
      const ionById = document.querySelector('ion-input[id="' + expectedId + '"],ion-textarea[id="' + expectedId + '"]');
      if (ionById && ionById.offsetParent !== null) {
        const shadowInput = ionById.shadowRoot && ionById.shadowRoot.querySelector('input,textarea');
        if (shadowInput) return { el: shadowInput, mode: 'standard', host: ionById };
        return { el: ionById, mode: 'ion-host' };
      }
      throw new Error('targetFieldKey="' + targetFieldKey + '" specified but no visible input with id="' + expectedId + '" was found');
    }
    const candidates = Array.from(document.querySelectorAll('input,textarea')).filter(
      (i) => i.offsetParent !== null && (i.type === 'text' || i.tagName === 'TEXTAREA') && !i.disabled,
    );
    const direct = candidates.find((i) => !isTriggerInput(i)) || candidates[0];
    if (direct) return { el: direct, mode: 'standard' };
    const ionHosts = Array.from(document.querySelectorAll('ion-input,ion-textarea')).filter((h) => h.offsetParent !== null);
    const ionHost = ionHosts.find((h) => !isHostTriggerInput(h)) || ionHosts[0];
    if (ionHost) {
      const shadowInput = ionHost.shadowRoot && ionHost.shadowRoot.querySelector('input,textarea');
      if (shadowInput) return { el: shadowInput, mode: 'standard', host: ionHost };
      return { el: ionHost, mode: 'ion-host' };
    }
    return null;
  }

  const found = findInput();
  if (!found) throw new Error('No suitable input found');
  const input = found.el;
  const inputMode = found.mode;

  await new Promise((r) => setTimeout(r, 400));
  if (input.focus) input.focus();

  function setValueAndDispatch(value) {
    if (inputMode === 'ion-host') {
      input.dispatchEvent(new CustomEvent('ionInput', { detail: { value }, bubbles: true, composed: true }));
    } else {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }
  }

  const loaf = [];
  const longTasks = [];
  let loafObs, ltObs;
  try {
    loafObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) loaf.push({ duration: e.duration, blockingDuration: e.blockingDuration || 0 });
    });
    loafObs.observe({ type: 'long-animation-frame', buffered: false });
  } catch (_) {}
  try {
    ltObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) longTasks.push({ duration: e.duration });
    });
    ltObs.observe({ entryTypes: ['longtask'] });
  } catch (_) {}

  const STACKS = {}, TOTALS = {}, COUNTS = {};
  const HOOK_NAMES = { 2: 'tpl', 12: 'cd', 14: 'cdSync', 16: 'afterRender', 22: 'dynComp', 4: 'lifecycle' };
  const START_TYPES = new Set([2, 12, 14, 16, 22, 4]);
  const END_TYPES = { 3: 2, 13: 12, 15: 14, 17: 16, 23: 22, 5: 4 };

  if (window.ng && window.ng['ɵsetProfiler']) {
    window.ng['ɵsetProfiler']((eventType, instance) => {
      if (START_TYPES.has(eventType)) {
        const bucket = HOOK_NAMES[eventType];
        const name = instance && instance.constructor ? instance.constructor.name : '?';
        const key = bucket + '::' + name;
        (STACKS[key] || (STACKS[key] = [])).push(performance.now());
      } else if (eventType in END_TYPES) {
        const startType = END_TYPES[eventType];
        const bucket = HOOK_NAMES[startType];
        const name = instance && instance.constructor ? instance.constructor.name : '?';
        const key = bucket + '::' + name;
        const s = STACKS[key] && STACKS[key].pop();
        if (s != null) {
          TOTALS[key] = (TOTALS[key] || 0) + (performance.now() - s);
          COUNTS[key] = (COUNTS[key] || 0) + 1;
        }
      }
    });
  }

  const trialResults = [];
  try {
    for (let trialIdx = 0; trialIdx < trials + warmupTrials; trialIdx++) {
      for (const k of Object.keys(STACKS)) delete STACKS[k];
      for (const k of Object.keys(TOTALS)) delete TOTALS[k];
      for (const k of Object.keys(COUNTS)) delete COUNTS[k];
      loaf.length = 0;
      longTasks.length = 0;

      setValueAndDispatch('');
      await new Promise((r) => setTimeout(r, 80));

      const keystrokes = [];
      let buf = '';
      for (let i = 0; i < charPerTrial; i++) {
        const t0 = performance.now();
        buf = buf + 'a';
        setValueAndDispatch(buf);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        keystrokes.push(performance.now() - t0);
      }
      await new Promise((r) => setTimeout(r, 200));

      trialResults.push({
        isWarmup: trialIdx < warmupTrials,
        keystrokes: keystrokes.slice(),
        loafCount: loaf.length,
        loafTotalDuration: loaf.reduce((a, e) => a + e.duration, 0),
        loafTotalBlocking: loaf.reduce((a, e) => a + e.blockingDuration, 0),
        longTaskCount: longTasks.length,
        ngTotals: Object.assign({}, TOTALS),
        ngCounts: Object.assign({}, COUNTS),
      });
    }
  } finally {
    if (window.ng && window.ng['ɵsetProfiler']) window.ng['ɵsetProfiler'](null);
    if (loafObs) loafObs.disconnect();
    if (ltObs) ltObs.disconnect();
  }

  const realTrials = trialResults.filter((t) => !t.isWarmup);
  const stat = (arr) => {
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    return {
      median: +sorted[Math.floor(sorted.length / 2)].toFixed(3),
      p25: +sorted[Math.floor(sorted.length * 0.25)].toFixed(3),
      p75: +sorted[Math.floor(sorted.length * 0.75)].toFixed(3),
      p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(3),
      min: +sorted[0].toFixed(3),
      max: +sorted[sorted.length - 1].toFixed(3),
      mean: +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3),
    };
  };

  const allKeystrokes = realTrials.flatMap((t) => t.keystrokes);
  const ngAggregate = {};
  for (const t of realTrials) {
    for (const k of Object.keys(t.ngTotals)) {
      if (!ngAggregate[k]) ngAggregate[k] = { totals: [], counts: [] };
      ngAggregate[k].totals.push(t.ngTotals[k]);
      ngAggregate[k].counts.push(t.ngCounts[k]);
    }
  }
  const ngSummary = Object.entries(ngAggregate)
    .map(([key, v]) => {
      const [bucket, name] = key.split('::');
      return { bucket, name, totalMsPerTrial: stat(v.totals), callsPerTrial: stat(v.counts) };
    })
    .sort((a, b) => (b.totalMsPerTrial?.median || 0) - (a.totalMsPerTrial?.median || 0));

  const isForge = (name) => /^(_DynamicForm|_PageOrchestratorComponent|_PageFieldComponent|_GroupFieldComponent|_RowFieldComponent|_ArrayFieldComponent|_DfFieldOutlet)/.test(name);
  const isAdapter = (name) => /^(_Mat|_Bs|_Prime|_Ionic|_p-|_NgbInput)/.test(name);
  const tplSlices = ngSummary.filter((s) => s.bucket === 'tpl');
  const forgeTotal = tplSlices.filter((s) => isForge(s.name)).reduce((a, s) => a + (s.totalMsPerTrial?.median || 0), 0);
  const adapterTotal = tplSlices.filter((s) => isAdapter(s.name)).reduce((a, s) => a + (s.totalMsPerTrial?.median || 0), 0);
  const totalCD = tplSlices.reduce((a, s) => a + (s.totalMsPerTrial?.median || 0), 0);

  return {
    config: { charPerTrial, trials, warmupTrials },
    keystrokes: { totalSampled: allKeystrokes.length, perKeystrokeMs: stat(allKeystrokes) },
    longAnimationFrames: {
      countPerTrial: stat(realTrials.map((t) => t.loafCount)),
      durationMsPerTrial: stat(realTrials.map((t) => t.loafTotalDuration)),
      blockingMsPerTrial: stat(realTrials.map((t) => t.loafTotalBlocking)),
    },
    longTasksCountPerTrial: stat(realTrials.map((t) => t.longTaskCount)),
    cdTimePerTrialBreakdown: {
      forgeCoreTotalMedian: +forgeTotal.toFixed(3),
      adapterComponentsTotalMedian: +adapterTotal.toFixed(3),
      allTemplatesTotalMedian: +totalCD.toFixed(3),
    },
    topAngularProfilerSlices: ngSummary.slice(0, 15),
  };
})()`;

/**
 * Loose default thresholds for CI regression detection. These are generous so
 * they catch catastrophic regressions without flapping on run-to-run variance.
 *
 * Numbers calibrated against 2026-05-26 baseline (50 pages × full API surface).
 * Two reference points are used because GitHub Actions runners are noticeably
 * slower than a developer laptop — the per-keystroke wall-clock measurement
 * tracks the rAF cadence, which throttles to 2 frames (~33.3ms) under CI load.
 *
 *   Metric                       Local (mac)    CI (gha+docker)   Threshold
 *   per-keystroke median        16.4–16.7ms     33.3ms             50ms
 *   per-keystroke p95           16.8–18.7ms     33.4ms             65ms
 *   LoAF count / trial          0               0                  0
 *   LongTask count / trial      0               0                  0
 *   Total CD time / trial       9.0–14.6ms      21.7ms             60ms
 */
export const PERF_THRESHOLDS = {
  perKeystrokeMedianMs: 50,
  perKeystrokeP95Ms: 65,
  loafCountPerTrial: 0,
  longTasksCountPerTrial: 0,
  totalCDPerTrialMs: 60,
} as const;

export type BenchResult = {
  config: { charPerTrial: number; trials: number; warmupTrials: number };
  keystrokes: { totalSampled: number; perKeystrokeMs: BenchStat | null };
  longAnimationFrames: {
    countPerTrial: BenchStat | null;
    durationMsPerTrial: BenchStat | null;
    blockingMsPerTrial: BenchStat | null;
  };
  longTasksCountPerTrial: BenchStat | null;
  cdTimePerTrialBreakdown: {
    forgeCoreTotalMedian: number;
    adapterComponentsTotalMedian: number;
    allTemplatesTotalMedian: number;
  };
  topAngularProfilerSlices: Array<{ bucket: string; name: string; totalMsPerTrial: BenchStat | null; callsPerTrial: BenchStat | null }>;
};

export type BenchStat = {
  median: number;
  p25: number;
  p75: number;
  p95: number;
  min: number;
  max: number;
  mean: number;
};

export type BenchOptions = {
  charPerTrial?: number;
  trials?: number;
  warmupTrials?: number;
  /**
   * Field key to target (matches the `id="<key>-input"` convention used by every
   * adapter's input/textarea field component). When set, the harness will only
   * type into that specific input and throw if it's not visible. When unset, the
   * harness picks the first visible non-trigger input — trigger fields
   * (`accountType`/`region`/`tier`/`plan`/`currency`) are skipped because their
   * values gate the hidden-page conditions exercised by the stress configs and
   * mutating them mid-trial would defeat what the bench is measuring.
   */
  targetFieldKey?: string;
};

/**
 * Pre-script that the Playwright spec must inject before `runBench()` so the
 * harness can read its options from `window.__benchOpts`. Pass `{}` for defaults.
 */
export function benchOptionsInitScript(opts: BenchOptions): string {
  return `window.__benchOpts = ${JSON.stringify(opts)};`;
}

#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Cross-adapter performance bench runner.
 *
 *   node scripts/cross-adapter-bench.mjs [--adapters=material,bootstrap,primeng,ionic] [--variants=flat,paged]
 *
 * For each (adapter, variant) pair:
 *   1. Spawn `nx serve <adapter>-examples` (kept alive only for this combo).
 *   2. Poll the dev URL until ready.
 *   3. Launch headless Chromium, navigate to the perf scenario, run the harness.
 *   4. Persist the per-run report to .perf-results/<adapter>-<variant>.json.
 *   5. Tear down dev server, move to next.
 *
 * After all runs complete, prints a summary table comparing per-keystroke median + p95,
 * total CD time per keystroke, LoAF count, and top component CD costs.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Extract the canonical bench harness source from the shared lib.
// (The TS file holds it as `export const BENCH_HARNESS_SOURCE = \`...\`;`.)
const harnessFileText = readFileSync(resolve(process.cwd(), 'internal/examples-shared-testing/src/lib/perf/bench-harness.ts'), 'utf8');
const harnessMatch = harnessFileText.match(/export const BENCH_HARNESS_SOURCE = `([\s\S]*?)`;/);
if (!harnessMatch) throw new Error('Could not locate BENCH_HARNESS_SOURCE in bench-harness.ts');
const BENCH_FN = harnessMatch[1];

const ADAPTERS = [
  { name: 'material', nxProject: 'material-examples', port: 4201 },
  { name: 'bootstrap', nxProject: 'bootstrap-examples', port: 4204 },
  { name: 'primeng', nxProject: 'primeng-examples', port: 4202 },
  { name: 'ionic', nxProject: 'ionic-examples', port: 4203 },
];
// Variant → URL path under /#/test/performance/. Only the variants whose routes
// exist in every adapter app are exposed in VARIANTS (which is the default selection
// when --variants is omitted). New variants (e.g. paged-hidden) can be added here
// once their routes are wired in the adapter you want to run them against.
const VARIANT_PATHS = {
  flat: 'perf-stress-flat',
  paged: 'perf-stress-paged',
  'paged-hidden': 'perf-stress-paged-hidden',
};
const VARIANTS = ['flat', 'paged'];
const RESULT_DIR = resolve(process.cwd(), '.perf-results');

const args = process.argv.slice(2).reduce((acc, raw) => {
  const m = raw.match(/^--([^=]+)=(.*)$/);
  if (m) acc[m[1]] = m[2];
  return acc;
}, {});
const wantedAdapters = typeof args.adapters === 'string' ? args.adapters.split(',') : ADAPTERS.map((a) => a.name);
const wantedVariants = typeof args.variants === 'string' ? args.variants.split(',') : VARIANTS;

mkdirSync(RESULT_DIR, { recursive: true });

function waitForPort(port, timeoutMs = 180_000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = async () => {
      try {
        const res = await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) return resolve();
      } catch (_) {
        /* not ready */
      }
      if (Date.now() - start > timeoutMs) return reject(new Error(`Timeout waiting for port ${port}`));
      setTimeout(tick, 1000);
    };
    tick();
  });
}

async function killOnPort(port) {
  return new Promise((res) => {
    const p = spawn('sh', ['-c', `lsof -ti:${port} | xargs -r kill -9`]);
    p.on('exit', () => res());
  });
}

async function runOne(adapter, variant) {
  const path = VARIANT_PATHS[variant];
  if (!path) throw new Error(`Unknown variant: ${variant} (known: ${Object.keys(VARIANT_PATHS).join(', ')})`);
  const url = `http://localhost:${adapter.port}/#/test/performance/${path}`;

  console.log(`\n=== ${adapter.name}/${variant} ===`);
  console.log(`[serve] starting ${adapter.nxProject} on :${adapter.port}`);
  await killOnPort(adapter.port);

  const serveProc = spawn('npx', ['nx', 'serve', adapter.nxProject, '--port', String(adapter.port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  let serveOutput = '';
  serveProc.stdout.on('data', (d) => (serveOutput += d.toString()));
  serveProc.stderr.on('data', (d) => (serveOutput += d.toString()));
  serveProc.on('error', (e) => console.error('serve error:', e));

  try {
    await waitForPort(adapter.port);
    console.log(`[serve] ready`);

    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      page.on('pageerror', (err) => console.error(`[page error] ${err.message.split('\n')[0]}`));
      console.log(`[bench] navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      // Allow @defer/@if to settle
      await page.waitForTimeout(3000);
      const result = await page.evaluate(BENCH_FN);
      const out = { adapter: adapter.name, variant, url, result };
      const filePath = resolve(RESULT_DIR, `${adapter.name}-${variant}.json`);
      writeFileSync(filePath, JSON.stringify(out, null, 2));
      console.log(`[bench] wrote ${filePath}`);
      return out;
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error(`[error] ${adapter.name}/${variant}:`, err.message);
    return { adapter: adapter.name, variant, url, error: err.message, serveTail: serveOutput.slice(-2000) };
  } finally {
    serveProc.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
    await killOnPort(adapter.port);
  }
}

function fmt(n) {
  return n == null ? '   —  ' : String(+n.toFixed(2)).padStart(7);
}

function printSummary(runs) {
  console.log('\n\n=== CROSS-ADAPTER SUMMARY ===');
  console.log('adapter      variant  keystroke[ms] median/p95   loaf  longTasks  forge[ms]  adapter[ms]  totalCD[ms]');
  console.log('-----------  -------  --------------------------- ----  --------- ---------- ----------- ------------');
  for (const r of runs) {
    if (r.error) {
      console.log(`${r.adapter.padEnd(11)}  ${r.variant.padEnd(7)}  ERROR: ${r.error.slice(0, 80)}`);
      continue;
    }
    const ks = r.result.keystrokes.perKeystrokeMs;
    const cd = r.result.cdTimePerTrialBreakdown;
    const loaf = r.result.longAnimationFrames.countPerTrial?.median;
    const lt = r.result.longTasksCountPerTrial?.median;
    console.log(
      `${r.adapter.padEnd(11)}  ${r.variant.padEnd(7)}  ${fmt(ks.median)}/${fmt(ks.p95)}        ${fmt(loaf)}  ${fmt(lt)}   ${fmt(cd.forgeCoreTotalMedian)}   ${fmt(cd.adapterComponentsTotalMedian)}    ${fmt(cd.allTemplatesTotalMedian)}`,
    );
  }
}

(async () => {
  const targets = ADAPTERS.filter((a) => wantedAdapters.includes(a.name));
  const runs = [];
  for (const adapter of targets) {
    for (const variant of wantedVariants) {
      const out = await runOne(adapter, variant);
      runs.push(out);
    }
  }
  writeFileSync(resolve(RESULT_DIR, 'summary.json'), JSON.stringify(runs, null, 2));
  printSummary(runs);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

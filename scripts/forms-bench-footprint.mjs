/**
 * Memory and initial-render footprint across every benchmark target.
 *
 * Per target: time from navigation to all controls present, JS heap after a forced GC,
 * and DOM node count. Run with all three servers up (4321 ng-forge, 4322 formly, 4323 raw).
 *
 * Usage: CPU_THROTTLE=1 REPS=3 node scripts/forms-bench-footprint.mjs
 */
import { chromium } from 'playwright';

const CPU = Number(process.env.CPU_THROTTLE ?? 1);
const REPS = Number(process.env.REPS ?? 3);

const NG = process.env.NG_PORT ?? '4321';
const FORMLY = process.env.FORMLY_PORT ?? '4322';
const RAW = process.env.RAW_PORT ?? '4323';

const TARGETS = {
  'ng-forge flat 240': `http://localhost:${NG}/#/full`,
  'formly flat 240': `http://localhost:${FORMLY}/?flat`,
  'ng-forge page 40': `http://localhost:${NG}/#/wizard?preload=0`,
  'formly page 40': `http://localhost:${FORMLY}/`,
  'raw Signal 240': `http://localhost:${RAW}/?raw=signal`,
  'raw Reactive 240': `http://localhost:${RAW}/?raw=reactive`,
};

async function measure(browser, url) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);
  if (CPU > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: CPU });

  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'commit' });
  await page.waitForSelector('#field2-input', { timeout: 30000 });
  // Settle: wait until the control count stops growing.
  let last = -1;
  for (let i = 0; i < 100; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('input,select,textarea').length);
    if (n === last && n > 0) break;
    last = n;
    await page.waitForTimeout(50);
  }
  const renderMs = Date.now() - t0;

  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');
  await page.waitForTimeout(200);
  const { usedSize } = await client.send('Runtime.getHeapUsage');
  const dom = await client.send('Memory.getDOMCounters');
  const controls = await page.evaluate(() => document.querySelectorAll('input,select,textarea').length);
  const nodes = await page.evaluate(() => document.getElementsByTagName('*').length);

  await ctx.close();
  return { renderMs, heapMb: usedSize / 1024 / 1024, controls, nodes, listeners: dom.jsEventListeners };
}

const browser = await chromium.launch();
const out = {};
for (let rep = 0; rep < REPS + 1; rep++) {
  for (const [label, url] of Object.entries(TARGETS)) {
    const r = await measure(browser, url);
    if (rep === 0) continue;
    (out[label] ??= { renderMs: [], heapMb: [], controls: r.controls, nodes: r.nodes, listeners: r.listeners }).renderMs.push(r.renderMs);
    out[label].heapMb.push(r.heapMb);
  }
  process.stdout.write(`${rep === 0 ? 'warmup' : `rep ${rep}`} done\n`);
}
await browser.close();

const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log(`\nCPU ${CPU}x, ${REPS} reps\n`);
console.log(
  'target'.padEnd(20) +
    'controls'.padStart(9) +
    'DOM nodes'.padStart(11) +
    'listeners'.padStart(11) +
    'render ms'.padStart(11) +
    'heap MB'.padStart(10),
);
console.log('-'.repeat(75));
for (const [label, v] of Object.entries(out)) {
  console.log(
    label.padEnd(20) +
      String(v.controls).padStart(9) +
      String(v.nodes).padStart(11) +
      String(v.listeners).padStart(11) +
      med(v.renderMs).toFixed(0).padStart(11) +
      med(v.heapMb).toFixed(1).padStart(10),
  );
}

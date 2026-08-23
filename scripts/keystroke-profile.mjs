/**
 * Deep per-keystroke profiler for the ng-forge vs formly head-to-head.
 *
 * Captures, while typing into a plain field on the 240-control fixture:
 *   1. A V8 CPU profile (CDP), aggregated by self-time and attributed back to
 *      original sources through the bundle's sourcemap.
 *   2. Angular's `ɵsetProfiler` events, which stay semantic under minification
 *      (component/template names, change-detection phases, lifecycle hooks).
 *
 * Usage: CPU_THROTTLE=20 node scripts/keystroke-profile.mjs [chars]
 * Expects ng-forge on :4321 and formly on :4322.
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SourceMapConsumer } from 'source-map';

const CHARS = Number(process.argv[2] ?? 40);
const CPU = Number(process.env.CPU_THROTTLE ?? 20);

const TARGETS = {
  'ng-forge': {
    url: process.env.NG_URL ?? 'http://localhost:4321/#/wizard?preload=0',
    dist: 'dist/apps/e2e/bootstrap-performance/browser',
  },
  formly: { url: 'http://localhost:4322/', dist: 'dist/apps/e2e/bootstrap-formly/browser' },
};

/** Buckets a resolved source path into something meaningful for the comparison. */
function bucketOf(src) {
  if (!src) return 'unattributed';
  if (src.includes('@ngx-formly')) return 'formly';
  if (src.includes('packages/dynamic-forms/internal')) return 'ng-forge internal';
  if (src.includes('packages/dynamic-forms-bootstrap')) return 'ng-forge bootstrap adapter';
  if (src.includes('packages/dynamic-forms')) return 'ng-forge core';
  if (src.includes('@angular/forms')) return '@angular/forms (signals)';
  if (src.includes('@angular/core/')) return '@angular/core';
  if (src.includes('@angular/')) return '@angular other';
  if (src.includes('rxjs')) return 'rxjs';
  if (src.includes('examples-shared-testing') || src.includes('apps/e2e')) return 'fixture';
  if (src.includes('node_modules')) return 'other deps';
  return 'app/other';
}

/** Types into the field and returns Angular profiler slices gathered during it. */
const TYPE_PROBE = `async (opts) => {
  const { chars, fieldId } = opts;
  const nextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const input = document.querySelector('#' + fieldId);
  if (!input) throw new Error('missing ' + fieldId);
  const setValue = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  input.focus();
  let text = String(input.value ?? '');
  const per = [];
  for (let i = 0; i < chars; i++) {
    text += 'a';
    const t0 = performance.now();
    setValue(input, text);
    await nextPaint();
    per.push(performance.now() - t0);
  }
  return { per, ng: (window.__ngProf && window.__ngProf.dump()) || null };
}`;

/**
 * Installs an Angular profiler hook. `ɵsetProfiler` is a private but stable-enough
 * entry point; if it isn't reachable the run still yields the CPU profile.
 */
const INSTALL_NG_PROFILER = `(() => {
  const ng = window.ng;
  const core = (ng && ng.core) || window.__ngCore;
  const setProfiler = core && (core['ɵsetProfiler'] || core.setProfiler);
  const totals = new Map();
  const open = new Map();
  if (!setProfiler) { window.__ngProf = null; return false; }
  // Angular emits (event, instance, eventFn) with even=start, odd=end per phase.
  setProfiler((event, instance) => {
    const name = (instance && instance.constructor && instance.constructor.name) || 'unknown';
    const key = event + '|' + name;
    if (event % 2 === 0) {
      open.set(key, performance.now());
    } else {
      const startKey = (event - 1) + '|' + name;
      const t0 = open.get(startKey);
      if (t0 !== undefined) {
        const rec = totals.get(startKey) || { ms: 0, calls: 0 };
        rec.ms += performance.now() - t0; rec.calls++;
        totals.set(startKey, rec);
        open.delete(startKey);
      }
    }
  });
  window.__ngProf = {
    dump: () => Array.from(totals.entries()).map(([k, v]) => ({ key: k, ms: +v.ms.toFixed(2), calls: v.calls }))
      .sort((a, b) => b.ms - a.ms).slice(0, 20),
    reset: () => { totals.clear(); open.clear(); },
  };
  return true;
})()`;

/** Self-time per call frame from a V8 cpuProfile. */
function selfTimes(profile) {
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  const { samples, timeDeltas } = profile;
  for (let i = 0; i < samples.length; i++) {
    const dt = timeDeltas[i] ?? 0;
    if (dt <= 0) continue;
    const node = byId.get(samples[i]);
    if (!node) continue;
    self.set(node.id, (self.get(node.id) ?? 0) + dt);
  }
  return { self, byId };
}

async function profileOne(browser, name, target) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  await page.addInitScript(`window.__ngCore = null;`);
  await page.goto(target.url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#field2-input', { timeout: 20000 });
  await page.waitForTimeout(800);

  const ngInstalled = await page.evaluate(INSTALL_NG_PROFILER).catch(() => false);

  if (CPU > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: CPU });

  // Warm up so JIT/first-run costs don't land in the profile.
  await page.evaluate(`(${TYPE_PROBE})(${JSON.stringify({ chars: 10, fieldId: 'field2-input' })})`);
  await page.evaluate(`window.__ngProf && window.__ngProf.reset()`);

  await client.send('Profiler.enable');
  await client.send('Profiler.setSamplingInterval', { interval: 100 });
  await client.send('Profiler.start');

  const typed = await page.evaluate(`(${TYPE_PROBE})(${JSON.stringify({ chars: CHARS, fieldId: 'field2-input' })})`);

  const { profile } = await client.send('Profiler.stop');
  if (CPU > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // Resolve minified frames back to original sources via the bundle sourcemap.
  const mapFile = profile.nodes.map((n) => n.callFrame.url).find((u) => u && u.includes('/main-') && u.endsWith('.js'));
  let consumer = null;
  if (mapFile) {
    const base = mapFile.split('/').pop();
    const p = join(target.dist, base + '.map');
    if (existsSync(p)) consumer = await new SourceMapConsumer(JSON.parse(readFileSync(p, 'utf8')));
  }

  // Parent links so a sample can be attributed to the nearest library frame on
  // its stack — self-time alone credits Angular internals without saying which
  // caller dragged them there.
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);

  const { self, byId } = selfTimes(profile);
  const buckets = new Map();
  const fns = new Map();
  const entryAttribution = new Map();
  let total = 0;

  for (const [id, us] of self) {
    const node = byId.get(id);
    const cf = node.callFrame;
    total += us;
    let src = cf.url || '';
    let fnName = cf.functionName || '(anonymous)';

    if (consumer && cf.url && cf.url.includes('/main-')) {
      const pos = consumer.originalPositionFor({ line: (cf.lineNumber ?? 0) + 1, column: cf.columnNumber ?? 0 });
      if (pos && pos.source) {
        src = pos.source;
        if (pos.name) fnName = pos.name;
      }
    }

    const bucket = bucketOf(src);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + us);
    const shortSrc = src.replace(/^.*(packages|internal|node_modules|apps)\//, '$1/');
    const key = `${fnName}  (${shortSrc})`;
    fns.set(key, (fns.get(key) ?? 0) + us);

    // Walk up to the nearest frame owned by the library under test.
    let cur = id;
    let owner = null;
    for (let hop = 0; hop < 200 && cur !== undefined; hop++) {
      const n = byId.get(cur);
      if (!n) break;
      let s = n.callFrame.url || '';
      let fname = n.callFrame.functionName || '(anonymous)';
      if (consumer && s.includes('/main-')) {
        const p = consumer.originalPositionFor({ line: (n.callFrame.lineNumber ?? 0) + 1, column: n.callFrame.columnNumber ?? 0 });
        if (p && p.source) {
          s = p.source;
          if (p.name) fname = p.name;
        }
      }
      const b = bucketOf(s);
      if (b.startsWith('ng-forge') || b === 'formly') {
        owner = `${fname}  (${s.replace(/^.*(packages|internal|node_modules)\//, '$1/')})`;
        break;
      }
      cur = parent.get(cur);
    }
    if (owner) entryAttribution.set(owner, (entryAttribution.get(owner) ?? 0) + us);
  }
  if (consumer) consumer.destroy();
  await context.close();

  const per = typed.per.slice().sort((a, b) => a - b);
  return {
    name,
    perKeystrokeMedian: +per[Math.floor(per.length / 2)].toFixed(2),
    totalCpuMs: +(total / 1000).toFixed(1),
    buckets: [...buckets.entries()].map(([k, v]) => [k, +(v / 1000).toFixed(1)]).sort((a, b) => b[1] - a[1]),
    topFns: [...fns.entries()]
      .map(([k, v]) => [k, +(v / 1000).toFixed(1)])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20),
    entryAttribution: [...entryAttribution.entries()]
      .map(([k, v]) => [k, +(v / 1000).toFixed(1)])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15),
    ng: typed.ng,
    ngInstalled,
  };
}

const browser = await chromium.launch();
const out = {};
for (const [name, target] of Object.entries(TARGETS)) {
  process.stdout.write(`profiling ${name} (cpu ${CPU}x, ${CHARS} chars) ... `);
  out[name] = await profileOne(browser, name, target);
  console.log('done');
}
await browser.close();

for (const name of Object.keys(TARGETS)) {
  const r = out[name];
  console.log(`\n${'='.repeat(78)}\n${name}   per-keystroke median ${r.perKeystrokeMedian}ms   CPU sampled ${r.totalCpuMs}ms`);
  console.log('-'.repeat(78));
  console.log('self-time by source:');
  for (const [b, ms] of r.buckets) {
    if (ms < 0.5) continue;
    const pct = ((ms / r.totalCpuMs) * 100).toFixed(1);
    console.log(`  ${b.padEnd(30)} ${String(ms).padStart(8)}ms  ${pct.padStart(5)}%`);
  }
  console.log('\ntop functions by self-time:');
  for (const [fn, ms] of r.topFns) {
    if (ms < 0.4) continue;
    console.log(`  ${String(ms).padStart(7)}ms  ${fn.slice(0, 96)}`);
  }
  if (r.entryAttribution?.length) {
    console.log('\nCPU attributed to nearest library frame on the stack (incl. Angular work it triggers):');
    for (const [fn, ms] of r.entryAttribution) {
      if (ms < 1) continue;
      const pct = ((ms / r.totalCpuMs) * 100).toFixed(1);
      console.log(`  ${String(ms).padStart(7)}ms ${pct.padStart(5)}%  ${fn.slice(0, 92)}`);
    }
  }
  if (r.ng && r.ng.length) {
    console.log('\nAngular profiler slices (event|component, ms/calls):');
    for (const s of r.ng.slice(0, 10)) console.log(`  ${String(s.ms).padStart(7)}ms  ${String(s.calls).padStart(5)}x  ${s.key}`);
  }
}

writeFileSync('/tmp/keystroke-profile.json', JSON.stringify(out, null, 2));
console.log('\nfull profile written to /tmp/keystroke-profile.json');

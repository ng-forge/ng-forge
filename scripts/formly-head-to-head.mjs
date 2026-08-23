/**
 * Head-to-head runtime benchmark: ng-forge vs ngx-formly on the same
 * representative form (240 controls / 6 pages, identical validation rules).
 *
 * Measures, paint-aligned via double-rAF:
 *   - per-keystroke latency on a plain field (the common case)
 *   - per-keystroke latency on a field that feeds a cross-field validator
 *   - cross-field validation latency (edit -> dependent error state settles)
 *   - cross-page validation latency (edit page 1 -> navigate -> page settles)
 *   - page navigation latency
 *
 * Usage: node scripts/formly-head-to-head.mjs [trials]
 * Expects both apps served: ng-forge on :4321, formly on :4322.
 */
import { chromium, firefox, webkit } from 'playwright';

// CPU throttling is Chromium-only (CDP), so cross-browser runs are unthrottled.
const ENGINES = { chromium, firefox, webkit };
const ENGINE_NAME = process.env.BROWSER ?? 'chromium';
const ENGINE = ENGINES[ENGINE_NAME] ?? chromium;

const TRIALS = Number(process.argv[2] ?? 7);
const WARMUP = 2;
const CHARS = 20;

const TARGETS = {
  'ng-forge': 'http://localhost:4321/#/wizard?preload=0',
  formly: 'http://localhost:4322/',
};

/** Runs in the page. Returns raw per-trial samples; stats are computed in node. */
const PROBE = `async (opts) => {
  const { chars, fieldId } = opts;
  const nextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const q = (sel) => document.querySelector(sel);
  const input = q('#' + fieldId);
  if (!input) throw new Error('missing input ' + fieldId);

  const setValue = (el, v) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // --- per-keystroke ---
  input.focus();
  const keystrokes = [];
  let text = String(input.value ?? '');
  for (let i = 0; i < chars; i++) {
    text += 'a';
    const t0 = performance.now();
    setValue(input, text);
    await nextPaint();
    keystrokes.push(performance.now() - t0);
  }
  return { keystrokes };
}`;

/** Cross-field: drive field9 above/below field8 and wait for the error state to flip. */
const CROSS_FIELD_PROBE = `async () => {
  const nextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const lower = document.querySelector('#field9-input');
  if (!lower) throw new Error('missing #field9-input');

  const setValue = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const errorVisible = () => {
    const host = lower.closest('.mb-3, .form-group, formly-field, df-field, div');
    if (host && host.querySelector('.invalid-feedback, [class*="error"], .is-invalid')) return true;
    return lower.classList.contains('ng-invalid') || lower.classList.contains('is-invalid');
  };

  const samples = [];
  // 20 > field8 (10) => invalid ; 1 < 10 => valid. Each flip is one measured transition.
  for (let i = 0; i < 6; i++) {
    const target = i % 2 === 0 ? '20' : '1';
    const want = i % 2 === 0;
    const t0 = performance.now();
    setValue(lower, target);
    let settled = false;
    for (let f = 0; f < 60; f++) {
      await nextPaint();
      if (errorVisible() === want) { settled = true; break; }
    }
    samples.push({ ms: performance.now() - t0, settled });
  }
  return { samples };
}`;

/**
 * Cross-page validation + navigation. Both apps gate advancing on the active page
 * being valid, so this fills every required control, then measures from the Next
 * click until the next page has painted — i.e. the whole-page validation pass plus
 * the page swap, which is the cross-page cost users actually feel.
 */
const NAV_PROBE = `async () => {
  const nextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const setValue = (el, v) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  // Satisfy every control so the validity gate opens. Three fields need specific
  // values: field8/field9 are the cross-field bound pair (lower must be < upper),
  // and field6 hits the mock username endpoint, which only reports "available"
  // for an even-length query.
  const fillPage = async () => {
    for (const el of Array.from(document.querySelectorAll('input,textarea'))) {
      if (el.disabled || el.readOnly) continue;
      const id = el.id || '';
      if (id === 'field8-input') { setValue(el, '10'); continue; }
      if (id === 'field9-input') { setValue(el, '1'); continue; }
      if (el.type === 'number') { setValue(el, '1'); continue; }
      if (id === 'field6-input') { setValue(el, 'valid1'); continue; }
      setValue(el, id === 'field7-input' ? 'valid@example.com' : 'valid');
    }
    // Wait for the page to actually settle valid rather than guessing a delay:
    // async (HTTP) validators resolve on their own schedule and CPU throttling
    // stretches that well past any fixed timeout.
    const stillInvalid = () =>
      Array.from(document.querySelectorAll('input,textarea')).filter(
        (e) => e.classList.contains('ng-invalid') || e.classList.contains('is-invalid'),
      ).length;
    for (let i = 0; i < 120 && stillInvalid() > 0; i++) {
      await new Promise((r) => setTimeout(r, 25));
    }
    await nextPaint();
  };

  // Re-query each iteration: the nav can re-render, leaving cached refs detached.
  const findBtn = (label) => Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === label);
  if (!findBtn('Next') || !findBtn('Previous')) throw new Error('missing nav buttons');

  const status = () => document.querySelector('[aria-live="polite"]')?.textContent?.trim();
  const countInputs = () => document.querySelectorAll('input,select,textarea').length;
  const samples = [];

  for (let i = 0; i < 6; i++) {
    const label = i % 2 === 0 ? 'Next' : 'Previous';
    if (label === 'Next') await fillPage();
    const btn = findBtn(label);
    if (!btn || btn.disabled) continue;
    const before = status();
    const t0 = performance.now();
    btn.click();
    let settled = false;
    for (let f = 0; f < 120; f++) {
      await nextPaint();
      if (status() !== before && countInputs() > 0) { settled = true; break; }
    }
    samples.push({ ms: performance.now() - t0, settled, from: before, to: status() });
  }
  return { samples };
}`;

function stat(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const at = (p) => s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
  return {
    median: +at(50).toFixed(2),
    p95: +at(95).toFixed(2),
    min: +s[0].toFixed(2),
    max: +s[s.length - 1].toFixed(2),
  };
}

async function runOne(browser, url, cpuThrottle) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const client = ENGINE_NAME === 'chromium' ? await context.newCDPSession(page) : null;
  if (client && cpuThrottle > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#field2-input', { timeout: 20000 });
  await page.waitForTimeout(600);

  const plain = [];
  const crossKey = [];
  const crossField = [];
  const nav = [];

  // Probes are source strings, so they must be invoked as IIFEs — Playwright
  // evaluates a string as an expression and would otherwise just return the fn.
  const call = (src, arg) => `(${src})(${arg === undefined ? '' : JSON.stringify(arg)})`;

  for (let t = 0; t < TRIALS + WARMUP; t++) {
    const a = await page.evaluate(call(PROBE, { chars: CHARS, fieldId: 'field2-input' }));
    const b = await page.evaluate(call(PROBE, { chars: CHARS, fieldId: 'field9-input' }));
    const c = await page.evaluate(call(CROSS_FIELD_PROBE));
    const d = await page.evaluate(call(NAV_PROBE));
    if (t < WARMUP) continue;
    plain.push(...a.keystrokes);
    crossKey.push(...b.keystrokes);
    crossField.push(...c.samples.filter((s) => s.settled).map((s) => s.ms));
    nav.push(...d.samples.filter((s) => s.settled).map((s) => s.ms));
  }

  await context.close();
  return {
    perKeystrokePlain: stat(plain),
    perKeystrokeCrossField: stat(crossKey),
    crossFieldValidationMs: stat(crossField),
    pageNavigationMs: stat(nav),
  };
}

const cpu = Number(process.env.CPU_THROTTLE ?? 1);
const REPS = Number(process.env.REPS ?? 3);
const browser = await ENGINE.launch();

// Repeat, and alternate order within each rep. Both libraries must be measured
// close together or machine drift is indistinguishable from a real change.
// The first rep is discarded: browser launch and JIT warmup skew it well beyond
// the per-page warmup the inner loop already does.
const reps = [];
for (let rep = 0; rep < REPS + 1; rep++) {
  const order = rep % 2 === 0 ? ['ng-forge', 'formly'] : ['formly', 'ng-forge'];
  const round = {};
  const label = rep === 0 ? 'warmup' : `rep ${rep}/${REPS}`;
  for (const name of order) {
    process.stdout.write(`${label}  ${name} (cpu ${cpu}x) ... `);
    round[name] = await runOne(browser, TARGETS[name], cpu);
    console.log('done');
  }
  if (rep > 0) reps.push(round);
}
await browser.close();

const METRICS = [
  ['perKeystrokePlain', 'per-keystroke, plain field'],
  ['perKeystrokeCrossField', 'per-keystroke, cross-field src'],
  ['crossFieldValidationMs', 'cross-field validation settle'],
  ['pageNavigationMs', 'page navigation'],
];

const med = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

console.log(`\n${REPS} reps x ${TRIALS} trials (+${WARMUP} warmup), ${CHARS} chars/trial, CPU ${cpu}x`);
console.log('Ratio is the trustworthy figure: both libraries measured back-to-back per rep.\n');
console.log('metric'.padEnd(31) + 'ng-forge'.padStart(14) + 'formly'.padStart(14) + 'ratio'.padStart(9) + '  per-rep ratios');
console.log('-'.repeat(100));

for (const [key, label] of METRICS) {
  const perRep = reps
    .map((r) => ({ a: r['ng-forge'][key], b: r['formly'][key] }))
    .filter(({ a, b }) => a && b)
    .map(({ a, b }) => ({ a: a.median, b: b.median, ratio: a.median / b.median }));

  if (!perRep.length) {
    console.log(label.padEnd(31) + 'n/a'.padStart(14) + 'n/a'.padStart(14));
    continue;
  }

  const ratios = perRep.map((r) => r.ratio);
  const spread = `${Math.min(...ratios).toFixed(2)}-${Math.max(...ratios).toFixed(2)}`;

  console.log(
    label.padEnd(31) +
      med(perRep.map((r) => r.a))
        .toFixed(1)
        .padStart(14) +
      med(perRep.map((r) => r.b))
        .toFixed(1)
        .padStart(14) +
      med(ratios).toFixed(2).padStart(9) +
      `  [${ratios.map((r) => r.toFixed(2)).join(', ')}]  spread ${spread}`,
  );
}
console.log('\nmedian ms per library; ratio >1 means formly faster. Wide spread means the run is noise-bound.');

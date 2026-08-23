/**
 * Lighthouse head-to-head on the brotli-served production builds.
 * Expects scripts/static-brotli-server.mjs on 4331 (ng-forge) and 4332 (formly).
 *
 * Usage: RUNS=5 node scripts/lighthouse-head-to-head.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';

const RUNS = Number(process.env.RUNS ?? 5);
const OUT = '/tmp/lh-h2h';
mkdirSync(OUT, { recursive: true });

const TARGETS = {
  'ng-forge paged': 'http://localhost:4331/#/wizard',
  'ng-forge flat': 'http://localhost:4331/#/full',
  'formly paged': 'http://localhost:4332/',
  'formly flat': 'http://localhost:4332/?flat',
};

const METRICS = [
  ['first-contentful-paint', 'FCP'],
  ['largest-contentful-paint', 'LCP'],
  ['total-blocking-time', 'TBT'],
  ['speed-index', 'SI'],
];

const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const results = {};

for (const [label, url] of Object.entries(TARGETS)) {
  const slug = label.replace(/\W+/g, '-');
  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`${label} run ${i}/${RUNS}\r`);
    execFileSync(
      'npx',
      [
        '--no-install',
        'lighthouse',
        url,
        '--only-categories=performance',
        '--output=json',
        `--output-path=${OUT}/${slug}-${i}.json`,
        '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
        '--quiet',
      ],
      { stdio: 'ignore' },
    );
  }
  const runs = Array.from({ length: RUNS }, (_, i) => JSON.parse(readFileSync(`${OUT}/${slug}-${i + 1}.json`, 'utf8')));
  results[label] = {
    scores: runs.map((r) => Math.round(r.categories.performance.score * 100)),
    metrics: Object.fromEntries(METRICS.map(([k, s]) => [s, med(runs.map((r) => r.audits[k].numericValue))])),
    transferKb: runs[0].audits['network-requests'].details.items.reduce((a, x) => a + (x.transferSize ?? 0), 0) / 1024,
  };
  console.log(`${label}: done                       `);
}

console.log(`\nLighthouse stock mobile preset, ${RUNS} runs, brotli-served\n`);
console.log(
  'target'.padEnd(18) +
    'score'.padStart(7) +
    'FCP'.padStart(8) +
    'LCP'.padStart(8) +
    'TBT'.padStart(8) +
    'SI'.padStart(8) +
    'transfer kB'.padStart(13) +
    '   runs',
);
console.log('-'.repeat(92));
for (const [label, r] of Object.entries(results)) {
  console.log(
    label.padEnd(18) +
      String(med(r.scores)).padStart(7) +
      r.metrics.FCP.toFixed(0).padStart(8) +
      r.metrics.LCP.toFixed(0).padStart(8) +
      r.metrics.TBT.toFixed(0).padStart(8) +
      r.metrics.SI.toFixed(0).padStart(8) +
      r.transferKb.toFixed(1).padStart(13) +
      `   [${r.scores.join(', ')}]`,
  );
}

// Union-order-insensitive api-check.
//
// Runs api-extractor to generate a fresh report into the temp folder, then
// compares it to the committed golden after normalizing union member order in
// BOTH (see normalize-api-unions.mjs). This removes the flaky-union false
// positives that plain api-extractor diffing produces under parallel builds,
// while still catching real public-API changes.
import { normalizeApiReport } from './normalize-api-unions.mjs';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const configs = process.argv.slice(2);
if (!configs.length) {
  console.error('usage: api-check.mjs <api-extractor-config...>');
  process.exit(2);
}

const ETC = resolve('etc');
const TEMP = resolve('tmp/api-extractor');
let failed = false;

for (const cfg of configs) {
  const raw = readFileSync(cfg, 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const reportFileName = JSON.parse(raw).apiReport?.reportFileName;
  if (!reportFileName) {
    console.error(`api-check: no apiReport.reportFileName in ${cfg}`);
    failed = true;
    continue;
  }

  // Generate the fresh report into the temp folder. In non-local mode
  // api-extractor exits non-zero when the report differs from the golden; that
  // is exactly the case we re-judge below, so the throw is expected.
  try {
    execSync(`npx --no-install api-extractor run --config ${cfg}`, { stdio: 'pipe' });
  } catch {
    /* expected on report drift; verdict comes from the normalized compare */
  }

  const golden = resolve(ETC, reportFileName);
  const fresh = resolve(TEMP, reportFileName);
  if (!existsSync(fresh)) {
    console.error(`api-check: api-extractor did not produce ${reportFileName} (config: ${cfg})`);
    failed = true;
    continue;
  }
  if (!existsSync(golden)) {
    console.error(`api-check: missing golden etc/${reportFileName} — run the matching api-update target`);
    failed = true;
    continue;
  }

  const g = normalizeApiReport(readFileSync(golden, 'utf8'));
  const f = normalizeApiReport(readFileSync(fresh, 'utf8'));
  if (g === f) {
    console.log(`api-check ok: ${reportFileName}`);
    continue;
  }

  console.error(
    `api-check FAILED: ${reportFileName} — public API changed; run the project's api-update target and commit etc/${reportFileName}`,
  );
  const gl = g.split('\n');
  const fl = f.split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(gl.length, fl.length) && shown < 25; i++) {
    if (gl[i] !== fl[i]) {
      console.error(`  L${i + 1}`);
      console.error(`    - ${gl[i] ?? ''}`);
      console.error(`    + ${fl[i] ?? ''}`);
      shown++;
    }
  }
  failed = true;
}

process.exit(failed ? 1 : 0);

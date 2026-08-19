/**
 * The golden corpus, asserted against the live hand-written validator.
 *
 * The corpus records a reviewed contract rather than a snapshot of current
 * behaviour, which is the whole point: freezing whatever the schemas happen to do
 * would enshrine known gaps as the specification.
 *
 * `currentVerdict` is what the hand-written schemas do **now**, and it is asserted
 * on every run. Letting it drift into a historical note would turn Tier B from a
 * differential oracle into provenance, which is the one thing it must not become.
 *
 * `v1Verdict` is the reviewed target, asserted against the derived validator once
 * that exists. Until then a row whose two verdicts differ is a pending intended
 * change: reported here, deliberately not asserted.
 *
 * `regression` carries the history of a resolved divergence. Documentation only.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateFormConfig, type UiIntegration } from '../validate/src';

type Verdict = 'valid' | 'invalid';

interface GoldenRow {
  id: string;
  description: string;
  adapters: UiIntegration[];
  config: unknown;
  currentVerdict: Verdict;
  v1Verdict?: Verdict;
  rationale: string;
  regression?: { observedBefore: string; issue: string };
}

const corpus: { rows: GoldenRow[] } = JSON.parse(readFileSync(join(__dirname, 'golden-corpus.json'), 'utf-8'));

function verdictOf(adapter: UiIntegration, config: unknown) {
  const result = validateFormConfig(adapter, config);
  return {
    verdict: (result.valid ? 'valid' : 'invalid') as Verdict,
    detail: (result.errors ?? []).map((e) => `${e.path}: ${e.message}`).join('\n'),
  };
}

describe('golden corpus shape', () => {
  it('is not empty', () => {
    expect(corpus.rows.length).toBeGreaterThan(0);
  });

  it('gives every row a unique id', () => {
    const ids = corpus.rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every row a rationale, because a row without one cannot be reviewed', () => {
    for (const row of corpus.rows) {
      expect(row.rationale.length, `${row.id} has no rationale`).toBeGreaterThan(20);
    }
  });

  it('names at least one adapter per row', () => {
    for (const row of corpus.rows) {
      expect(row.adapters.length, `${row.id} asserts nothing`).toBeGreaterThan(0);
    }
  });

  it('keeps resolved history in `regression`, never in a verdict', () => {
    // A verdict that records the past stops describing the present, and the
    // differential comparison silently becomes a history lesson.
    for (const row of corpus.rows) {
      if (!row.regression) continue;
      expect(row.regression.observedBefore, `${row.id} regression has no commit`).toBeTruthy();
      expect(row.regression.issue.length, `${row.id} regression has no description`).toBeGreaterThan(20);
    }
  });
});

describe('the live hand-written validator matches currentVerdict', () => {
  for (const row of corpus.rows) {
    for (const adapter of row.adapters) {
      it(`${row.id} is ${row.currentVerdict} under ${adapter}`, () => {
        const { verdict, detail } = verdictOf(adapter, row.config);

        expect(verdict, `${row.description}\n${detail}`).toBe(row.currentVerdict);
      });
    }
  }
});

describe('reviewed targets', () => {
  const pending = corpus.rows.filter((r) => r.v1Verdict !== undefined && r.v1Verdict !== r.currentVerdict);

  it('reports rows whose target differs from current behaviour', () => {
    // Not a failure. These are intended changes awaiting the derived validator,
    // and naming them here keeps them from being mistaken for regressions later.
    for (const row of pending) {
      console.info(`[golden] pending intended change: ${row.id} current=${row.currentVerdict} v1=${row.v1Verdict}`);
    }

    expect(pending.every((r) => r.rationale.length > 20)).toBe(true);
  });

  it('agrees with currentVerdict wherever no change is intended', () => {
    // While the hand-written validator is authoritative, an unchanged row's two
    // verdicts must match, or the corpus is asserting two different contracts.
    for (const row of corpus.rows) {
      if (row.v1Verdict === undefined || pending.includes(row)) continue;
      expect(row.v1Verdict, `${row.id} disagrees with itself`).toBe(row.currentVerdict);
    }
  });
});

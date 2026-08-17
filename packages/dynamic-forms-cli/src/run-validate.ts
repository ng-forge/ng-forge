/** Glob resolution and the validate run itself, independent of any CLI framework. */

import { glob } from 'node:fs/promises';
import { relative } from 'node:path';
import type { UiIntegration } from '@ng-forge/dynamic-forms-zod/validate';
import { formatFileReport } from './report.js';
import { collectRelatedDocs } from './related-docs.js';
import { UI_INTEGRATIONS, validateFile, type FileValidationResult } from './validate-file.js';

/** All valid, nothing to fix. */
export const EXIT_OK = 0;
/** Files were checked and at least one config failed validation. */
export const EXIT_INVALID_CONFIG = 1;
/** The invocation itself was wrong: bad integration name, no files matched. */
export const EXIT_USAGE = 2;

const DEFAULT_EXCLUDES = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

export interface ValidateOptions {
  /** UI integration to validate against. Defaults to `material` at the CLI layer. */
  ui: string;
  /** Emit machine-readable JSON instead of a human report. */
  json: boolean;
  /** Suppress per-file success lines and the closing summary. */
  quiet: boolean;
}

/**
 * Shorten a path for display, but keep it absolute when it sits outside the
 * working directory: a wall of `../../..` is less readable than the full path.
 */
function displayPath(filePath: string): string {
  const rel = relative(process.cwd(), filePath);
  return !rel || rel.startsWith('..') ? filePath : rel;
}

/** Expand glob patterns into a deduplicated, sorted file list. */
async function resolveFiles(patterns: string[]): Promise<string[]> {
  const found = new Set<string>();

  for (const pattern of patterns) {
    for await (const entry of glob(pattern, { exclude: DEFAULT_EXCLUDES })) {
      found.add(entry);
    }
  }

  return [...found].sort();
}

/** Machine-readable shape emitted by `--json`. */
function toJsonSummary(results: FileValidationResult[], uiIntegration: UiIntegration) {
  return {
    uiIntegration,
    filesChecked: results.length,
    valid: results.every((r) => r.valid),
    errorCount: results.reduce((sum, r) => sum + r.errorCount, 0),
    files: results.map((r) => ({
      filePath: r.filePath,
      valid: r.valid,
      configsFound: r.results.length,
      errorCount: r.errorCount,
      configs: r.results.map((c) => ({
        name: c.name,
        line: c.line,
        matchReason: c.matchReason,
        valid: c.validation.valid,
        errors: c.validation.errors ?? [],
      })),
    })),
  };
}

/**
 * Validate every FormConfig found in the files matching `patterns`.
 *
 * Returns the exit code rather than calling `process.exit`, so callers can
 * embed it and tests can assert on it.
 */
export async function runValidate(patterns: string[], options: ValidateOptions): Promise<number> {
  const uiIntegration = options.ui as UiIntegration;

  if (!UI_INTEGRATIONS.includes(uiIntegration)) {
    console.error(`Unknown UI integration "${options.ui}". Expected one of: ${UI_INTEGRATIONS.join(', ')}`);
    return EXIT_USAGE;
  }

  const files = await resolveFiles(patterns);

  if (files.length === 0) {
    console.error(`No files matched: ${patterns.join(', ')}`);
    return EXIT_USAGE;
  }

  const results: FileValidationResult[] = [];
  for (const file of files) {
    results.push(await validateFile(file, uiIntegration));
  }

  if (options.json) {
    console.log(JSON.stringify(toJsonSummary(results, uiIntegration), null, 2));
    return results.every((r) => r.valid) ? EXIT_OK : EXIT_INVALID_CONFIG;
  }

  const failing = results.filter((r) => !r.valid);

  for (const result of failing) {
    console.log(formatFileReport(result, { relatedDocs: collectRelatedDocs }));
    console.log('');
  }

  if (!options.quiet) {
    for (const result of results.filter((r) => r.valid && !r.noConfigsFound)) {
      const label = displayPath(result.filePath);
      console.log(`ok  ${label} (${result.results.length} config${result.results.length === 1 ? '' : 's'})`);
    }
  }

  const configsFound = results.reduce((sum, r) => sum + r.results.length, 0);

  if (configsFound === 0) {
    console.error(
      `No FormConfig objects found in ${files.length} file(s). Check the pattern, or annotate configs with \`satisfies FormConfig\`.`,
    );
    return EXIT_OK;
  }

  if (failing.length > 0) {
    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    console.error(`${errorCount} error(s) across ${failing.length} of ${files.length} file(s).`);
    return EXIT_INVALID_CONFIG;
  }

  if (!options.quiet) {
    console.log(`${configsFound} config(s) valid across ${files.length} file(s).`);
  }

  return EXIT_OK;
}

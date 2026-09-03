/** Glob resolution and the validate run itself, independent of any CLI framework. */

import { glob } from 'node:fs/promises';
import { relative } from 'node:path';
import { markFail, markOk, bad, bold, cyan, dim, plural, rule, startSpinner, warn } from './terminal.js';
import { discoverProject, versionMismatch } from './discover-project.js';
import { loadProjectRules } from '@ng-forge/dynamic-forms-validation';
import {
  formatFileReport,
  UI_INTEGRATIONS,
  validateFile,
  type FileValidationResult,
  type UiIntegration,
} from '@ng-forge/dynamic-forms-validation';
import { collectRelatedDocs } from './related-docs.js';

/** All valid, nothing to fix. */
export const EXIT_OK = 0;
/** Files were checked and at least one config failed validation. */
export const EXIT_INVALID_CONFIG = 1;
/** The invocation itself was wrong: bad integration name, no files matched. */
export const EXIT_USAGE = 2;

const DEFAULT_EXCLUDES = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

export interface ValidateOptions {
  /** tsconfig to resolve types with. Discovered when omitted. */
  tsconfig?: string;
  /** This CLI's own version, for the mismatch check. Injected so tests can set it. */
  cliVersion?: string;
  /** UI integration to validate against. Defaults to `material` at the CLI layer. */
  ui: string;
  /** Emit machine-readable JSON instead of a human report. */
  json: boolean;
  /** Suppress per-file success lines and the closing summary. */
  quiet: boolean;
  /**
   * Fail when the matched files contain no FormConfig at all.
   *
   * Off by default, because interactively a glob that catches unrelated files
   * is not an error. On as a CI gate, where "found nothing" and "found nothing
   * wrong" must not look the same: a refactor that moves configs somewhere the
   * extractor cannot see them would otherwise turn the gate green.
   */
  requireConfig?: boolean;
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
        // Runtime values are replaced with placeholders before validating. A
        // JSON consumer that cannot see that has no way to know the verdict
        // was reached against a substitute rather than the real value.
        extractionWarnings: c.extraction.warnings.map((w) => ({ path: w.path, issue: w.issue })),
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
    console.error(`${markFail()} Unknown UI integration ${cyan(options.ui)}. Expected one of: ${UI_INTEGRATIONS.join(', ')}`);
    return EXIT_USAGE;
  }

  // Discovered rather than asked for: an agent runs this wherever the file it is
  // editing happens to live, and has no way to know where the tsconfig is.
  const project = await discoverProject({ tsconfig: options.tsconfig });

  if (!options.json) {
    const mismatch = options.cliVersion ? versionMismatch(options.cliVersion, project.libraryVersion) : undefined;
    if (mismatch) console.error(warn(mismatch));
  }

  // Fails when the file is malformed or names a rule that does not exist, rather
  // than running with a configuration the user wrote and the tool ignored.
  let projectRules;
  try {
    projectRules = await loadProjectRules(project.packageJsonPath);
  } catch (cause) {
    console.error(`${markFail()} ${(cause as Error).message}`);
    return EXIT_USAGE;
  }

  if (!options.json && !options.quiet && projectRules.disabled.size > 0) {
    console.error(dim(`${plural(projectRules.disabled.size, 'rule')} disabled by ${displayPath(projectRules.source ?? '')}`));
  }

  const files = await resolveFiles(patterns);

  if (files.length === 0) {
    console.error(`${markFail()} No files matched: ${cyan(patterns.join(', '))}`);
    return EXIT_USAGE;
  }

  // Progress on stderr only, and only for a person: a large glob takes long
  // enough that silence reads as a hang, but stdout must stay exactly what an
  // agent is told to parse.
  const spinner = options.json || options.quiet ? undefined : startSpinner(`validating ${plural(files.length, 'file')}`);

  const results: FileValidationResult[] = [];
  try {
    for (const [index, file] of files.entries()) {
      spinner?.update(`validating ${displayPath(file)} ${dim(`(${index + 1}/${files.length})`)}`);
      results.push(await validateFile(file, uiIntegration, { disabledRules: projectRules.disabled }));
    }
  } finally {
    spinner?.stop();
  }

  if (options.json) {
    console.log(JSON.stringify(toJsonSummary(results, uiIntegration), null, 2));

    if (!results.every((r) => r.valid)) {
      return EXIT_INVALID_CONFIG;
    }
    const found = results.reduce((sum, r) => sum + r.results.length, 0);
    return options.requireConfig && found === 0 ? EXIT_INVALID_CONFIG : EXIT_OK;
  }

  const failing = results.filter((r) => !r.valid);

  for (const [index, result] of failing.entries()) {
    if (index > 0) console.log(rule());
    console.log(`${markFail()} ${bold(displayPath(result.filePath))}`);
    console.log(formatFileReport(result, { relatedDocs: collectRelatedDocs }));
    console.log('');
  }

  if (!options.quiet) {
    for (const result of results.filter((r) => r.valid && !r.noConfigsFound)) {
      const label = displayPath(result.filePath);
      console.log(`${markOk()} ${label} ${dim(`(${plural(result.results.length, 'config')})`)}`);
    }
  }

  const configsFound = results.reduce((sum, r) => sum + r.results.length, 0);

  if (configsFound === 0) {
    console.error(
      warn(`No FormConfig objects found in ${plural(files.length, 'file')}.`) +
        ` Check the pattern, or annotate configs with ${cyan('satisfies FormConfig')}.`,
    );
    return options.requireConfig ? EXIT_INVALID_CONFIG : EXIT_OK;
  }

  if (failing.length > 0) {
    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    console.error(bad(`${plural(errorCount, 'error')} across ${failing.length} of ${plural(files.length, 'file')}.`));
    return EXIT_INVALID_CONFIG;
  }

  if (!options.quiet) {
    console.log(
      `${markOk()} ${bold(plural(configsFound, 'config'))} valid across ${plural(files.length, 'file')} ${dim(`· ${uiIntegration}`)}`,
    );
  }

  return EXIT_OK;
}

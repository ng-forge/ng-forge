/**
 * Read the project's rule configuration from `.ng-forge/rules.json`.
 *
 * User-owned, never generated, and never written by the validator. A file the
 * tool rewrites is a file nobody trusts to hold their decisions.
 *
 * Every failure here is loud. A config file that silently does nothing is the
 * worst outcome: the user believes a rule is off, it is not, and nothing ever
 * says so.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { resolveDisabledRules } from './catalogue';

export const RULES_FILE = join('.ng-forge', 'rules.json');

export interface ProjectRules {
  /** Rule ids the project switched off, resolved and checked. */
  disabled: ReadonlySet<string>;
  /** Where they came from, for reporting. Absent when there is no file. */
  source?: string;
}

/** Thrown when the file exists but cannot be honoured. */
export class RulesConfigError extends Error {
  constructor(path: string, detail: string) {
    super(`[Dynamic Forms] ${path}: ${detail}`);
    this.name = 'RulesConfigError';
  }
}

/** The `errno` code of a filesystem failure, when it carries one. */
function errorCode(cause: unknown): string | undefined {
  return typeof cause === 'object' && cause !== null && 'code' in cause ? String((cause as { code: unknown }).code) : undefined;
}

/**
 * Load the rules file sitting beside the project's manifest.
 *
 * Absent is fine and means no rule is disabled. Present and malformed is not:
 * it fails, because the alternative is running with a configuration the user
 * wrote and the tool quietly ignored.
 */
export async function loadProjectRules(packageJsonPath: string | undefined): Promise<ProjectRules> {
  if (!packageJsonPath) return { disabled: new Set() };

  const path = join(dirname(packageJsonPath), RULES_FILE);

  let raw: string;
  try {
    raw = await readFile(path, 'utf-8');
  } catch (cause) {
    // Not there is the only failure that means "nothing is disabled". A file
    // that exists and cannot be read - no permission, a directory under that
    // name - is a configuration the user wrote, and treating it as absent
    // turns every rule back on without saying so.
    const code = errorCode(cause);
    if (code === 'ENOENT') return { disabled: new Set() };

    throw new RulesConfigError(path, `cannot be read (${code ?? (cause as Error).message})`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    throw new RulesConfigError(path, `not valid JSON (${(cause as Error).message})`);
  }

  if (parsed === null || typeof parsed !== 'object') {
    throw new RulesConfigError(path, 'must be a JSON object');
  }

  const disabled = (parsed as { disabled?: unknown }).disabled ?? [];

  if (!Array.isArray(disabled) || disabled.some((id) => typeof id !== 'string')) {
    throw new RulesConfigError(path, '"disabled" must be an array of rule ids');
  }

  try {
    // Throws on an id that does not exist, which is the point: a rule renamed
    // upstream must surface here rather than turning itself back on.
    return { disabled: resolveDisabledRules(disabled as string[]), source: path };
  } catch (cause) {
    throw new RulesConfigError(path, (cause as Error).message.replace('[Dynamic Forms] ', ''));
  }
}

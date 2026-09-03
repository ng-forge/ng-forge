/** Markdown reports for FormConfig validation results. */

import type { FormattedValidationError, UiIntegration, ValidationResult } from '../validate/src';
import { getFixSuggestion } from './fix-suggestions';
import type { FileValidationResult } from '../discovery/validate-file';

export interface ReportOptions {
  /**
   * Hook for appending documentation pointers derived from the errors seen.
   * The CLI points at the docs site; the MCP server points at its own lookup
   * tool. Returning an empty array omits the section.
   */
  relatedDocs?: (errors: FormattedValidationError[]) => string[];
}

/** Render the error list for one config, including fix suggestions. */
function pushErrors(lines: string[], errors: FormattedValidationError[]): void {
  for (const error of errors) {
    lines.push(`- **${error.path}:** ${error.message}`);
    const fix = getFixSuggestion(error);
    if (fix) {
      lines.push(`  - **Fix:** ${fix}`);
    }
  }
}

/** Append the related-documentation section when the hook yields anything. */
function pushRelatedDocs(lines: string[], errors: FormattedValidationError[], options?: ReportOptions): void {
  const hints = options?.relatedDocs?.(errors) ?? [];
  if (hints.length === 0) {
    return;
  }
  lines.push('### Related documentation');
  for (const hint of hints) {
    lines.push(`- ${hint}`);
  }
  lines.push('');
}

/** Format the validation report for a single source file. */
export function formatFileReport(result: FileValidationResult, options?: ReportOptions): string {
  const lines: string[] = [];

  lines.push('# Validation Report');
  lines.push('');
  lines.push(`**File:** ${result.filePath}`);
  lines.push(`**UI Integration:** ${result.uiIntegration}`);
  lines.push('');

  if (result.noConfigsFound) {
    lines.push('## No FormConfig Found');
    lines.push('');
    lines.push('Could not find any FormConfig objects in the file.');
    lines.push('');
    lines.push('**Detection methods used:**');
    lines.push('1. `satisfies FormConfig` (recommended)');
    lines.push('2. `const x: FormConfig = {...}`');
    lines.push('3. `as FormConfig`');
    lines.push('4. Structural match (object with `fields` array)');
    lines.push('');
    lines.push('**Tip:** Ensure your config has a `fields` array with objects containing `key` or `type`.');
    return lines.join('\n');
  }

  lines.push(`## Found ${result.results.length} FormConfig(s)`);
  lines.push('');

  const hasWarnings = result.results.some((r) => r.extraction.warnings.length > 0);
  if (hasWarnings) {
    lines.push('### Extraction Notes');
    lines.push('');
    lines.push('Some runtime values were replaced with placeholders:');
    lines.push('');
    for (const entry of result.results) {
      for (const warning of entry.extraction.warnings) {
        lines.push(`- **${warning.path}**: ${warning.issue}`);
      }
    }
    lines.push('');
  }

  if (result.valid) {
    lines.push('### All Configs Valid');
    lines.push('');
    for (const entry of result.results) {
      lines.push(`- **${entry.name}** (line ${entry.line}): Valid`);
    }

    // A disabled rule downgrades rather than silences, so the finding still has
    // to reach the reader. Printing "All Configs Valid" and stopping hid the
    // one thing the project asked to be told about quietly.
    const warnings = result.results.flatMap((entry) =>
      (entry.validation.errors ?? []).filter((error) => error.severity === 'warning').map((error) => ({ entry, error })),
    );

    if (warnings.length > 0) {
      lines.push('');
      lines.push(`### ${warnings.length} Warning(s)`);
      lines.push('');
      for (const { entry, error } of warnings) {
        const rule = error.ruleId ? ` (${error.ruleId}, disabled)` : '';
        lines.push(`- **${entry.name}** \`${error.path}\`${rule}: ${error.message}`);
      }
    }

    return lines.join('\n');
  }

  lines.push(`### ${result.errorCount} Error(s) Found`);
  lines.push('');

  const allErrors: FormattedValidationError[] = [];

  for (const entry of result.results) {
    if (entry.validation.valid) {
      lines.push(`#### ${entry.name} (line ${entry.line}): Valid`);
    } else {
      lines.push(`#### ${entry.name} (line ${entry.line}): Invalid`);
      lines.push('');
      if (entry.validation.errors) {
        pushErrors(lines, entry.validation.errors);
        allErrors.push(...entry.validation.errors);
      }
    }
    lines.push('');
  }

  pushRelatedDocs(lines, allErrors, options);

  return lines.join('\n');
}

/** Format the validation report for a config supplied as JSON or an object. */
export function formatConfigReport(uiIntegration: UiIntegration, validation: ValidationResult, options?: ReportOptions): string {
  const lines: string[] = [];

  lines.push('# Validation Report');
  lines.push('');
  lines.push(`**UI Integration:** ${uiIntegration}`);
  lines.push('');

  if (validation.valid) {
    lines.push('### Config Valid');
    lines.push('');
    lines.push('The configuration passes all validation checks.');
    return lines.join('\n');
  }

  const errors = validation.errors ?? [];
  lines.push(`### ${errors.length} Error(s) Found`);
  lines.push('');
  pushErrors(lines, errors);
  lines.push('');
  pushRelatedDocs(lines, errors, options);

  return lines.join('\n');
}

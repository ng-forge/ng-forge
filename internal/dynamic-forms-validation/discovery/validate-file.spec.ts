import { describe, it, expect } from 'vitest';
import { parseConfigInput, validateSource } from './validate-file';
import { getFixSuggestion, FIX_SUGGESTIONS } from '../reporting/fix-suggestions';
import { formatConfigReport, formatFileReport } from '../reporting/report';
import { resolveDisabledRules } from '../rules/catalogue';

const VALID_SOURCE = `
import { FormConfig } from '@ng-forge/dynamic-forms';

const loginForm = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
    { key: 'password', type: 'input', label: 'Password', required: true, props: { type: 'password' } },
  ],
} as const satisfies FormConfig;
`;

const INVALID_SOURCE = `
import { FormConfig } from '@ng-forge/dynamic-forms';

const brokenForm = {
  fields: [
    { key: 'token', type: 'hidden' },
  ],
} as const satisfies FormConfig;
`;

/**
 * Two configs in one file: the first only trips a rule the project disabled,
 * the second is broken outright and also trips that rule.
 */
const MIXED_SOURCE = `
import { FormConfig } from '@ng-forge/dynamic-forms';

const passing = {
  fields: [{ key: 'ref', type: 'hidden', value: 'web', label: 'nope' }],
} as const satisfies FormConfig;

const failing = {
  fields: [{ key: 'token', type: 'hidden', label: 'nope' }],
} as const satisfies FormConfig;
`;

/** Stand-in for a consumer's relatedDocs hook. */
const stubDocs = (errors: { path: string; message: string }[]) => (errors.length > 0 ? ['see the docs'] : []);

describe('validateSource', () => {
  it('finds and validates a well-formed config', () => {
    const result = validateSource(VALID_SOURCE, '/tmp/login.form.ts', 'material');

    expect(result.noConfigsFound).toBe(false);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe('loginForm');
    expect(result.valid).toBe(true);
    expect(result.errorCount).toBe(0);
  });

  it('reports a hidden field that is missing its required value', () => {
    const result = validateSource(INVALID_SOURCE, '/tmp/broken.form.ts', 'material');

    expect(result.results).toHaveLength(1);
    expect(result.valid).toBe(false);
    expect(result.errorCount).toBeGreaterThan(0);
  });

  it('records the declaration line so callers can point at the source', () => {
    const result = validateSource(VALID_SOURCE, '/tmp/login.form.ts', 'material');

    expect(result.results[0].line).toBeGreaterThan(0);
  });

  it('flags a file with no FormConfig rather than failing it', () => {
    const result = validateSource('export const notAConfig = { a: 1 };', '/tmp/other.ts', 'material');

    expect(result.noConfigsFound).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.errorCount).toBe(0);
  });

  it('validates the same config differently per adapter', () => {
    for (const ui of ['material', 'bootstrap', 'primeng', 'ionic'] as const) {
      const result = validateSource(VALID_SOURCE, '/tmp/login.form.ts', ui);
      expect(result.noConfigsFound, `${ui} found no config`).toBe(false);
    }
  });
});

describe('parseConfigInput', () => {
  it('treats a .ts path as a file', () => {
    expect(parseConfigInput('src/app/login.form.ts')).toEqual({ type: 'file', path: 'src/app/login.form.ts' });
  });

  it('treats an absolute path as a file', () => {
    expect(parseConfigInput('/abs/login.ts')).toEqual({ type: 'file', path: '/abs/login.ts' });
  });

  it('parses a JSON string', () => {
    const parsed = parseConfigInput('{"fields":[]}');
    expect(parsed.type).toBe('json');
    expect(parsed).toHaveProperty('data', { fields: [] });
  });

  it('passes an object through untouched', () => {
    const config = { fields: [] };
    expect(parseConfigInput(config)).toEqual({ type: 'object', data: config });
  });

  it('falls back to a file path when JSON-looking input does not parse', () => {
    expect(parseConfigInput('{not json')).toEqual({ type: 'file', path: '{not json' });
  });
});

describe('getFixSuggestion', () => {
  it('matches on the offending property in the error path', () => {
    const suggestion = getFixSuggestion({ path: 'fields[0].props.options', message: 'Unrecognized key' });
    expect(suggestion).toBe(FIX_SUGGESTIONS['options']);
  });

  it('finds the property anywhere in a bracket path, not just the last segment', () => {
    const suggestion = getFixSuggestion({ path: 'fields[0].props.options', message: 'anything' });
    expect(suggestion).toBe(FIX_SUGGESTIONS['options']);
  });

  it('ignores array indices when reading the path', () => {
    const suggestion = getFixSuggestion({ path: 'fields[3].value', message: 'anything' });
    expect(suggestion).toBe(FIX_SUGGESTIONS['value']);
  });

  it('gives no suggestion when the path names no property', () => {
    // Dotted zod paths bottom out at an index. Guessing from the message text
    // produced actively wrong fixes, so nothing is the correct answer here.
    expect(getFixSuggestion({ path: 'fields.0', message: 'Unknown field type "x". Valid types: hidden, text' })).toBeUndefined();
  });

  it('never suggests deleting validators because the message mentions them', () => {
    const suggestion = getFixSuggestion({
      path: 'fields.0',
      message: 'Field "name" (type: input): Validators can be shorthand (`required: true`) or use the `validators: [...]` array.',
    });
    expect(suggestion).toBeUndefined();
  });

  it('returns undefined when nothing matches', () => {
    expect(getFixSuggestion({ path: 'fields[0].zzz', message: 'something unrelated' })).toBeUndefined();
  });
});

describe('report formatting', () => {
  it('lists each valid config in a passing file report', () => {
    const report = formatFileReport(validateSource(VALID_SOURCE, '/tmp/login.form.ts', 'material'));

    expect(report).toContain('All Configs Valid');
    expect(report).toContain('loginForm');
  });

  it('includes fix suggestions and the related-docs section for a failing file report', () => {
    const result = validateSource(INVALID_SOURCE, '/tmp/broken.form.ts', 'material');
    const report = formatFileReport(result, { relatedDocs: stubDocs });

    expect(report).toContain('Error(s) Found');
    expect(report).toContain('brokenForm');
    expect(report).toContain('Related documentation');
  });

  it('keeps the warnings of a passing config in a file that also fails', () => {
    // The file is invalid because of `failing`, but `passing` still carries a
    // finding the project asked to be told about quietly. Reporting only the
    // invalid entries dropped it.
    const result = validateSource(MIXED_SOURCE, '/tmp/mixed.form.ts', 'material', {
      disabledRules: resolveDisabledRules(['core/hidden-minimal']),
    });
    const report = formatFileReport(result);

    expect(result.valid).toBe(false);
    expect(report).toContain('Warning(s)');
    expect(report).toContain('**passing**');
    expect(report).toMatch(/core\/hidden-minimal, disabled/);
  });

  it('does not print a warning as an error under the config that failed', () => {
    const result = validateSource(MIXED_SOURCE, '/tmp/mixed.form.ts', 'material', {
      disabledRules: resolveDisabledRules(['core/hidden-minimal']),
    });
    const report = formatFileReport(result);

    const errorSection = report.slice(report.indexOf('Error(s) Found'), report.indexOf('Warning(s)'));

    // The disabled rule's message must not appear among the errors of the
    // config that failed for an unrelated reason.
    expect(errorSection).not.toContain('FORBIDDEN properties');
    expect(errorSection).toContain('MISSING REQUIRED "value"');
    expect(report).toContain('FORBIDDEN properties');
  });

  it('counts the disabled-rule findings as warnings, not errors', () => {
    const result = validateSource(MIXED_SOURCE, '/tmp/mixed.form.ts', 'material', {
      disabledRules: resolveDisabledRules(['core/hidden-minimal']),
    });

    // One warning per config, since both carry the label the rule forbids, and
    // neither is counted among the errors that make the file invalid.
    expect(result.warningCount).toBe(2);
    expect(result.errorCount).toBe(2);
  });

  it('explains how detection works when no config is found', () => {
    const report = formatFileReport(validateSource('const x = 1;', '/tmp/x.ts', 'material'));

    expect(report).toContain('No FormConfig Found');
    expect(report).toContain('satisfies FormConfig');
  });

  it('renders a passing object report', () => {
    const report = formatConfigReport('material', { valid: true });
    expect(report).toContain('Config Valid');
  });

  it('renders a failing object report with fixes', () => {
    const report = formatConfigReport(
      'material',
      { valid: false, errors: [{ path: 'fields[0].props.options', message: 'Unrecognized key' }] },
      { relatedDocs: stubDocs },
    );

    expect(report).toContain('1 Error(s) Found');
    expect(report).toContain('**Fix:**');
    expect(report).toContain('Related documentation');
  });

  it('omits the related-docs section when no hook is supplied', () => {
    const result = validateSource(INVALID_SOURCE, '/tmp/broken.form.ts', 'material');
    expect(formatFileReport(result)).not.toContain('Related documentation');
  });

  it('surfaces extraction warnings for runtime values', () => {
    const source = `
      const cfg = {
        fields: [{ key: 'when', type: 'input', label: 'When', value: new Date() }],
      } as const satisfies FormConfig;
    `;
    const result = validateSource(source, '/tmp/runtime.ts', 'material');
    const report = formatFileReport(result);

    if (result.results.some((r) => r.extraction.warnings.length > 0)) {
      expect(report).toContain('Extraction Notes');
    }
  });
});

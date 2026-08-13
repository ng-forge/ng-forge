import type { ValidationError } from '@angular/forms/signals';

/** One field's current state, as reported to an agent. */
export interface FieldReport {
  /** Dotted path into the form value. */
  path: string;
  /** The field's label, when it has a static one. */
  label?: string;
  /** Currently applicable — not hidden and not disabled. */
  applicable: boolean;
  /** Required right now, including by conditional validators. */
  required: boolean;
  /** Allowed values, for fields that declare options. */
  options?: readonly unknown[];
}

/** A single validation failure, phrased for an agent to act on. */
export interface ErrorReport {
  path: string;
  message: string;
}

/** Everything `inspect` reports back. */
export interface InspectReport {
  values: unknown;
  fields: FieldReport[];
  errors: ErrorReport[];
  /** Present when async validators were skipped, so the agent knows what it did not see. */
  note?: string;
}

/**
 * Turns Signal Forms validation errors into agent-readable rows.
 *
 * Prefers the message the form config already provides (`validationMessages` /
 * `defaultValidationMessages` flow into the error's `message`), falling back to
 * the error `kind` so an untitled custom error still says something.
 *
 * @internal
 */
export function toErrorReports(errors: readonly ValidationError.WithFieldTree[], paths: Map<unknown, string>): ErrorReport[] {
  return errors.map((error) => ({
    path: paths.get(error.fieldTree) ?? '',
    message: error.message ?? String(error.kind),
  }));
}

/**
 * Renders a report as the text an agent receives.
 *
 * Plain prose rather than raw JSON: agents act on this directly, and a
 * `path: message` list is both shorter and less ambiguous than a nested object
 * for the failure case that matters most.
 *
 * @internal
 */
export function renderInspectReport(report: InspectReport): string {
  const lines: string[] = [];

  lines.push('Current values:');
  lines.push(JSON.stringify(report.values, null, 2));

  const inapplicable = report.fields.filter((field) => !field.applicable);
  if (inapplicable.length) {
    lines.push('');
    lines.push(`Not currently applicable (do not send these): ${inapplicable.map((field) => field.path).join(', ')}`);
  }

  const required = report.fields.filter((field) => field.applicable && field.required);
  if (required.length) {
    lines.push('');
    lines.push(`Required right now: ${required.map((field) => field.path).join(', ')}`);
  }

  if (report.errors.length) {
    lines.push('');
    lines.push('Validation errors:');
    for (const error of report.errors) {
      lines.push(`- ${error.path ? `${error.path}: ` : ''}${error.message}`);
    }
  } else {
    lines.push('');
    lines.push('No validation errors.');
  }

  if (report.note) {
    lines.push('');
    lines.push(report.note);
  }

  return lines.join('\n');
}

/** Renders the result of a submit attempt. */
export function renderSubmitResult(errors: ErrorReport[]): string {
  if (!errors.length) return 'Form submitted successfully.';

  const lines = ['Form was not submitted because validation failed:'];
  for (const error of errors) {
    lines.push(`- ${error.path ? `${error.path}: ` : ''}${error.message}`);
  }
  lines.push('');
  lines.push('Correct these values and call the tool again.');
  return lines.join('\n');
}

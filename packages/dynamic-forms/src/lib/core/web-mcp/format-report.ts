import type { ValidationError } from '@angular/forms/signals';
import { interpolateParams, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

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

/** Everything the `fill` tool reports back. */
export interface FormReport {
  values: unknown;
  fields: FieldReport[];
  errors: ErrorReport[];
  /** Whether this call wrote anything, so the agent knows if form state moved. */
  changed: boolean;
}

/**
 * Turns Signal Forms validation errors into agent-readable rows.
 *
 * Resolves each error against the messages the author already wrote for humans:
 * the field's own `validationMessages` first, then the form's
 * `defaultValidationMessages`, then whatever the error itself carries, and
 * finally the bare `kind` so an unlabelled custom error still says something.
 *
 * Only literal string messages are used. A `DynamicText` message (Observable or
 * Signal) resolves asynchronously per field at render time, which is not
 * available here; falling back to the kind matches how the schema builder
 * handles dynamic labels.
 *
 * @internal
 */
export function toErrorReports(
  errors: readonly ValidationError.WithFieldTree[],
  paths: Map<unknown, string>,
  messages: Map<unknown, ValidationMessages>,
  defaults: ValidationMessages | undefined,
): ErrorReport[] {
  return errors.map((error) => {
    const kind = String(error.kind);
    const fieldMessages = messages.get(error.fieldTree);
    const template =
      staticMessage(fieldMessages?.[kind as keyof ValidationMessages]) ?? staticMessage(defaults?.[kind as keyof ValidationMessages]);

    return {
      path: paths.get(error.fieldTree) ?? '',
      message: template ? interpolateParams(template, error) : (error.message ?? kind),
    };
  });
}

/** Narrows a `ValidationMessage` to a literal string, ignoring dynamic forms of it. */
function staticMessage(message: unknown): string | undefined {
  return typeof message === 'string' && message.length > 0 ? message : undefined;
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
export function renderFormReport(report: FormReport): string {
  const lines: string[] = [];

  lines.push(report.changed ? 'Values applied. Current values:' : 'No changes made. Current values:');
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

  return lines.join('\n');
}

/**
 * Renders the result of a submit attempt.
 *
 * A failure states whether form state changed, because it did: the values were
 * applied before validation ran and are still sitting in the form. Leaving the
 * agent to infer that would invite it to re-send everything from scratch.
 */
export function renderSubmitResult(errors: ErrorReport[], changed: boolean): string {
  if (!errors.length) return 'Form submitted successfully.';

  const lines = ['Not submitted: validation failed.'];
  for (const error of errors) {
    lines.push(`- ${error.path ? `${error.path}: ` : ''}${error.message}`);
  }
  lines.push('');
  lines.push(
    changed
      ? 'The values you sent were applied to the form and are still there. Send only the corrected fields and call again.'
      : 'The form was not modified. Send the corrected fields and call again.',
  );
  return lines.join('\n');
}

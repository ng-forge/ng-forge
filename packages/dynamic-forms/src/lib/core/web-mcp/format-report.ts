import type { ValidationError } from '@angular/forms/signals';
import { interpolateParams, ValidationMessages } from '@ng-forge/dynamic-forms/internal';
import type { SubmissionOutcome } from '../../utils/submission-handler/submission-outcome';
import type { FieldReport } from './collect-field-reports';

/** A single validation failure, phrased for an agent to act on. */
export interface ErrorReport {
  path: string;
  message: string;
}

/** Everything a tool call reports back. */
export interface FormReport {
  /** The values the agent is allowed to see, already scoped and redacted. */
  values: unknown;
  fields: FieldReport[];
  errors: ErrorReport[];
  /** Paths this call wrote, in the order they were given. */
  changed: readonly string[];
  /** True when async validators had not finished, so the error list is provisional. */
  validationPending: boolean;
  /** Whether `values` is the whole readable model or only what this call changed. */
  scope: 'changed' | 'all';
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
 * available here; falling back to the kind matches how the plan builder handles
 * dynamic labels.
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
 * Renders the response to arguments that never reached the form.
 *
 * Says plainly that nothing changed, because the parser rejects a bad call whole
 * rather than applying the half of it that parsed. An agent that has to guess
 * which fields landed will re-send everything, or worse, only the rest.
 *
 * @internal
 */
export function renderRejection(errors: readonly string[]): string {
  return ['Nothing was applied. The form is unchanged.', '', 'Problems with the arguments:', ...errors.map((error) => `- ${error}`)].join(
    '\n',
  );
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

  if (report.changed.length) {
    lines.push(`Applied: ${report.changed.join(', ')}.`);
    lines.push(report.scope === 'all' ? 'Current values:' : 'Current values of the fields you set:');
    lines.push(JSON.stringify(report.values, null, 2));
  } else {
    lines.push('No changes made.');
    if (report.scope === 'all') {
      lines.push('Current values:');
      lines.push(JSON.stringify(report.values, null, 2));
    }
  }

  appendFieldSections(lines, report.fields);
  appendErrorSection(lines, report.errors, report.validationPending);

  return lines.join('\n');
}

function appendFieldSections(lines: string[], fields: readonly FieldReport[]): void {
  const inapplicable = fields.filter((field) => !field.applicable);
  if (inapplicable.length) {
    lines.push('');
    lines.push(`Not currently applicable (do not send these): ${paths(inapplicable)}`);
  }

  const required = fields.filter((field) => field.applicable && field.required);
  if (required.length) {
    lines.push('');
    lines.push(`Required right now: ${paths(required)}`);
  }

  // The orientation half of the report. Naming the blanks is what a whole-model
  // dump was really being used for, and it says the same thing without handing
  // back values the agent never asked for.
  const empty = fields.filter((field) => field.applicable && field.writable && !field.filled);
  if (empty.length) {
    lines.push('');
    lines.push(`Still empty: ${paths(empty)}`);
  }

  const locked = fields.filter((field) => field.applicable && !field.writable);
  if (locked.length) {
    lines.push('');
    lines.push(`Cannot be set by an agent: ${paths(locked)}`);
  }
}

function appendErrorSection(lines: string[], errors: readonly ErrorReport[], validationPending: boolean): void {
  if (errors.length) {
    lines.push('');
    lines.push('Validation errors:');
    for (const error of errors) {
      lines.push(`- ${error.path ? `${error.path}: ` : ''}${error.message}`);
    }
  }

  // Never report "no validation errors" while validators are still running: that
  // is a claim about a result nobody has yet.
  if (validationPending) {
    lines.push('');
    lines.push('Validation has not finished — some checks are still running, so this list may be incomplete. Call again to re-read it.');
    return;
  }

  if (!errors.length) {
    lines.push('');
    lines.push('No validation errors.');
  }
}

function paths(fields: readonly FieldReport[]): string {
  return fields.map((field) => field.path).join(', ');
}

/**
 * Renders the result of a submit attempt.
 *
 * Every branch here is a real thing the submission pipeline does. Reporting
 * "submitted successfully" the moment the event is dispatched was wrong for four
 * of them: an action that rejects later, a submission skipped because async
 * validation had not resolved, one dropped because another was already running,
 * and server-side validation errors that arrive after the call.
 *
 * @internal
 */
export function renderSubmitResult(outcome: SubmissionOutcome, report: FormReport): string {
  switch (outcome.status) {
    case 'success':
      return 'Form submitted successfully.';

    case 'dispatched':
      return 'Form submitted. The page handled the submission itself, so there is no result to report back.';

    case 'server-errors':
      return renderFailure('Submitted, but it came back with errors.', report, 'Correct these and call again.');

    case 'action-failed':
      return renderFailure(
        `Not submitted: the submission failed. ${describeError(outcome.error)}`,
        report,
        'The values you sent are still in the form. This may be worth retrying.',
      );

    case 'validation-failed':
      return renderFailure('Not submitted: validation failed.', report, changedNote(report));

    case 'pending-validation':
      return renderFailure(
        'Not submitted: validation had not finished when the form was asked to submit.',
        report,
        'The values you sent are still in the form. Call again in a moment.',
      );

    case 'busy':
      return 'Not submitted: this form is already submitting. Wait for that to finish before trying again.';

    case 'cancelled':
      return 'Not submitted: the form went away before the submission finished.';
  }
}

function renderFailure(headline: string, report: FormReport, closing: string): string {
  const lines = [headline];

  for (const error of report.errors) {
    lines.push(`- ${error.path ? `${error.path}: ` : ''}${error.message}`);
  }

  lines.push('');
  lines.push(closing);
  return lines.join('\n');
}

function changedNote(report: FormReport): string {
  return report.changed.length
    ? 'The values you sent were applied to the form and are still there. Send only the corrected fields and call again.'
    : 'The form was not modified. Send the corrected fields and call again.';
}

/** Reports that an action failed without echoing an unbounded error payload. */
function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return message ? `Reason: ${message.slice(0, 200)}` : 'No reason was given.';
}

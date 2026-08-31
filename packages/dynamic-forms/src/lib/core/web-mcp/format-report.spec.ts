import { describe, expect, it } from 'vitest';
import type { FieldReport } from './collect-field-reports';
import { FormReport, renderFormReport, renderRejection, renderSubmitResult } from './format-report';

const field = (overrides: Partial<FieldReport> = {}): FieldReport => ({
  path: 'name',
  applicable: true,
  required: false,
  writable: true,
  readable: true,
  filled: true,
  ...overrides,
});

const report = (overrides: Partial<FormReport> = {}): FormReport => ({
  values: {},
  fields: [],
  errors: [],
  changed: [],
  validationPending: false,
  scope: 'changed',
  ...overrides,
});

describe('renderRejection', () => {
  it('leads with the fact that nothing was applied', () => {
    const text = renderRejection(['Unknown field "nope".']);

    expect(text.split('\n')[0]).toBe('Nothing was applied. The form is unchanged.');
    expect(text).toContain('- Unknown field "nope".');
  });

  it('lists every problem, so one round trip fixes them all', () => {
    expect(renderRejection(['first', 'second'])).toContain('- second');
  });
});

describe('renderFormReport', () => {
  it('names what it applied and shows only those values by default', () => {
    const text = renderFormReport(report({ changed: ['name'], values: { name: 'Ada' } }));

    expect(text).toContain('Applied: name.');
    expect(text).toContain('Current values of the fields you set:');
    expect(text).toContain('"name": "Ada"');
  });

  it('says nothing changed, and shows no values, for an empty call', () => {
    const text = renderFormReport(report({ values: { name: 'Ada' } }));

    expect(text).toContain('No changes made.');
    expect(text).not.toContain('Ada');
  });

  it('shows the whole model when the form opted into it', () => {
    const text = renderFormReport(report({ scope: 'all', values: { name: 'Ada' } }));

    expect(text).toContain('Current values:');
    expect(text).toContain('"name": "Ada"');
  });

  it('names inapplicable fields so the agent stops sending them', () => {
    const text = renderFormReport(report({ fields: [field({ path: 'detail', applicable: false })] }));

    expect(text).toContain('Not currently applicable (do not send these): detail');
  });

  it('names what is required right now', () => {
    const text = renderFormReport(report({ fields: [field({ required: true })] }));

    expect(text).toContain('Required right now: name');
  });

  it('names what is still empty, which is how an agent orients without the values', () => {
    const text = renderFormReport(report({ fields: [field({ filled: false })] }));

    expect(text).toContain('Still empty: name');
  });

  it('does not offer a field the agent cannot write as somewhere to write', () => {
    const text = renderFormReport(report({ fields: [field({ writable: false, filled: false })] }));

    expect(text).not.toContain('Still empty:');
    expect(text).toContain('Cannot be set by an agent: name');
  });

  it('reports no validation errors only when validation actually finished', () => {
    expect(renderFormReport(report())).toContain('No validation errors.');
  });

  it('withholds the all-clear while validators are still running', () => {
    const text = renderFormReport(report({ validationPending: true }));

    expect(text).not.toContain('No validation errors.');
    expect(text).toContain('Validation has not finished');
  });

  it('says the error list is provisional when validation is still running', () => {
    const text = renderFormReport(report({ validationPending: true, errors: [{ path: 'name', message: 'Required' }] }));

    expect(text).toContain('- name: Required');
    expect(text).toContain('may be incomplete');
  });
});

describe('renderSubmitResult', () => {
  it('confirms a clean submission', () => {
    expect(renderSubmitResult({ status: 'success' }, report())).toBe('Form submitted successfully.');
  });

  it('says plainly when the page handled the submission itself', () => {
    expect(renderSubmitResult({ status: 'dispatched' }, report())).toContain('The page handled the submission itself');
  });

  it('reports server errors as a submission that happened and came back bad', () => {
    const text = renderSubmitResult({ status: 'server-errors' }, report({ errors: [{ path: 'name', message: 'Taken' }] }));

    expect(text).toContain('Submitted, but it came back with errors.');
    expect(text).toContain('- name: Taken');
  });

  it('reports an action failure with its reason, without echoing an unbounded payload', () => {
    const text = renderSubmitResult({ status: 'action-failed', error: new Error('gateway exploded') }, report());

    expect(text).toContain('Not submitted: the submission failed.');
    expect(text).toContain('gateway exploded');
  });

  it('handles an action that rejected with something other than an Error', () => {
    expect(renderSubmitResult({ status: 'action-failed', error: 'boom' }, report())).toContain('boom');
  });

  it('says no reason was given when the rejection carried none', () => {
    expect(renderSubmitResult({ status: 'action-failed', error: { code: 500 } }, report())).toContain('No reason was given.');
  });

  it('truncates a very long failure reason', () => {
    const text = renderSubmitResult({ status: 'action-failed', error: new Error('x'.repeat(500)) }, report());

    expect(text.length).toBeLessThan(400);
  });

  it('tells the agent its values were kept when validation failed after a write', () => {
    const text = renderSubmitResult({ status: 'validation-failed' }, report({ changed: ['name'] }));

    expect(text).toContain('Not submitted: validation failed.');
    expect(text).toContain('are still there');
  });

  it('tells the agent nothing was written when validation failed on an empty call', () => {
    expect(renderSubmitResult({ status: 'validation-failed' }, report())).toContain('The form was not modified.');
  });

  it('distinguishes unfinished validation from failed validation', () => {
    const text = renderSubmitResult({ status: 'pending-validation' }, report());

    expect(text).toContain('validation had not finished');
    expect(text).toContain('Call again in a moment.');
  });

  it('tells the agent to wait rather than retry when a submission is already running', () => {
    expect(renderSubmitResult({ status: 'busy' }, report())).toContain('already submitting');
  });

  it('reports a form that went away mid-submission', () => {
    expect(renderSubmitResult({ status: 'cancelled' }, report())).toContain('went away');
  });
});

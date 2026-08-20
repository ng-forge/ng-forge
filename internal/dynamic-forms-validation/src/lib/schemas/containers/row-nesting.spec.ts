/**
 * A row accepts what a container accepts.
 *
 * `RowAllowedChildren` is a straight alias of `ContainerAllowedChildren`,
 * because a row resolves to a container at runtime. The nesting rule had kept
 * an older, narrower list that forbade nested rows and hidden fields, so three
 * sources agreed and the validator disagreed with all of them:
 *
 *   - the types alias the two together
 *   - the runtime flattens both cases (dynamic-form.component.spec.ts)
 *   - the registry documents `row` as allowed inside `row`
 *
 * Both cases are also already legal inside a `container`, which is the same
 * thing a row becomes, so rejecting them here was inconsistent on its own terms.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '../../../../validate/src';

const leaf = { key: 'firstName', type: 'input', label: 'First' };

/** Wrap children in a row, at the top level. */
const inRow = (fields: unknown[]) => ({ fields: [{ key: 'row', type: 'row', fields }] });

function errorsFor(config: unknown): string[] {
  const result = validateFormConfig('material', config as never);
  return (result.errors ?? []).map((error) => error.message);
}

describe('a row accepts the children a container accepts', () => {
  it('accepts a nested row', () => {
    expect(errorsFor(inRow([{ key: 'inner', type: 'row', fields: [leaf] }]))).toEqual([]);
  });

  it('accepts a hidden field', () => {
    expect(errorsFor(inRow([leaf, { key: 'source', type: 'hidden', value: 'web' }]))).toEqual([]);
  });

  it('accepts a hidden field inside a nested row', () => {
    const nested = { key: 'inner', type: 'row', fields: [leaf, { key: 'source', type: 'hidden', value: 'web' }] };

    expect(errorsFor(inRow([nested]))).toEqual([]);
  });
});

describe('the constraints a row keeps', () => {
  it('still rejects a page', () => {
    // Pages are top-level only, which no other source disputes.
    expect(errorsFor(inRow([{ key: 'p', type: 'page', fields: [leaf] }]))).not.toEqual([]);
  });

  it('still rejects a label on the row itself', () => {
    const config = { fields: [{ key: 'row', type: 'row', fields: [leaf], label: 'nope' }] };

    expect(errorsFor(config)).not.toEqual([]);
  });
});

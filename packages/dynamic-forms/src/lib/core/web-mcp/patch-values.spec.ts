import { describe, expect, it } from 'vitest';
import { FieldDef, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { buildFieldPlan } from './field-plan';
import { mergePatch, pickPaths, REDACTED, redactValues } from './patch-values';

const registry = new Map<string, FieldTypeDefinition>([
  ['input', { name: 'input', scope: ['text-input', 'numeric'] }],
  ['group', { name: 'group', valueHandling: 'include' }],
  ['array', { name: 'array', valueHandling: 'include' }],
]);

const planOf = (fields: unknown[]) => buildFieldPlan(fields as FieldDef<unknown>[], registry);

describe('mergePatch', () => {
  const plan = planOf([
    { key: 'first', type: 'input' },
    {
      key: 'person',
      type: 'group',
      fields: [
        { key: 'first', type: 'input' },
        { key: 'last', type: 'input' },
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'city', type: 'input' },
            { key: 'zip', type: 'input' },
          ],
        },
      ],
    },
    { key: 'tags', type: 'array', fields: [{ key: 'tag', type: 'input' }] },
  ]);

  it('replaces a scalar', () => {
    expect(mergePatch({ first: 'Ada' }, { first: 'Grace' }, plan)).toEqual({ first: 'Grace' });
  });

  it('leaves keys the patch does not mention alone', () => {
    expect(mergePatch({ first: 'Ada', tags: ['x'] }, { first: 'Grace' }, plan)).toEqual({ first: 'Grace', tags: ['x'] });
  });

  it('merges a group instead of replacing it', () => {
    const result = mergePatch({ person: { first: 'Ada', last: 'Lovelace' } }, { person: { first: 'Grace' } }, plan);

    expect(result).toEqual({ person: { first: 'Grace', last: 'Lovelace' } });
  });

  it('merges through nested groups', () => {
    const current = { person: { first: 'Ada', address: { city: 'London', zip: 'E1' } } };

    const result = mergePatch(current, { person: { address: { city: 'Paris' } } }, plan);

    expect(result).toEqual({ person: { first: 'Ada', address: { city: 'Paris', zip: 'E1' } } });
  });

  it('replaces an array whole rather than merging by index', () => {
    expect(mergePatch({ tags: ['a', 'b', 'c'] }, { tags: ['z'] }, plan)).toEqual({ tags: ['z'] });
  });

  it('creates a group that was absent from the current value', () => {
    expect(mergePatch({}, { person: { first: 'Ada' } }, plan)).toEqual({ person: { first: 'Ada' } });
  });

  it('does not mutate the value it was given', () => {
    const current = { person: { first: 'Ada', last: 'Lovelace' } };

    mergePatch(current, { person: { first: 'Grace' } }, plan);

    expect(current).toEqual({ person: { first: 'Ada', last: 'Lovelace' } });
  });
});

describe('redactValues', () => {
  it('replaces an unreadable field with a marker rather than dropping it', () => {
    const plan = planOf([
      { key: 'user', type: 'input' },
      { key: 'password', type: 'input', props: { type: 'password' } },
    ]);

    expect(redactValues({ user: 'ada', password: 'hunter2' }, plan)).toEqual({ user: 'ada', password: REDACTED });
  });

  it('redacts inside a group', () => {
    const plan = planOf([
      {
        key: 'account',
        type: 'group',
        fields: [
          { key: 'user', type: 'input' },
          { key: 'token', type: 'input', webMcp: { readable: false } },
        ],
      },
    ]);

    expect(redactValues({ account: { user: 'ada', token: 'abc' } }, plan)).toEqual({ account: { user: 'ada', token: REDACTED } });
  });

  it('redacts inside array items', () => {
    const plan = planOf([
      {
        key: 'cards',
        type: 'array',
        fields: [
          [
            { key: 'label', type: 'input' },
            { key: 'pan', type: 'input', webMcp: { readable: false } },
          ],
        ],
      },
    ]);

    const result = redactValues({ cards: [{ label: 'Visa', pan: '4111' }] }, plan);

    expect(result).toEqual({ cards: [{ label: 'Visa', pan: REDACTED }] });
  });

  it('drops keys the plan does not know about', () => {
    const plan = planOf([{ key: 'a', type: 'input' }]);

    expect(redactValues({ a: 1, stray: 2 }, plan)).toEqual({ a: 1 });
  });
});

describe('pickPaths', () => {
  it('keeps only the named top-level keys', () => {
    expect(pickPaths({ a: 1, b: 2 }, ['a'])).toEqual({ a: 1 });
  });

  it('narrows into a group without carrying its siblings', () => {
    expect(pickPaths({ person: { first: 'Ada', secret: 'x' } }, ['person.first'])).toEqual({ person: { first: 'Ada' } });
  });

  it('merges two paths into the same group', () => {
    const result = pickPaths({ person: { first: 'Ada', last: 'L', secret: 'x' } }, ['person.first', 'person.last']);

    expect(result).toEqual({ person: { first: 'Ada', last: 'L' } });
  });

  it('returns nothing for an empty path list', () => {
    expect(pickPaths({ a: 1 }, [])).toEqual({});
  });
});

import { describe, expect, it } from 'vitest';
import { FieldDef, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { buildFieldPlan } from './field-plan';
import { parseAgentInput } from './parse-agent-input';

const registry = new Map<string, FieldTypeDefinition>([
  ['input', { name: 'input', scope: ['text-input', 'numeric'] }],
  ['select', { name: 'select', scope: 'single-select' }],
  ['multiselect', { name: 'multiselect', scope: 'multi-select' }],
  ['checkbox', { name: 'checkbox', scope: 'boolean' }],
  ['group', { name: 'group', valueHandling: 'include' }],
  ['array', { name: 'array', valueHandling: 'include' }],
]);

const parse = (fields: unknown[], input: unknown, liveBlock?: (path: string) => string | undefined) =>
  parseAgentInput(buildFieldPlan(fields as FieldDef<unknown>[], registry), input, liveBlock);

const fields = [
  { key: 'name', type: 'input' },
  { key: 'age', type: 'input', props: { type: 'number' } },
  { key: 'agree', type: 'checkbox' },
  { key: 'nickname', type: 'input', nullable: true },
  { key: 'plan', type: 'select', options: [{ value: 'free' }, { value: 'pro' }, { value: 'legacy', disabled: true }] },
  { key: 'tags', type: 'multiselect', options: [{ value: 'a' }, { value: 'b' }] },
  {
    key: 'address',
    type: 'group',
    fields: [
      { key: 'city', type: 'input' },
      { key: 'zip', type: 'input' },
    ],
  },
  { key: 'lines', type: 'array', fields: [[{ key: 'sku', type: 'input' }]] },
];

describe('parseAgentInput', () => {
  describe('accepts', () => {
    it('an empty call', () => {
      expect(parse(fields, {})).toEqual({ ok: true, patch: {}, paths: [] });
    });

    it('missing arguments entirely', () => {
      expect(parse(fields, undefined)).toEqual({ ok: true, patch: {}, paths: [] });
    });

    it('a subset of correctly typed values', () => {
      const result = parse(fields, { name: 'Ada', age: 36, agree: true });

      expect(result).toEqual({ ok: true, patch: { name: 'Ada', age: 36, agree: true }, paths: ['name', 'age', 'agree'] });
    });

    it('null on a nullable field', () => {
      expect(parse(fields, { nickname: null })).toMatchObject({ ok: true });
    });

    it('a nested group patch, reporting only the leaves it set', () => {
      const result = parse(fields, { address: { city: 'London' } });

      expect(result).toEqual({ ok: true, patch: { address: { city: 'London' } }, paths: ['address.city'] });
    });

    it('an array, reporting it as one path because it is replaced whole', () => {
      const result = parse(fields, { lines: [{ sku: 'a' }, { sku: 'b' }] });

      expect(result).toEqual({ ok: true, patch: { lines: [{ sku: 'a' }, { sku: 'b' }] }, paths: ['lines'] });
    });

    it('an empty array — clearing a list is a legitimate write', () => {
      expect(parse(fields, { lines: [] })).toMatchObject({ ok: true, patch: { lines: [] } });
    });
  });

  describe('rejects', () => {
    const errorsOf = (input: unknown, liveBlock?: (path: string) => string | undefined) => {
      const result = parse(fields, input, liveBlock);
      if (result.ok) throw new Error('expected a rejection');
      return result.errors;
    };

    it('a non-object argument', () => {
      expect(errorsOf('nope')[0]).toContain('must be an object');
    });

    it('an unknown property, listing what is accepted', () => {
      const [error] = errorsOf({ nope: 1 });

      expect(error).toContain('Unknown field "nope"');
      expect(error).toContain('name');
    });

    it('a string where a number is expected', () => {
      expect(errorsOf({ age: 'thirty' })[0]).toContain('expects number but got "thirty"');
    });

    it('a number where a string is expected', () => {
      expect(errorsOf({ name: 7 })[0]).toContain('expects string but got 7');
    });

    it('null on a field that is not nullable', () => {
      expect(errorsOf({ name: null })[0]).toContain('got null');
    });

    it('a value outside the option list', () => {
      expect(errorsOf({ plan: 'enterprise' })[0]).toContain('not one of: "free", "pro"');
    });

    it('a disabled option', () => {
      expect(errorsOf({ plan: 'legacy' })[0]).toContain('not one of');
    });

    it('a bare value where a multi-select expects an array', () => {
      expect(errorsOf({ tags: 'a' })[0]).toContain('expects an array');
    });

    it('an out-of-range entry inside a multi-select', () => {
      expect(errorsOf({ tags: ['a', 'z'] })[0]).toContain('not one of');
    });

    it('a scalar where a group is expected', () => {
      expect(errorsOf({ address: 'London' })[0]).toContain('expects an object');
    });

    it('an unknown property inside a group, named by its full path', () => {
      expect(errorsOf({ address: { nope: 1 } })[0]).toContain('Unknown field "address.nope"');
    });

    it('a non-array where a list is expected', () => {
      expect(errorsOf({ lines: 'a' })[0]).toContain('expects an array');
    });

    it('a bad item inside a list, named by its index', () => {
      expect(errorsOf({ lines: [{ sku: 1 }] })[0]).toContain('lines[0].sku');
    });

    it('a field the config says agents may not write', () => {
      const result = parse([{ key: 'id', type: 'input', webMcp: { writable: false } }], { id: 'x' });

      expect(result).toMatchObject({ ok: false });
    });

    it('a field the form has blocked right now', () => {
      expect(errorsOf({ name: 'Ada' }, (path) => (path === 'name' ? 'the form has disabled it' : undefined))[0]).toContain(
        'the form has disabled it',
      );
    });

    it('every problem at once, so one round trip fixes them all', () => {
      expect(errorsOf({ nope: 1, age: 'x', plan: 'enterprise' })).toHaveLength(3);
    });

    it('the whole call — a partial patch never half-applies', () => {
      const result = parse(fields, { name: 'Ada', age: 'thirty' });

      expect(result).toMatchObject({ ok: false });
      expect(result).not.toHaveProperty('patch');
    });
  });
});

describe('parseAgentInput edge cases', () => {
  const errorsOf = (defs: unknown[], input: unknown) => {
    const result = parse(defs, input);
    if (result.ok) throw new Error('expected a rejection');
    return result.errors;
  };

  it('treats an explicit null argument object as an empty call', () => {
    expect(parse(fields, null)).toEqual({ ok: true, patch: {}, paths: [] });
  });

  it('rejects an array where an argument object is expected', () => {
    expect(errorsOf(fields, [{ name: 'Ada' }])[0]).toContain('must be an object');
  });

  it('rejects a number where an argument object is expected', () => {
    expect(errorsOf(fields, 42)[0]).toContain('must be an object');
  });

  it('names the object it got rather than echoing it back', () => {
    expect(errorsOf(fields, { name: { nested: true } })[0]).toContain('an object');
  });

  it('names an array it got rather than echoing it back', () => {
    expect(errorsOf(fields, { name: [1, 2, 3] })[0]).toContain('an array');
  });

  it('does not echo a long string back in the error', () => {
    const long = 'x'.repeat(200);
    const [error] = errorsOf(fields, { age: long });

    expect(error).toContain('a long string');
    expect(error).not.toContain(long);
  });

  it('reports undefined as undefined rather than as a missing key', () => {
    expect(errorsOf(fields, { name: undefined })[0]).toContain('undefined');
  });

  it('rejects a non-object item inside an object array', () => {
    expect(errorsOf(fields, { lines: ['not an object'] })[0]).toContain('expects an object');
  });

  it('refuses a list whose item shape could not be derived', () => {
    // A heterogeneous array has no describable item, so there is nothing to
    // validate a write against.
    const mixed = [
      {
        key: 'mixed',
        type: 'array',
        fields: [
          { key: 'a', type: 'input' },
          { key: 'b', type: 'checkbox' },
        ],
      },
    ];

    expect(errorsOf(mixed, { mixed: [] })[0]).toContain('cannot be set');
  });

  it('keeps a group out of the patch entirely when one of its leaves fails', () => {
    const result = parse(fields, { address: { city: 'London', zip: 7 } });

    expect(result).toMatchObject({ ok: false });
    expect(result).not.toHaveProperty('patch');
  });

  it('reports a nested group failure with its full path', () => {
    expect(errorsOf(fields, { address: { zip: 7 } })[0]).toContain('"address.zip"');
  });

  it('accepts a group patch that names no keys', () => {
    expect(parse(fields, { address: {} })).toEqual({ ok: true, patch: { address: {} }, paths: [] });
  });

  it('lists the writable siblings when a group gets an unknown key', () => {
    const [error] = errorsOf(fields, { address: { nope: 1 } });

    expect(error).toContain('city');
    expect(error).toContain('zip');
  });

  it('says a form accepts nothing when every field is closed to agents', () => {
    const closed = [{ key: 'secret', type: 'input', webMcp: false }];

    expect(errorsOf(closed, { anything: 1 })[0]).toContain('no writable fields');
  });

  it('accepts an empty multi-select selection', () => {
    expect(parse(fields, { tags: [] })).toMatchObject({ ok: true, patch: { tags: [] } });
  });

  it('reports the first bad entry in a multi-select rather than all of them', () => {
    expect(errorsOf(fields, { tags: ['z', 'y'] })).toHaveLength(1);
  });
});

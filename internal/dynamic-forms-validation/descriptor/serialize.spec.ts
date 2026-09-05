import { describe, it, expect } from 'vitest';
import { DESCRIPTOR_FORMAT_VERSION, type Descriptor } from './descriptor.types';
import { serializeDescriptor, parseDescriptor, DescriptorFormatError, acceptedFieldTypeNames, resolveCanonicalName } from './serialize';

function descriptor(overrides: Partial<Descriptor> = {}): Descriptor {
  return {
    formatVersion: DESCRIPTOR_FORMAT_VERSION,
    generator: { name: '@ng-forge/dynamic-forms-validation', version: '1.1.0' },
    adapter: { id: 'material', package: '@ng-forge/dynamic-forms-material', version: '1.1.0' },
    fieldTypes: {
      input: {
        kind: 'leaf',
        canonical: 'input',
        aliases: [],
        fieldLevel: { key: { required: true, type: { kind: 'string' } } },
        props: { policy: 'strip', keys: {} },
      },
      'add-array-item': {
        kind: 'leaf',
        canonical: 'add-array-item',
        aliases: ['addArrayItem'],
        fieldLevel: { key: { required: true, type: { kind: 'string' } } },
      },
    },
    objects: {},
    unresolved: [],
    ...overrides,
  };
}

describe('serializeDescriptor', () => {
  it('produces identical bytes regardless of key insertion order', () => {
    // The diff is the review artifact. If output depends on extraction order,
    // every regeneration churns and reviewers learn to skip the file.
    const a = descriptor();
    const b: Descriptor = {
      unresolved: [],
      objects: {},
      fieldTypes: {
        'add-array-item': a.fieldTypes['add-array-item'],
        input: a.fieldTypes['input'],
      },
      adapter: a.adapter,
      generator: a.generator,
      formatVersion: a.formatVersion,
    };

    expect(serializeDescriptor(b)).toBe(serializeDescriptor(a));
  });

  it('ends with exactly one newline', () => {
    const text = serializeDescriptor(descriptor());
    expect(text.endsWith('}\n')).toBe(true);
    expect(text.endsWith('\n\n')).toBe(false);
  });

  it('omits undefined rather than emitting null', () => {
    // `props` is optional; a null would read as "declared, empty".
    const text = serializeDescriptor(descriptor());
    expect(text).not.toContain('null');
  });

  it('round-trips through parseDescriptor', () => {
    const original = descriptor();
    expect(parseDescriptor(serializeDescriptor(original))).toEqual(original);
  });
});

describe('parseDescriptor', () => {
  it('accepts the current format version', () => {
    expect(() => parseDescriptor(serializeDescriptor(descriptor()))).not.toThrow();
  });

  it('refuses a newer major version instead of ignoring fields it cannot read', () => {
    // Reading a 2.x descriptor with a 1.x reader silently drops constraints,
    // which loosens the validator while everything appears to work.
    const text = serializeDescriptor(descriptor({ formatVersion: '2.0' }));

    expect(() => parseDescriptor(text)).toThrow(DescriptorFormatError);
    expect(() => parseDescriptor(text)).toThrow(/not readable by this build/);
  });

  it('accepts a newer minor version, which is additive by definition', () => {
    expect(() => parseDescriptor(serializeDescriptor(descriptor({ formatVersion: '1.7' })))).not.toThrow();
  });

  it('rejects a missing format version', () => {
    expect(() => parseDescriptor(JSON.stringify({ fieldTypes: {} }))).toThrow(/missing a string formatVersion/);
  });

  it('rejects malformed JSON with a useful message', () => {
    expect(() => parseDescriptor('{ not json')).toThrow(/not valid JSON/);
  });

  it('rejects a JSON value that is not an object', () => {
    expect(() => parseDescriptor('42')).toThrow(/must be a JSON object/);
  });
});

describe('acceptedFieldTypeNames', () => {
  it('includes canonical names and aliases', () => {
    expect(acceptedFieldTypeNames(descriptor())).toEqual(['add-array-item', 'addArrayItem', 'input']);
  });

  it('does not duplicate a name that is both canonical and aliased elsewhere', () => {
    const names = acceptedFieldTypeNames(descriptor());
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('resolveCanonicalName', () => {
  it('returns a canonical name unchanged', () => {
    expect(resolveCanonicalName(descriptor(), 'input')).toBe('input');
  });

  it('maps an alias to its canonical name', () => {
    expect(resolveCanonicalName(descriptor(), 'addArrayItem')).toBe('add-array-item');
  });

  it('returns undefined for an unknown name', () => {
    expect(resolveCanonicalName(descriptor(), 'acme-currency')).toBeUndefined();
  });

  it('resolves every accepted name to a field type that exists', () => {
    // The alias round-trip safeguard: an alias pointing at nothing would make
    // the validator accept a name it cannot then describe.
    const d = descriptor();
    for (const name of acceptedFieldTypeNames(d)) {
      const canonical = resolveCanonicalName(d, name);
      expect(canonical, `${name} resolves to nothing`).toBeDefined();
      expect(d.fieldTypes[canonical!], `${name} resolves to a missing field type`).toBeDefined();
    }
  });
});

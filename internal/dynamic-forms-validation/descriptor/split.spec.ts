import { describe, it, expect } from 'vitest';
import { DESCRIPTOR_FORMAT_VERSION, type Descriptor } from './descriptor.types';
import { splitDescriptor, joinDescriptor, DescriptorMismatchError } from './split';
import { serializeDescriptor } from './serialize';

function descriptor(overrides: Partial<Descriptor> = {}): Descriptor {
  return {
    formatVersion: DESCRIPTOR_FORMAT_VERSION,
    generator: { name: 'g', version: '1.1.0' },
    adapter: { id: 'material', package: '@ng-forge/dynamic-forms-material', version: '1.1.0' },
    fieldTypes: {
      input: {
        kind: 'leaf',
        canonical: 'input',
        aliases: [],
        fieldLevel: { key: { required: true, type: { kind: 'string' } } },
        props: { policy: 'strip', keys: { appearance: { required: false, type: { kind: 'enum', values: ['fill', 'outline'] } } } },
      },
      text: {
        kind: 'leaf',
        canonical: 'text',
        aliases: [],
        fieldLevel: { key: { required: true, type: { kind: 'string' } } },
        props: { policy: 'strip', keys: {} },
      },
    },
    objects: { FieldOption: { policy: 'passthrough', keys: {} } },
    unresolved: [
      { path: 'input.props.hint', reason: 'callable', fallback: 'passthrough' },
      { path: 'input.logic[]', reason: 'union', fallback: 'passthrough' },
    ],
    ...overrides,
  };
}

describe('splitDescriptor', () => {
  it('keeps field-level shape in core and props in the adapter', () => {
    const { core, adapter } = splitDescriptor(descriptor());

    expect(core.fieldTypes['input'].fieldLevel['key']).toBeDefined();
    expect(core.fieldTypes['input']).not.toHaveProperty('props');
    expect(adapter.props['input'].keys['appearance']).toBeDefined();
  });

  it('keeps an entry for a props object the adapter adds no keys to', () => {
    // "takes props, this adapter adds none" and "takes no props at all" are
    // different claims. Collapsing them makes the round trip lossy.
    const { adapter } = splitDescriptor(descriptor());

    expect(adapter.props['text']).toEqual({ policy: 'strip', keys: {} });
  });

  it('attributes a props degradation to the adapter, not to core', () => {
    // Left in core, one adapter's unresolved prop would be reported against
    // every adapter, including ones where the property does not exist.
    const { core, adapter } = splitDescriptor(descriptor());

    expect(adapter.unresolved.map((u) => u.path)).toEqual(['input.props.hint']);
    expect(core.unresolved.map((u) => u.path)).toEqual(['input.logic[]']);
  });

  it('carries provenance on the adapter half', () => {
    const { adapter } = splitDescriptor(descriptor());
    expect(adapter.adapter.package).toBe('@ng-forge/dynamic-forms-material');
  });

  it('is smaller than the whole for the half that repeats', () => {
    const whole = descriptor();
    const { core, adapter } = splitDescriptor(whole);

    expect(serializeDescriptor(adapter as never).length).toBeLessThan(serializeDescriptor(whole).length);
    expect(serializeDescriptor(core as never).length).toBeLessThan(serializeDescriptor(whole).length);
  });
});

describe('joinDescriptor', () => {
  it('round-trips a split descriptor unchanged, in full', () => {
    // Compared whole, deliberately. An earlier version of this test checked one
    // field type and excused the rest, which hid a round trip that lost `props`
    // from every type the adapter added no keys to.
    const original = descriptor();
    const { core, adapter } = splitDescriptor(original);

    // `unresolved` comes back in a stable sorted order, which is what the
    // committed artifact needs, so compare against the sorted original.
    expect(joinDescriptor(core, adapter)).toEqual({
      ...original,
      unresolved: [...original.unresolved].sort((a, b) => (a.path < b.path ? -1 : 1)),
    });
  });

  it('refuses halves generated at different format versions', () => {
    const { core, adapter } = splitDescriptor(descriptor());
    const stale = { ...core, formatVersion: '2.0' };

    expect(() => joinDescriptor(stale, adapter)).toThrow(DescriptorMismatchError);
    expect(() => joinDescriptor(stale, adapter)).toThrow(/Regenerate both together/);
  });

  it('refuses adapter props for a field type core does not define', () => {
    // Dropping them silently would leave the adapter claiming to configure a
    // field type that cannot exist.
    const { core, adapter } = splitDescriptor(descriptor());
    const orphaned = { ...adapter, props: { ...adapter.props, 'acme-currency': { policy: 'strip' as const, keys: {} } } };

    expect(() => joinDescriptor(core, orphaned)).toThrow(/core does not define: acme-currency/);
  });

  it('restores an empty props object rather than dropping it', () => {
    const { core, adapter } = splitDescriptor(descriptor());
    const rejoined = joinDescriptor(core, adapter);

    expect(rejoined.fieldTypes['text'].props).toEqual({ policy: 'strip', keys: {} });
  });
});

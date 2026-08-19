/**
 * Split a whole descriptor into its adapter-independent half and one adapter's
 * contribution, and put them back together again.
 *
 * Measured on the real packages: the field-level half is byte-identical across
 * adapters for all 26 field types, and only `props` differs. Committing four
 * copies of the identical half costs 433 KB where the split costs 132 KB, and
 * more importantly it means a change to a shared field type rewrites four files
 * instead of one — a diff nobody reads is not a review artifact.
 *
 * The split is the same seam the skills use: core carries field types and rules,
 * each adapter carries only its own `props`.
 */

import type {
  AdapterDescriptor,
  CoreDescriptor,
  Descriptor,
  DescriptorFieldType,
  DescriptorObject,
  UnresolvedEntry,
} from './descriptor.types';

/**
 * Stable order for `unresolved`.
 *
 * Serialisation sorts object keys but cannot sort an array, so without this the
 * committed artifact would depend on extraction order and on which half an entry
 * came from. Same reasoning as sorting keys: the diff has to reflect content.
 */
function byPath(entries: readonly UnresolvedEntry[]): UnresolvedEntry[] {
  return [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** True when an unresolved entry describes something inside a `props` object. */
function isPropsEntry(entry: UnresolvedEntry): boolean {
  return entry.path.includes('.props.');
}

export interface SplitDescriptor {
  core: CoreDescriptor;
  adapter: AdapterDescriptor;
}

/**
 * Separate the halves.
 *
 * `unresolved` is divided the same way: an entry about a `props` key belongs to
 * the adapter that declared it, everything else to core. Leaving them all in core
 * would attribute one adapter's degradation to every adapter.
 */
export function splitDescriptor(descriptor: Descriptor): SplitDescriptor {
  const fieldTypes: Record<string, Omit<DescriptorFieldType, 'props'>> = {};
  const props: Record<string, DescriptorObject> = {};

  for (const [name, fieldType] of Object.entries(descriptor.fieldTypes)) {
    const { props: fieldProps, ...rest } = fieldType;
    fieldTypes[name] = rest;

    // Every field type that HAS a props object gets an entry, even when this
    // adapter adds no keys to it. Dropping the empty ones loses the difference
    // between "takes props, none added here" and "takes no props at all", and
    // makes the round trip lossy for every such type.
    if (fieldProps) props[name] = fieldProps;
  }

  return {
    core: {
      formatVersion: descriptor.formatVersion,
      generator: descriptor.generator,
      fieldTypes,
      objects: descriptor.objects,
      unresolved: byPath(descriptor.unresolved.filter((entry) => !isPropsEntry(entry))),
    },
    adapter: {
      formatVersion: descriptor.formatVersion,
      generator: descriptor.generator,
      adapter: descriptor.adapter,
      props,
      unresolved: byPath(descriptor.unresolved.filter(isPropsEntry)),
    },
  };
}

/** Thrown when the two halves cannot be read together. */
export class DescriptorMismatchError extends Error {
  constructor(message: string) {
    super(`[Dynamic Forms] ${message}`);
    this.name = 'DescriptorMismatchError';
  }
}

/**
 * Rejoin the halves into a whole descriptor.
 *
 * Refuses a format mismatch rather than merging across versions: the halves are
 * shipped and installed separately, so nothing else guarantees they were
 * generated together, and a silent merge would produce a descriptor that
 * describes neither release.
 */
export function joinDescriptor(core: CoreDescriptor, adapter: AdapterDescriptor): Descriptor {
  if (core.formatVersion !== adapter.formatVersion) {
    throw new DescriptorMismatchError(
      `core descriptor is format ${core.formatVersion} but the ${adapter.adapter.id} adapter descriptor is format ${adapter.formatVersion}. Regenerate both together.`,
    );
  }

  const fieldTypes: Record<string, DescriptorFieldType> = {};
  for (const [name, fieldType] of Object.entries(core.fieldTypes)) {
    const fieldProps = adapter.props[name];
    fieldTypes[name] = fieldProps ? { ...fieldType, props: fieldProps } : fieldType;
  }

  // Props for a field type core does not know about would be silently dropped,
  // leaving the adapter claiming to configure something that cannot exist.
  const orphaned = Object.keys(adapter.props).filter((name) => !core.fieldTypes[name]);
  if (orphaned.length > 0) {
    throw new DescriptorMismatchError(
      `the ${adapter.adapter.id} adapter descriptor has props for field type(s) core does not define: ${orphaned.join(', ')}. Regenerate both together.`,
    );
  }

  return {
    formatVersion: core.formatVersion,
    generator: adapter.generator,
    adapter: adapter.adapter,
    fieldTypes,
    objects: core.objects,
    unresolved: byPath([...core.unresolved, ...adapter.unresolved]),
  };
}

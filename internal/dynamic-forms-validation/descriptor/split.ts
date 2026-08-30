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
import { majorOf } from './serialize';

/**
 * Stable order for `unresolved`.
 *
 * Serialisation sorts object keys but cannot sort an array, so without this the
 * committed artifact would depend on extraction order and on which half an entry
 * came from. Same reasoning as sorting keys: the diff has to reflect content.
 */
function byReason(entries: readonly UnresolvedEntry[]): UnresolvedEntry[] {
  return [...entries].sort((a, b) => (a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0));
}

/**
 * Divide one grouped entry between the halves.
 *
 * An entry's paths can straddle both: the same union is often unresolved on a
 * field-level key and inside `props`. Assigning the whole entry to one side
 * would either hide a degradation or attribute one adapter's to every adapter,
 * so the paths are split and the reason kept on whichever halves need it.
 */
function partitionByProps(entries: readonly UnresolvedEntry[]): { core: UnresolvedEntry[]; adapter: UnresolvedEntry[] } {
  const core: UnresolvedEntry[] = [];
  const adapter: UnresolvedEntry[] = [];

  for (const entry of entries) {
    const propsPaths = entry.paths.filter((path) => path.includes('.props.'));
    const corePaths = entry.paths.filter((path) => !path.includes('.props.'));

    if (corePaths.length > 0) core.push({ ...entry, paths: corePaths });
    if (propsPaths.length > 0) adapter.push({ ...entry, paths: propsPaths });
  }

  return { core, adapter };
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
  const unresolved = partitionByProps(descriptor.unresolved);

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
      unresolved: byReason(unresolved.core),
    },
    adapter: {
      formatVersion: descriptor.formatVersion,
      generator: descriptor.generator,
      adapter: descriptor.adapter,
      props,
      unresolved: byReason(unresolved.adapter),
    },
  };
}

/** Rejoin entries the split may have divided, so the whole matches the original. */
function mergeUnresolved(...halves: ReadonlyArray<readonly UnresolvedEntry[]>): UnresolvedEntry[] {
  const byReasonText = new Map<string, string[]>();

  for (const half of halves) {
    for (const entry of half) {
      const paths = byReasonText.get(entry.reason) ?? [];
      paths.push(...entry.paths);
      byReasonText.set(entry.reason, paths);
    }
  }

  return [...byReasonText.entries()]
    .map(([reason, paths]) => ({ reason, fallback: 'passthrough' as const, paths: [...paths].sort() }))
    .sort((a, b) => (a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0));
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
 * Refuses an incompatible format rather than merging across versions: the halves
 * are shipped and installed separately, so nothing else guarantees they were
 * generated together, and a silent merge would produce a descriptor that
 * describes neither release.
 *
 * Compatibility is the major only, matching what `parseDescriptor` accepts. Core
 * ships in @ng-forge/dynamic-forms and props in the adapter package, so an exact
 * comparison hard-failed a combination the format contract calls compatible as
 * soon as one of the two took a minor bump.
 */
export function joinDescriptor(core: CoreDescriptor, adapter: AdapterDescriptor): Descriptor {
  if (majorOf(core.formatVersion) !== majorOf(adapter.formatVersion)) {
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
    unresolved: mergeUnresolved(core.unresolved, adapter.unresolved),
  };
}

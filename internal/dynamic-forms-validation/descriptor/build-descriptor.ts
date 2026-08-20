/**
 * Assemble a complete descriptor for one adapter.
 *
 * Combines registry resolution (names, aliases, kinds) with shape extraction
 * (field-level keys, props, structural properties) and records everything that
 * degraded along the way.
 */

import { resolveRegistry, type RegistryFailure, type ResolveRegistryOptions } from './extract-registry';
import { describeFieldLevel, describeProps, describeStructural, type RawUnresolved, type ShapeContext } from './extract-shape';
import { unmappedNarrowingCandidates } from './narrowing';
import {
  DESCRIPTOR_FORMAT_VERSION,
  type Descriptor,
  type DescriptorFieldType,
  type DescriptorObject,
  type DescriptorProperty,
  type UnresolvedEntry,
} from './descriptor.types';

/**
 * Collapse per-path degradations into one entry per distinct reason.
 *
 * The same few config shapes are unresolved across most field types, so listing
 * them per path restated the same long union text dozens of times. Sorted so the
 * committed artifact does not depend on traversal order.
 */
function groupUnresolved(raw: readonly RawUnresolved[]): UnresolvedEntry[] {
  const byReason = new Map<string, string[]>();

  for (const entry of raw) {
    const paths = byReason.get(entry.reason) ?? [];
    paths.push(entry.path);
    byReason.set(entry.reason, paths);
  }

  return [...byReason.entries()]
    .map(([reason, paths]) => ({ reason, fallback: 'passthrough' as const, paths: [...paths].sort() }))
    .sort((a, b) => (a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0));
}

/** Name of the hoisted shared field-level shape. */
const BASE_OBJECT = 'BaseFieldProperties';

/**
 * Hoist field-level properties that every field type declares identically.
 *
 * Field types inherit a large common base, so without this the same three dozen
 * keys repeat on every type: the artifact bloats, and any change to a base
 * property rewrites every block in the diff.
 */
function hoistCommonFieldLevel(fieldTypes: Record<string, DescriptorFieldType>): {
  fieldTypes: Record<string, DescriptorFieldType>;
  base?: DescriptorObject;
} {
  const names = Object.keys(fieldTypes);
  if (names.length < 2) return { fieldTypes };

  const [first, ...rest] = names;
  const shared: Record<string, DescriptorProperty> = {};

  for (const [key, property] of Object.entries(fieldTypes[first].fieldLevel)) {
    const serialised = JSON.stringify(property);
    const inAll = rest.every((name) => JSON.stringify(fieldTypes[name].fieldLevel[key]) === serialised);
    if (inAll) shared[key] = property;
  }

  if (Object.keys(shared).length === 0) return { fieldTypes };

  const reduced: Record<string, DescriptorFieldType> = {};
  for (const [name, fieldType] of Object.entries(fieldTypes)) {
    const own = Object.fromEntries(Object.entries(fieldType.fieldLevel).filter(([key]) => !(key in shared)));
    reduced[name] = { ...fieldType, extends: BASE_OBJECT, fieldLevel: own };
  }

  return { fieldTypes: reduced, base: { policy: 'strip', keys: shared } };
}

export interface BuildDescriptorOptions extends ResolveRegistryOptions {
  adapterId: string;
  adapterVersion: string;
  generator: { name: string; version: string };
  /**
   * Fail when a non-serializable type has no narrowing entry.
   *
   * True for ng-forge's own adapters: an unmapped runtime type there is a
   * regression in a descriptor we ship. False for a consumer's custom adapter,
   * where we have never seen their types and failing would make the feature
   * unusable — those degrade to opaque and are recorded instead.
   */
  strictNarrowing: boolean;
}

export type BuildFailure = RegistryFailure | { kind: 'unmapped-non-serializable'; adapterPackage: string; detail: string };

export type BuildResult = { ok: true; descriptor: Descriptor; unresolved: UnresolvedEntry[] } | { ok: false; failure: BuildFailure };

export function buildDescriptor(options: BuildDescriptorOptions): BuildResult {
  const registry = resolveRegistry(options);
  if (!registry.ok) return { ok: false, failure: registry.failure };

  const unresolved: RawUnresolved[] = [];
  const encountered = new Set<string>();
  const fieldTypes: Record<string, DescriptorFieldType> = {};
  // Shared across every field type, so a config shape such as `logic` is
  // described once and referenced rather than repeated on each of twenty types.
  const objects: Record<string, DescriptorObject> = {};

  for (const entry of registry.entries) {
    const at = entry.at;
    const context: ShapeContext = { path: entry.canonical, unresolved, encountered, objects };
    const props = describeProps(entry.type, at, context);

    fieldTypes[entry.canonical] = {
      kind: entry.kind,
      canonical: entry.canonical,
      aliases: entry.aliases,
      fieldLevel: { ...describeFieldLevel(entry.type, at, context), ...describeStructural(entry.type, at, context) },
      ...(props ? { props } : {}),
    };
  }

  if (options.strictNarrowing) {
    const unmapped = unmappedNarrowingCandidates(encountered);
    if (unmapped.length > 0) {
      return {
        ok: false,
        failure: {
          kind: 'unmapped-non-serializable',
          adapterPackage: options.adapterPackage,
          detail:
            `${unmapped.length} type(s) mix serializable and non-serializable arms but have no narrowing entry: ${unmapped.join(', ')}. ` +
            `Add them to NARROWING_TABLE with the arm that survives, or the descriptor would quietly stop constraining a property it could constrain.`,
        },
      };
    }
  }

  const hoisted = hoistCommonFieldLevel(fieldTypes);
  const grouped = groupUnresolved(unresolved);

  return {
    ok: true,
    unresolved: grouped,
    descriptor: {
      formatVersion: DESCRIPTOR_FORMAT_VERSION,
      generator: options.generator,
      adapter: { id: options.adapterId, package: options.adapterPackage, version: options.adapterVersion },
      fieldTypes: hoisted.fieldTypes,
      objects: hoisted.base ? { ...objects, [BASE_OBJECT]: hoisted.base } : objects,
      unresolved: grouped,
    },
  };
}

/**
 * Deterministic serialisation and guarded reading for the type descriptor.
 *
 * The descriptor is committed and reviewed as a diff, so byte-for-byte
 * stability matters: an artifact whose key order depends on extraction order
 * produces noise that trains reviewers to skip it, which defeats the reason for
 * committing it at all.
 */

import { DESCRIPTOR_FORMAT_VERSION, type AdapterDescriptor, type CoreDescriptor, type Descriptor } from './descriptor.types';

/** Recursively sort object keys so output depends on content, not insertion order. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

    return Object.fromEntries(entries.map(([k, v]) => [k, sortKeys(v)]));
  }

  return value;
}

/**
 * Deterministic order for enum members.
 *
 * TypeScript returns union arms in its own order, which is stable for a given
 * compiler but is not something a committed artifact should depend on. Sorting
 * by kind then value keeps the diff meaningful across versions.
 *
 * Lives here beside `sortKeys` because it is the same concern, and it is shared
 * so an enum built by extraction and one built by narrowing cannot end up with
 * two different orderings of the same concept.
 */
export function sortEnumValues(values: readonly (string | number | boolean)[]): (string | number | boolean)[] {
  return [...values].sort((a, b) => {
    if (typeof a !== typeof b) return typeof a < typeof b ? -1 : 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
  });
}

/** Serialise to the exact bytes that belong on disk, newline-terminated. */
export function serializeDescriptor(descriptor: Descriptor): string {
  return `${JSON.stringify(sortKeys(descriptor), null, 2)}\n`;
}

/** Thrown when a descriptor cannot be read, rather than read incorrectly. */
export class DescriptorFormatError extends Error {
  constructor(message: string) {
    super(`[Dynamic Forms] ${message}`);
    this.name = 'DescriptorFormatError';
  }
}

/**
 * The half of the format version that decides compatibility.
 *
 * A minor bump adds fields an older reader can ignore; a major one changes what
 * the existing fields mean. Everything that compares two format versions goes
 * through this, so the contract is stated once.
 */
export function majorOf(version: string): string {
  return version.split('.')[0] ?? '';
}

/**
 * Parse and version-check, without deciding which half was read.
 *
 * Refusing an unreadable version is the point. Reading a newer descriptor with
 * an older reader means silently ignoring fields that constrain validation,
 * which loosens the validator without anything appearing to go wrong.
 */
function parseChecked(text: string): Record<string, unknown> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (cause) {
    throw new DescriptorFormatError(`descriptor is not valid JSON: ${(cause as Error).message}`);
  }

  if (raw === null || typeof raw !== 'object') {
    throw new DescriptorFormatError('descriptor must be a JSON object');
  }

  const version = (raw as { formatVersion?: unknown }).formatVersion;
  if (typeof version !== 'string') {
    throw new DescriptorFormatError('descriptor is missing a string formatVersion');
  }

  if (majorOf(version) !== majorOf(DESCRIPTOR_FORMAT_VERSION)) {
    throw new DescriptorFormatError(
      `descriptor format ${version} is not readable by this build, which understands ${DESCRIPTOR_FORMAT_VERSION}. Upgrade @ng-forge/dynamic-forms-cli.`,
    );
  }

  return raw as Record<string, unknown>;
}

/** Read a whole descriptor, refusing any format version this build does not understand. */
export function parseDescriptor(text: string): Descriptor {
  const raw = parseChecked(text);

  if (typeof raw['fieldTypes'] !== 'object' || raw['fieldTypes'] === null) {
    throw new DescriptorFormatError('descriptor has no fieldTypes object');
  }

  return raw as unknown as Descriptor;
}

/**
 * Read the adapter-independent half.
 *
 * The two halves ship in different packages and are read from different files,
 * so the caller always knows which one it asked for. Saying so here is what
 * removes the double cast at every call site, and it catches the one mistake
 * that matters: reading an adapter file as core, or the reverse, which would
 * otherwise surface much later as a descriptor with no field types.
 */
export function parseCoreDescriptor(text: string): CoreDescriptor {
  const raw = parseChecked(text);

  if (typeof raw['fieldTypes'] !== 'object' || raw['fieldTypes'] === null) {
    throw new DescriptorFormatError('core descriptor has no fieldTypes object; this looks like an adapter descriptor');
  }

  return raw as unknown as CoreDescriptor;
}

/** Read one adapter's half. See {@link parseCoreDescriptor}. */
export function parseAdapterDescriptor(text: string): AdapterDescriptor {
  const raw = parseChecked(text);

  if (typeof raw['props'] !== 'object' || raw['props'] === null) {
    throw new DescriptorFormatError('adapter descriptor has no props object; this looks like a core descriptor');
  }

  return raw as unknown as AdapterDescriptor;
}

/**
 * Every accepted spelling of every field type, canonical names and aliases.
 *
 * This is what an "unknown field type" message should list. Deriving it here
 * keeps the message and the contract from drifting, which is the failure phase 0
 * fixed for the hand-written schemas.
 */
export function acceptedFieldTypeNames(descriptor: Descriptor): string[] {
  const names = new Set<string>();

  for (const [canonical, fieldType] of Object.entries(descriptor.fieldTypes)) {
    names.add(canonical);
    for (const alias of fieldType.aliases) names.add(alias);
  }

  return [...names].sort();
}

/**
 * Normalise a spelling to its canonical name, or undefined when unknown.
 *
 * Aliases exist in the type registry but not in the schemas, so normalisation is
 * an explicit descriptor-driven step rather than an incidental rewrite.
 */
export function resolveCanonicalName(descriptor: Descriptor, name: string): string | undefined {
  if (descriptor.fieldTypes[name]) return name;

  for (const [canonical, fieldType] of Object.entries(descriptor.fieldTypes)) {
    if (fieldType.aliases.includes(name)) return canonical;
  }

  return undefined;
}

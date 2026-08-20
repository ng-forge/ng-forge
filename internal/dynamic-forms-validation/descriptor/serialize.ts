/**
 * Deterministic serialisation and guarded reading for the type descriptor.
 *
 * The descriptor is committed and reviewed as a diff, so byte-for-byte
 * stability matters: an artifact whose key order depends on extraction order
 * produces noise that trains reviewers to skip it, which defeats the reason for
 * committing it at all.
 */

import { DESCRIPTOR_FORMAT_VERSION, type Descriptor } from './descriptor.types';

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

function majorOf(version: string): string {
  return version.split('.')[0] ?? '';
}

/**
 * Read a descriptor, refusing any format version this build does not understand.
 *
 * Refusing is the point. Reading a newer descriptor with an older reader means
 * silently ignoring fields that constrain validation, which loosens the
 * validator without anything appearing to go wrong.
 */
export function parseDescriptor(text: string): Descriptor {
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

  return raw as Descriptor;
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

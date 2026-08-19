/**
 * Narrowing: projecting a TypeScript type onto the JSON-serializable static
 * config domain.
 *
 * The validation domain is JSON-serializable static configs. `DynamicText` is
 * `string | Observable<string> | Signal<string>` in the runtime library, but only
 * the `string` arm can appear literally in a config file, which is why
 * `DynamicTextSchema` has always been `z.string()`.
 *
 * Narrowing is a deliberate domain decision, not a failure to resolve a type, and
 * the two must never be collapsed:
 *
 * - **narrowed** — we understand the type and are dropping arms that cannot be
 *   written statically. The dropped arms are recorded.
 * - **unresolved** — we do not understand the type. Recorded, and permissive.
 */

import type { Type } from 'ts-morph';
import type { DescriptorProperty, DescriptorType } from './descriptor.types';

/**
 * Type names whose non-serializable arms are dropped by design.
 *
 * Keyed by the name as it appears in the type text. Kept small on purpose: this
 * is a list of deliberate domain decisions, not a dumping ground for anything
 * awkward to resolve.
 */
export const NARROWING_TABLE: Readonly<Record<string, DescriptorType>> = {
  DynamicText: { kind: 'string' },
};

/** Type constructors that can never be expressed in a static JSON config. */
const NON_SERIALIZABLE = [/^Observable</, /^Signal</, /^WritableSignal</, /=>/, /^Promise</];

/** True when an arm of a union cannot appear literally in a config file. */
export function isNonSerializableArm(text: string): boolean {
  return NON_SERIALIZABLE.some((pattern) => pattern.test(text));
}

/** Strip `import("...").` qualifiers so type text can be matched by name. */
export function bareTypeName(text: string): string {
  return text.replace(/import\("[^"]*"\)\./g, '');
}

export interface NarrowingOutcome {
  type: DescriptorType;
  narrowedFrom?: string;
  droppedArms?: string[];
}

/**
 * Apply the narrowing table to a resolved type.
 *
 * Returns undefined when the type is not a narrowing case, leaving the caller to
 * resolve it normally.
 */
export function narrow(type: Type, at: import('ts-morph').Node): NarrowingOutcome | undefined {
  // An optional property is `T | undefined`, which carries no alias of its own,
  // so the alias has to be read through the nullable wrapper or every optional
  // DynamicText silently misses the table.
  const aliasName = (type.getAliasSymbol() ?? type.getNonNullableType().getAliasSymbol())?.getName();
  const named = aliasName && NARROWING_TABLE[aliasName] ? aliasName : undefined;

  if (named) {
    const arms = armTexts(type, at);
    return {
      type: NARROWING_TABLE[named],
      narrowedFrom: named,
      droppedArms: arms.filter(isNonSerializableArm),
    };
  }

  // An anonymous union that mixes serializable and non-serializable arms, e.g. a
  // prop typed inline rather than through an alias. Keep the serializable half
  // rather than giving up on the whole property.
  if (!type.isUnion()) return undefined;

  const arms = armTexts(type, at);
  const dropped = arms.filter(isNonSerializableArm);
  if (dropped.length === 0 || dropped.length === arms.length) return undefined;

  return {
    type: { kind: 'unknown' },
    narrowedFrom: bareTypeName(type.getText(at)),
    droppedArms: dropped,
  };
}

function armTexts(type: Type, at: import('ts-morph').Node): string[] {
  const nonNullable = type.getNonNullableType();
  const arms = nonNullable.isUnion() ? nonNullable.getUnionTypes() : [nonNullable];
  return arms.map((arm) => bareTypeName(arm.getText(at)));
}

/**
 * Every narrowing-table entry that a set of encountered type names failed to use.
 *
 * Exhaustiveness runs the other way too: {@link unmappedNonSerializable} reports
 * a type we should have narrowed and did not, which for a built-in adapter is a
 * build failure rather than a silent degradation.
 */
export function unmappedNonSerializable(encountered: Iterable<string>): string[] {
  const unmapped = new Set<string>();

  for (const name of encountered) {
    if (NARROWING_TABLE[name]) continue;
    if (isNonSerializableArm(name)) unmapped.add(name);
  }

  return [...unmapped].sort();
}

/** Convenience for building a descriptor property from a narrowing outcome. */
export function propertyFromNarrowing(required: boolean, outcome: NarrowingOutcome): DescriptorProperty {
  return {
    required,
    type: outcome.type,
    ...(outcome.narrowedFrom ? { narrowedFrom: outcome.narrowedFrom } : {}),
    ...(outcome.droppedArms && outcome.droppedArms.length > 0 ? { droppedArms: outcome.droppedArms } : {}),
  };
}

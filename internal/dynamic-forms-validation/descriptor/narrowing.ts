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

/**
 * Types that cannot be written in a JSON-serializable static config.
 *
 * `RegExp` and `Date` sit here for the same reason as `Observable`: a config can
 * hold `"^[a-z]+$"` or `"2026-01-01"` but not `/^[a-z]+$/` or `new Date()`. The
 * hand-written schemas already take this position — `pattern` is `z.string()` —
 * so recording it makes the derivation agree rather than diverge.
 */
const NON_SERIALIZABLE = [/^Observable</, /^Signal</, /^WritableSignal</, /=>/, /^Promise</, /^RegExp$/, /^Date$/];

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
  /**
   * False when the table had no entry and the serializable half was kept by
   * inference instead. That is still a degradation and must be recorded, or a
   * property we only partly understand would look fully understood.
   */
  viaTable: boolean;
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
      viaTable: true,
    };
  }

  // A union mixing serializable and non-serializable arms, e.g. `string | RegExp`
  // written inline. Keep the serializable half rather than giving up: `unknown`
  // constrains nothing where `string` constrains a great deal.
  if (!type.isUnion()) return undefined;

  const arms = armTexts(type, at);
  const dropped = arms.filter(isNonSerializableArm);
  if (dropped.length === 0 || dropped.length === arms.length) return undefined;

  const kept = type
    .getNonNullableType()
    .getUnionTypes()
    .filter((arm) => !isNonSerializableArm(bareTypeName(arm.getText(at))));

  return {
    type: survivingType(kept),
    narrowedFrom: aliasName ?? bareTypeName(type.getText(at)),
    droppedArms: dropped,
    viaTable: false,
  };
}

/**
 * The descriptor type for the arms that survived narrowing.
 *
 * Only unambiguous shapes: one primitive, or a set of string literals. Anything
 * else stays `unknown`, because inventing a narrower type from a union we do not
 * fully understand is how a validator starts rejecting valid configs.
 */
function survivingType(kept: Type[]): DescriptorType {
  if (kept.length === 0) return { kind: 'unknown' };
  if (kept.every((a) => a.isString())) return { kind: 'string' };
  if (kept.every((a) => a.isNumber())) return { kind: 'number' };
  if (kept.every((a) => a.isBoolean() || a.isBooleanLiteral())) return { kind: 'boolean' };
  if (kept.every((a) => a.isStringLiteral())) {
    return { kind: 'enum', values: kept.map((a) => String(a.getLiteralValue())).sort() };
  }
  return { kind: 'unknown' };
}

function armTexts(type: Type, at: import('ts-morph').Node): string[] {
  const nonNullable = type.getNonNullableType();
  const arms = nonNullable.isUnion() ? nonNullable.getUnionTypes() : [nonNullable];
  return arms.map((arm) => bareTypeName(arm.getText(at)));
}

/**
 * Named types that could be narrowed but have no table entry.
 *
 * Only a *mixed* type is a narrowing candidate: one with both a serializable arm
 * to keep and a non-serializable arm to drop, like `DynamicText`. Those are the
 * cases where omitting an entry silently stops constraining a property that
 * could have been constrained.
 *
 * A type with no serializable arm at all — a bare callback, a bare `Observable`
 * — is permanently opaque. There is nothing to keep, so demanding a table entry
 * would be asking for an impossible answer, and failing the build over it would
 * make the gate fire on correct code.
 */
export function unmappedNarrowingCandidates(candidates: Iterable<string>): string[] {
  const unmapped = new Set<string>();

  for (const name of candidates) {
    if (!NARROWING_TABLE[name]) unmapped.add(name);
  }

  return [...unmapped].sort();
}

/**
 * True when a type mixes arms we can express with arms we cannot, which is what
 * makes it narrowable rather than simply opaque.
 */
export function isNarrowingCandidate(arms: string[]): boolean {
  const dropped = arms.filter(isNonSerializableArm);
  return dropped.length > 0 && dropped.length < arms.length;
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

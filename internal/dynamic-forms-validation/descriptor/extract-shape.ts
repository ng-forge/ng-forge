/**
 * Read the shape of a resolved field type: which properties sit at field level,
 * which sit inside `props`, whether each is required, and what JSON-expressible
 * type it has.
 *
 * Property placement is the payoff here. `SelectField` declares `options` on the
 * field itself while `SelectProps` is empty, so "options go at field level, not
 * inside props" — the pitfall the skill teaches most often — falls out of the
 * types instead of being maintained as prose.
 *
 * Container nesting is not read and not inferred. Which children a container may
 * contain is a separate contract that the type registry does not express and the
 * schemas do not enforce.
 */

import type { Node, Type } from 'ts-morph';
import type { DescriptorObject, DescriptorProperty, DescriptorType, ObjectPolicy, UnresolvedEntry } from './descriptor.types';
import { bareTypeName, narrow, propertyFromNarrowing } from './narrowing';

/**
 * Deterministic order for enum members.
 *
 * TypeScript returns union arms in its own order, which is stable for a given
 * compiler but is not something a committed artifact should depend on. Sorting
 * by kind then value keeps the diff meaningful across versions.
 */
function sortEnumValues(values: (string | number | boolean)[]): (string | number | boolean)[] {
  return [...values].sort((a, b) => {
    if (typeof a !== typeof b) return typeof a < typeof b ? -1 : 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
  });
}

/** Keys handled structurally elsewhere, or meaningless in a static config. */
const SKIPPED_FIELD_KEYS = new Set(['props', 'fields', 'addons', 'wrappers']);

export interface ShapeContext {
  /** Dotted path prefix for `unresolved` entries, e.g. `input`. */
  path: string;
  /** Collected as a side effect, so a caller sees everything that degraded. */
  unresolved: UnresolvedEntry[];
  /** Every non-serializable type name seen, for exhaustiveness checking. */
  encountered: Set<string>;
}

function record(context: ShapeContext, path: string, reason: string): DescriptorType {
  context.unresolved.push({ path, reason, fallback: 'passthrough' });
  return { kind: 'opaque' };
}

/** Resolve a type to its JSON-expressible descriptor form. */
export function describeType(type: Type, at: Node, context: ShapeContext, path: string): DescriptorProperty['type'] {
  const nonNullable = type.getNonNullableType();

  if (nonNullable.isString()) return { kind: 'string' };
  if (nonNullable.isNumber()) return { kind: 'number' };
  if (nonNullable.isBoolean()) return { kind: 'boolean' };
  if (nonNullable.isUnknown() || nonNullable.isAny()) return { kind: 'unknown' };

  if (nonNullable.isStringLiteral() || nonNullable.isNumberLiteral() || nonNullable.isBooleanLiteral()) {
    return { kind: 'enum', values: [nonNullable.getLiteralValue() as string | number | boolean] };
  }

  if (nonNullable.isArray()) {
    const element = nonNullable.getArrayElementType();
    return element
      ? { kind: 'array', of: describeType(element, at, context, `${path}[]`) }
      : record(context, path, 'array with no element type');
  }

  // A readonly array reads as a union-free object type with a numeric index, so
  // fall back on the text form rather than missing it entirely.
  const text = bareTypeName(nonNullable.getText(at));
  if (/^readonly .+\[\]$/.test(text)) {
    const element = nonNullable.getArrayElementType();
    return element ? { kind: 'array', of: describeType(element, at, context, `${path}[]`) } : { kind: 'array', of: { kind: 'unknown' } };
  }

  if (nonNullable.isUnion()) {
    const arms = nonNullable.getUnionTypes();
    const literals = arms.filter((a) => a.isStringLiteral() || a.isNumberLiteral());

    // A union of literals is an enum; `boolean` decomposes into true|false, so
    // treat an all-boolean-literal union as a plain boolean.
    if (literals.length === arms.length && literals.length > 0) {
      return { kind: 'enum', values: sortEnumValues(literals.map((a) => a.getLiteralValue() as string | number)) };
    }
    if (arms.every((a) => a.isBooleanLiteral())) return { kind: 'boolean' };

    return record(context, path, `union of ${arms.map((a) => bareTypeName(a.getText(at))).join(' | ')}`);
  }

  // Functions are objects to the checker, so they must be caught first or every
  // callback prop would be recorded as a referenceable object shape.
  if (nonNullable.getCallSignatures().length > 0) return record(context, path, `callable ${text}`);

  if (nonNullable.isObject()) return { kind: 'ref', name: text };

  return record(context, path, `unhandled type ${text}`);
}

/** Turn one property symbol into a descriptor property. */
function describeProperty(symbol: import('ts-morph').Symbol, at: Node, context: ShapeContext, path: string): DescriptorProperty {
  const type = symbol.getTypeAtLocation(at);
  const required = !symbol.isOptional();

  for (const arm of splitArms(type, at)) context.encountered.add(arm);

  const narrowed = narrow(type, at);
  if (narrowed) return propertyFromNarrowing(required, narrowed);

  return { required, type: describeType(type, at, context, path) };
}

function splitArms(type: Type, at: Node): string[] {
  const nonNullable = type.getNonNullableType();
  const arms = nonNullable.isUnion() ? nonNullable.getUnionTypes() : [nonNullable];
  return arms.map((arm) => bareTypeName(arm.getText(at)));
}

/**
 * Field-level properties of a field type.
 *
 * `props`, `fields`, `addons` and `wrappers` are excluded: the first is described
 * separately, and the rest are structural rather than value-carrying.
 */
export function describeFieldLevel(fieldType: Type, at: Node, context: ShapeContext): Record<string, DescriptorProperty> {
  const out: Record<string, DescriptorProperty> = {};

  for (const symbol of fieldType.getProperties()) {
    const name = symbol.getName();
    if (SKIPPED_FIELD_KEYS.has(name)) continue;

    // `label?: never` and friends mark a key as forbidden rather than optional.
    if (symbol.getTypeAtLocation(at).getNonNullableType().isNever()) continue;

    out[name] = describeProperty(symbol, at, context, `${context.path}.${name}`);
  }

  return out;
}

/**
 * The `props` object of a field type, if it has one.
 *
 * Policy is `strip` because that is Zod's default and what the hand-written
 * schemas do. Recording it means a later `.strict()` migration is visible in the
 * committed diff rather than a silent change in what is accepted.
 */
export function describeProps(
  fieldType: Type,
  at: Node,
  context: ShapeContext,
  policy: ObjectPolicy = 'strip',
): DescriptorObject | undefined {
  const symbol = fieldType.getProperty('props');
  if (!symbol) return undefined;

  const propsType = symbol.getTypeAtLocation(at).getNonNullableType();
  const keys: Record<string, DescriptorProperty> = {};

  for (const prop of propsType.getProperties()) {
    keys[prop.getName()] = describeProperty(prop, at, context, `${context.path}.props.${prop.getName()}`);
  }

  return { policy, keys };
}

/**
 * Whether a field type declares a required structural property.
 *
 * `wrappers` on `container` is the case that matters: it is required, and that
 * requirement is what distinguishes a container from a group. Losing it would
 * turn the type into a synonym.
 */
export function describeStructural(fieldType: Type, at: Node, context: ShapeContext): Record<string, DescriptorProperty> {
  const out: Record<string, DescriptorProperty> = {};

  for (const name of ['fields', 'wrappers']) {
    const symbol = fieldType.getProperty(name);
    if (!symbol) continue;
    if (symbol.getTypeAtLocation(at).getNonNullableType().isNever()) continue;

    out[name] = describeProperty(symbol, at, context, `${context.path}.${name}`);
  }

  return out;
}

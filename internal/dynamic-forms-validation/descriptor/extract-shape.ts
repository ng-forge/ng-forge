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
import type { DescriptorObject, DescriptorProperty, DescriptorType, ObjectPolicy } from './descriptor.types';

/** One degradation as it is recorded, before entries are grouped by reason. */
export interface RawUnresolved {
  path: string;
  reason: string;
}
import { bareTypeName, isNarrowingCandidate, isNonSerializableArm, narrow, propertyFromNarrowing } from './narrowing';

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
  unresolved: RawUnresolved[];
  /**
   * Named types that mix serializable and non-serializable arms but have no
   * narrowing entry. Only these are exhaustiveness failures; a type with no
   * serializable arm is permanently opaque and needs no entry.
   */
  encountered: Set<string>;
}

function record(context: ShapeContext, path: string, reason: string): DescriptorType {
  context.unresolved.push({ path, reason });
  return { kind: 'opaque' };
}

/**
 * True when a type is one of the registry's field definitions.
 *
 * Identified structurally, by carrying a literal `type` discriminant and a
 * `key`, rather than by name: adapters name their field types freely, and the
 * point is to recognise the shape wherever it comes from.
 */
function isFieldType(type: Type, at: Node): boolean {
  const discriminant = type.getProperty('type')?.getTypeAtLocation(at)?.getNonNullableType();
  if (!discriminant || !type.getProperty('key')) return false;

  // The discriminant may be a union: array actions declare both spellings, e.g.
  // `'add-array-item' | 'addArrayItem'`. Requiring a single literal missed those
  // arms, and one missed arm makes the whole union look unresolved.
  const arms = discriminant.isUnion() ? discriminant.getUnionTypes() : [discriminant];
  return arms.length > 0 && arms.every((arm) => arm.isStringLiteral());
}

/**
 * True when a type is directly expressible: a primitive, a literal, or an array
 * of those.
 *
 * Used to decide whether a union can be spelled out. Object arms are excluded on
 * purpose — describing them means naming shapes in `objects`, and emitting a
 * reference to something nothing defines is worse than recording it as
 * unresolved.
 */
function isDirectlyExpressible(type: Type): boolean {
  const t = type.getNonNullableType();

  if (t.isString() || t.isNumber() || t.isBoolean() || t.isStringLiteral() || t.isNumberLiteral() || t.isBooleanLiteral()) {
    return true;
  }

  if (t.isUnion()) return t.getUnionTypes().every(isDirectlyExpressible);

  const element = t.getArrayElementType();
  return element ? isDirectlyExpressible(element) : false;
}

/** True when every arm of a type is a field definition. */
function isFieldUnion(type: Type, at: Node): boolean {
  const nonNullable = type.getNonNullableType();
  const arms = nonNullable.isUnion() ? nonNullable.getUnionTypes() : [nonNullable];
  return arms.length > 0 && arms.every((arm) => isFieldType(arm, at));
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

    // A union of primitives and literals, e.g. `string | number` or
    // `number | 'auto'`. Recording it as unresolved leaves a property
    // unconstrained that the types describe completely.
    if (arms.every(isDirectlyExpressible)) {
      return { kind: 'union', of: arms.map((arm) => describeType(arm, at, context, path)) };
    }

    // `fields` and `template` accept the whole field union. It is not unresolved:
    // the accepted set is this descriptor's own `fieldTypes`.
    if (arms.length > 1 && arms.every((a) => isFieldType(a, at))) return { kind: 'field' };

    // Mostly field types, plus something else. `ArrayItemDefinition` is the case
    // that matters: one field for a primitive array item, or a list of fields for
    // an object item. Collapsing the field arms also keeps this
    // adapter-independent, where spelling the union out named the adapter's own
    // prop types and made an otherwise shared core differ between adapters.
    if (arms.length > 1 && arms.some((a) => isFieldType(a, at))) {
      const others = arms
        .filter((a) => !isFieldType(a, at))
        .map((arm): DescriptorType => {
          // A list of field definitions is expressible, so say so rather than
          // giving up on it: `readonly ArrayAllowedChildren[]` is exactly the
          // object-item form of an array template.
          const element = arm.getArrayElementType();
          if (element && isFieldUnion(element, at)) return { kind: 'array', of: { kind: 'field' } };

          return { kind: 'opaque', as: bareTypeName(arm.getText(at)) };
        });

      return { kind: 'union', of: [{ kind: 'field' }, ...others] };
    }

    // A union of config objects: logic, validators, wrappers. These are the
    // richest part of a config, so leaving them unconstrained is the most
    // expensive gap in a derived schema. Each arm is described one level deep;
    // anything nested inside is named rather than followed.
    if (!context.shallow && context.objects && arms.every((a) => a.getProperties().length > 0 && a.getCallSignatures().length === 0)) {
      return { kind: 'union', of: arms.map((arm) => describeConfigShape(arm, at, context)) };
    }

    return record(context, path, `union of ${arms.map((a) => bareTypeName(a.getText(at))).join(' | ')}`);
  }

  // Functions are objects to the checker, so they must be caught first or every
  // callback prop would be recorded as a referenceable object shape.
  if (nonNullable.getCallSignatures().length > 0) return record(context, path, `callable ${text}`);

  // A runtime type such as Observable<T> is object-shaped but can never appear in
  // a JSON config. Recording it as a describable ref would claim we can validate
  // a value that cannot be written down.
  if (isNonSerializableArm(text)) return record(context, path, `not expressible in a static config: ${text}`);

  if (isFieldType(nonNullable, at)) return { kind: 'field' };

  // An object we did not describe is named, not referenced. Only config union
  // arms are described, so a `ref` anywhere else pointed at a shape nothing
  // defines — a reader following it finds nothing, and a schema built from it
  // would have no rule to apply. `opaque` says what is true: we stopped here.
  if (nonNullable.isObject()) return { kind: 'opaque', as: text };

  return record(context, path, `unhandled type ${text}`);
}

/**
 * A short, stable, unique name for a described shape.
 *
 * Most arms are named types and keep their name. The rest are anonymous
 * intersections whose structural text runs to 145 characters, repeated once as a
 * key and again at every reference, which cost about a quarter of the artifact
 * and made it unreadable.
 *
 * Those get their base type plus a digest of the full text. The digest is
 * content-derived rather than positional, so it does not move when TypeScript
 * reorders union arms, and a changed variant shows up as a removal and an
 * addition rather than as an edit to a name that no longer describes it. The
 * full shape is right there under the name, so nothing is lost.
 */
function shapeName(type: Type, at: Node): string {
  const alias = type.getAliasSymbol()?.getName();
  if (alias) return alias;

  const text = bareTypeName(type.getText(at));
  if (text.length <= MAX_INLINE_SHAPE_NAME) return text;

  const base = text.split(' & ')[0].trim();
  return `${base}~${digest(text)}`;
}

/** Longest structural text kept as a name before falling back to a digest. */
const MAX_INLINE_SHAPE_NAME = 48;

/** FNV-1a, for a short stable suffix. Not security relevant. */
function digest(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 6);
}

/**
 * Describe one arm of a config union, one level deep, and reference it by name.
 *
 * Arms of the same union often share a name across field types, so naming them
 * in `objects` keeps twenty copies of the same logic shape out of the artifact.
 */
function describeConfigShape(type: Type, at: Node, context: ShapeContext): DescriptorType {
  const name = shapeName(type, at);

  if (context.objects && !context.objects[name]) {
    // Reserve the name first: an arm can reference its own union.
    context.objects[name] = { policy: 'strip', keys: {} };

    const keys: Record<string, DescriptorProperty> = {};
    const nested: ShapeContext = { ...context, shallow: true, path: name };
    for (const prop of type.getProperties()) {
      // `never` marks a key as forbidden on this arm, e.g. `debounceMs?: never`
      // on the non-debounced variant. It is the absence of a property, not a
      // property whose type we failed to work out.
      if (prop.getTypeAtLocation(at).getNonNullableType().isNever()) continue;

      keys[prop.getName()] = describeProperty(prop, at, nested, `${name}.${prop.getName()}`);
    }

    context.objects[name] = { policy: 'strip', keys };
  }

  return { kind: 'ref', name };
}

/** Turn one property symbol into a descriptor property. */
function describeProperty(symbol: import('ts-morph').Symbol, at: Node, context: ShapeContext, path: string): DescriptorProperty {
  const type = symbol.getTypeAtLocation(at);
  const required = !symbol.isOptional();

  const narrowed = narrow(type, at);
  if (narrowed) {
    // Only a *named* type could have had a table entry. An inline union such as
    // `string | RegExp` has no name to record, so keeping its serializable arm is
    // the complete answer rather than a degradation worth reporting.
    const named = Boolean((type.getAliasSymbol() ?? type.getNonNullableType().getAliasSymbol())?.getName());

    if (!narrowed.viaTable && named) {
      // Kept the serializable half by inference rather than by decision. Record
      // it, so a property we only partly understand is visible in the diff.
      context.unresolved.push({
        path,
        reason: `no narrowing entry for ${narrowed.narrowedFrom}; kept the serializable arm by inference`,
      });
      const alias = (type.getAliasSymbol() ?? type.getNonNullableType().getAliasSymbol())?.getName();
      if (alias) context.encountered.add(alias);
    }
    return propertyFromNarrowing(required, narrowed);
  }

  // A narrowed property is already handled, so only unnarrowed ones are checked,
  // and only when they are genuinely narrowable: a named alias mixing arms we can
  // express with arms we cannot.
  const alias = (type.getAliasSymbol() ?? type.getNonNullableType().getAliasSymbol())?.getName();
  if (alias && isNarrowingCandidate(splitArms(type, at))) context.encountered.add(alias);

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

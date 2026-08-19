/**
 * Derive the set of accepted field type names from a field schema.
 *
 * The error formatter has to tell a genuinely unknown field type apart from a
 * known one whose properties are wrong. It used to consult a hand-written list,
 * which drifted from the schemas: `insert-array-item` is accepted, was missing
 * from that list, and a config that merely omitted its required `index` was
 * reported as an unknown field type alongside a "valid types" list that did not
 * mention it. An agent reading that renames or deletes the field instead of
 * adding the missing property.
 *
 * Reading the names off the schema that actually decides validity removes the
 * possibility of the two disagreeing.
 */

import { z } from 'zod';

/**
 * Guards against a self-referential `z.lazy`. Nothing in the current schemas
 * nests wrapper types anywhere near this deep.
 */
const MAX_DEPTH = 20;

/** Record a discriminator value, which is a literal in every current schema. */
function collectDiscriminator(schema: z.ZodTypeAny | undefined, into: Set<string>): void {
  if (schema instanceof z.ZodLiteral) {
    if (typeof schema.value === 'string') into.add(schema.value);
    return;
  }

  // Not used by any adapter today, but an enum is a legitimate discriminator
  // and silently ignoring one would reintroduce exactly the drift this fixes.
  if (schema instanceof z.ZodEnum) {
    for (const value of schema.options as string[]) into.add(value);
  }
}

function visit(schema: z.ZodTypeAny, into: Set<string>, depth: number): void {
  if (depth > MAX_DEPTH) return;

  if (schema instanceof z.ZodLazy) {
    visit(schema.schema, into, depth + 1);
    return;
  }

  // `.superRefine(...)` wraps the leaf union in a ZodEffects.
  if (schema instanceof z.ZodEffects) {
    visit(schema.innerType(), into, depth + 1);
    return;
  }

  if (schema instanceof z.ZodDiscriminatedUnion || schema instanceof z.ZodUnion) {
    for (const option of schema.options as z.ZodTypeAny[]) visit(option, into, depth + 1);
    return;
  }

  if (schema instanceof z.ZodObject) {
    collectDiscriminator((schema.shape as z.ZodRawShape)['type'], into);
    // Deliberately does not descend into other properties. Containers hold a
    // `fields` array of this same schema, so descending would recurse forever.
    return;
  }
}

/**
 * Every `type` value the given field schema accepts, in no particular order.
 *
 * Pass an adapter's all-fields schema (`MatFieldSchema`, `BsFieldSchema`, ...).
 */
export function collectFieldTypeNames(schema: z.ZodTypeAny): string[] {
  const names = new Set<string>();
  visit(schema, names, 0);
  return [...names];
}

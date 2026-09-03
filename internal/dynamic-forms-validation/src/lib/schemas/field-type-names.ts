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
function collectDiscriminator(schema: z.ZodType | undefined, into: Set<string>): void {
  if (schema instanceof z.ZodLiteral) {
    // zod 4 literals hold a value set, since a literal may accept several values.
    for (const value of schema.def.values) {
      if (typeof value === 'string') into.add(value);
    }
    return;
  }

  // Not used by any adapter today, but an enum is a legitimate discriminator
  // and silently ignoring one would reintroduce exactly the drift this fixes.
  if (schema instanceof z.ZodEnum) {
    for (const value of schema.options as string[]) into.add(value);
  }
}

function visit(schema: z.ZodType, into: Set<string>, depth: number): void {
  if (depth > MAX_DEPTH) return;

  if (schema instanceof z.ZodLazy) {
    visit(schema.unwrap() as z.ZodType, into, depth + 1);
    return;
  }

  // Covers z.ZodDiscriminatedUnion too, which extends z.ZodUnion in zod 4.
  // Refinements no longer wrap the schema, so there is no effects layer to peel.
  if (schema instanceof z.ZodUnion) {
    for (const option of schema.options as z.ZodType[]) visit(option, into, depth + 1);
    return;
  }

  if (schema instanceof z.ZodObject) {
    collectDiscriminator((schema.shape as Record<string, z.ZodType>)['type'], into);
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
export function collectFieldTypeNames(schema: z.ZodType): string[] {
  const names = new Set<string>();
  visit(schema, names, 0);
  return [...names];
}

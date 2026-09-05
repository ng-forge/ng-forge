import { z } from 'zod';

/**
 * The `template` on an array-add button: what one new item looks like.
 *
 * `ArrayItemDefinition` is a field definition for a primitive item, or a list of
 * them for an object item. The type declares it required and its doc comment
 * says REQUIRED, but no button schema carried it, so the validator passed a
 * config that does not compile — the worst kind of gap, because an agent is told
 * to trust a clean run.
 *
 * Shaped as "something field-like" rather than the real field union on purpose.
 * The buttons are members of the leaf union, so referring to that union from
 * here would be a cycle between the two modules. This catches the mistake that
 * actually happens — the property missing altogether, or holding something that
 * is plainly not a field — and leaves the deep check to TypeScript, which does
 * it properly.
 */
const FieldLikeSchema = z.object({ type: z.string() }).passthrough();

export const ArrayItemTemplateSchema = z.union([FieldLikeSchema, z.array(FieldLikeSchema)]);

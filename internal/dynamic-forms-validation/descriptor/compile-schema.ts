/**
 * Compile a Zod schema from a descriptor, in memory.
 *
 * No schema source is generated. The descriptor is the persisted artifact and
 * this builds from it at load time, so a consumer never has generated validator
 * code to keep in step, and there is no second thing to drift.
 *
 * Permissiveness is deliberate and asymmetric. Anything the descriptor records
 * as `opaque` passes through unchecked, because a guessed rejection is worse
 * than no check: an agent acts on a rejection, and a wrong one sends it to
 * rewrite correct config. A prohibition (`never`) is the one place the schema
 * refuses, because that is a rule the types state outright.
 */

import { z } from 'zod';
import type {
  AdapterDescriptor,
  CoreDescriptor,
  Descriptor,
  DescriptorObject,
  DescriptorProperty,
  DescriptorType,
} from './descriptor.types';
import { joinDescriptor } from './split';

/**
 * A shape under construction.
 *
 * Zod's own `ZodRawShape` is readonly, and these are built key by key, so the
 * mutable spelling is written out here rather than cast away at each write.
 */
type Shape = Record<string, z.ZodTypeAny>;

/** Everything one compilation pass shares, so a `ref` can reach it from anywhere. */
interface Ctx {
  objects: Readonly<Record<string, DescriptorObject>>;
  /** The whole field union, lazily; a container's `fields` refers back to it. */
  fieldSchema: z.ZodTypeAny;
  /** Named shapes already compiled, keyed by descriptor name. See `compileRef`. */
  refs: Map<string, z.ZodTypeAny>;
}

/** Build a Zod type for one descriptor type. */
function compileType(type: DescriptorType, ctx: Ctx): z.ZodTypeAny {
  switch (type.kind) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'enum':
      // A single-member enum is still a literal union; z.enum needs strings only.
      return z.union(type.values.map((value) => z.literal(value)) as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
    case 'array':
      return z.array(compileType(type.of, ctx));
    case 'union':
      return z.union(type.of.map((arm) => compileType(arm, ctx)) as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
    case 'field':
      return ctx.fieldSchema;
    case 'never':
      // The types say this key is forbidden here. Optional so its absence is
      // fine and its presence is not, matching `z.never().optional()` in the
      // hand-written schemas.
      return z.never();
    case 'ref':
      return compileRef(type.name, ctx);
    case 'unknown':
    case 'opaque':
      return z.unknown();
  }
}

/**
 * Compile a named shape once, behind a lazy.
 *
 * `describeConfigShape` reserves a name before describing it, specifically so an
 * arm can reference its own union, so a descriptor may legitimately carry a
 * cycle. Nothing in the committed artifacts does today, but only
 * MAX_CONFIG_DEPTH is keeping one out: expanding refs inline would blow the
 * stack the moment that depth is raised. The lazy breaks the cycle, and the map
 * means a shape referenced from twenty field types is built once.
 */
function compileRef(name: string, ctx: Ctx): z.ZodTypeAny {
  const existing = ctx.refs.get(name);
  if (existing) return existing;

  let resolved: z.ZodTypeAny | undefined;
  const lazy: z.ZodTypeAny = z.lazy(() => (resolved ??= compileObject(ctx.objects[name], ctx)));

  ctx.refs.set(name, lazy);
  return lazy;
}

function compileProperty(property: DescriptorProperty, ctx: Ctx): z.ZodTypeAny {
  const compiled = compileType(property.type, ctx);
  return property.required ? compiled : compiled.optional();
}

function compileObject(object: DescriptorObject | undefined, ctx: Ctx): z.ZodTypeAny {
  // A ref to a shape nothing defines: permissive rather than a hard failure, so
  // a descriptor gap degrades the same way an opaque does.
  if (!object) return z.unknown();

  const shape: Shape = {};
  for (const [key, property] of Object.entries(object.keys)) {
    shape[key] = compileProperty(property, ctx);
  }

  const built = z.object(shape);
  return object.policy === 'passthrough' ? built.passthrough() : object.policy === 'strict' ? built.strict() : built;
}

/**
 * Compile the whole field union.
 *
 * Fields nest, so the union is lazy: a container's `fields` refers back to the
 * same union it is a member of.
 */
export function compileFieldSchema(descriptor: Descriptor): z.ZodTypeAny {
  const objects = descriptor.objects;
  const base = objects['BaseFieldProperties'];

  // `z.lazy` runs its getter on every parse, so without this the whole union is
  // rebuilt each time a field is validated — the dominant cost by far. Built
  // once, on first use, and reused for the life of the schema.
  let built: z.ZodTypeAny | undefined;

  const fieldSchema: z.ZodTypeAny = z.lazy(() => (built ??= buildUnion()));
  const ctx: Ctx = { objects, fieldSchema, refs: new Map() };

  function buildUnion(): z.ZodTypeAny {
    // One option per accepted spelling, so the union can discriminate on `type`.
    // A plain union tries all 26 variants for every field and measured 52ms per
    // parse; dispatching on the discriminant is what the hand-written schemas do
    // and is the difference between usable and not for a CLI over many files.
    const variants: z.core.$ZodTypeDiscriminable[] = Object.values(descriptor.fieldTypes).flatMap((fieldType) => {
      const shape: Shape = {};

      // Hoisted shared properties come first; a field type's own entry wins.
      for (const [key, property] of Object.entries(fieldType.extends ? (base?.keys ?? {}) : {})) {
        shape[key] = compileProperty(property, ctx);
      }
      for (const [key, property] of Object.entries(fieldType.fieldLevel)) {
        shape[key] = compileProperty(property, ctx);
      }

      if (fieldType.props) {
        shape['props'] = compileObject(fieldType.props, ctx).optional();
      }

      // One variant per spelling, each with a single literal discriminant.
      return [fieldType.canonical, ...fieldType.aliases].map((name) => z.object({ ...shape, type: z.literal(name) }));
    });

    // Zod wants a non-empty tuple. The generator fails rather than emitting a
    // descriptor whose registry resolved nothing, so by the time one is loaded
    // it declares at least one field type.
    return z.discriminatedUnion('type', variants as [z.core.$ZodTypeDiscriminable, ...z.core.$ZodTypeDiscriminable[]]);
  }

  return fieldSchema;
}

/** Compile a whole form config schema from the two descriptor halves. */
export function compileFormConfigSchema(core: CoreDescriptor, adapter: AdapterDescriptor): z.ZodTypeAny {
  const descriptor = joinDescriptor(core, adapter);

  return z.object({
    fields: z.array(compileFieldSchema(descriptor)),
  });
}

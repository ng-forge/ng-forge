/**
 * The type descriptor: what field types an adapter accepts, and what shape each
 * one has, derived from the `FieldRegistryLeaves` module augmentation.
 *
 * This is a committed artifact whose diff is the review signal for "did this
 * change what configs validate", so two properties matter as much as the
 * content: it serialises deterministically, and a consumer that does not
 * understand its format version refuses to read it rather than misreading it.
 */

/**
 * Incremented on any change to the descriptor shape.
 *
 * Major means incompatible: a reader built for 1.x must refuse 2.x rather than
 * silently ignoring fields it does not know about, because a dropped field is a
 * loosened validator.
 */
export const DESCRIPTOR_FORMAT_VERSION = '1.0';

/** A JSON-expressible type, or an explicit admission that we could not express it. */
export type DescriptorType =
  | { readonly kind: 'string' }
  | { readonly kind: 'number' }
  | { readonly kind: 'boolean' }
  | { readonly kind: 'enum'; readonly values: readonly (string | number | boolean)[] }
  | { readonly kind: 'array'; readonly of: DescriptorType }
  /** A named entry in {@link Descriptor.objects}. */
  | { readonly kind: 'ref'; readonly name: string }
  /** Deliberately unconstrained, e.g. a `value` that may be any JSON. */
  | { readonly kind: 'unknown' }
  /**
   * The extractor could not express this type. Always permissive at validation
   * time: a guessed rejection is worse than no check, because agents act on it.
   */
  | { readonly kind: 'opaque'; readonly as?: string };

/** One property, at field level or inside `props`. */
export interface DescriptorProperty {
  readonly required: boolean;
  readonly type: DescriptorType;
  /**
   * Set when the TypeScript type had non-serializable arms removed because they
   * fall outside the JSON-serializable static config domain, e.g. `DynamicText`
   * keeping `string` and dropping `Observable<string> | Signal<string>`.
   *
   * Narrowing is a deliberate domain decision and is not the same as failing to
   * resolve a type; the two must not be collapsed.
   */
  readonly narrowedFrom?: string;
  /** The arms dropped by narrowing, recorded so the decision is auditable. */
  readonly droppedArms?: readonly string[];
}

/**
 * What an object does with keys it does not declare.
 *
 * Not uniform in the current schemas: Zod's default is `strip`, and
 * `FieldOptionSchema` is explicitly `passthrough`. Recording it is what lets a
 * future `.strict()` migration show up in the committed diff instead of
 * silently changing acceptance.
 */
export type ObjectPolicy = 'strict' | 'strip' | 'passthrough';

export interface DescriptorObject {
  readonly policy: ObjectPolicy;
  readonly keys: Readonly<Record<string, DescriptorProperty>>;
}

/** A single field type, keyed in {@link Descriptor.fieldTypes} by its canonical name. */
export interface DescriptorFieldType {
  readonly kind: 'leaf' | 'container';
  /** The name the validator normalises to. Equals the key it is stored under. */
  readonly canonical: string;
  /**
   * Accepted spellings that normalise to {@link canonical}.
   *
   * The registry legitimately declares both `addArrayItem` and
   * `add-array-item` while the schemas accept kebab only, so aliasing is part of
   * the contract rather than an accident to paper over.
   */
  readonly aliases: readonly string[];
  /**
   * Name of a shared entry in {@link Descriptor.objects} holding the field-level
   * properties every field type has in common.
   *
   * Hoisting them matters for more than size. Repeating three dozen inherited
   * keys on each of two dozen field types means changing one base property
   * churns every block, and a diff nobody can read is not a review artifact.
   */
  readonly extends?: string;
  /** Field-level properties specific to this type, beyond {@link extends}. */
  readonly fieldLevel: Readonly<Record<string, DescriptorProperty>>;
  readonly props?: DescriptorObject;
}

/**
 * A type the extractor could not express, recorded rather than silently dropped.
 *
 * Grouped by reason rather than listed per path. The same handful of config
 * shapes are unresolved on most field types — one union accounted for 26 of 80
 * entries — so repeating the reason text spent about a fifth of the whole
 * artifact restating it. Grouping also reads better: "this shape is unresolved
 * in 26 places" is the useful fact, not 26 near-identical lines.
 */
export interface UnresolvedEntry {
  readonly reason: string;
  /** Always permissive. Present so the guarantee is visible in the artifact. */
  readonly fallback: 'passthrough';
  /** Dotted paths sharing this reason, e.g. `input.props.hint`. Sorted. */
  readonly paths: readonly string[];
}

export interface Descriptor {
  readonly formatVersion: string;
  readonly generator: { readonly name: string; readonly version: string };
  readonly adapter: {
    readonly id: string;
    readonly package: string;
    readonly version: string;
  };
  readonly fieldTypes: Readonly<Record<string, DescriptorFieldType>>;
  /** Shared object shapes referenced by `{ kind: 'ref' }`. */
  readonly objects: Readonly<Record<string, DescriptorObject>>;
  /**
   * Every type the extractor could not express.
   *
   * Growth here means validation quietly loosened, which is invisible otherwise
   * because everything still passes. Committing the descriptor makes it a diff.
   */
  readonly unresolved: readonly UnresolvedEntry[];
}

/**
 * The adapter-independent half of a descriptor.
 *
 * Field types, their aliases, and their field-level shape are identical whichever
 * adapter is installed — measured byte-identical across all 26 types for Material
 * and Bootstrap. Carrying them once rather than in every adapter's file is what
 * keeps the committed artifact readable as well as smaller.
 *
 * This is the same seam the skills use: core holds field types and rules, each
 * adapter holds only its own `props`.
 */
export interface CoreDescriptor {
  readonly formatVersion: string;
  readonly generator: { readonly name: string; readonly version: string };
  /** Field types without their `props`, which belong to an adapter. */
  readonly fieldTypes: Readonly<Record<string, Omit<DescriptorFieldType, 'props'>>>;
  readonly objects: Readonly<Record<string, DescriptorObject>>;
  readonly unresolved: readonly UnresolvedEntry[];
}

/**
 * One adapter's contribution: the `props` it adds, and nothing else.
 *
 * Read together with a {@link CoreDescriptor} of the same `formatVersion`. Held
 * apart because a project installs core plus exactly one adapter, so shipping
 * four adapters' props in one artifact describes three sets of properties the
 * project does not have.
 */
export interface AdapterDescriptor {
  readonly formatVersion: string;
  readonly generator: { readonly name: string; readonly version: string };
  readonly adapter: {
    readonly id: string;
    readonly package: string;
    readonly version: string;
  };
  /** Keyed by canonical field type name. Absent means the adapter adds no props. */
  readonly props: Readonly<Record<string, DescriptorObject>>;
  readonly unresolved: readonly UnresolvedEntry[];
}

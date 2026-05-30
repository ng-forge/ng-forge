import { InjectionToken } from '@angular/core';
import { LazyComponentLoader } from '../wrapper-type';
import { BaseAddon } from './addon-def';
import { AddonSlot } from './addon-slot';

/**
 * Minimal JSON Schema fragment used by the MCP server to surface an addon
 * kind's shape to AI form generators. Covers the common subset
 * (`type`/`properties`/`required`/`enum`/etc.) without pulling in a full JSON
 * Schema dependency. Extra keys are allowed via the `[key: string]` index so
 * vendor-specific annotations (`x-foo`, `markdownDescription`) still typecheck.
 */
export interface AddonKindSchema {
  readonly $ref?: string;
  readonly $schema?: string;
  readonly title?: string;
  readonly description?: string;
  readonly type?:
    | 'object'
    | 'array'
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'null'
    | ReadonlyArray<'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null'>;
  readonly enum?: ReadonlyArray<unknown>;
  readonly const?: unknown;
  readonly properties?: Readonly<Record<string, AddonKindSchema>>;
  readonly required?: ReadonlyArray<string>;
  readonly additionalProperties?: boolean | AddonKindSchema;
  readonly items?: AddonKindSchema | ReadonlyArray<AddonKindSchema>;
  readonly oneOf?: ReadonlyArray<AddonKindSchema>;
  readonly anyOf?: ReadonlyArray<AddonKindSchema>;
  readonly allOf?: ReadonlyArray<AddonKindSchema>;
  readonly not?: AddonKindSchema;
  readonly default?: unknown;
  readonly examples?: ReadonlyArray<unknown>;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly format?: string;
  /** Vendor extensions and unrecognised keywords pass through untyped. */
  readonly [key: string]: unknown;
}

/**
 * Optional shape validator a kind ships to enforce its required fields at
 * runtime. Throws are caught by the validator and converted into lenient
 * warnings; the offending addon is dropped and the form keeps rendering.
 */
export type AddonShapeValidator<T extends BaseAddon = BaseAddon> = (addon: T, fieldKey: string) => void;

/** Per-kind registration metadata. */
export interface AddonKindDefinition<T extends BaseAddon = BaseAddon> {
  /** Discriminant matching `addon.kind`. */
  readonly kind: string;
  /** Lazy loader for the kind's renderer component. */
  readonly loadComponent: LazyComponentLoader;
  /** Optional shape validator — throw `DynamicFormError` to drop the addon with a warning. */
  readonly validate?: AddonShapeValidator<T>;
  /** Optional JSON Schema fragment for MCP / pre-flight tooling. */
  readonly schema?: AddonKindSchema;
  /**
   * Whether the kind survives `JSON.stringify` / `JSON.parse`. Kinds whose
   * shape includes a function payload (e.g., the built-in `'component'`
   * loader, inline `prime-button` `action` handlers) declare `jsonSafe: false`
   * so the validator drops them when the config was loaded from a JSON
   * source (`sanitizeFormConfig(config, { source: 'json' })`). Defaults to
   * `true` — kinds are JSON-safe unless explicitly opted out.
   */
  readonly jsonSafe?: boolean;
}

/** Per-field-type addon-support metadata declared at field registration. */
export interface FieldAddonSupport {
  /** Slots a field of this type accepts. */
  readonly slots: readonly AddonSlot[];
  /** Optional whitelist of allowed addon kinds. Omitted = any registered kind. */
  readonly allowedKinds?: readonly string[];
}

/** Global registry of addon kinds. */
export const ADDON_KIND_REGISTRY = new InjectionToken<Map<string, AddonKindDefinition>>('ADDON_KIND_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map<string, AddonKindDefinition>(),
});

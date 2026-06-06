import { InjectionToken, Type } from '@angular/core';
import { LazyComponentLoader } from '../wrapper-type';
import { BaseAddon } from './addon-def';
import { AddonSlot } from './addon-slot';

/**
 * Minimal JSON Schema fragment used by the MCP server to surface an addon
 * type's shape to AI form generators. Covers the common subset
 * (`type`/`properties`/`required`/`enum`/etc.) without pulling in a full JSON
 * Schema dependency. Extra keys are allowed via the `[key: string]` index so
 * vendor-specific annotations (`x-foo`, `markdownDescription`) still typecheck.
 */
export interface AddonTypeSchema {
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
  readonly properties?: Readonly<Record<string, AddonTypeSchema>>;
  readonly required?: ReadonlyArray<string>;
  readonly additionalProperties?: boolean | AddonTypeSchema;
  readonly items?: AddonTypeSchema | ReadonlyArray<AddonTypeSchema>;
  readonly oneOf?: ReadonlyArray<AddonTypeSchema>;
  readonly anyOf?: ReadonlyArray<AddonTypeSchema>;
  readonly allOf?: ReadonlyArray<AddonTypeSchema>;
  readonly not?: AddonTypeSchema;
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
 * Optional shape validator a type ships to enforce its required fields at
 * runtime. Throws are caught by the validator and converted into lenient
 * warnings; the offending addon is dropped and the form keeps rendering.
 */
export type AddonShapeValidator<T extends BaseAddon = BaseAddon> = (addon: T, fieldKey: string) => void;

/** Per-type registration metadata. */
export interface AddonTypeDefinition<T extends BaseAddon = BaseAddon> {
  /** Discriminant matching `addon.type`. */
  readonly type: string;
  /** Lazy loader for the type's renderer component. */
  readonly loadComponent: LazyComponentLoader;
  /** Optional shape validator — throw `DynamicFormError` to drop the addon with a warning. */
  readonly validate?: AddonShapeValidator<T>;
  /** Optional JSON Schema fragment for MCP / pre-flight tooling. */
  readonly schema?: AddonTypeSchema;
  /**
   * Whether the type survives `JSON.stringify` / `JSON.parse`. Types whose
   * shape includes a function payload (e.g., the built-in `'component'`
   * loader, inline `prime-button` `action` handlers) declare `jsonSafe: false`
   * so the validator drops them when the config was loaded from a JSON
   * source (`sanitizeFormConfig(config, { source: 'json' })`). Defaults to
   * `true` — types are JSON-safe unless explicitly opted out.
   */
  readonly jsonSafe?: boolean;
}

/** Per-field-type addon-support metadata declared at field registration. */
export interface FieldAddonSupport {
  /** Slots a field of this type accepts. */
  readonly slots: readonly AddonSlot[];
  /** Optional whitelist of allowed addon types. Omitted = any registered type. */
  readonly allowedTypes?: readonly string[];
}

/** Global registry of addon types. */
export const ADDON_TYPE_REGISTRY = new InjectionToken<Map<string, AddonTypeDefinition>>('ADDON_TYPE_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map<string, AddonTypeDefinition>(),
});

/**
 * Cache for resolved addon-type components. Provided at form scope by
 * `provideDynamicForm`.
 *
 * @internal
 */
export const ADDON_TYPE_COMPONENT_CACHE = new InjectionToken<Map<string, Type<unknown>>>('ADDON_TYPE_COMPONENT_CACHE');

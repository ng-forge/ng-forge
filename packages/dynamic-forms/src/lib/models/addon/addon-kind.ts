import { InjectionToken } from '@angular/core';
import { LazyComponentLoader } from '../wrapper-type';
import { BaseAddon } from './addon-def';
import { AddonSlot } from './addon-slot';

/**
 * JSON Schema fragment used by the MCP server to surface an addon kind's
 * shape to AI form generators. Manually authored per kind for MVP;
 * auto-extracted from TypeScript types in a follow-up.
 */
export type AddonKindSchema = Record<string, unknown>;

/**
 * Optional shape validator a kind ships to enforce its required fields at
 * runtime. Throws are caught by the validator and converted into lenient
 * warnings; the offending addon is dropped and the form keeps rendering.
 */
export type AddonShapeValidator<T extends BaseAddon = BaseAddon> = (addon: T, fieldKey: string) => void;

/**
 * Per-kind registration metadata.
 *
 * Registered via `withCustomAddon(...)` features (or adapter feature
 * helpers like `withPrimeNGAddons()`); resolved at render time by
 * `<df-addon-slot>`.
 */
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
   * loader, inline `pi-button` `action` handlers) declare `jsonSafe: false`
   * so the validator drops them when the config was loaded from a JSON
   * source (`validateFormConfig(config, { source: 'json' })`). Defaults to
   * `true` — kinds are JSON-safe unless explicitly opted out.
   */
  readonly jsonSafe?: boolean;
}

/**
 * Per-field-type addon-support metadata declared at field registration.
 *
 * Source of truth for the runtime validator: which slots are valid for a
 * field type, which kinds are accepted (optional whitelist).
 *
 * Field types that do not declare `addons` on their `FieldTypeDefinition`
 * are treated as Tier 3 — addons configured on such fields are dropped
 * with a warning at config init.
 */
export interface FieldAddonSupport {
  /** Slots a field of this type accepts. */
  readonly slots: readonly AddonSlot[];
  /** Optional whitelist of allowed addon kinds. Omitted = any registered kind. */
  readonly allowedKinds?: readonly string[];
}

/**
 * Global registry of addon kinds.
 *
 * Populated by `withCustomAddon(...)` features and adapter feature helpers
 * (e.g., `withPrimeNGAddons()`). Read by `<df-addon-slot>` to resolve a
 * kind discriminant to its renderer component.
 */
export const ADDON_KIND_REGISTRY = new InjectionToken<Map<string, AddonKindDefinition>>('ADDON_KIND_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map<string, AddonKindDefinition>(),
});

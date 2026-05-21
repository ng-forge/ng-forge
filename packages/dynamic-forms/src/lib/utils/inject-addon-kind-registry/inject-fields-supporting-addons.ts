import { inject } from '@angular/core';
import { FieldAddonSupport } from '../../models/addon/addon-kind';
import { FIELD_REGISTRY } from '../../models/field-type';

/**
 * One entry per field type that declares addon support.
 *
 * `name` is the field-type discriminant; `slots` and `allowedKinds` mirror
 * the `FieldTypeDefinition.addons` registration.
 */
export interface FieldAddonSupportEntry {
  readonly name: string;
  readonly slots: FieldAddonSupport['slots'];
  readonly allowedKinds: FieldAddonSupport['allowedKinds'];
}

/**
 * Walk `FIELD_REGISTRY` and return every field type that opted into addons
 * (i.e., declared `addons` on its `FieldTypeDefinition`).
 *
 * Useful for tooling — admin UIs surfacing "which fields can carry addons?",
 * docs generators, MCP server cross-checks. Field types without an `addons`
 * registration ("Tier 3" — toggle, checkbox, radio, slider) are excluded.
 *
 * Must be called within an injection context.
 *
 * @example
 * ```typescript
 * @Component({ ... })
 * class FormBuilder {
 *   protected readonly addonable = injectFieldsSupportingAddons();
 *
 *   constructor() {
 *     // -> [{ name: 'prime-input', slots: ['prefix', 'suffix'], allowedKinds: [...] }, ...]
 *   }
 * }
 * ```
 */
export function injectFieldsSupportingAddons(): FieldAddonSupportEntry[] {
  const registry = inject(FIELD_REGISTRY);
  const entries: FieldAddonSupportEntry[] = [];
  for (const [name, def] of registry.entries()) {
    if (def.addons === undefined) continue;
    entries.push({ name, slots: def.addons.slots, allowedKinds: def.addons.allowedKinds });
  }
  return entries;
}

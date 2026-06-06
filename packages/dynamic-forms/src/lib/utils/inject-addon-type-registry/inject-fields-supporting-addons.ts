import { inject } from '@angular/core';
import { FieldAddonSupport } from '@ng-forge/dynamic-forms/internal';
import { FIELD_REGISTRY } from '@ng-forge/dynamic-forms/internal';

/** One entry per field type that declares addon support. */
export interface FieldAddonSupportEntry {
  readonly name: string;
  readonly slots: FieldAddonSupport['slots'];
  readonly allowedTypes: FieldAddonSupport['allowedTypes'];
}

/**
 * Walk `FIELD_REGISTRY` and return every field type that opted into addons
 * (i.e., declared `addons` on its `FieldTypeDefinition`).
 *
 * @Component({ ... })
 * class FormBuilder {
 *   protected readonly addonable = injectFieldsSupportingAddons();
 *
 *   constructor() {
 *     // -> [{ name: 'prime-input', slots: ['prefix', 'suffix'], allowedTypes: [...] }, ...]
 *   }
 * }
 * ```
 */
export function injectFieldsSupportingAddons(): FieldAddonSupportEntry[] {
  const registry = inject(FIELD_REGISTRY);
  const entries: FieldAddonSupportEntry[] = [];
  for (const [name, def] of registry.entries()) {
    if (def.addons === undefined) continue;
    entries.push({ name, slots: def.addons.slots, allowedTypes: def.addons.allowedTypes });
  }
  return entries;
}

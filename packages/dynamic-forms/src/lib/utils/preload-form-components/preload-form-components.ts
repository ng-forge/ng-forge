import { inject, Type } from '@angular/core';
import { DEFAULT_WRAPPERS, FieldDef, FormConfig, WRAPPER_AUTO_ASSOCIATIONS, WRAPPER_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import { WRAPPER_COMPONENT_CACHE } from '@ng-forge/dynamic-forms/internal';
import { injectFieldRegistry } from '../inject-field-registry/inject-field-registry';
import { loadWrapperComponent } from '../wrapper-chain/wrapper-chain';
import { resolveWrappers } from '../resolve-wrappers/resolve-wrappers';

/**
 * Collects every field type named anywhere in a config, including inside
 * containers. Containers hold their children under `fields`, and array item
 * templates under `fields` too, so one recursive walk covers both.
 */
function collectFieldDefs(fields: readonly FieldDef<unknown>[] | undefined, out: FieldDef<unknown>[] = []): FieldDef<unknown>[] {
  for (const field of fields ?? []) {
    out.push(field);
    const children = (field as { fields?: unknown }).fields;
    if (Array.isArray(children)) {
      // Array item templates nest one level deeper: `fields: [[...template]]`.
      for (const child of children) {
        if (Array.isArray(child)) collectFieldDefs(child as FieldDef<unknown>[], out);
        else collectFieldDefs([child as FieldDef<unknown>], out);
      }
    }
  }
  return out;
}

/**
 * Warms the field- and wrapper-component caches for everything a config will
 * actually render, in parallel, as soon as the config is known.
 *
 * Without this the two sets load in sequence: a field's wrapper chain is
 * resolved inside `DfFieldOutlet`, which does not exist until that field's own
 * component has loaded. Measured on the 240-field fixture, that dependent
 * waterfall put the last wrapper chunk 30ms before first paint on localhost,
 * where a round trip costs ~1ms — on a real network each wave costs a full RTT.
 *
 * Nothing extra is fetched: this is exactly the set that would load anyway, only
 * sooner and at the same time. Both loaders dedupe (field loads through
 * `COMPONENT_LOAD_CACHE`, wrapper loads through the module system's own
 * `import()` dedup), so racing the normal resolution path is safe.
 *
 * Warming the caches also lets the sync fast paths take over: `resolveFieldSync`
 * and the wrapper chain controller's "every wrapper cached" branch both skip
 * their async hop entirely once the cache is populated.
 *
 * Failures are swallowed on purpose. This is a head start, not a load-bearing
 * step — every one of these types is loaded again through the normal path,
 * which owns the real error reporting.
 */
export function injectFormComponentPreloader(): (config: FormConfig) => void {
  const fieldRegistry = injectFieldRegistry();
  const wrapperRegistry = inject(WRAPPER_REGISTRY);
  const wrapperCache = inject(WRAPPER_COMPONENT_CACHE);
  const autoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  const defaultWrappers = inject(DEFAULT_WRAPPERS, { optional: true });

  return (config: FormConfig): void => {
    const defs = collectFieldDefs(config.fields as readonly FieldDef<unknown>[]);
    if (defs.length === 0) return;

    const fieldTypes = new Set<string>();
    const wrapperTypes = new Set<string>();

    for (const def of defs) {
      if (def.type) fieldTypes.add(def.type);
      // Pure function of the field def plus registry state, all of it known
      // here — which is what makes the wrapper set computable before any field
      // has rendered.
      for (const wrapper of resolveWrappers(def, defaultWrappers?.(), autoAssociations, wrapperRegistry)) {
        wrapperTypes.add(wrapper.type);
      }
    }

    const started: Promise<unknown>[] = [];
    for (const type of fieldTypes) {
      if (fieldRegistry.getLoadedComponent(type)) continue;
      started.push(Promise.resolve(fieldRegistry.loadTypeComponent(type)).catch(() => undefined));
    }
    for (const type of wrapperTypes) {
      if (wrapperCache.has(type)) continue;
      started.push(loadWrapperComponent(type, wrapperRegistry, wrapperCache).catch((): Type<unknown> | undefined => undefined));
    }
    // Deliberately not awaited: rendering must not be gated on the head start.
    void Promise.allSettled(started);
  };
}

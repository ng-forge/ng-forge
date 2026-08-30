import { inject, Type } from '@angular/core';
import {
  DEFAULT_WRAPPERS,
  FieldDef,
  FormConfig,
  isPageField,
  WRAPPER_AUTO_ASSOCIATIONS,
  WRAPPER_COMPONENT_LOAD_CACHE,
  WRAPPER_REGISTRY,
} from '@ng-forge/dynamic-forms/internal';
import { WRAPPER_COMPONENT_CACHE } from '@ng-forge/dynamic-forms/internal';
import { injectFieldRegistry } from '../inject-field-registry/inject-field-registry';
import { loadWrapperComponent } from '../wrapper-chain/wrapper-chain';
import { resolveWrappers } from '../resolve-wrappers/resolve-wrappers';
import { normalizeSimplifiedArrays } from '../array-field/normalize-simplified-arrays';
import { getNormalizedArrayMetadata } from '../array-field/normalized-array-metadata';

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

    const metadata = getNormalizedArrayMetadata(field);
    const template = metadata?.template;
    if (Array.isArray(template)) collectFieldDefs(template as readonly FieldDef<unknown>[], out);
    else if (template) collectFieldDefs([template as FieldDef<unknown>], out);
    if (metadata?.autoRemoveButton) collectFieldDefs([metadata.autoRemoveButton], out);
  }
  return out;
}

export interface FormComponentPreloader {
  /** Preload a complete non-paged form config. Paged configs are orchestrator-owned. */
  readonly preloadConfig: (config: FormConfig) => void;
  /** Preload the exact field subtree selected for rendering. */
  readonly preloadFields: (fields: readonly FieldDef<unknown>[]) => void;
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
 * Only the current render scope is fetched: a flat form, or the active page
 * window selected by PageOrchestrator. Both loaders dedupe (field loads through
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
export function injectFormComponentPreloader(): FormComponentPreloader {
  const fieldRegistry = injectFieldRegistry();
  const wrapperRegistry = inject(WRAPPER_REGISTRY);
  const wrapperCache = inject(WRAPPER_COMPONENT_CACHE);
  const wrapperLoadCache = inject(WRAPPER_COMPONENT_LOAD_CACHE);
  const autoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  const defaultWrappers = inject(DEFAULT_WRAPPERS, { optional: true });
  const preloadedConfigs = new WeakSet<FormConfig>();
  const preloadedFieldRoots = new WeakSet<FieldDef<unknown>>();

  const preloadFields = (fields: readonly FieldDef<unknown>[]): void => {
    const unseenFields = fields.filter((field) => {
      if (preloadedFieldRoots.has(field)) return false;
      preloadedFieldRoots.add(field);
      return true;
    });
    if (unseenFields.length === 0) return;

    const normalizedFields = normalizeSimplifiedArrays(unseenFields);
    const defs = collectFieldDefs(normalizedFields);
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
      started.push(
        loadWrapperComponent(type, wrapperRegistry, wrapperCache, wrapperLoadCache).catch((): Type<unknown> | undefined => undefined),
      );
    }
    // Deliberately not awaited: rendering must not be gated on the head start.
    void Promise.allSettled(started);
  };

  return {
    preloadConfig: (config: FormConfig): void => {
      if (preloadedConfigs.has(config)) return;
      preloadedConfigs.add(config);

      const fields = config.fields as readonly FieldDef<unknown>[];
      // PageOrchestrator owns paged rendering and calls preloadFields for the
      // active page plus its configured neighbours. Walking the raw config here
      // would eagerly fetch chunks for every distant page.
      if (fields.length > 0 && fields.every(isPageField)) return;
      preloadFields(fields);
    },
    preloadFields,
  };
}

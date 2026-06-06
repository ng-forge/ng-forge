import { inject, InjectionToken } from '@angular/core';
import { AddonActionContext } from './addon-action';

/** Handler signature for user-registered addon actions. */
export type AddonActionHandler<TValue = unknown> = (ctx: AddonActionContext<TValue>) => void;

/**
 * Multi-provider token populated by `withAddonActions({...})` calls.
 * `ADDON_ACTION_REGISTRY` aggregates these into a single name → handler map.
 *
 * @internal
 */
export const ADDON_ACTION_HANDLERS = new InjectionToken<readonly Record<string, AddonActionHandler>[]>('ADDON_ACTION_HANDLERS');

/**
 * Form-scoped name → handler map. Read by adapter button types at click
 * time for `actionRef: 'name'` lookups. Provided at form scope (not root)
 * because `ADDON_ACTION_HANDLERS` is form-scoped via `withAddonActions`.
 */
export const ADDON_ACTION_REGISTRY = new InjectionToken<ReadonlyMap<string, AddonActionHandler>>('ADDON_ACTION_REGISTRY');

export function createAddonActionRegistry(): ReadonlyMap<string, AddonActionHandler> {
  const sources = inject(ADDON_ACTION_HANDLERS, { optional: true }) ?? [];
  const map = new Map<string, AddonActionHandler>();
  for (const handlers of sources) {
    for (const [name, fn] of Object.entries(handlers)) {
      map.set(name, fn);
    }
  }
  return map;
}

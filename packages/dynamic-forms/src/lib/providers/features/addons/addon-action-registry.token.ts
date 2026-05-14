import { inject, InjectionToken } from '@angular/core';
import { AddonActionContext } from '../../../models/addon/addon-action';

/**
 * Handler signature for user-registered addon actions.
 *
 * Backends reference handlers by name via `actionRef: 'name'` on button-style
 * addons; the dispatcher invokes the registered function with the addon's
 * action context.
 */
export type AddonActionHandler<TValue = unknown> = (ctx: AddonActionContext<TValue>) => void;

/**
 * Multi-provider token populated by `provideAddonActions({...})` calls.
 * `ADDON_ACTION_REGISTRY` aggregates these into a single name → handler map.
 *
 * @internal
 */
export const ADDON_ACTION_HANDLERS = new InjectionToken<readonly Record<string, AddonActionHandler>[]>('ADDON_ACTION_HANDLERS');

/**
 * Form-scoped registry mapping action names to their handler functions.
 *
 * Read by adapter button kinds (e.g., `pi-button`) when an addon configures
 * `actionRef: 'name'` — the button looks up `name` here at click time.
 *
 * Provided at the form component scope by `provideDynamicFormDI()` (NOT at
 * root) — the multi-provider source `ADDON_ACTION_HANDLERS` is form-scoped
 * via `provideAddonActions(...)`, so its aggregation has to live in the
 * same injector tree to see those entries.
 */
export const ADDON_ACTION_REGISTRY = new InjectionToken<ReadonlyMap<string, AddonActionHandler>>('ADDON_ACTION_REGISTRY');

/** Factory used by `provideDynamicFormDI()` to build the form-scoped registry from `ADDON_ACTION_HANDLERS`. */
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

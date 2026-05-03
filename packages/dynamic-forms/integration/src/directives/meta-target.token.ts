import { InjectionToken, Provider, Signal } from '@angular/core';

/**
 * Configuration for `NgForgeField`'s built-in meta-attribute tracking.
 *
 * - `kind: 'selector'` — apply meta attributes to descendants matching `selector`.
 * - `kind: 'host'` — apply meta attributes directly to the component's host element.
 *    Useful for shadow-DOM-encapsulated wrappers (PrimeNG `p-select`, etc.) where
 *    no light-DOM child is the canonical control.
 * - `kind: 'skip'` — directive does NOT run `setupMetaTracking`. Use when the
 *    component handles meta tracking itself (e.g. radio groups whose dependents
 *    reference instance signals not available at provider-definition time).
 */
export type MetaTargetConfig = { kind: 'selector'; selector: string; dependents?: Signal<unknown>[] } | { kind: 'host' } | { kind: 'skip' };

/**
 * Injection token consumed by `NgForgeField` to decide where meta attributes are applied.
 *
 * Adapter components configure this declaratively via the `provideMetaTarget()`,
 * `provideHostMetaTarget()`, and `provideSkipMetaTarget()` helpers. When no provider
 * is supplied the directive does NOT run meta tracking — components must opt in
 * explicitly so the target is unambiguous.
 */
export const NG_FORGE_FIELD_META_TARGET = new InjectionToken<MetaTargetConfig>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NG_FORGE_FIELD_META_TARGET' : '',
);

/**
 * Provider helper for `NgForgeField`'s meta-attribute tracking.
 *
 * @param selector CSS selector used to find the descendant element(s) the
 *   field's `meta` should be forwarded onto (e.g. `'input'`, `'mat-select'`,
 *   `'p-checkbox'`).
 * @param options.dependents Additional signals whose changes should trigger
 *   re-application of meta. Required when the matched elements are recreated
 *   reactively (typically only for dynamic option lists).
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [NG_FORGE_FIELD_HOST_DIRECTIVE],
 *   providers: [provideMetaTarget('mat-select')],
 *   template: `...`,
 * })
 * export class MatSelectField { ... }
 * ```
 */
export function provideMetaTarget(selector: string, options?: { dependents?: Signal<unknown>[] }): Provider {
  return {
    provide: NG_FORGE_FIELD_META_TARGET,
    useValue: { kind: 'selector', selector, dependents: options?.dependents },
  };
}

/**
 * Provider helper that applies field meta attributes directly to the host element.
 *
 * Use when the component is a shadow-DOM-encapsulated wrapper (PrimeNG `p-select`,
 * Ionic web components) where no light-DOM child is the canonical control.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [NG_FORGE_FIELD_HOST_DIRECTIVE],
 *   providers: [provideHostMetaTarget()],
 *   template: `...`,
 * })
 * export class PrimeSelectField { ... }
 * ```
 */
export function provideHostMetaTarget(): Provider {
  return {
    provide: NG_FORGE_FIELD_META_TARGET,
    useValue: { kind: 'host' },
  };
}

/**
 * Provider helper that opts a component OUT of `NgForgeField`'s built-in meta tracking.
 *
 * Use when the component must call `setupMetaTracking` manually — typically because
 * its `dependents` array references component-instance signals (e.g. an `options`
 * input on a radio group) that aren't accessible at provider-definition time.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [NG_FORGE_FIELD_HOST_DIRECTIVE],
 *   providers: [provideSkipMetaTarget()],
 *   template: `...`,
 * })
 * export class MyRadioField {
 *   readonly options = input<...>();
 *   constructor() {
 *     setupMetaTracking(inject(ElementRef), this.field.meta, {
 *       selector: 'input[type="radio"]',
 *       dependents: [this.options],
 *     });
 *   }
 * }
 * ```
 */
export function provideSkipMetaTarget(): Provider {
  return {
    provide: NG_FORGE_FIELD_META_TARGET,
    useValue: { kind: 'skip' },
  };
}

import { afterRenderEffect, ElementRef, isDevMode, Signal } from '@angular/core';
import { applyMetaToElement, FieldMeta, isEqual } from '@ng-forge/dynamic-forms/internal';

/** Configuration options for setupMetaTracking. */
export interface MetaTrackingOptions {
  /**
   * CSS selector for target elements within the host.
   * If not provided, meta attributes are applied directly to the host element.
   */
  selector?: string;

  /**
   * Additional signals to track that should trigger re-application of meta.
   * Useful for components where DOM elements are dynamically created (e.g., radio options).
   */
  dependents?: Signal<unknown>[];
}

// Shared options: selector may be string or accessor; computeAttrs is the
// merged attribute record (meta + optional parent aria).
interface ApplyAttrsOptions {
  readonly selector?: string | (() => string | undefined);
  readonly dependents?: readonly Signal<unknown>[];
}

/**
 * Resolve target set, compute combined attrs, apply via applyMetaToElement.
 * Target resolution is cached by selector identity — re-resolves only on
 * selector change or `dependents` change. afterRenderEffect is signal-tracked,
 * so the callback re-runs only when computeAttrs / dependents differ.
 *
 * @internal
 */
function applyTrackedAttrsToTargets(
  elementRef: ElementRef<HTMLElement>,
  computeAttrs: () => FieldMeta | undefined,
  options: ApplyAttrsOptions = {},
): void {
  const appliedByElement = new WeakMap<Element, Set<string>>();
  let cachedSelector: string | undefined;
  let cachedTargets: Element[] = [];
  let previousAttrs: FieldMeta | undefined;
  let previousDeps: readonly unknown[] | undefined;
  const warnedSelectors = isDevMode() ? new Set<string>() : undefined;

  afterRenderEffect({
    write: () => {
      // Read dependents first so afterRenderEffect tracks them.
      const currentDeps = options.dependents?.map((d) => d());
      const attrs = computeAttrs();
      const selector = (typeof options.selector === 'function' ? options.selector() : options.selector)?.trim() || undefined;

      const selectorChanged = selector !== cachedSelector;
      const depsChanged =
        !!currentDeps &&
        (!previousDeps || currentDeps.length !== previousDeps.length || currentDeps.some((d, i) => d !== previousDeps![i]));

      if (selectorChanged || depsChanged || cachedTargets.length === 0) {
        cachedSelector = selector;
        cachedTargets = selector ? Array.from(elementRef.nativeElement.querySelectorAll(selector)) : [elementRef.nativeElement];
      }

      previousDeps = currentDeps;

      // Dev-mode safety net: selector typo or wrong descendant query leaves
      // meta + aria unapplied. Warn the first time we'd apply non-empty attrs
      // to zero matches for a given selector. Re-warns only when the selector
      // string changes (so authors fixing one typo see the next).
      if (warnedSelectors && selector && cachedTargets.length === 0 && attrs && Object.keys(attrs).length > 0) {
        if (!warnedSelectors.has(selector)) {
          warnedSelectors.add(selector);
          const tag = elementRef.nativeElement.tagName.toLowerCase();
          console.warn(
            `[Dynamic Forms] ngForgeControl selector "${selector}" matched no descendants of <${tag}> — meta + aria attributes will not be applied. ` +
              `Check the selector for typos, or supply 'dependents' if the target is rendered after a signal emits.`,
          );
        }
      }

      // Bail when attrs unchanged AND nothing structural moved — keeps repeated
      // effect runs (driven by an unrelated tracked-signal flicker) cheap.
      if (!selectorChanged && !depsChanged && isEqual(attrs, previousAttrs)) {
        return;
      }
      previousAttrs = attrs;

      for (const el of cachedTargets) {
        const applied = appliedByElement.get(el) ?? new Set<string>();
        appliedByElement.set(el, applyMetaToElement(el as HTMLElement, attrs, applied));
      }
    },
  });
}

/**
 * Sets up automatic meta attribute tracking and application for wrapped components.
 *
 * @param elementRef - Reference to the host element
 * @param meta - Signal containing meta attributes to apply
 * @param options - Configuration options
 */
export function setupMetaTracking(
  elementRef: ElementRef<HTMLElement>,
  meta: Signal<FieldMeta | undefined>,
  options?: MetaTrackingOptions,
): void {
  applyTrackedAttrsToTargets(elementRef, () => meta(), { selector: options?.selector, dependents: options?.dependents });
}

/**
 * Marker-directive variant: writes parent meta + aria to resolved targets.
 * Parent aria wins on key collision. Internal to NgForgeControl/HostControl.
 *
 * @internal
 */
export function setupMarkerAttrTracking(
  elementRef: ElementRef<HTMLElement>,
  parent: {
    readonly meta: Signal<FieldMeta | undefined>;
    readonly ariaInvalid: Signal<boolean>;
    readonly ariaRequired: Signal<true | null>;
    readonly ariaDescribedBy: Signal<string | null>;
  },
  selector: () => string | undefined,
): void {
  applyTrackedAttrsToTargets(
    elementRef,
    () => {
      const ariaRequired = parent.ariaRequired();
      const ariaDescribedBy = parent.ariaDescribedBy();
      // Skip null aria-required/describedby so applyMetaToElement removes the
      // attr (rather than serializing "null") on transitions.
      return {
        ...(parent.meta() ?? {}),
        'aria-invalid': parent.ariaInvalid(),
        ...(ariaRequired === null ? {} : { 'aria-required': ariaRequired }),
        ...(ariaDescribedBy === null ? {} : { 'aria-describedby': ariaDescribedBy }),
      };
    },
    { selector },
  );
}

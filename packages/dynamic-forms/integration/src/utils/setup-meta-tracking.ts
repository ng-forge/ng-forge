import { afterRenderEffect, ElementRef, Signal } from '@angular/core';
import { applyMetaToElement, FieldMeta } from '@ng-forge/dynamic-forms';

/**
 * Configuration options for setupMetaTracking.
 */
export interface MetaTrackingOptions {
  /**
   * CSS selector for target elements within the host.
   * If not provided, meta attributes are applied directly to the host element.
   *
   * @example
   * // Apply to internal radio inputs
   * selector: 'input[type="radio"]'
   *
   * // Apply to host element (for Shadow DOM components)
   * selector: undefined
   */
  selector?: string;

  /**
   * Additional signals to track that should trigger re-application of meta.
   * Useful for components where DOM elements are dynamically created (e.g., radio options).
   *
   * @example
   * // Re-apply when options change
   * dependents: [this.options]
   */
  dependents?: Signal<unknown>[];
}

/**
 * Sets up automatic meta attribute tracking and application for wrapped components.
 *
 * This utility creates an `afterRenderEffect` that applies meta attributes to DOM elements
 * after Angular's render cycle. It efficiently tracks signal dependencies and only re-applies
 * when the meta signal or any dependent signals change.
 *
 * Use this instead of MutationObserver for better performance and integration with Angular's
 * change detection.
 *
 * @param elementRef - Reference to the host element
 * @param meta - Signal containing meta attributes to apply
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * // For a radio group with dynamic options
 * constructor() {
 *   setupMetaTracking(inject(ElementRef), this.meta, {
 *     selector: 'input[type="radio"]',
 *     dependents: [this.options]
 *   });
 * }
 *
 * // For a simple checkbox
 * constructor() {
 *   setupMetaTracking(inject(ElementRef), this.meta, {
 *     selector: 'input[type="checkbox"]'
 *   });
 * }
 *
 * // For Shadow DOM components (apply to host)
 * constructor() {
 *   setupMetaTracking(inject(ElementRef), this.meta);
 * }
 * ```
 */
export function setupMetaTracking(
  elementRef: ElementRef<HTMLElement>,
  meta: Signal<FieldMeta | undefined>,
  options?: MetaTrackingOptions,
): void {
  let appliedAttributes = new Set<string>();

  afterRenderEffect({
    write: () => {
      // Read dependents to establish signal tracking
      options?.dependents?.forEach((dep) => dep());

      const currentMeta = meta();
      const hostElement = elementRef.nativeElement;

      if (options?.selector) {
        // Apply to elements matching selector
        const elements = hostElement.querySelectorAll(options.selector);
        const allApplied = new Set<string>();

        elements.forEach((el) => {
          const applied = applyMetaToElement(el, currentMeta, appliedAttributes);
          applied.forEach((attr) => allApplied.add(attr));
        });

        appliedAttributes = allApplied;
      } else {
        // Apply to host element (for Shadow DOM components)
        appliedAttributes = applyMetaToElement(hostElement, currentMeta, appliedAttributes);
      }
    },
  });
}

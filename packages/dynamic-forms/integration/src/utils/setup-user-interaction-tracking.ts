import { afterNextRender, DestroyRef, ElementRef, inject, InputSignal } from '@angular/core';
import { USER_INTERACTION_TRACKER } from '@ng-forge/dynamic-forms';

/**
 * Configuration options for setupUserInteractionTracking.
 */
export interface UserInteractionTrackingOptions {
  /**
   * CSS selector for target elements within the host.
   * If not provided, events are listened on the host element.
   *
   * @example
   * selector: 'input'
   * selector: 'textarea'
   * selector: 'mat-select'
   */
  selector?: string;
}

/**
 * Sets up user interaction tracking for a field component.
 *
 * Listens for `input` and `change` events on the target element(s)
 * and marks the field as user-modified in the `UserInteractionTracker`.
 *
 * Uses `afterNextRender` for one-time DOM setup. The key signal is read
 * inside the event handler closure (not during effect execution), so
 * `afterRenderEffect` is unnecessary — we don't need re-binding on
 * signal changes.
 *
 * No-op if `USER_INTERACTION_TRACKER` is not provided in the injector.
 *
 * @param elementRef - Reference to the host element
 * @param key - Input signal containing the field key
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * constructor() {
 *   setupUserInteractionTracking(this.elementRef, this.key, { selector: 'input' });
 * }
 * ```
 *
 * @public
 */
export function setupUserInteractionTracking(
  elementRef: ElementRef<HTMLElement>,
  key: InputSignal<string>,
  options?: UserInteractionTrackingOptions,
): void {
  const tracker = inject(USER_INTERACTION_TRACKER, { optional: true });
  if (!tracker) return;

  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const hostElement = elementRef.nativeElement;

    const handler = () => {
      tracker.markUserModified(key());
    };

    if (options?.selector) {
      const elements = hostElement.querySelectorAll(options.selector);
      elements.forEach((el) => {
        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
      });

      destroyRef.onDestroy(() => {
        elements.forEach((el) => {
          el.removeEventListener('input', handler);
          el.removeEventListener('change', handler);
        });
      });
    } else {
      hostElement.addEventListener('input', handler);
      hostElement.addEventListener('change', handler);

      destroyRef.onDestroy(() => {
        hostElement.removeEventListener('input', handler);
        hostElement.removeEventListener('change', handler);
      });
    }
  });
}

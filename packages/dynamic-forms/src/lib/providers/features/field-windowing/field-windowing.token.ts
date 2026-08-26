import { InjectionToken } from '@angular/core';

/**
 * Global default configuration for progressive field mounting ("field
 * windowing"): fields beyond `eager` render as `@defer (on viewport)`
 * placeholders instead of mounting immediately, and mount only once scrolled
 * near/into view.
 *
 * @internal
 */
export interface FieldWindowingConfig {
  /** Whether field windowing is active. */
  readonly enabled: boolean;
  /** Number of leading fields mounted eagerly (not windowed). */
  readonly eager: number;
  /** CSS `min-height` reserved for each unmounted field's placeholder. */
  readonly placeholderHeight: string;
  /** Parking: hold scrolled-away fields out of change detection, DOM intact. */
  readonly park: FieldParkingConfig;
}

/**
 * Parking config. `@defer (on viewport)` only ever mounts — it never unmounts —
 * so without parking a form that has been scrolled through ends up with every
 * field live again, and the windowing win is handed back for the rest of the
 * session. Parking closes that: a field that scrolls away leaves change
 * detection but keeps its DOM, so it stays findable, autofillable and
 * reachable by assistive tech.
 *
 * Off in this default, on whenever `withFieldWindowing()` is used. Parking
 * suspends model → DOM updates for a scrolled-away field until it returns, so
 * it is a rendering behaviour change and is not something a form should get
 * without asking. It exists to bound what windowing leaves mounted, which is
 * why enabling windowing enables it too.
 *
 * @internal
 */
export interface FieldParkingConfig {
  /** Whether scrolled-away fields are held out of change detection. */
  readonly enabled: boolean;
  /** `IntersectionObserver` rootMargin — how far outside the viewport stays live. */
  readonly margin: string;
}

export const FIELD_WINDOWING = new InjectionToken<FieldWindowingConfig>('FIELD_WINDOWING', {
  providedIn: 'root',
  factory: () => ({ enabled: false, eager: 12, placeholderHeight: '4rem', park: { enabled: false, margin: '100%' } }),
});

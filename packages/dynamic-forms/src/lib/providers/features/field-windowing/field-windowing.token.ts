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
}

export const FIELD_WINDOWING = new InjectionToken<FieldWindowingConfig>('FIELD_WINDOWING', {
  providedIn: 'root',
  factory: () => ({ enabled: false, eager: 12, placeholderHeight: '4rem' }),
});

import { InjectionToken, WritableSignal } from '@angular/core';

/**
 * Per-field writable signal that overrides the input's `type` attribute.
 *
 * Provided at the `prime-input` field component level. The button addon's
 * `'toggle-password-visibility'` preset writes to it; the field component
 * reads it to compute its effective `type`.
 *
 * Optional from a button's perspective — when the button is hosted inside a
 * field that doesn't provide this token (e.g., textarea or a future
 * non-input field), the toggle preset is a no-op.
 *
 * @example provided per-field:
 * ```typescript
 * @Component({
 *   providers: [{ provide: PRIME_INPUT_TYPE_OVERRIDE, useValue: signal(undefined) }],
 * })
 * class PrimeInputFieldComponent { ... }
 * ```
 */
export const PRIME_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('PRIME_INPUT_TYPE_OVERRIDE');

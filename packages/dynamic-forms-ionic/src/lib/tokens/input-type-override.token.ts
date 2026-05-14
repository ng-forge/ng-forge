import { InjectionToken, WritableSignal } from '@angular/core';

/**
 * Per-field writable signal that overrides the input's `type` attribute.
 *
 * Provided at the `ion-input` field component level. The button addon's
 * `'toggle-password-visibility'` preset writes to it; the field component
 * reads it to compute its effective `type`.
 *
 * Optional from a button's perspective — when the button is hosted inside a
 * field that doesn't provide this token (e.g., textarea or a future
 * non-input field), the toggle preset is a no-op.
 */
export const IONIC_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('IONIC_INPUT_TYPE_OVERRIDE');

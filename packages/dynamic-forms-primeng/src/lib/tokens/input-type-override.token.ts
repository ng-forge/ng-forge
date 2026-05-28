import { InjectionToken, WritableSignal } from '@angular/core';

/**
 * Per-field writable signal that overrides the input's `type` attribute.
 *
 * @Component({
 *   providers: [{ provide: PRIME_INPUT_TYPE_OVERRIDE, useValue: signal(undefined) }],
 * })
 * class PrimeInputFieldComponent { ... }
 * ```
 */
export const PRIME_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('PRIME_INPUT_TYPE_OVERRIDE');

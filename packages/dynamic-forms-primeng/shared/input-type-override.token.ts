import { InjectionToken, type WritableSignal } from '@angular/core';

/** Per-field writable signal that overrides the input's `type` attribute. */
export const PRIME_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('PRIME_INPUT_TYPE_OVERRIDE');

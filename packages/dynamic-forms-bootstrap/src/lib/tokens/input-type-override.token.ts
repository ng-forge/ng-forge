import { InjectionToken, WritableSignal } from '@angular/core';

/** Per-field writable signal that overrides the input's `type` attribute. */
export const BS_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('BS_INPUT_TYPE_OVERRIDE');

import { InjectionToken, WritableSignal } from '@angular/core';

/** Per-field writable signal that overrides the input's `type` attribute. */
export const IONIC_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('IONIC_INPUT_TYPE_OVERRIDE');

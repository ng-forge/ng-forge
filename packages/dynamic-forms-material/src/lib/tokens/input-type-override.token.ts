import { InjectionToken, WritableSignal } from '@angular/core';

/**
 * Per-field writable signal that overrides the input's `type` attribute.
 *
 * @Component({
 *   providers: [{ provide: MAT_INPUT_TYPE_OVERRIDE, useValue: signal(undefined) }],
 * })
 * class MatInputFieldComponent { ... }
 * ```
 */
export const MAT_INPUT_TYPE_OVERRIDE = new InjectionToken<WritableSignal<string | undefined>>('MAT_INPUT_TYPE_OVERRIDE');

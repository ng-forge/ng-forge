import { InjectionToken } from '@angular/core';
import { MaterialConfig } from './material-config';

/**
 * Injection token for providing global Material Design configuration.
 *
 * This token is used to inject the global Material configuration into components.
 * It should be provided using the `withMaterialConfig()` function.
 *
 * @example
 * ```typescript
 * // In a component that needs to access global config
 * export class MatInputFieldComponent {
 *   private materialConfig = inject(MATERIAL_CONFIG, { optional: true });
 *
 *   readonly effectiveAppearance = computed(() =>
 *     this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline'
 *   );
 * }
 * ```
 *
 * @public
 */
export const MATERIAL_CONFIG = new InjectionToken<MaterialConfig>('MATERIAL_CONFIG', {
  providedIn: null, // Not provided at root - must be provided explicitly
  factory: () => ({
    // Default values
    appearance: 'outline',
    subscriptSizing: 'dynamic',
    disableRipple: false,
    labelPosition: 'after',
    datepickerTouchUi: false,
    datepickerStartView: 'month',
  }),
});

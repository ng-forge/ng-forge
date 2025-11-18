import { InjectionToken } from '@angular/core';
import { PrimeNGConfig } from './primeng-config';

/**
 * Injection token for providing global PrimeNG configuration.
 *
 * This token is used to inject the global PrimeNG configuration into components.
 * It should be provided using the `withPrimeNGConfig()` function.
 *
 * @example
 * ```typescript
 * // In a component that needs to access global config
 * export class PrimeInputFieldComponent {
 *   private primengConfig = inject(PRIMENG_CONFIG, { optional: true });
 *
 *   readonly effectiveVariant = computed(() =>
 *     this.props()?.variant ?? this.primengConfig?.variant ?? 'outlined'
 *   );
 * }
 * ```
 *
 * @public
 */
export const PRIMENG_CONFIG = new InjectionToken<PrimeNGConfig>('PRIMENG_CONFIG', {
  providedIn: null, // Not provided at root - must be provided explicitly
  factory: () => ({
    // Default values
    variant: 'outlined',
    buttonSeverity: 'primary',
    buttonText: false,
    buttonOutlined: false,
    buttonRaised: false,
    buttonRounded: false,
    datepickerShowIcon: true,
    datepickerTouchUI: false,
    datepickerView: 'date',
  }),
});

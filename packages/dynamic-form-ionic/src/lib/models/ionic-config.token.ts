import { InjectionToken } from '@angular/core';
import { IonicConfig } from './ionic-config';

/**
 * Injection token for providing global Ionic configuration.
 *
 * This token is used to inject the global Ionic configuration into components.
 * It should be provided using the `withIonicFields()` function with config parameter.
 *
 * @example
 * ```typescript
 * // In your app configuration
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withIonicFields({
 *       fill: 'outline',
 *       labelPlacement: 'floating',
 *       color: 'primary',
 *     }))
 *   ],
 * };
 * ```
 *
 * @public
 */
export const IONIC_CONFIG = new InjectionToken<IonicConfig>('IONIC_CONFIG', {
  providedIn: null, // Not provided at root - must be provided explicitly
  factory: () => ({
    // Default values
    fill: 'solid',
    labelPlacement: 'floating',
    inputClearInput: false,
    inputCounter: false,
    buttonFill: 'solid',
    buttonSize: 'default',
    buttonStrong: false,
    selectInterface: 'alert',
  }),
});

import { InjectionToken } from '@angular/core';
import { BootstrapConfig } from './bootstrap-config';

/**
 * Injection token for providing global Bootstrap configuration.
 *
 * This token is used to inject the global Bootstrap configuration into components.
 * It should be provided using the `withBootstrapFields()` function with config parameter.
 *
 * @example
 * ```typescript
 * // In your app configuration
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields({
 *       floatingLabel: true,
 *       size: 'lg',
 *       variant: 'primary',
 *     }))
 *   ],
 * };
 * ```
 *
 * @public
 */
export const BOOTSTRAP_CONFIG = new InjectionToken<BootstrapConfig>('BOOTSTRAP_CONFIG', {
  providedIn: null, // Not provided at root - must be provided explicitly
  factory: () => ({
    // Default values
    floatingLabel: false,
    buttonVariant: 'primary',
    buttonOutline: false,
    buttonBlock: false,
  }),
});

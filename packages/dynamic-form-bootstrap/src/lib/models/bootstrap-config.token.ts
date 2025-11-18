import { InjectionToken } from '@angular/core';
import { BootstrapConfig } from './bootstrap-config';

/**
 * Injection token for providing global Bootstrap configuration.
 *
 * This token is used to inject the global Bootstrap configuration into components.
 * It should be provided using the `withBootstrapConfig()` function.
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

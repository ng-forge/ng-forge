import { InjectionToken } from '@angular/core';
import { BootstrapConfig } from './bootstrap-config';

/**
 * Injection token for Bootstrap form configuration.
 * Use this to provide global configuration for Bootstrap form fields.
 */
export const BOOTSTRAP_CONFIG = new InjectionToken<BootstrapConfig>('BOOTSTRAP_CONFIG');

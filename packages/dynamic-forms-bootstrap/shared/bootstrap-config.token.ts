import { InjectionToken } from '@angular/core';
import type { BootstrapConfig } from './bootstrap-config';

/** Global configuration for Bootstrap form fields. */
export const BOOTSTRAP_CONFIG = new InjectionToken<BootstrapConfig>('BOOTSTRAP_CONFIG');

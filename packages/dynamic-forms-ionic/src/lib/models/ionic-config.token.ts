import { InjectionToken } from '@angular/core';
import { IonicConfig } from './ionic-config';

/**
 * Injection token for Ionic form configuration.
 * Use this to provide global configuration for Ionic form fields.
 */
export const IONIC_CONFIG = new InjectionToken<IonicConfig>('IONIC_CONFIG');

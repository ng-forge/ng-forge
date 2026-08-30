import { InjectionToken } from '@angular/core';
import type { IonicConfig } from './ionic-config';

/** Global configuration for Ionic form fields. */
export const IONIC_CONFIG = new InjectionToken<IonicConfig>('IONIC_CONFIG');

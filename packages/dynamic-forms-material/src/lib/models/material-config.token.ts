import { InjectionToken } from '@angular/core';
import { MaterialConfig } from './material-config';

/**
 * Injection token for Material Design form configuration.
 * Use this to provide global configuration for Material form fields.
 */
export const MATERIAL_CONFIG = new InjectionToken<MaterialConfig>('MATERIAL_CONFIG');

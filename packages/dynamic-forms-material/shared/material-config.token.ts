import { InjectionToken } from '@angular/core';
import type { MaterialConfig } from './material-config';

/** Global configuration for Material Design form fields. */
export const MATERIAL_CONFIG = new InjectionToken<MaterialConfig>('MATERIAL_CONFIG');

import { InjectionToken } from '@angular/core';

export interface Environment {
  exampleBaseUrls: {
    material: string;
    primeng: string;
    ionic: string;
    bootstrap: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');

// URLs are injected at build time via --define
// Development: Individual localhost URLs with different ports
// Production: GitHub Pages subdirectories
export const environment: Environment = {
  exampleBaseUrls: {
    material: MATERIAL_EXAMPLES_URL,
    primeng: PRIMENG_EXAMPLES_URL,
    ionic: IONIC_EXAMPLES_URL,
    bootstrap: BOOTSTRAP_EXAMPLES_URL,
  },
};

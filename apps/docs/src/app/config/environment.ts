import { InjectionToken } from '@angular/core';

export interface Environment {
  exampleBaseUrls: {
    material: string;
    primeng: string;
    ionic: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');

// Base path is injected at build time via --define
// Development default: 'http://localhost:420' (port added per library)
// Production default: '/ng-forge/examples'
export const environment: Environment = {
  exampleBaseUrls: {
    material: `${EXAMPLE_BASE_PATH}1`,
    primeng: `${EXAMPLE_BASE_PATH}2`,
    ionic: `${EXAMPLE_BASE_PATH}3`,
  },
};

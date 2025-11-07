import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  exampleBaseUrls: {
    material: string;
    primeng: string;
    ionic: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');

// Development environment
export const environment: Environment = {
  production: false,
  exampleBaseUrls: {
    material: 'http://localhost:4201',
    primeng: 'http://localhost:4202',
    ionic: 'http://localhost:4203',
  },
};

// Production environment
export const environmentProd: Environment = {
  production: true,
  exampleBaseUrls: {
    // Same domain paths - no CORS issues!
    material: '/ng-forge/examples/material',
    primeng: '/ng-forge/examples/primeng',
    ionic: '/ng-forge/examples/ionic',
  },
};

import { AdapterRegistration } from '@ng-forge/sandbox-harness';
import { Route } from '@angular/router';

type ExamplesLib = { EXAMPLES_ROUTES: Route[] };

function makeLoadRoutes(importFn: () => Promise<ExamplesLib>): () => Promise<Route[]> {
  return async () => {
    const { EXAMPLES_ROUTES } = await importFn();
    return [{ path: 'examples', children: EXAMPLES_ROUTES }];
  };
}

export const SANDBOX_ADAPTERS: AdapterRegistration[] = [
  {
    name: 'material',
    stylesheetUrl: 'material.css',
    defaultRoute: 'examples',
    loadRoutes: makeLoadRoutes(() => import('@ng-forge/examples-material')),
    factory: async (routes) => {
      const { createMaterialApp } = await import('./adapters/material-adapter');
      return createMaterialApp(routes);
    },
  },
  {
    name: 'bootstrap',
    stylesheetUrl: 'bootstrap.css',
    defaultRoute: 'examples',
    loadRoutes: makeLoadRoutes(() => import('@ng-forge/examples-bootstrap')),
    factory: async (routes) => {
      const { createBootstrapApp } = await import('./adapters/bootstrap-adapter');
      return createBootstrapApp(routes);
    },
  },
  {
    name: 'primeng',
    stylesheetUrl: 'primeng.css',
    defaultRoute: 'examples',
    loadRoutes: makeLoadRoutes(() => import('@ng-forge/examples-primeng')),
    factory: async (routes) => {
      const { createPrimeNGApp } = await import('./adapters/primeng-adapter');
      return createPrimeNGApp(routes);
    },
  },
  {
    name: 'ionic',
    stylesheetUrl: 'ionic.css',
    defaultRoute: 'examples',
    loadRoutes: makeLoadRoutes(() => import('@ng-forge/examples-ionic')),
    factory: async (routes) => {
      const { createIonicApp } = await import('./adapters/ionic-adapter');
      return createIonicApp(routes);
    },
  },
];

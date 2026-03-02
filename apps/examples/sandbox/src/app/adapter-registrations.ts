import { AdapterRegistration } from '@ng-forge/sandbox-harness';

export const SANDBOX_ADAPTERS: AdapterRegistration[] = [
  {
    name: 'material',
    stylesheetUrl: 'material.css',
    defaultRoute: 'examples',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-material');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    },
    factory: (routes) => import('./adapters/material-adapter').then((m) => m.createMaterialApp(routes)),
  },
  {
    name: 'bootstrap',
    stylesheetUrl: 'bootstrap.css',
    defaultRoute: 'examples',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-bootstrap');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    },
    factory: (routes) => import('./adapters/bootstrap-adapter').then((m) => m.createBootstrapApp(routes)),
  },
  {
    name: 'primeng',
    stylesheetUrl: 'primeng.css',
    defaultRoute: 'examples',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-primeng');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    },
    factory: (routes) => import('./adapters/primeng-adapter').then((m) => m.createPrimeNGApp(routes)),
  },
  {
    name: 'ionic',
    stylesheetUrl: 'ionic.css',
    defaultRoute: 'examples',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-ionic');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    },
    factory: (routes) => import('./adapters/ionic-adapter').then((m) => m.createIonicApp(routes)),
  },
  {
    name: 'core',
    stylesheetUrl: 'material.css',
    defaultRoute: 'test',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-core');
      return [{ path: 'test', children: lib.TESTING_ROUTES }];
    },
    factory: (routes) => import('./adapters/core-adapter').then((m) => m.createCoreApp(routes)),
  },
];

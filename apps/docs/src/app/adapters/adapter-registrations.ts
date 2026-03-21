import { AdapterRegistration } from '@ng-forge/sandbox-harness';

// Captured on first PrimeNG factory call — must be synchronous so the harness
// can call it before createApplication().
let primengClearStyleCaches: (() => void) | undefined;

export const DOCS_ADAPTERS: AdapterRegistration[] = [
  {
    name: 'material',
    stylesheetUrl: 'material.css',
    defaultRoute: 'examples/input',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-material');
      return [{ path: 'examples', children: lib.EXAMPLES_ROUTES }];
    },
    factory: async (routes) => {
      const lib = await import('@ng-forge/sandbox-adapter-material');
      return lib.createMaterialSandboxApp(routes);
    },
  },
  {
    name: 'bootstrap',
    stylesheetUrl: 'bootstrap.css',
    defaultRoute: 'examples/input',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-bootstrap');
      return [{ path: 'examples', children: lib.EXAMPLES_ROUTES }];
    },
    factory: async (routes) => {
      const lib = await import('@ng-forge/sandbox-adapter-bootstrap');
      return lib.createBootstrapSandboxApp(routes);
    },
  },
  {
    name: 'primeng',
    stylesheetUrl: 'primeng.css',
    defaultRoute: 'examples/input',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-primeng');
      return [{ path: 'examples', children: lib.EXAMPLES_ROUTES }];
    },
    factory: async (routes) => {
      const lib = await import('@ng-forge/sandbox-adapter-primeng');
      // Capture the synchronous cache-clear function on first load.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      primengClearStyleCaches = (lib as any).clearPrimeNGStyleCaches;
      return lib.createPrimeNGSandboxApp(routes);
    },
    clearStyleCaches: () => primengClearStyleCaches?.(),
  },
  {
    name: 'ionic',
    stylesheetUrl: 'ionic.css',
    defaultRoute: 'examples/input',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-ionic');
      return [{ path: 'examples', children: lib.EXAMPLES_ROUTES }];
    },
    factory: async (routes) => {
      const lib = await import('@ng-forge/sandbox-adapter-ionic');
      return lib.createIonicSandboxApp(routes);
    },
  },
];

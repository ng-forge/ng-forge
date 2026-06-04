import { AdapterRegistration } from '@ng-forge/sandbox-harness';

// Captured on first PrimeNG factory call — must be synchronous so the harness
// can call it before createApplication().
let primengClearStyleCaches: (() => void) | undefined;

export const DOCS_ADAPTERS: AdapterRegistration[] = [
  {
    name: 'material',
    stylesheetUrl: 'material.css',
    // Material Icons class rules (`.material-icons { font-family: 'Material Icons'; ... }`)
    // live in the icon-font CSS. Without re-injecting them into the shadow root,
    // <mat-icon>search</mat-icon> renders the ligature text instead of the glyph.
    // Self-hosted from the material-icons npm package (see vite-plugin-icon-fonts).
    extraStylesheetUrls: ['fonts/icons/material-icons/material-icons.css'],
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
    // Bootstrap Icons (`.bi`, `.bi-*::before { content: '\f...'; }`) — re-inject
    // into the shadow root so `<i class="bi bi-search">` renders the glyph.
    // Self-hosted from the bootstrap-icons npm package (see vite-plugin-icon-fonts).
    extraStylesheetUrls: ['fonts/icons/bootstrap-icons/bootstrap-icons.min.css'],
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
    // PrimeIcons (`.pi-*::before { content: '\\e...'; font-family: 'primeicons'; }`).
    // adapter-primeng.scss imports primeicons.css but the font file path can break
    // when the bundle is loaded from a different origin; this self-contained copy is
    // dedup-safe via the browser's font cache.
    // Self-hosted from the primeicons npm package (see vite-plugin-icon-fonts).
    extraStylesheetUrls: ['fonts/icons/primeicons/primeicons.css'],
    defaultRoute: 'examples/input',
    loadRoutes: async () => {
      const lib = await import('@ng-forge/examples-primeng');
      return [{ path: 'examples', children: lib.EXAMPLES_ROUTES }];
    },
    factory: async (routes) => {
      const lib = await import('@ng-forge/sandbox-adapter-primeng');
      // Capture the synchronous cache-clear function on first load.
      primengClearStyleCaches = lib.clearPrimeNGStyleCaches;
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

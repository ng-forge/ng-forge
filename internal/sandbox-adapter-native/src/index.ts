import type { Route } from '@angular/router';

export { createNativeSandboxApp } from './lib/factory';

/**
 * The docs' live examples on native. Only the `demo` route, which renders a config from the docs'
 * glossary: native has no per-adapter scenario components.
 */
export const NATIVE_EXAMPLE_ROUTES: Route[] = [
  {
    path: 'examples',
    children: [
      { path: 'demo', loadComponent: () => import('./lib/demo-scenario.component') },
      { path: '**', loadComponent: () => import('./lib/not-on-native.component') },
    ],
  },
  { path: '**', loadComponent: () => import('./lib/not-on-native.component') },
];

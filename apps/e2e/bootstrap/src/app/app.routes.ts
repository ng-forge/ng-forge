import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'full',
    loadComponent: () => import('./testing/performance/direct-entry-benchmark.component').then((m) => m.DirectEntryBenchmarkComponent),
  },
  {
    path: 'wizard',
    loadComponent: () => import('./testing/performance/direct-entry-benchmark.component').then((m) => m.DirectEntryBenchmarkComponent),
  },
  {
    path: '',
    redirectTo: '/examples',
    pathMatch: 'full',
  },
  {
    path: 'examples',
    loadChildren: () => import('./examples/examples.routes'),
  },
  {
    path: 'test',
    loadChildren: () => import('./testing/testing-routes'),
  },
];

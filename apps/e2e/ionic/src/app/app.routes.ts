import { Route } from '@angular/router';

export const appRoutes: Route[] = [
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
    path: 'testing',
    loadChildren: () => import('./testing/testing-routes'),
  },
  // Alias matching the other adapters (material/bootstrap/primeng use 'test') so
  // cross-adapter perf-bench URLs work uniformly. Existing 'testing' paths kept for back-compat.
  {
    path: 'test',
    loadChildren: () => import('./testing/testing-routes'),
  },
];

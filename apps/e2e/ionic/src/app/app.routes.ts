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
];

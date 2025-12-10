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
    path: 'test',
    loadChildren: () => import('./testing/testing-routes'),
  },
];

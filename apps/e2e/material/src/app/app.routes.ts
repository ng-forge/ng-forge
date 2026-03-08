import { Route } from '@angular/router';

export default [
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
] satisfies Route[];

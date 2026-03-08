import { Route } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: '/test',
    pathMatch: 'full',
  },
  {
    path: 'test',
    loadChildren: () => import('./testing/testing-routes'),
  },
] satisfies Route[];

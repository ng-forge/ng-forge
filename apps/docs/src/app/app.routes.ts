import { Route } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { NG_DOC_ROUTING } from '@ng-doc/generated';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  ...NG_DOC_ROUTING,
  {
    path: '**',
    redirectTo: '',
  },
];

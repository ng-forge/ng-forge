import { Route } from '@angular/router';
import { NG_DOC_ROUTING } from '@ng-doc/generated';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/getting-started',
    pathMatch: 'full'
  },
  ...NG_DOC_ROUTING,
  {
    path: '**',
    redirectTo: '/getting-started'
  }
];

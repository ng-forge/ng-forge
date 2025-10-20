import { Route } from '@angular/router';
import { NG_DOC_ROUTING } from '@ng-doc/generated';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'docs',
    pathMatch: 'full'
  },
  ...NG_DOC_ROUTING,
  {
    path: '**',
    redirectTo: 'docs'
  }
];

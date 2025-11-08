import { Route } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { NG_DOC_ROUTING } from '@ng-doc/generated';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/getting-started/what-is-dynamic-forms',
    pathMatch: 'full',
  },
  ...NG_DOC_ROUTING,
  {
    path: '**',
    redirectTo: '/getting-started/what-is-dynamic-forms',
  },
];

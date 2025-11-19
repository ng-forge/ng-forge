import { Route } from '@angular/router';
import { MultiPageRegistrationComponent } from './multi-page-registration.component';
import { ValidationNavigationComponent } from './validation-navigation.component';
import { BackwardNavigationComponent } from './backward-navigation.component';
import { DirectNavigationComponent } from './direct-navigation.component';
import { PageTransitionsComponent } from './page-transitions.component';

export const MULTI_PAGE_NAVIGATION_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'multi-page-registration',
        component: MultiPageRegistrationComponent,
      },
      {
        path: 'validation-navigation',
        component: ValidationNavigationComponent,
      },
      {
        path: 'backward-navigation',
        component: BackwardNavigationComponent,
      },
      {
        path: 'direct-navigation',
        component: DirectNavigationComponent,
      },
      {
        path: 'page-transitions',
        component: PageTransitionsComponent,
      },
    ],
  },
];

import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/scenarios',
    pathMatch: 'full',
  },
  {
    path: 'scenarios',
    loadComponent: () => import('./scenarios/scenario-list.component').then((m) => m.ScenarioListComponent),
  },
  {
    path: 'single-page',
    loadComponent: () => import('./scenarios/single-page/single-page-demo.component'),
  },
  {
    path: 'e2e-test',
    loadComponent: () => import('./e2e-test/simple-e2e-test-page.component').then((m) => m.SimpleE2ETestPageComponent),
  },
  // {
  //   path: 'multi-page',
  //   loadComponent: () => import('./scenarios/multi-page/multi-page-form.component').then(m => m.MultiPageFormComponent),
  // },
  // {
  //   path: 'cross-field-validation',
  //   loadComponent: () => import('./scenarios/cross-field-validation/cross-field-validation.component').then(m => m.CrossFieldValidationComponent),
  // },
  // {
  //   path: 'user-registration',
  //   loadComponent: () => import('./scenarios/user-registration/user-registration.component').then(m => m.UserRegistrationComponent),
  // },
  // {
  //   path: 'profile-management',
  //   loadComponent: () => import('./scenarios/profile-management/profile-management.component').then(m => m.ProfileManagementComponent),
  // },
];

import { CrossFieldValidationScenarioComponent } from './cross-field-validation.component';
import { ConditionalFieldsScenarioComponent } from './conditional-fields.component';
import { UserRegistrationScenarioComponent } from './user-registration.component';
import { ProfileManagementScenarioComponent } from './profile-management.component';

/**
 * Demo Scenarios Routes
 * Individual routes for each demo scenario test component
 */
export default [
  {
    path: '',
    loadComponent: () => import('./demo-scenarios-index.component').then((m) => m.DemoScenariosIndexComponent),
  },
  {
    path: 'cross-field-validation',
    component: CrossFieldValidationScenarioComponent,
  },
  {
    path: 'conditional-fields',
    component: ConditionalFieldsScenarioComponent,
  },
  {
    path: 'user-registration',
    component: UserRegistrationScenarioComponent,
  },
  {
    path: 'profile-management',
    component: ProfileManagementScenarioComponent,
  },
];

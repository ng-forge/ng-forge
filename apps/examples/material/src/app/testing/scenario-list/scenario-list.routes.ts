import { Routes } from '@angular/router';
import { SinglePageScenarioComponent } from './single-page-scenario.component';
import { MultiPageScenarioComponent } from './multi-page-scenario.component';
import { CrossFieldValidationScenarioComponent } from './cross-field-validation-scenario.component';
import { UserRegistrationScenarioComponent } from './user-registration-scenario.component';
import { ProfileManagementScenarioComponent } from './profile-management-scenario.component';

export const scenarioListRoutes: Routes = [
  {
    path: 'single-page',
    component: SinglePageScenarioComponent,
  },
  {
    path: 'multi-page',
    component: MultiPageScenarioComponent,
  },
  {
    path: 'cross-field-validation',
    component: CrossFieldValidationScenarioComponent,
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

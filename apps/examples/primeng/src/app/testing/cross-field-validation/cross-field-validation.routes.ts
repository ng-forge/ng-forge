import { Routes } from '@angular/router';
import { crossFieldValidationSuite, getCrossFieldValidationScenario } from './cross-field-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: crossFieldValidationSuite },
  },
  {
    path: 'password-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossFieldValidationScenario('password-validation') },
  },
  {
    path: 'conditional-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossFieldValidationScenario('conditional-validation') },
  },
  {
    path: 'dependent-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossFieldValidationScenario('dependent-fields') },
  },
  {
    path: 'enable-disable',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossFieldValidationScenario('enable-disable') },
  },
];

export default routes;

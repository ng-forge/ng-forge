import { Routes } from '@angular/router';
import { cascadingValidationSuite, getCascadingValidationScenario } from './cascading-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: cascadingValidationSuite },
  },
  {
    path: 'basic-hidden-required',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('basic-hidden-required') },
  },
  {
    path: 'toggle-hidden-required',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('toggle-hidden-required') },
  },
  {
    path: 'field-validate-when-hidden',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('field-validate-when-hidden') },
  },
  {
    path: 'form-validate-when-hidden',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('form-validate-when-hidden') },
  },
  {
    path: 'group-cascade-hidden',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('group-cascade-hidden') },
  },
  {
    path: 'cascade-middle-override',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('cascade-middle-override') },
  },
  {
    path: 'array-nested-hidden-required',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCascadingValidationScenario('array-nested-hidden-required') },
  },
];

export default routes;

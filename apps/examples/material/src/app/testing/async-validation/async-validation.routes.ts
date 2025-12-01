import { Routes } from '@angular/router';
import { asyncValidationSuite, getAsyncValidationScenario } from './async-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: asyncValidationSuite },
  },
  {
    path: 'http-get-validator',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncValidationScenario('http-get-validator-test') },
  },
  {
    path: 'http-post-validator',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncValidationScenario('http-post-validator-test') },
  },
  {
    path: 'async-resource-validator',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncValidationScenario('async-resource-validator-test') },
  },
  {
    path: 'http-error-handling',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncValidationScenario('http-error-handling-test') },
  },
  {
    path: 'multiple-validators',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncValidationScenario('multiple-validators-test') },
  },
];

export default routes;

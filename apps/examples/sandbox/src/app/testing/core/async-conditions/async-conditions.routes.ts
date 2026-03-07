import { Routes } from '@angular/router';
import { asyncConditionsSuite, getAsyncConditionsScenario } from './async-conditions.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: asyncConditionsSuite },
  },
  {
    path: 'hidden-async',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('hidden-async-test') },
  },
  {
    path: 'disabled-async',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('disabled-async-test') },
  },
  {
    path: 'required-async',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('required-async-test') },
  },
  {
    path: 'readonly-async',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('readonly-async-test') },
  },
  {
    path: 'async-error-fallback',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('async-error-fallback-test') },
  },
  {
    path: 'async-pending-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('async-pending-value-test') },
  },
  {
    path: 'composite-async',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAsyncConditionsScenario('composite-async-test') },
  },
];

export default routes;

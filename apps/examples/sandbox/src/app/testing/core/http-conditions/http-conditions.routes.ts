import { Routes } from '@angular/router';
import { httpConditionsSuite, getHttpConditionsScenario } from './http-conditions.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: httpConditionsSuite },
  },
  {
    path: 'hidden-http-get',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('hidden-http-get-test') },
  },
  {
    path: 'disabled-http-post',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('disabled-http-post-test') },
  },
  {
    path: 'required-http-condition',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('required-http-condition-test') },
  },
  {
    path: 'readonly-http-condition',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('readonly-http-condition-test') },
  },
  {
    path: 'response-expression',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('response-expression-test') },
  },
  {
    path: 'pending-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('pending-value-test') },
  },
  {
    path: 'http-error-fallback',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('http-error-fallback-test') },
  },
  {
    path: 'cache-behavior',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('cache-behavior-test') },
  },
  {
    path: 'debounce-coalescing',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('debounce-coalescing-test') },
  },
  {
    path: 'multiple-http-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpConditionsScenario('multiple-http-logic-test') },
  },
];

export default routes;

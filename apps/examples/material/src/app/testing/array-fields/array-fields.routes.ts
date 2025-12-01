import { Routes } from '@angular/router';
import { arrayFieldsSuite, getArrayFieldsScenario } from './array-fields.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: arrayFieldsSuite },
  },
  {
    path: 'array-add',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-add') },
  },
  {
    path: 'array-remove',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-remove') },
  },
  {
    path: 'array-values',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-values') },
  },
  {
    path: 'array-initial-values',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-initial-values') },
  },
  {
    path: 'array-item-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-item-validation') },
  },
  {
    path: 'array-min-length',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-min-length') },
  },
  {
    path: 'array-max-length',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-max-length') },
  },
  {
    path: 'array-nested',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-nested') },
  },
  {
    path: 'array-multiple-ops',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-multiple-ops') },
  },
];

export default routes;

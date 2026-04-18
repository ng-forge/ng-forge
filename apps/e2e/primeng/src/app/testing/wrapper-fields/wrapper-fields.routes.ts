import { Routes } from '@angular/router';
import { wrapperFieldsSuite, getWrapperFieldsScenario } from './wrapper-fields.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: wrapperFieldsSuite },
  },
  {
    path: 'wrapper-css',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getWrapperFieldsScenario('wrapper-css') },
  },
  {
    path: 'wrapper-section',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getWrapperFieldsScenario('wrapper-section') },
  },
  {
    path: 'wrapper-defaults',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getWrapperFieldsScenario('wrapper-defaults') },
  },
];

export default routes;

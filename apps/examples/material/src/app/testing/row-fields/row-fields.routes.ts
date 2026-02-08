import { Routes } from '@angular/router';
import { rowFieldsSuite, getRowFieldsScenario } from './row-fields.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: rowFieldsSuite },
  },
  {
    path: 'row-basic-layout',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-basic-layout') },
  },
  {
    path: 'row-conditional-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-conditional-visibility') },
  },
  {
    path: 'row-containing-group',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-containing-group') },
  },
  {
    path: 'row-conditional-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-conditional-fields') },
  },
  {
    path: 'row-multiple-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-multiple-visibility') },
  },
  {
    path: 'row-state-preservation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-state-preservation') },
  },
];

export default routes;

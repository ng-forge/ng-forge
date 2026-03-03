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
    path: 'row-containing-group',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getRowFieldsScenario('row-containing-group') },
  },
];

export default routes;

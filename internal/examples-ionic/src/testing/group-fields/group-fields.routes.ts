import { Routes } from '@angular/router';
import { groupFieldsSuite, getGroupFieldsScenario } from './group-fields.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: groupFieldsSuite },
  },
  {
    path: 'group-value-propagation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getGroupFieldsScenario('group-value-propagation') },
  },
  {
    path: 'group-initial-values',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getGroupFieldsScenario('group-initial-values') },
  },
  {
    path: 'group-nested',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getGroupFieldsScenario('group-nested') },
  },
];

export default routes;

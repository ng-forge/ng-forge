import { Routes } from '@angular/router';
import { containerNestingSuite, getContainerNestingScenario } from './container-nesting.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: containerNestingSuite },
  },
  {
    path: 'array-inside-group',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerNestingScenario('array-inside-group') },
  },
  {
    path: 'group-inside-array',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerNestingScenario('group-inside-array') },
  },
  {
    path: 'row-inside-array',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerNestingScenario('row-inside-array') },
  },
  {
    path: 'deeply-nested',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerNestingScenario('deeply-nested') },
  },
];

export default routes;

import { Routes } from '@angular/router';
import { getIonicComponentsScenario, ionicComponentsSuite } from './ionic-components.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: ionicComponentsSuite },
  },
  {
    path: 'datetime-component',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getIonicComponentsScenario('datetime-component') },
  },
  {
    path: 'range-component',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getIonicComponentsScenario('range-component') },
  },
  {
    path: 'toggle-component',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getIonicComponentsScenario('toggle-component') },
  },
  {
    path: 'checkbox-array-component',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getIonicComponentsScenario('checkbox-array-component') },
  },
];

export default routes;

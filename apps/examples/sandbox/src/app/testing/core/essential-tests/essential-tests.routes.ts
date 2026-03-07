import { Routes } from '@angular/router';
import { essentialTestsSuite, getEssentialTestScenario } from './essential-tests.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: essentialTestsSuite },
  },
  {
    path: 'basic-form',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getEssentialTestScenario('basic-form') },
  },
  {
    path: 'age-based-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getEssentialTestScenario('age-based-logic') },
  },
  {
    path: 'multi-page-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getEssentialTestScenario('multi-page-navigation') },
  },
  {
    path: 'reactive-config-changes',
    loadComponent: () => import('./scenarios/reactive-config-changes.component').then((m) => m.ReactiveConfigChangesComponent),
  },
];

export default routes;

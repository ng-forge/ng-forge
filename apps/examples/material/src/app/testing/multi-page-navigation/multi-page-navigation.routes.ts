import { Routes } from '@angular/router';
import { getMultiPageNavigationScenario, multiPageNavigationSuite } from './multi-page-navigation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: multiPageNavigationSuite },
  },
  {
    path: 'multi-page-registration',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('multi-page-registration') },
  },
  {
    path: 'validation-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('validation-navigation') },
  },
  {
    path: 'backward-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('backward-navigation') },
  },
  {
    path: 'direct-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('direct-navigation') },
  },
  {
    path: 'page-transitions',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('page-transitions') },
  },
  // Conditional Visibility
  {
    path: 'page-conditional-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('page-conditional-visibility') },
  },
  {
    path: 'page-dynamic-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMultiPageNavigationScenario('page-dynamic-navigation') },
  },
];

export default routes;

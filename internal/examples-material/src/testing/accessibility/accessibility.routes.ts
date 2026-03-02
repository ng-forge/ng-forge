import { Routes } from '@angular/router';
import { accessibilitySuite, getAccessibilityScenario } from './accessibility.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: accessibilitySuite },
  },
  {
    path: 'aria-attributes',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAccessibilityScenario('aria-attributes') },
  },
  {
    path: 'all-fields-aria',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAccessibilityScenario('all-fields-aria') },
  },
  {
    path: 'error-announcements',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAccessibilityScenario('error-announcements') },
  },
  {
    path: 'keyboard-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAccessibilityScenario('keyboard-navigation') },
  },
  {
    path: 'focus-management',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAccessibilityScenario('focus-management') },
  },
];

export default routes;

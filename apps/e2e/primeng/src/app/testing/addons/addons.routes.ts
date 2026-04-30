import { Routes } from '@angular/router';
import { addonsSuite, getAddonsScenario } from './addons.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: addonsSuite },
  },
  {
    path: 'icon-prefix',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('icon-prefix') },
  },
  {
    path: 'clear-button',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('clear-button') },
  },
  {
    path: 'text-currency',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('text-currency') },
  },
  {
    path: 'password-toggle',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('password-toggle') },
  },
];

export default routes;

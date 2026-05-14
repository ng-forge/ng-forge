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
  {
    path: 'multi-addons',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('multi-addons') },
  },
  {
    path: 'severity-variants',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('severity-variants') },
  },
  {
    path: 'labelled-button',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('labelled-button') },
  },
  {
    path: 'disabled-addon',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('disabled-addon') },
  },
  {
    path: 'reset-preset',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('reset-preset') },
  },
  {
    path: 'decorative-button',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('decorative-button') },
  },
  {
    path: 'inline-action',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('inline-action') },
  },
  {
    path: 'action-ref',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAddonsScenario('action-ref') },
  },
];

export default routes;

import { Routes } from '@angular/router';
import { demoScenariosSuite, getDemoScenario } from './demo-scenarios.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: demoScenariosSuite },
  },
  {
    path: 'cross-field-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDemoScenario('cross-field-validation') },
  },
  {
    path: 'user-registration',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDemoScenario('user-registration') },
  },
  {
    path: 'profile-management',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDemoScenario('profile-management') },
  },
  {
    path: 'conditional-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDemoScenario('conditional-fields') },
  },
];

export default routes;

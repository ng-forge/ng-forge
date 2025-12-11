import { Routes } from '@angular/router';
import { errorHandlingSuite, getErrorHandlingScenario } from './error-handling.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: errorHandlingSuite },
  },
  {
    path: 'invalid-config',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getErrorHandlingScenario('invalid-config') },
  },
  {
    path: 'basic-test',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getErrorHandlingScenario('basic-test') },
  },
];

export default routes;

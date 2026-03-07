import { Routes } from '@angular/router';
import { comprehensiveFieldTestsSuite, getComprehensiveFieldTestsScenario } from './comprehensive-field-tests.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: comprehensiveFieldTestsSuite },
  },
  {
    path: 'comprehensive-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getComprehensiveFieldTestsScenario('comprehensive-fields-test') },
  },
  {
    path: 'validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getComprehensiveFieldTestsScenario('validation-test') },
  },
  {
    path: 'grid-layout',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getComprehensiveFieldTestsScenario('grid-layout-test') },
  },
  {
    path: 'state-management',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getComprehensiveFieldTestsScenario('state-management-test') },
  },
];

export default routes;

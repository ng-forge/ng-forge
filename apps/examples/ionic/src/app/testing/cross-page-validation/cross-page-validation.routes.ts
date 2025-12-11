import { Routes } from '@angular/router';
import { crossPageValidationSuite, getCrossPageValidationScenario } from './cross-page-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: crossPageValidationSuite },
  },
  {
    path: 'email-verification',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossPageValidationScenario('cross-page-email-verification') },
  },
  {
    path: 'conditional-pages',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossPageValidationScenario('conditional-pages') },
  },
  {
    path: 'business-flow',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossPageValidationScenario('business-flow') },
  },
  {
    path: 'cascade-dependencies',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossPageValidationScenario('cascade-dependencies') },
  },
  {
    path: 'progressive-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getCrossPageValidationScenario('progressive-validation') },
  },
];

export default routes;

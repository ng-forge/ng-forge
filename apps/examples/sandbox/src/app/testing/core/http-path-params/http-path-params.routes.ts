import { Routes } from '@angular/router';
import { httpPathParamsSuite, getHttpPathParamsScenario } from './http-path-params.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: httpPathParamsSuite },
  },
  {
    path: 'condition-path-params',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpPathParamsScenario('condition-path-params-test') },
  },
  {
    path: 'derivation-path-params',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpPathParamsScenario('derivation-path-params-test') },
  },
  {
    path: 'validator-path-params',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHttpPathParamsScenario('validator-path-params-test') },
  },
];

export default routes;

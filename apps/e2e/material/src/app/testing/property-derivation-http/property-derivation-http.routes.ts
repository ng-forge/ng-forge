import { Routes } from '@angular/router';
import { getPropertyDerivationHttpScenario, propertyDerivationHttpSuite } from './property-derivation-http.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: propertyDerivationHttpSuite },
  },
  {
    path: 'http-driven-select-options',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationHttpScenario('http-driven-select-options') },
  },
];

export default routes;

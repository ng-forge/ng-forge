import { Routes } from '@angular/router';
import { propertyDerivationLogicSuite, getPropertyDerivationScenario } from './property-derivation-logic.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: propertyDerivationLogicSuite },
  },
  {
    path: 'expression-property',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationScenario('expression-property-test') },
  },
  {
    path: 'conditional-property',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationScenario('conditional-property-test') },
  },
  {
    path: 'function-property',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationScenario('function-property-test') },
  },
  {
    path: 'datepicker-mindate',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationScenario('datepicker-mindate-test') },
  },
  {
    path: 'appearance-property',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationScenario('appearance-property-test') },
  },
  {
    path: 'array-property',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPropertyDerivationScenario('array-property-test') },
  },
];

export default routes;

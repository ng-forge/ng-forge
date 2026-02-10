import { Routes } from '@angular/router';
import { derivationLogicSuite, getDerivationLogicScenario } from './derivation-logic.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: derivationLogicSuite },
  },
  {
    path: 'static-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('static-value-derivation-test') },
  },
  {
    path: 'expression',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('expression-derivation-test') },
  },
  {
    path: 'function',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('function-derivation-test') },
  },
  {
    path: 'conditional',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('conditional-derivation-test') },
  },
  {
    path: 'self-transform',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('self-transform-test') },
  },
  {
    path: 'chain',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('chain-derivation-test') },
  },
  {
    path: 'shorthand',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('shorthand-derivation-test') },
  },
  {
    path: 'array-field',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('array-field-derivation-test') },
  },
  {
    path: 'bidirectional-float',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('bidirectional-float-test') },
  },
  {
    path: 'derivation-in-group',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('derivation-in-group') },
  },
];

export default routes;

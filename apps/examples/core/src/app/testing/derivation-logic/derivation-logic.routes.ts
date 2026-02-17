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
  {
    path: 'stop-on-user-override',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('stop-on-user-override-test') },
  },
  {
    path: 're-engage-on-dependency-change',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('re-engage-on-dependency-change-test') },
  },
  {
    path: 'field-state-condition',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('field-state-condition-test') },
  },
  {
    path: 'field-state-advanced',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('field-state-advanced-test') },
  },
  {
    path: 'array-stop-on-user-override',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('array-stop-on-user-override-test') },
  },
  {
    path: 'http-derivation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('http-derivation-test') },
  },
  {
    path: 'http-derivation-error',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('http-derivation-error-test') },
  },
  {
    path: 'http-derivation-stop-override',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getDerivationLogicScenario('http-derivation-stop-override-test') },
  },
];

export default routes;

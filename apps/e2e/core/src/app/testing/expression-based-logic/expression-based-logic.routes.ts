import { Routes } from '@angular/router';
import { expressionBasedLogicSuite, getExpressionBasedLogicScenario } from './expression-based-logic.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: expressionBasedLogicSuite },
  },
  {
    path: 'hidden-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('hidden-logic-test') },
  },
  {
    path: 'disabled-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('disabled-logic-test') },
  },
  {
    path: 'and-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('and-logic-test') },
  },
  {
    path: 'readonly-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('readonly-logic-test') },
  },
  {
    path: 'or-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('or-logic-test') },
  },
  {
    path: 'nested-and-within-or',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('nested-and-within-or-test') },
  },
  {
    path: 'nested-or-within-and',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('nested-or-within-and-test') },
  },
  {
    path: 'comparison-operators',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('comparison-operators-test') },
  },
  {
    path: 'string-operators',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getExpressionBasedLogicScenario('string-operators-test') },
  },
];

export default routes;

import { Routes } from '@angular/router';
import { advancedValidationSuite, getAdvancedValidationScenario } from './advanced-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: advancedValidationSuite },
  },
  {
    path: 'custom-validator',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('custom-validator-test') },
  },
  {
    path: 'cross-field-validator',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('cross-field-test') },
  },
  {
    path: 'range-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('range-validation-test') },
  },
  {
    path: 'conditional-validator',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('conditional-validator-test') },
  },
  {
    path: 'multiple-validators',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('multiple-validators-test') },
  },
  {
    path: 'expression-based-min-max',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('expression-based-min-max-test') },
  },
  {
    path: 'cross-field-error-targeting',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('cross-field-error-targeting-test') },
  },
  {
    path: 'when-with-and-or',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('when-with-and-or-test') },
  },
  {
    path: 'nested-field-paths',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('nested-field-paths-test') },
  },
  {
    path: 'array-cross-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAdvancedValidationScenario('array-cross-validation-test') },
  },
];

export default routes;

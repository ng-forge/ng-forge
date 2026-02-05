import { Routes } from '@angular/router';
import { arrayFieldsSuite, getArrayFieldsScenario } from './array-fields.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: arrayFieldsSuite },
  },
  // Basic operations
  {
    path: 'array-add',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-add') },
  },
  {
    path: 'array-remove',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-remove') },
  },
  {
    path: 'array-values',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-values') },
  },
  {
    path: 'array-initial-values',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-initial-values') },
  },
  // Semantic array events (PR #218)
  {
    path: 'array-prepend',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-prepend') },
  },
  {
    path: 'array-shift',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-shift') },
  },
  {
    path: 'array-insert-at-index',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-insert-at-index') },
  },
  {
    path: 'array-remove-at-index',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-remove-at-index') },
  },
  // DOM ID uniqueness (PR #219)
  {
    path: 'array-dom-id-uniqueness',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-dom-id-uniqueness') },
  },
  // Validation
  {
    path: 'array-item-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-item-validation') },
  },
  {
    path: 'array-min-length',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-min-length') },
  },
  {
    path: 'array-max-length',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-max-length') },
  },
  // Complex structures
  {
    path: 'array-nested',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-nested') },
  },
  {
    path: 'array-multiple-ops',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-multiple-ops') },
  },
  {
    path: 'array-multiple-arrays',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-multiple-arrays') },
  },
  // Accessibility
  {
    path: 'array-keyboard-navigation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-keyboard-navigation') },
  },
  {
    path: 'array-screen-reader-labels',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-screen-reader-labels') },
  },
  // Focus management
  {
    path: 'array-focus-after-add',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-focus-after-add') },
  },
  {
    path: 'array-focus-after-remove',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-focus-after-remove') },
  },
  // Form state
  {
    path: 'array-dirty-touched-tracking',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-dirty-touched-tracking') },
  },
  {
    path: 'array-rapid-operations',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-rapid-operations') },
  },
  // Edge cases
  {
    path: 'array-empty-state',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-empty-state') },
  },
  {
    path: 'array-boundary-indices',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-boundary-indices') },
  },
  // Button logic (hidden/disabled)
  {
    path: 'array-button-hidden-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-button-hidden-logic') },
  },
  {
    path: 'array-button-disabled-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getArrayFieldsScenario('array-button-disabled-logic') },
  },
];

export default routes;

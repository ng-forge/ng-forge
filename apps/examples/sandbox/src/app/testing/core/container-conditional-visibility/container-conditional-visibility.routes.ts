import { Routes } from '@angular/router';
import { containerConditionalVisibilitySuite, getContainerConditionalVisibilityScenario } from './container-conditional-visibility.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: containerConditionalVisibilitySuite },
  },
  // Child field visibility - Group
  {
    path: 'group-conditional-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('group-conditional-visibility') },
  },
  {
    path: 'group-nested-conditional',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('group-nested-conditional') },
  },
  {
    path: 'group-state-preservation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('group-state-preservation') },
  },
  // Child field visibility - Row
  {
    path: 'row-conditional-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('row-conditional-visibility') },
  },
  {
    path: 'row-multiple-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('row-multiple-visibility') },
  },
  {
    path: 'row-state-preservation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('row-state-preservation') },
  },
  {
    path: 'row-conditional-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('row-conditional-fields') },
  },
  // Child field visibility - Array
  {
    path: 'array-conditional-visibility',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('array-conditional-visibility') },
  },
  {
    path: 'array-state-preservation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('array-state-preservation') },
  },
  {
    path: 'array-items-conditional-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('array-items-conditional-fields') },
  },
  // Child field visibility - Submission
  {
    path: 'submit-conditional-containers',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('submit-conditional-containers') },
  },
  // Container-level hidden logic
  {
    path: 'group-hidden-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('group-hidden-logic') },
  },
  {
    path: 'row-hidden-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('row-hidden-logic') },
  },
  {
    path: 'array-hidden-logic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('array-hidden-logic') },
  },
  {
    path: 'container-level-submission',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getContainerConditionalVisibilityScenario('container-level-submission') },
  },
];

export default routes;

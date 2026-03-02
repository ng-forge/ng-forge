import { Routes } from '@angular/router';
import { getSubmissionBehaviorScenario, submissionBehaviorSuite } from './submission-behavior.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: submissionBehaviorSuite },
  },
  {
    path: 'basic-submission',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('basic-submission') },
  },
  {
    path: 'button-disabled-invalid',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('button-disabled-invalid') },
  },
  {
    path: 'button-disabled-submitting',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('button-disabled-submitting') },
  },
  {
    path: 'button-never-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('button-never-disabled') },
  },
  {
    path: 'next-button-page-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('next-button-page-validation') },
  },
  {
    path: 'next-button-never-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('next-button-never-disabled') },
  },
  {
    path: 'form-state-condition',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('form-state-condition') },
  },
  {
    path: 'conditional-expression',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('conditional-expression') },
  },
  {
    path: 'explicit-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('explicit-disabled') },
  },
  {
    path: 'http-error-handling',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('http-error-handling') },
  },
  {
    path: 'hidden-field',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('hidden-field') },
  },
  {
    path: 'submit-inside-group',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('submit-inside-group') },
  },
  {
    path: 'submit-nested-arrays',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSubmissionBehaviorScenario('submit-nested-arrays') },
  },
];

export default routes;

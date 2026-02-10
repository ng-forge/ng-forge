import { Routes } from '@angular/router';
import { formResetClearSuite, getFormResetClearScenario } from './form-reset-clear.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: formResetClearSuite },
  },
  {
    path: 'reset-defaults',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-defaults') },
  },
  {
    path: 'reset-select',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-select') },
  },
  {
    path: 'reset-checkbox',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-checkbox') },
  },
  {
    path: 'reset-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-validation') },
  },
  {
    path: 'clear-all',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('clear-all') },
  },
  {
    path: 'clear-select',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('clear-select') },
  },
  {
    path: 'clear-checkbox',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('clear-checkbox') },
  },
  {
    path: 'reset-vs-clear',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-vs-clear') },
  },
  {
    path: 'required-reset-clear',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('required-reset-clear') },
  },
  {
    path: 'reset-nested',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-nested') },
  },
  {
    path: 'multiple-cycles',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('multiple-cycles') },
  },
  {
    path: 'reset-with-arrays',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-with-arrays') },
  },
  {
    path: 'reset-with-groups',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFormResetClearScenario('reset-with-groups') },
  },
];

export default routes;

import { Routes } from '@angular/router';
import { getPrimengComponentsScenario, primengComponentsSuite } from './primeng-components.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: primengComponentsSuite },
  },
  {
    path: 'datepicker-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('datepicker-basic') },
  },
  {
    path: 'datepicker-constraints',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('datepicker-constraints') },
  },
  {
    path: 'datepicker-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('datepicker-validation') },
  },
  {
    path: 'datepicker-clear',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('datepicker-clear') },
  },
  {
    path: 'datepicker-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('datepicker-disabled') },
  },
  {
    path: 'datepicker-initial-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('datepicker-initial-value') },
  },
  {
    path: 'slider-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('slider-basic') },
  },
  {
    path: 'slider-bounds',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('slider-bounds') },
  },
  {
    path: 'slider-steps',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('slider-steps') },
  },
  {
    path: 'slider-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('slider-disabled') },
  },
  {
    path: 'slider-value-display',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('slider-value-display') },
  },
  {
    path: 'toggle-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-basic') },
  },
  {
    path: 'toggle-keyboard',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-keyboard') },
  },
  {
    path: 'toggle-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-disabled') },
  },
  {
    path: 'toggle-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-validation') },
  },
  {
    path: 'multi-checkbox-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-checkbox-basic') },
  },
  {
    path: 'multi-checkbox-array',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-checkbox-array') },
  },
  {
    path: 'multi-checkbox-deselect',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-checkbox-deselect') },
  },
  {
    path: 'multi-checkbox-disabled-options',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-checkbox-disabled-options') },
  },
  {
    path: 'multi-checkbox-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-checkbox-validation') },
  },
];

export default routes;

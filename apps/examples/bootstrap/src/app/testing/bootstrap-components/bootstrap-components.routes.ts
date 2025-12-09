import { Routes } from '@angular/router';
import { getBootstrapComponentsScenario, bootstrapComponentsSuite } from './bootstrap-components.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: bootstrapComponentsSuite },
  },
  {
    path: 'datepicker-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('datepicker-basic') },
  },
  {
    path: 'datepicker-constraints',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('datepicker-constraints') },
  },
  {
    path: 'datepicker-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('datepicker-validation') },
  },
  {
    path: 'datepicker-clear',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('datepicker-clear') },
  },
  {
    path: 'datepicker-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('datepicker-disabled') },
  },
  {
    path: 'datepicker-initial-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('datepicker-initial-value') },
  },
  {
    path: 'slider-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('slider-basic') },
  },
  {
    path: 'slider-bounds',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('slider-bounds') },
  },
  {
    path: 'slider-steps',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('slider-steps') },
  },
  {
    path: 'slider-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('slider-disabled') },
  },
  {
    path: 'slider-value-display',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('slider-value-display') },
  },
  {
    path: 'toggle-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('toggle-basic') },
  },
  {
    path: 'toggle-keyboard',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('toggle-keyboard') },
  },
  {
    path: 'toggle-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('toggle-disabled') },
  },
  {
    path: 'toggle-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('toggle-validation') },
  },
  {
    path: 'multi-checkbox-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('multi-checkbox-basic') },
  },
  {
    path: 'multi-checkbox-array',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('multi-checkbox-array') },
  },
  {
    path: 'multi-checkbox-deselect',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('multi-checkbox-deselect') },
  },
  {
    path: 'multi-checkbox-disabled-options',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('multi-checkbox-disabled-options') },
  },
  {
    path: 'multi-checkbox-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getBootstrapComponentsScenario('multi-checkbox-validation') },
  },
];

export default routes;

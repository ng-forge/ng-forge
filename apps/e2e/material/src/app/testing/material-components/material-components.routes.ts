import { Routes } from '@angular/router';
import { getMaterialComponentsScenario, materialComponentsSuite } from './material-components.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: materialComponentsSuite },
  },
  {
    path: 'datepicker-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('datepicker-basic') },
  },
  {
    path: 'datepicker-constraints',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('datepicker-constraints') },
  },
  {
    path: 'datepicker-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('datepicker-validation') },
  },
  {
    path: 'datepicker-clear',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('datepicker-clear') },
  },
  {
    path: 'datepicker-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('datepicker-disabled') },
  },
  {
    path: 'datepicker-initial-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('datepicker-initial-value') },
  },
  {
    path: 'slider-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('slider-basic') },
  },
  {
    path: 'slider-bounds',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('slider-bounds') },
  },
  {
    path: 'slider-steps',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('slider-steps') },
  },
  {
    path: 'slider-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('slider-disabled') },
  },
  {
    path: 'slider-value-display',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('slider-value-display') },
  },
  {
    path: 'toggle-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('toggle-basic') },
  },
  {
    path: 'toggle-keyboard',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('toggle-keyboard') },
  },
  {
    path: 'toggle-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('toggle-disabled') },
  },
  {
    path: 'toggle-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('toggle-validation') },
  },
  {
    path: 'multi-checkbox-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('multi-checkbox-basic') },
  },
  {
    path: 'multi-checkbox-array',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('multi-checkbox-array') },
  },
  {
    path: 'multi-checkbox-deselect',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('multi-checkbox-deselect') },
  },
  {
    path: 'multi-checkbox-disabled-options',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('multi-checkbox-disabled-options') },
  },
  {
    path: 'multi-checkbox-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getMaterialComponentsScenario('multi-checkbox-validation') },
  },
];

export default routes;

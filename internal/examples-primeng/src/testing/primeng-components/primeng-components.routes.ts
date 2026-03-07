import { Routes } from '@angular/router';
import { getPrimengComponentsScenario, primengComponentsSuite } from './primeng-components.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: primengComponentsSuite },
  },
  // Calendar scenarios
  {
    path: 'calendar-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('calendar-basic') },
  },
  {
    path: 'calendar-constraints',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('calendar-constraints') },
  },
  {
    path: 'calendar-format',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('calendar-format') },
  },
  {
    path: 'calendar-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('calendar-disabled') },
  },
  {
    path: 'calendar-initial-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('calendar-initial-value') },
  },
  {
    path: 'calendar-button-bar',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('calendar-button-bar') },
  },
  // Slider scenarios
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
  // Toggle scenarios
  {
    path: 'toggle-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-basic') },
  },
  {
    path: 'toggle-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-disabled') },
  },
  {
    path: 'toggle-label',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-label') },
  },
  {
    path: 'toggle-initial-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('toggle-initial-value') },
  },
  // Multi-Select scenarios
  {
    path: 'multi-select-basic',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-select-basic') },
  },
  {
    path: 'multi-select-filter',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-select-filter') },
  },
  {
    path: 'multi-select-initial-value',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-select-initial-value') },
  },
  {
    path: 'multi-select-disabled',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPrimengComponentsScenario('multi-select-disabled') },
  },
];

export default routes;

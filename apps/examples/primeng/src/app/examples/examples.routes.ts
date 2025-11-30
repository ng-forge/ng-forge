import { Route } from '@angular/router';
import { getScenarioById } from './scenarios';

export default [
  {
    path: '',
    loadComponent: () => import('./index/index.component').then((m) => m.IndexComponent),
  },
  {
    path: 'input',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('input') },
  },
  {
    path: 'select',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('select') },
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('checkbox') },
  },
  {
    path: 'toggle',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('toggle') },
  },
  {
    path: 'radio',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('radio') },
  },
  {
    path: 'multi-checkbox',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('multi-checkbox') },
  },
  {
    path: 'textarea',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('textarea') },
  },
  {
    path: 'datepicker',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('datepicker') },
  },
  {
    path: 'slider',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('slider') },
  },
  {
    path: 'button',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('button') },
  },
  {
    path: 'complete-form',
    loadComponent: () => import('./shared/example-scenario.component').then((m) => m.ExampleScenarioComponent),
    data: { scenario: getScenarioById('complete-form') },
  },
] satisfies Route[];

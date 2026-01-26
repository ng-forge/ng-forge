import { Route } from '@angular/router';
import { getScenarioById } from './scenarios';

export default [
  {
    path: '',
    loadComponent: () => import('./index/index.component'),
  },
  {
    path: 'input',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('input') },
  },
  {
    path: 'select',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('select') },
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('checkbox') },
  },
  {
    path: 'toggle',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('toggle') },
  },
  {
    path: 'radio',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('radio') },
  },
  {
    path: 'multi-checkbox',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('multi-checkbox') },
  },
  {
    path: 'textarea',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('textarea') },
  },
  {
    path: 'datepicker',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('datepicker') },
  },
  {
    path: 'slider',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('slider') },
  },
  {
    path: 'button',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('button') },
  },
  {
    path: 'complete-form',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('complete-form') },
  },
  {
    path: 'default-props',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('default-props') },
  },
] satisfies Route[];

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
    path: 'user-registration',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('user-registration') },
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('login') },
  },
  {
    path: 'hero-demo',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('hero-demo') },
  },
  {
    path: 'contact',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('contact') },
  },
  {
    path: 'paginated-form',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('paginated-form') },
  },
  {
    path: 'array',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('array') },
  },
  {
    path: 'group',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('group') },
  },
  {
    path: 'row',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('row') },
  },
  {
    path: 'validation-showcase',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('validation-showcase') },
  },
  {
    path: 'default-props',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('default-props') },
  },
  {
    path: 'value-derivation',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('value-derivation') },
  },
  // Special components with custom logic
  {
    path: 'conditional-logic-showcase',
    loadComponent: () => import('./conditional-logic-showcase-demo.component'),
  },
  {
    path: 'expression-validators-demo',
    loadComponent: () => import('./expression-validators-demo.component'),
  },
  {
    path: 'zod-schema-validation',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('zod-schema-validation') },
  },
  {
    path: 'contact-dynamic-fields',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('contact-dynamic-fields') },
  },
  {
    path: 'business-account-form',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('business-account-form') },
  },
  {
    path: 'shipping-billing-address',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('shipping-billing-address') },
  },
  {
    path: 'age-conditional-form',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('age-conditional-form') },
  },
  {
    path: 'enterprise-features',
    loadComponent: () => import('./shared/example-scenario.component'),
    data: { scenario: getScenarioById('enterprise-features') },
  },
] satisfies Route[];

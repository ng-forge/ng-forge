import { Routes } from '@angular/router';
import { configChangeSuite } from './config-change.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: configChangeSuite },
  },
  {
    path: 'config-swap-simple',
    loadComponent: () => import('./scenarios/config-swap-simple.component').then((m) => m.ConfigSwapSimpleComponent),
  },
  {
    path: 'config-swap-preserve-values',
    loadComponent: () => import('./scenarios/config-swap-preserve-values.component').then((m) => m.ConfigSwapPreserveValuesComponent),
  },
  {
    path: 'config-add-fields',
    loadComponent: () => import('./scenarios/config-add-fields.component').then((m) => m.ConfigAddFieldsComponent),
  },
  {
    path: 'config-remove-fields',
    loadComponent: () => import('./scenarios/config-remove-fields.component').then((m) => m.ConfigRemoveFieldsComponent),
  },
  {
    path: 'config-swap-with-arrays',
    loadComponent: () => import('./scenarios/config-swap-with-arrays.component').then((m) => m.ConfigSwapWithArraysComponent),
  },
  {
    path: 'config-swap-pages',
    loadComponent: () => import('./scenarios/config-swap-pages.component').then((m) => m.ConfigSwapPagesComponent),
  },
  {
    path: 'value-binding',
    loadComponent: () => import('./scenarios/value-binding.component').then((m) => m.ValueBindingComponent),
  },
];

export default routes;

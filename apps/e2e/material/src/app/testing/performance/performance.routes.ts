import { Routes } from '@angular/router';
import {
  perfStressFlatScenario,
  perfStressPagedScenario,
  perfStressPagedHiddenScenario,
  perfEnormousScenario,
  perfEnormousPreload0Scenario,
  perfEnormousPreload3Scenario,
  perfEnormousPreloadAllScenario,
  perfFlat100Scenario,
  perfFlat300Scenario,
  perfGrouped300Scenario,
  crossFieldGroupDemoScenario,
  perfStressStandardScenario,
} from './perf-stress.scenario';

const routes: Routes = [
  {
    path: 'perf-stress-flat',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfStressFlatScenario },
  },
  {
    path: 'perf-stress-paged',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfStressPagedScenario },
  },
  {
    path: 'perf-stress-paged-hidden',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfStressPagedHiddenScenario },
  },
  {
    path: 'perf-enormous',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfEnormousScenario },
  },
  {
    path: 'perf-enormous-preload0',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfEnormousPreload0Scenario },
  },
  {
    path: 'perf-enormous-preload3',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfEnormousPreload3Scenario },
  },
  {
    path: 'perf-enormous-preload-all',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfEnormousPreloadAllScenario },
  },
  {
    path: 'perf-flat-100',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfFlat100Scenario },
  },
  {
    path: 'perf-flat-300',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfFlat300Scenario },
  },
  {
    path: 'perf-grouped-300',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfGrouped300Scenario },
  },
  {
    path: 'cross-field-group-demo',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: crossFieldGroupDemoScenario },
  },
  {
    path: 'perf-stress-standard',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: perfStressStandardScenario },
  },
];

export default routes;

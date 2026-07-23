import { Routes } from '@angular/router';
import {
  perfStressFlatScenario,
  perfStressPagedScenario,
  perfStressPagedHiddenScenario,
  perfEnormousScenario,
  perfEnormousPreload0Scenario,
  perfEnormousPreload3Scenario,
  perfEnormousPreloadAllScenario,
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
];

export default routes;

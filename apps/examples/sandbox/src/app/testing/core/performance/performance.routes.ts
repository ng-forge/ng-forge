import { Routes } from '@angular/router';
import { performanceSuite, getPerformanceScenario } from './performance.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: performanceSuite },
  },
  {
    path: 'perf-100-flat-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPerformanceScenario('perf-100-flat-fields') },
  },
  {
    path: 'perf-200-flat-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPerformanceScenario('perf-200-flat-fields') },
  },
  {
    path: 'perf-100-mixed-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPerformanceScenario('perf-100-mixed-fields') },
  },
  {
    path: 'perf-50-with-conditionals',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPerformanceScenario('perf-50-with-conditionals') },
  },
  {
    path: 'perf-array-20-items',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPerformanceScenario('perf-array-20-items') },
  },
  {
    path: 'perf-10-pages-10-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getPerformanceScenario('perf-10-pages-10-fields') },
  },
  {
    path: 'perf-config-swap',
    loadComponent: () => import('./scenarios/perf-config-swap.component').then((m) => m.PerfConfigSwapComponent),
  },
];

export default routes;

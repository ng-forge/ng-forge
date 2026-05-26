import { Routes } from '@angular/router';
import { perfStressFlatScenario, perfStressPagedScenario, perfStressPagedHiddenScenario } from './perf-stress.scenario';

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
];

export default routes;

import { Routes } from '@angular/router';
import { perfStressFlatScenario, perfStressPagedScenario } from './perf-stress.scenario';

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
];

export default routes;

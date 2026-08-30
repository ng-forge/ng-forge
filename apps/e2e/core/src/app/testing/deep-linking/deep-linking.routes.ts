import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./deep-link-scenario.component').then((m) => m.DeepLinkScenarioComponent),
  },
];

export default routes;

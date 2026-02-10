import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./scenarios/external-data.scenario').then((m) => m.ExternalDataScenarioComponent),
  },
];

export default routes;

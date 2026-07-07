import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./scenarios/external-data.scenario').then((m) => m.ExternalDataScenarioComponent),
  },
  {
    path: 'containers',
    loadComponent: () => import('./scenarios/container-external-data.scenario').then((m) => m.ContainerExternalDataScenarioComponent),
  },
];

export default routes;

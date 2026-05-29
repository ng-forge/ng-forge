import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'two-forms',
    loadComponent: () => import('./id-collision.components').then((m) => m.IdCollisionTwoFormsComponent),
  },
  {
    path: 'explicit',
    loadComponent: () => import('./id-collision.components').then((m) => m.IdCollisionExplicitComponent),
  },
  {
    path: 'toggle',
    loadComponent: () => import('./id-collision.components').then((m) => m.IdCollisionToggleComponent),
  },
];

export default routes;

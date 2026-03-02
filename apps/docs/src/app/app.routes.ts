import { inject } from '@angular/core';
import { ActivatedRoute, CanActivateFn, Route, Router } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { NG_DOC_ROUTING } from '@ng-doc/generated';
import { isAdapterName } from '@ng-forge/sandbox-harness';

const adapterGuard: CanActivateFn = (route) => {
  const name = route.paramMap.get('adapter');
  if (!name || !isAdapterName(name) || name === 'core') {
    const router = inject(Router);
    const remaining = inject(ActivatedRoute).snapshot.url.map((s) => s.path);
    return router.createUrlTree(['/material', ...remaining]);
  }
  return true;
};

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: ':adapter',
    canActivate: [adapterGuard],
    children: [...NG_DOC_ROUTING],
  },
  {
    path: '**',
    redirectTo: '/material',
  },
];

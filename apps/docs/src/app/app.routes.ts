import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { NG_DOC_ROUTING } from '@ng-doc/generated';
import { isAdapterName } from '@ng-forge/sandbox-harness';

const adapterGuard: CanActivateFn = (route) => {
  const name = route.paramMap.get('adapter');
  if (!name || !isAdapterName(name) || name === 'core') {
    const router = inject(Router);
    const nav = router.getCurrentNavigation();
    const initialUrl = nav?.initialUrl.toString() ?? `/${name}`;
    // Prepend /material to the full URL to preserve child segments
    // e.g. /schema-fields/field-types → /material/schema-fields/field-types
    return router.parseUrl(`/material${initialUrl}`);
  }
  return true;
};

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  // Non-prefixed → /material canonical redirects
  { path: 'installation', redirectTo: '/material/getting-started', pathMatch: 'full' },
  { path: 'getting-started', redirectTo: '/material/getting-started', pathMatch: 'full' },
  { path: 'ui-libs-integrations', redirectTo: '/material/configuration', pathMatch: 'full' },
  { path: 'configuration', redirectTo: '/material/configuration', pathMatch: 'full' },
  { path: 'examples', redirectTo: '/material/examples', pathMatch: 'full' },
  { path: 'schema-fields', redirectTo: '/material/schema-fields', pathMatch: 'full' },
  { path: 'validation', redirectTo: '/material/validation', pathMatch: 'full' },
  { path: 'dynamic-behavior', redirectTo: '/material/dynamic-behavior', pathMatch: 'full' },
  { path: 'prebuilt', redirectTo: '/material/prebuilt', pathMatch: 'full' },
  { path: 'schema-validation', redirectTo: '/material/schema-validation', pathMatch: 'full' },
  { path: 'advanced', redirectTo: '/material/advanced', pathMatch: 'full' },
  { path: 'custom-integrations', redirectTo: '/custom/building-an-adapter', pathMatch: 'full' },
  { path: 'building-an-adapter', redirectTo: '/custom/building-an-adapter', pathMatch: 'full' },
  { path: 'ai-integration', redirectTo: '/material/ai-integration', pathMatch: 'full' },
  {
    path: ':adapter',
    canActivate: [adapterGuard],
    children: [
      // Redirect adapter root to Getting Started
      { path: '', redirectTo: 'getting-started', pathMatch: 'full' },
      // Route renames within adapter scope
      { path: 'installation', redirectTo: 'getting-started', pathMatch: 'full' },
      { path: 'ui-libs-integrations', redirectTo: 'configuration', pathMatch: 'full' },
      { path: 'custom-integrations', redirectTo: 'building-an-adapter', pathMatch: 'full' },
      ...NG_DOC_ROUTING,
    ],
  },
  {
    path: '**',
    redirectTo: '/material',
  },
];

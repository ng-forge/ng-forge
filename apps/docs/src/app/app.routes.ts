import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';

/** Adapter names valid in the docs app — includes 'custom' (a virtual adapter for docs only). */
const DOCS_ADAPTER_NAMES = new Set(['material', 'bootstrap', 'primeng', 'ionic', 'custom']);

const adapterGuard: CanActivateFn = (route) => {
  const name = route.paramMap.get('adapter');
  if (!name || !DOCS_ADAPTER_NAMES.has(name)) {
    const router = inject(Router);
    const nav = router.getCurrentNavigation();
    const initialUrl = nav?.initialUrl.toString() ?? `/${name}`;
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
  // Adapter root → Getting Started
  { path: 'material', redirectTo: '/material/getting-started', pathMatch: 'full' },
  { path: 'bootstrap', redirectTo: '/bootstrap/getting-started', pathMatch: 'full' },
  { path: 'primeng', redirectTo: '/primeng/getting-started', pathMatch: 'full' },
  { path: 'ionic', redirectTo: '/ionic/getting-started', pathMatch: 'full' },
  { path: 'custom', redirectTo: '/custom/getting-started', pathMatch: 'full' },
  {
    path: ':adapter',
    canActivate: [adapterGuard],
    children: [
      // Route renames within adapter scope
      { path: 'installation', redirectTo: 'getting-started', pathMatch: 'full' },
      { path: 'ui-libs-integrations', redirectTo: 'configuration', pathMatch: 'full' },
      { path: 'custom-integrations', redirectTo: 'building-an-adapter', pathMatch: 'full' },
      // Placeholder: content routes will be added in Phase 4
      {
        path: '**',
        loadComponent: () => import('./pages/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/material',
  },
];

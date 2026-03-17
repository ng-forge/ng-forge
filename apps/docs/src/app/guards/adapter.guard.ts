import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Adapter names valid in the docs app — includes 'custom' (a virtual adapter for docs only). */
const DOCS_ADAPTER_NAMES = new Set(['material', 'bootstrap', 'primeng', 'ionic', 'custom']);

export const adapterGuard: CanActivateFn = (route) => {
  const name = route.paramMap.get('adapter');
  if (!name || !DOCS_ADAPTER_NAMES.has(name)) {
    const router = inject(Router);
    const nav = router.getCurrentNavigation();
    const initialUrl = nav?.initialUrl.toString() ?? `/${name}`;
    return router.parseUrl(`/material${initialUrl}`);
  }
  return true;
};

import { Route } from '@angular/router';

/**
 * Wraps sub-app routes under an adapter prefix for hash-based routing.
 *
 * Produces:
 * - `{ path: '<adapter>', children: [redirect to 'examples', ...routes] }`
 * - `{ path: '', redirectTo: '<adapter>' }`
 * - `{ path: '**', redirectTo: '<adapter>' }`
 */
export function wrapRoutesWithAdapter(adapter: string, routes: Route[], defaultRoute = 'examples'): Route[] {
  return [
    { path: adapter, children: [{ path: '', redirectTo: defaultRoute, pathMatch: 'full' as const }, ...routes] },
    { path: '', redirectTo: adapter, pathMatch: 'full' as const },
    { path: '**', redirectTo: adapter },
  ];
}

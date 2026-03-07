import { Route } from '@angular/router';

/**
 * Wraps sub-app routes under an adapter prefix for hash-based routing.
 *
 * Produces:
 * - `{ path: '<adapter>', children: [redirect to defaultRoute, ...routes] }`
 * - `{ path: '', redirectTo: '<adapter>' }`
 * - `{ path: '**', redirectTo: '<adapter>' }`
 */
export function wrapRoutesWithAdapter(adapter: string, routes: Route[], defaultRoute = 'examples'): Route[] {
  return [
    { path: adapter, children: [{ path: '', redirectTo: defaultRoute, pathMatch: 'full' }, ...routes] },
    { path: '', redirectTo: adapter, pathMatch: 'full' },
    { path: '**', redirectTo: adapter },
  ];
}

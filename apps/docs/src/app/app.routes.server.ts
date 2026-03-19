import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * All routes are pre-rendered to static HTML at build time (SSG).
 * If you add a route that requires dynamic server-side rendering (e.g. user-specific content),
 * you must add an explicit entry with RenderMode.Server BEFORE this catch-all.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

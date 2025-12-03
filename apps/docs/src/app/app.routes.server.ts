import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Root path is a redirect - use Client mode so the fallback index.html
    // is served and the client-side router handles the redirect.
    // Without this, prerendering skips redirect routes, causing a 404 loop on GitHub Pages.
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

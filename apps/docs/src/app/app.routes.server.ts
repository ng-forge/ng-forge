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
    // Adapter-prefixed doc routes are dynamic (:adapter segment).
    // Without getPrerenderParams listing all adapters, only /material/* routes would be
    // pre-rendered (the redirect chain only points there). Refreshing on /bootstrap/*
    // etc. would get a 404 on static hosting. Use Server mode so all adapters render
    // on demand via SSR.
    path: ':adapter/**',
    renderMode: RenderMode.Server,
  },
  {
    // Non-prefixed redirect stubs and static pages can be prerendered normally.
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

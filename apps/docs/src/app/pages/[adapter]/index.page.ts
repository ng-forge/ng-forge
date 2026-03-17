import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Adapter root (/:adapter/) → redirect to getting-started.
 * Uses programmatic navigation because routeMeta redirects
 * don't reliably apply pathMatch: 'full' with file-based routing.
 *
 * In practice, withExtraRoutes in app.config.ts catches bare adapter
 * URLs first, so this component is a fallback that rarely renders.
 */
@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
export default class AdapterIndexPage {
  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);
    const adapter = route.parent?.snapshot.paramMap.get('adapter') ?? 'material';
    void router.navigateByUrl(`/${adapter}/getting-started`, { replaceUrl: true });
  }
}

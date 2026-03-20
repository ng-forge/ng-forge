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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly adapter = this.route.parent?.snapshot.paramMap.get('adapter') ?? 'material';

  constructor() {
    void this.router.navigateByUrl(`/${this.adapter}/getting-started`, { replaceUrl: true });
  }
}

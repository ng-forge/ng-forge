import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * Generic documentation page component.
 * Renders markdown content based on the current route.
 * Content loading will be wired in Phase 5.
 */
@Component({
  selector: 'app-doc-page',
  template: `
    <div class="doc-page">
      <p class="doc-page-placeholder">Route: {{ slug() }}</p>
    </div>
  `,
  styles: [
    `
      .doc-page-placeholder {
        color: var(--forge-text-muted);
        font-style: italic;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageComponent {
  private readonly route = inject(ActivatedRoute);

  /** Full slug derived from the URL (everything after /:adapter/) */
  readonly slug = toSignal(this.route.url.pipe(map((segments) => segments.map((s) => s.path).join('/'))), {
    initialValue: '',
  });
}

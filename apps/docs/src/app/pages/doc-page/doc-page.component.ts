import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { ContentComponentsDirective } from '../../directives/content-components.directive';
import { TocComponent } from '../../components/toc/toc.component';
import { findNavLabel } from '../../layout/nav.config';

/**
 * Generic documentation page component.
 * Loads and renders markdown content based on the current route slug.
 */
@Component({
  selector: 'app-doc-page',
  imports: [ContentComponentsDirective, TocComponent],
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div class="doc-layout" (click)="onContentClick($event)">
      <article class="doc-page">
        @if (content()?.error) {
          <div class="doc-page-error">{{ content()!.error }}</div>
        } @else if (content()?.html) {
          @if (pageTitle()) {
            <h1 class="doc-page-title">{{ pageTitle() }}</h1>
          }
          <div class="doc-page-content" contentComponents [contentHtml]="content()!.html"></div>
        } @else {
          <div class="doc-page-loading">Loading...</div>
        }
      </article>
      <app-toc [headings]="content()?.headings ?? []" />
    </div>
  `,
  styles: [
    `
      .doc-layout {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 48px;
      }

      @media (max-width: 1280px) {
        .doc-layout {
          grid-template-columns: 1fr;
        }
      }

      .doc-page-error {
        color: var(--forge-text-muted);
        font-style: italic;
        padding: 2rem 0;
      }

      .doc-page-loading {
        color: var(--forge-text-muted);
        padding: 2rem 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);
  private readonly clipboard = inject(Clipboard);

  private readonly slug$ = this.route.url.pipe(map((segments) => segments.map((s) => s.path).join('/')));

  private readonly content$ = this.slug$.pipe(switchMap((slug) => this.contentService.load(slug)));

  readonly content = toSignal(this.content$);

  private readonly slug = toSignal(this.slug$, { initialValue: '' });

  readonly pageTitle = computed(() => {
    const s = this.slug();
    return s ? findNavLabel(s) : undefined;
  });

  onContentClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('.heading-anchor') as HTMLElement | null;
    if (!anchor) return;
    event.preventDefault();
    const id = anchor.getAttribute('data-anchor-id');
    if (!id) return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    this.clipboard.copy(url);
    anchor.setAttribute('title', 'Copied!');
    setTimeout(() => anchor.setAttribute('title', 'Copy to clipboard'), 2000);
  }
}

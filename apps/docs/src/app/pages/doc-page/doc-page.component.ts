import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { ContentComponentsDirective } from '../../directives/content-components.directive';
import { TocComponent } from '../../components/toc/toc.component';
import { DocTabsComponent } from '../../components/doc-tabs/doc-tabs.component';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { LiveExampleComponent } from '../../components/live-example/live-example.component';
import { ExamplesIndexComponent } from '../examples-index/examples-index.component';
import { ApiIndexComponent } from '../api-index/api-index.component';
import { ApiDetailComponent } from '../api-detail/api-detail.component';
import { EXAMPLES_REGISTRY } from '../examples-index/examples.registry';
import { findBreadcrumbTrail } from '../../layout/nav.config';
import { findTabGroup } from '../../layout/tabs.config';

/**
 * Generic documentation page component.
 * Loads and renders markdown content based on the current route slug.
 * Also handles example detail pages (examples/:id) with live demos.
 */
@Component({
  selector: 'app-doc-page',
  imports: [
    ContentComponentsDirective,
    TocComponent,
    DocTabsComponent,
    RouterLink,
    LiveExampleComponent,
    ExamplesIndexComponent,
    ApiIndexComponent,
    ApiDetailComponent,
  ],
  template: `
    @if (isApiIndex()) {
      <docs-api-index />
    } @else if (isApiDetail()) {
      <docs-api-detail />
    } @else if (isExamplesIndex()) {
      <!-- Examples listing — rendered directly, no doc-layout grid -->
      <docs-examples-index />
    } @else {
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <div class="doc-layout" (click)="onContentClick($event)">
        <article class="doc-page">
          @if (exampleId()) {
            <!-- Example detail page -->
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a class="breadcrumb adapter-breadcrumb" [routerLink]="'/' + adapter.adapter() + '/getting-started'">
                <img class="adapter-breadcrumb-icon" [src]="adapterInfo()?.icon" [alt]="adapterInfo()?.label" width="16" height="16" />
                {{ adapterInfo()?.label }}
              </a>
              <span class="breadcrumb-sep" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              <a class="breadcrumb" [routerLink]="'/' + adapter.adapter() + '/examples'">Examples</a>
              <span class="breadcrumb-sep" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              <span class="breadcrumb breadcrumb--current" aria-current="page">{{ exampleTitle() }}</span>
            </nav>
            <docs-live-example [scenario]="'examples/' + exampleId()" />
          } @else if (content()?.error) {
            <div class="doc-page-error">{{ content()!.error }}</div>
          } @else if (content()?.html) {
            <!-- Doc page -->
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a class="breadcrumb adapter-breadcrumb" [routerLink]="'/' + adapter.adapter() + '/getting-started'">
                <img class="adapter-breadcrumb-icon" [src]="adapterInfo()?.icon" [alt]="adapterInfo()?.label" width="16" height="16" />
                {{ adapterInfo()?.label }}
              </a>
              @for (crumb of breadcrumbs(); track crumb.path; let last = $last) {
                <span class="breadcrumb-sep" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                @if (last) {
                  <span class="breadcrumb breadcrumb--current" aria-current="page">{{ crumb.label }}</span>
                } @else {
                  <a class="breadcrumb" [routerLink]="'/' + adapter.adapter() + '/' + crumb.path">{{ crumb.label }}</a>
                }
              }
            </nav>
            @if (tabGroup(); as tabs) {
              <app-doc-tabs [tabGroup]="tabs" />
            }
            <div class="doc-page-content" contentComponents [contentHtml]="content()!.html"></div>
          } @else {
            <div class="doc-page-loading">Loading...</div>
          }
        </article>
        @if (!exampleId()) {
          <app-toc [headings]="content()?.headings ?? []" />
        }
      </div>
    }
  `,
  styles: [
    `
      .doc-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 48px;
      }

      .doc-page {
        min-width: 0;
      }

      @media (max-width: 1280px) {
        .doc-layout {
          grid-template-columns: 1fr;
        }
      }

      .breadcrumbs {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
        margin-bottom: 16px;
        font-size: 14px;
        line-height: 20px;
      }

      .breadcrumb {
        color: var(--forge-text-muted);
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
          color: var(--forge-primary);
        }

        &--current {
          color: var(--forge-text);
          font-weight: 500;
        }
      }

      .adapter-breadcrumb {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
        color: var(--forge-primary);
      }

      .adapter-breadcrumb-icon {
        border-radius: 2px;
      }

      .breadcrumb-sep {
        display: inline-flex;
        align-items: center;
        color: var(--forge-base-4);
        margin: 0 2px;
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);
  private readonly clipboard = inject(Clipboard);
  protected readonly adapter = inject(ActiveAdapterService);

  /**
   * Extract the content slug from the full route path on every navigation.
   * With file-based routing's [...slug] catch-all, route.url is always empty
   * and never re-emits — so we listen to Router.events instead.
   */
  private readonly slug$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const parts = this.route.snapshot.pathFromRoot.flatMap((r) => r.url.map((s) => s.path));
      // Strip adapter prefix: ['material', 'getting-started'] → 'getting-started'
      return parts.slice(1).join('/');
    }),
    distinctUntilChanged(),
  );

  private readonly content$ = this.slug$.pipe(
    filter((slug) => slug !== 'examples' && !slug.startsWith('examples/') && !slug.startsWith('api-reference')),
    switchMap((slug) => this.contentService.load(slug)),
  );

  readonly content = toSignal(this.content$);

  private readonly slug = toSignal(this.slug$, { initialValue: '' });

  /** True when slug is exactly 'api-reference' — renders the API index. */
  readonly isApiIndex = computed(() => this.slug() === 'api-reference');

  /** True when slug starts with 'api-reference/' — renders an API detail page. */
  readonly isApiDetail = computed(() => this.slug().startsWith('api-reference/'));

  /** True when slug is exactly 'examples' — renders the examples listing. */
  readonly isExamplesIndex = computed(() => this.slug() === 'examples');

  /** Non-empty when the slug is an example detail page (examples/:id). */
  readonly exampleId = computed(() => {
    const s = this.slug();
    return s.startsWith('examples/') ? s.slice('examples/'.length) : '';
  });

  readonly exampleTitle = computed(() => {
    const id = this.exampleId();
    return EXAMPLES_REGISTRY.find((e) => e.id === id)?.title ?? id;
  });

  readonly breadcrumbs = computed(() => {
    const s = this.slug();
    return s ? findBreadcrumbTrail(s) : [];
  });

  readonly tabGroup = computed(() => {
    const s = this.slug();
    return s ? findTabGroup(s) : undefined;
  });

  readonly adapterInfo = computed(() => {
    const name = this.adapter.adapter();
    return this.adapter.adapters.find((a) => a.name === name);
  });

  onContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Code copy button
    const copyBtn = target.closest('.code-copy-btn') as HTMLElement | null;
    if (copyBtn) {
      event.preventDefault();
      const code = copyBtn.getAttribute('data-code') ?? '';
      // Decode HTML entities back to plain text
      const textarea = document.createElement('textarea');
      textarea.innerHTML = code;
      this.clipboard.copy(textarea.value);
      this.showCopiedState(copyBtn);
      return;
    }

    // API symbol link
    const apiLink = target.closest('.api-link') as HTMLElement | null;
    if (apiLink) {
      event.preventDefault();
      const symbol = apiLink.getAttribute('data-api-symbol');
      if (symbol) {
        void this.router.navigateByUrl(`/${this.adapter.adapter()}/api-reference/core/${symbol}`);
      }
      return;
    }

    // Heading anchor
    const anchor = target.closest('.heading-anchor') as HTMLElement | null;
    if (!anchor) return;
    event.preventDefault();
    const id = anchor.getAttribute('data-anchor-id');
    if (!id) return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    this.clipboard.copy(url);
    this.showCopiedState(anchor);
  }

  private showCopiedState(el: HTMLElement): void {
    el.classList.add('copied');
    const clear = (): void => {
      el.classList.remove('copied');
      el.removeEventListener('mouseleave', clear);
    };
    el.addEventListener('mouseleave', clear);
    setTimeout(clear, 2000);
  }
}

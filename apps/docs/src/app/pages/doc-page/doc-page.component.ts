import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { rxResource } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ContentService } from '../../services/content.service';
import { ContentSegmentsComponent } from '../../directives/content-components.directive';
import { TocComponent } from '../../components/toc/toc.component';
import { DocTabsComponent } from '../../components/doc-tabs/doc-tabs.component';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { LiveExampleComponent } from '../../components/live-example/live-example.component';
import { ExamplesIndexComponent } from '../examples-index/examples-index.component';
import { ApiIndexComponent } from '../api-index/api-index.component';
import { ApiDetailComponent } from '../api-detail/api-detail.component';
import { NotFoundComponent } from '../../components/not-found/not-found.component';
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
    ContentSegmentsComponent,
    TocComponent,
    DocTabsComponent,
    RouterLink,
    LiveExampleComponent,
    ExamplesIndexComponent,
    ApiIndexComponent,
    ApiDetailComponent,
    NotFoundComponent,
  ],
  template: `
    @if (isApiIndex()) {
      @defer (when isApiIndex()) {
        <docs-api-index />
      }
    } @else if (isApiDetail()) {
      @defer (when isApiDetail()) {
        <docs-api-detail />
      }
    } @else if (isExamplesIndex()) {
      @defer (when isExamplesIndex()) {
        <docs-examples-index />
      }
    } @else if (showNotFound()) {
      @defer (when showNotFound()) {
        <docs-not-found />
      }
    } @else {
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <div class="doc-layout" (click)="onContentClick($event)">
        <article class="doc-page">
          @if (content()?.html) {
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a class="breadcrumb adapter-breadcrumb" [routerLink]="'/' + adapter.adapter() + '/getting-started'">
                <img class="adapter-breadcrumb-icon" [src]="adapterInfo()?.icon" [alt]="adapterInfo()?.label" width="16" height="16" />
                {{ adapterInfo()?.label }}
              </a>
              @if (exampleId()) {
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
              } @else {
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
              }
            </nav>
            @if (tabGroup(); as tabs) {
              <app-doc-tabs [tabGroup]="tabs" />
            }
            <app-content-segments class="doc-page-content" [contentHtml]="content()!.rawHtml" />
          } @else if (showSkeleton()) {
            <div class="doc-page-skeleton" role="status" aria-busy="true">
              <span class="visually-hidden">Loading page content</span>
              <!-- Breadcrumb -->
              <div class="skeleton-breadcrumb"></div>
              <!-- Page title (h1) -->
              <div class="skeleton-h1"></div>
              <!-- Intro paragraph -->
              <div class="skeleton-paragraph">
                <div class="skeleton-line skeleton-line--long"></div>
                <div class="skeleton-line skeleton-line--full"></div>
                <div class="skeleton-line skeleton-line--medium"></div>
              </div>
              <!-- Section heading (h2) with ember accent bar -->
              <div class="skeleton-h2"></div>
              <!-- Body text -->
              <div class="skeleton-paragraph">
                <div class="skeleton-line skeleton-line--full"></div>
                <div class="skeleton-line skeleton-line--long"></div>
              </div>
              <!-- Code block -->
              <div class="skeleton-code"></div>
              <!-- Another section -->
              <div class="skeleton-h2 skeleton-h2--narrow"></div>
              <div class="skeleton-paragraph">
                <div class="skeleton-line skeleton-line--long"></div>
                <div class="skeleton-line skeleton-line--full"></div>
                <div class="skeleton-line skeleton-line--short"></div>
              </div>
              <!-- Inline code snippet -->
              <div class="skeleton-code skeleton-code--short"></div>
              <!-- Trailing text -->
              <div class="skeleton-paragraph">
                <div class="skeleton-line skeleton-line--medium"></div>
                <div class="skeleton-line skeleton-line--long"></div>
              </div>
            </div>
          }
        </article>
        @if (content()?.html) {
          <app-toc [headings]="content()?.headings ?? []" />
        } @else if (showSkeleton()) {
          <nav class="toc-skeleton" role="status" aria-busy="true">
            <span class="visually-hidden">Loading table of contents</span>
            <div class="toc-skeleton-line toc-skeleton-line--short"></div>
            <div class="toc-skeleton-line"></div>
            <div class="toc-skeleton-line toc-skeleton-line--long"></div>
            <div class="toc-skeleton-line"></div>
            <div class="toc-skeleton-line toc-skeleton-line--short"></div>
          </nav>
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

      /* Shimmer base for all skeleton elements */
      .doc-page-skeleton,
      .toc-skeleton {
        --shimmer-from: var(--forge-base-2, #f0f0f0);
        --shimmer-via: var(--forge-base-3, #e0e0e0);
      }

      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      /* ---- Doc page content skeleton ---- */
      .doc-page-skeleton {
        padding: 0;
      }

      /* Shared shimmer for all skeleton blocks */
      .skeleton-breadcrumb,
      .skeleton-h1,
      .skeleton-h2,
      .skeleton-line,
      .skeleton-code,
      .toc-skeleton-line {
        background: linear-gradient(90deg, var(--shimmer-from) 0%, var(--shimmer-via) 50%, var(--shimmer-from) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
      }

      /* Breadcrumb: matches real breadcrumb (14px text) */
      .skeleton-breadcrumb {
        width: 200px;
        height: 14px;
        border-radius: 4px;
        margin-bottom: 16px;
      }

      /* Page title: matches .doc-page-title (36px / 32px line-height) */
      .skeleton-h1 {
        width: 50%;
        height: 36px;
        border-radius: 6px;
        margin-bottom: 24px;
      }

      /* Section heading: matches h2 (26px) with ember accent bar */
      .skeleton-h2 {
        width: 35%;
        height: 26px;
        border-radius: 4px;
        margin-top: 56px;
        margin-bottom: 16px;
        margin-left: 14px;
        position: relative;
      }

      .skeleton-h2::before {
        content: '';
        position: absolute;
        left: -14px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        min-height: 16px;
        border-radius: 2px;
        background: linear-gradient(180deg, var(--forge-primary, #ff6b2b), var(--forge-primary-hover, #ff4d00));
        opacity: 0.4;
      }

      .skeleton-h2--narrow {
        width: 25%;
      }

      .skeleton-paragraph {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 16px 0;
      }

      /* Text lines: matches body text (16px / 24px line-height) */
      .skeleton-line {
        height: 16px;
        border-radius: 4px;
        width: 75%;
      }
      .skeleton-line--full {
        width: 100%;
      }
      .skeleton-line--long {
        width: 88%;
      }
      .skeleton-line--medium {
        width: 65%;
      }
      .skeleton-line--short {
        width: 38%;
      }

      /* Code block: matches pre (rounded 8px, code-bg color) */
      .skeleton-code {
        width: 100%;
        height: 140px;
        border-radius: 8px;
        margin: 24px 0;
      }
      .skeleton-code--short {
        height: 80px;
      }

      /* ---- TOC skeleton ---- */
      .toc-skeleton {
        padding: 1rem 0;
      }

      .toc-skeleton-line {
        height: 12px;
        width: 70%;
        border-radius: 4px;
        margin-bottom: 12px;
        background: linear-gradient(90deg, var(--shimmer-from) 0%, var(--shimmer-via) 50%, var(--shimmer-from) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;

        &--short {
          width: 50%;
        }
        &--long {
          width: 90%;
        }
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      @media (max-width: 1280px) {
        .toc-skeleton {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton-breadcrumb,
        .skeleton-heading,
        .skeleton-line,
        .skeleton-code,
        .toc-skeleton-line {
          animation: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageComponent {
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly contentService = inject(ContentService);
  private readonly clipboard = inject(Clipboard);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly adapter = inject(ActiveAdapterService);
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  private static readonly DEFAULT_DESCRIPTION =
    'ng-forge provides a configuration-driven dynamic forms library for Angular. Build complex, signal forms with minimal code using JSON/TypeScript configurations.';

  /**
   * False during SSR to preserve pre-rendered content during hydration.
   * Flips to true after hydration so subsequent navigations show skeleton.
   */
  protected readonly showSkeleton = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.copiedTimer) clearTimeout(this.copiedTimer);
    });

    // Enable skeleton rendering after hydration completes — during SSR
    // the skeleton is suppressed so Angular can match the pre-rendered content.
    afterNextRender(() => this.showSkeleton.set(true));

    // Update document title and meta tags based on current page
    explicitEffect([this.pageTitle, this.pageDescription], ([title, description]) => {
      const fullTitle = title ? `${title} — ng-forge Dynamic Forms` : 'ng-forge — Dynamic Forms for Angular';
      this.titleService.setTitle(fullTitle);
      const desc = description || DocPageComponent.DEFAULT_DESCRIPTION;
      this.metaService.updateTag({ name: 'description', content: desc });
      this.metaService.updateTag({ property: 'og:title', content: fullTitle });
      this.metaService.updateTag({ property: 'og:description', content: desc });
      this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
      this.metaService.updateTag({ name: 'twitter:description', content: desc });
    });
  }

  /**
   * Extract the content slug from the current URL.
   * Uses `router.lastSuccessfulNavigation()` signal for reactivity.
   */
  private readonly slug = computed(() => {
    const nav = this.router.lastSuccessfulNavigation();
    const url = nav ? this.router.serializeUrl(nav.finalUrl ?? nav.extractedUrl) : this.router.url;
    const parts = url.split('/').filter(Boolean);
    return parts.slice(1).join('/');
  });

  private readonly contentResource = rxResource({
    params: () => {
      const s = this.slug();
      return s && s !== 'examples' && !s.startsWith('api-reference') ? { slug: s } : undefined;
    },
    stream: ({ params }) => this.contentService.load(params.slug),
  });

  readonly content = computed(() => this.contentResource.value());

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Only show the 404 page when:
   * 1. Content definitively has an error
   * 2. We're in the browser (SSR should show skeleton, not 404 — content loads client-side)
   * 3. No navigation is in progress (prevents flash during guard redirects)
   */
  readonly showNotFound = computed(() => {
    const c = this.content();
    if (!c?.error) return false;
    // During SSR, content fetch fails — show skeleton instead, content loads after hydration
    if (!this.isBrowser) return false;
    // If a navigation is currently in progress (e.g., guard redirect), suppress the 404
    if (this.router.getCurrentNavigation()) return false;
    return true;
  });

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

  /** Resolved page title for document.title — covers content pages, examples, API, and special pages. */
  private readonly pageTitle = computed(() => {
    if (this.isApiIndex()) return 'API Reference';
    if (this.isApiDetail()) {
      const symbol = this.slug().slice('api-reference/'.length);
      return symbol ? `${symbol} — API Reference` : 'API Reference';
    }
    if (this.isExamplesIndex()) return 'Examples';
    if (this.exampleId()) return this.exampleTitle();
    return this.content()?.title ?? '';
  });

  /** Resolved page description for meta tags — falls back to default when not in frontmatter. */
  private readonly pageDescription = computed(() => this.content()?.description ?? '');

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
        void this.router.navigateByUrl(`/${this.adapter.adapter()}/api-reference/${symbol}`);
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
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(clear, 2000);
  }
}

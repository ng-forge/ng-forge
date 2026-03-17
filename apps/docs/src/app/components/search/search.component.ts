import { ChangeDetectionStrategy, Component, computed, inject, PLATFORM_ID, resource, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { explicitEffect } from 'ngxtension/explicit-effect';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface PagefindResult {
  data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }>;
}

interface Pagefind {
  init: () => Promise<void>;
  search: (q: string) => Promise<{ results: PagefindResult[] }>;
}

@Component({
  selector: 'app-search',
  template: `
    <div class="search-wrapper">
      <button class="search-trigger" (click)="open()" aria-label="Search documentation">
        <span class="icon icon--search"></span>
        <span class="search-label">Search...</span>
        <kbd class="search-kbd">/</kbd>
      </button>

      @if (isOpen()) {
        <div class="search-overlay" (click)="close()" (keydown.escape)="close()" role="button" tabindex="-1" aria-label="Close search">
          <div
            class="search-dialog"
            (click)="$event.stopPropagation()"
            (keydown)="$event.stopPropagation()"
            role="dialog"
            aria-label="Search documentation"
          >
            <input
              #searchInput
              type="text"
              class="search-input"
              placeholder="Search documentation..."
              [value]="query()"
              (input)="onInput($event)"
              (keydown.escape)="close()"
            />
            <div class="search-results">
              @for (result of results(); track result.url) {
                <button class="search-result" (click)="navigateTo(result.url)">
                  <span class="result-title">{{ result.title }}</span>
                  <span class="result-excerpt" [innerHTML]="result.excerpt"></span>
                </button>
              }
              @if (query() && results().length === 0 && !loading()) {
                <div class="search-empty">No results found.</div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
})
export class SearchComponent {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private pagefind: Pagefind | null = null;

  readonly isOpen = signal(false);
  readonly query = signal('');

  // Debounced query — follows query with 200ms delay
  private readonly debouncedQuery = signal('');

  constructor() {
    explicitEffect([this.query], ([q], cleanup) => {
      const timer = setTimeout(() => this.debouncedQuery.set(q), 200);
      cleanup(() => clearTimeout(timer));
    });
  }

  // Results ARE the search results for the debounced query
  private readonly searchResource = resource({
    params: () => {
      const q = this.debouncedQuery();
      return this.isOpen() && q.trim() ? { q } : undefined;
    },
    loader: async ({ params }) => {
      if (!this.pagefind) await this.initPagefind();
      if (!this.pagefind) return [];

      const response = await this.pagefind.search(params.q);
      const items = await Promise.all(response.results.slice(0, 8).map((r) => r.data()));
      return items.map((item) => ({
        url: item.url,
        title: item.meta?.title ?? 'Untitled',
        excerpt: item.excerpt ?? '',
      }));
    },
  });

  // Derived views on the resource — no manual coordination
  readonly results = computed<SearchResult[]>(() => this.searchResource.value() ?? []);
  readonly loading = this.searchResource.isLoading;

  open(): void {
    this.isOpen.set(true);
    this.initPagefind();
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus();
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
  }

  navigateTo(url: string): void {
    this.close();
    const path = url
      .replace(/^\/dynamic-forms/, '')
      .replace(/\.html$/, '')
      .replace(/\/index$/, '');
    void this.router.navigateByUrl(path || '/');
  }

  onGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === '/' && !this.isOpen() && !this.isInputFocused()) {
      event.preventDefault();
      this.open();
    }
  }

  private isInputFocused(): boolean {
    const active = document.activeElement;
    return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active as HTMLElement)?.isContentEditable;
  }

  private async initPagefind(): Promise<void> {
    if (this.pagefind || !this.isBrowser) return;
    try {
      this.pagefind = await new Function('return import("/pagefind/pagefind.js")')();
      await (this.pagefind as Pagefind).init();
    } catch {
      console.warn('[Search] Pagefind not available — run postbuild:search to generate index');
    }
  }
}

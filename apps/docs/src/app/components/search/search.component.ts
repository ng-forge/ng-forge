import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
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
        <div class="search-overlay" (click)="close()">
          <div class="search-dialog" (click)="$event.stopPropagation()" role="dialog" aria-label="Search documentation">
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
  private pagefind: unknown;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly results = signal<SearchResult[]>([]);
  readonly loading = signal(false);

  open(): void {
    this.isOpen.set(true);
    this.initPagefind();
    // Focus input after render
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus();
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search(value), 200);
  }

  navigateTo(url: string): void {
    this.close();
    // Strip base href if present, convert to router-compatible path
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
      // Pagefind generates its JS in the output directory
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      this.pagefind = await new Function('return import("/pagefind/pagefind.js")')();
      await (this.pagefind as { init: () => Promise<void> }).init();
    } catch {
      console.warn('[Search] Pagefind not available — run postbuild:search to generate index');
    }
  }

  private async search(query: string): Promise<void> {
    if (!query.trim() || !this.pagefind) {
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    try {
      const pf = this.pagefind as {
        search: (
          q: string,
        ) => Promise<{ results: Array<{ data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }> }> }>;
      };
      const response = await pf.search(query);
      const items = await Promise.all(response.results.slice(0, 8).map((r) => r.data()));
      this.results.set(
        items.map((item) => ({
          url: item.url,
          title: item.meta?.title ?? 'Untitled',
          excerpt: item.excerpt ?? '',
        })),
      );
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}

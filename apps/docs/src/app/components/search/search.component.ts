import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, PLATFORM_ID, resource, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { APP_BASE_HREF, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';

interface SearchResult {
  url: string;
  title: string;
  excerpt: SafeHtml;
  category?: string;
}

interface SearchIndexEntry {
  slug: string;
  title: string;
  content: string;
  category?: string;
}

const MAX_RESULTS = 8;
const EXCERPT_CONTEXT = 60;

/**
 * Score a search index entry against a query.
 * Returns 0 for no match, higher scores for better matches.
 */
function scoreEntry(entry: SearchIndexEntry, terms: string[]): number {
  const titleLower = entry.title.toLowerCase();
  const contentLower = entry.content.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (titleLower.includes(term)) {
      // Title matches are weighted heavily
      score += titleLower === term ? 100 : 50;
    }
    if (contentLower.includes(term)) {
      score += 10;
    }
  }

  return score;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Generate an excerpt with the matched term highlighted using <mark> tags.
 * HTML-escapes the excerpt text first, then inserts <mark> — safe for bypassSecurityTrustHtml.
 */
function generateExcerpt(content: string, terms: string[], sanitizer: DomSanitizer): SafeHtml {
  const lower = content.toLowerCase();

  // Find the first matching term's position
  let bestPos = -1;
  let bestTerm = terms[0];
  for (const term of terms) {
    const pos = lower.indexOf(term);
    if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
      bestPos = pos;
      bestTerm = term;
    }
  }

  if (bestPos === -1) {
    return sanitizer.bypassSecurityTrustHtml(escapeHtml(content.slice(0, EXCERPT_CONTEXT * 2)));
  }

  const start = Math.max(0, bestPos - EXCERPT_CONTEXT);
  const end = Math.min(content.length, bestPos + bestTerm.length + EXCERPT_CONTEXT);
  let excerpt = content.slice(start, end).trim();

  if (start > 0) excerpt = `...${excerpt}`;
  if (end < content.length) excerpt = `${excerpt}...`;

  // Escape HTML entities BEFORE inserting <mark> tags
  excerpt = escapeHtml(excerpt);

  // Highlight all matching terms (safe — excerpt is already escaped)
  for (const term of terms) {
    const escaped = escapeHtml(term);
    const regex = new RegExp(`(${escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    excerpt = excerpt.replace(regex, '<mark>$1</mark>');
  }

  return sanitizer.bypassSecurityTrustHtml(excerpt);
}

@Component({
  selector: 'docs-search',
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
                  <span class="result-header">
                    <span class="result-title">{{ result.title }}</span>
                    @if (result.category) {
                      <span class="result-category">{{ result.category }}</span>
                    }
                  </span>
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
  private readonly sanitizer = inject(DomSanitizer);
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private searchIndex: SearchIndexEntry[] | null = null;
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly isOpen = signal(false);
  readonly query = signal('');

  // Debounced query — follows query with 200ms delay via RxJS
  private readonly debouncedQuery = toSignal(toObservable(this.query).pipe(debounceTime(200)), { initialValue: '' });

  private readonly searchResource = resource({
    params: () => {
      const q = this.debouncedQuery();
      return this.isOpen() && q.trim() ? { q } : undefined;
    },
    loader: async ({ params }) => {
      if (!this.searchIndex) await this.loadSearchIndex();
      if (!this.searchIndex) return [];

      const terms = params.q
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 0);
      if (terms.length === 0) return [];

      return this.searchIndex
        .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RESULTS)
        .map(({ entry }) => ({
          url: entry.slug,
          title: entry.title,
          excerpt: generateExcerpt(entry.content, terms, this.sanitizer),
          category: entry.category,
        }));
    },
  });

  readonly results = computed<SearchResult[]>(() => this.searchResource.value() ?? []);
  readonly loading = this.searchResource.isLoading;

  open(): void {
    this.isOpen.set(true);
    this.loadSearchIndex();
    requestAnimationFrame(() => {
      this.searchInputRef()?.nativeElement.focus();
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

  navigateTo(slug: string): void {
    this.close();
    // Resolve the slug relative to the current adapter route
    const urlTree = this.router.parseUrl(this.router.url);
    const adapter = urlTree.root.children['primary']?.segments[0]?.path ?? 'material';
    void this.router.navigateByUrl(`/${adapter}/${slug}`);
  }

  onGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === '/' && !this.isOpen() && !this.isInputFocused()) {
      event.preventDefault();
      this.open();
    }
  }

  private isInputFocused(): boolean {
    if (!this.isBrowser) return false;
    const active = document.activeElement;
    return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active as HTMLElement)?.isContentEditable;
  }

  private async loadSearchIndex(): Promise<void> {
    if (this.searchIndex || !this.isBrowser) return;
    try {
      const base = this.baseHref.endsWith('/') ? this.baseHref : `${this.baseHref}/`;
      const response = await fetch(`${base}__search-index.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.searchIndex = (await response.json()) as SearchIndexEntry[];
    } catch {
      // Search index unavailable — search will show no results
    }
  }
}

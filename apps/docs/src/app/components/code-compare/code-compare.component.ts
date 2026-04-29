import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, signal, viewChildren } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { derivedFrom } from 'ngxtension/derived-from';
import { from, pipe, switchMap } from 'rxjs';
import { ShikiService } from '../../utils/shiki';

type LibraryKey = 'formly' | 'ngforge';

interface LibraryTab {
  readonly key: LibraryKey;
  readonly label: string;
}

const TABS: readonly LibraryTab[] = [
  { key: 'formly', label: 'ngx-formly' },
  { key: 'ngforge', label: 'ng-forge' },
];

function escapeHtml(code: string): string {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function plainCodeBlock(code: string, lang: string): string {
  return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
}

/**
 * Side-by-side code comparison for the ngx-formly migration guide.
 *
 * Renders both code panels in the DOM at all times — toggling visibility via
 * the `hidden` attribute — so search engines can crawl both samples regardless
 * of which tab is active. Highlighting runs synchronously during construction
 * (with a plain `<pre><code>` SSR fallback emitted by `ShikiService`) so the
 * raw HTML always contains the code text, then re-runs in the browser for
 * full Shiki tokenisation after hydration.
 */
@Component({
  selector: 'docs-code-compare',
  template: `
    @if (title(); as t) {
      <p class="code-compare__title">{{ t }}</p>
    }

    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus, @angular-eslint/template/click-events-have-key-events -->
    <nav class="code-compare__tabs" role="tablist" [attr.aria-label]="title() || 'Code comparison'" (keydown)="onKeydown($event)">
      @for (tab of tabs; track tab.key; let i = $index) {
        <button
          #tabBtn
          type="button"
          role="tab"
          class="code-compare__tab"
          [class.code-compare__tab--active]="active() === tab.key"
          [id]="tabId(tab.key)"
          [attr.aria-selected]="active() === tab.key"
          [attr.aria-controls]="panelId(tab.key)"
          [attr.tabindex]="active() === tab.key ? 0 : -1"
          [attr.data-index]="i"
          (click)="select(tab.key)"
        >
          {{ tab.label }}
        </button>
      }
    </nav>

    @for (tab of tabs; track tab.key) {
      <section
        class="code-compare__panel"
        role="tabpanel"
        [id]="panelId(tab.key)"
        [attr.aria-labelledby]="tabId(tab.key)"
        [hidden]="active() !== tab.key"
      >
        <div class="code-block-wrapper">
          <button
            type="button"
            class="code-copy-btn"
            [class.copied]="copiedKey() === tab.key"
            [attr.aria-label]="'Copy ' + tab.label + ' code'"
            (click)="copy(tab.key)"
            (mouseleave)="resetCopied(tab.key)"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <div class="code-compare__code" [innerHTML]="highlightedFor(tab.key)"></div>
        </div>
      </section>
    }
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
      margin: $space-6 0;
    }

    .code-compare__title {
      margin: 0 0 $space-3;
      font-family: $font-primary;
      font-size: $text-sm;
      font-weight: 600;
      color: var(--forge-text, #e8e4de);
    }

    .code-compare__tabs {
      display: flex;
      gap: $space-1;
      border-bottom: 1px solid var(--forge-border-color, #2a2824);
      margin-bottom: 0;
      position: relative;
    }

    .code-compare__tab {
      padding: $space-2 $space-4;
      font-size: $text-sm;
      font-family: $font-primary;
      font-weight: 500;
      color: var(--forge-text-muted, #9a958c);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      margin-bottom: -1px;
      transition:
        color $transition-fast,
        border-color $transition-fast;

      &:hover {
        color: var(--forge-text, #e8e4de);
      }

      &:focus-visible {
        outline: 2px solid $ember-glow;
        outline-offset: 2px;
        border-radius: 2px;
      }

      &--active {
        color: $ember-glow;
        border-bottom-color: $ember-glow;
      }
    }

    .code-compare__panel {
      border: 1px solid var(--forge-border-color, #2a2824);
      border-top: none;
      border-radius: 0 0 $radius-md $radius-md;
      background: var(--forge-base-1, #131210);

      &[hidden] {
        display: none;
      }
    }

    .code-block-wrapper {
      position: relative;

      &:hover .code-copy-btn {
        opacity: 1;
      }
    }

    .code-copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--forge-text-muted, #9a958c);
      cursor: pointer;
      opacity: 0;
      transition:
        opacity $transition-fast,
        color $transition-fast;

      &:hover {
        color: var(--forge-text, #e8e4de);
      }

      &:focus-visible {
        opacity: 1;
        outline: 2px solid $ember-glow;
        outline-offset: 2px;
      }

      &.copied {
        opacity: 1;
        color: $ember-glow;
      }

      &.copied::after {
        content: 'Copied!';
        position: absolute;
        bottom: calc(100% + 6px);
        right: 0;
        font-size: 11px;
        font-weight: 600;
        color: #fff;
        background: $ember-core;
        padding: 4px 10px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        animation: code-compare-copy-toast-in 0.15s ease;
      }
    }

    @keyframes code-compare-copy-toast-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .code-compare__code {
      ::ng-deep pre {
        margin: 0;
        padding: $space-4;
        border: none;
        border-radius: 0 0 $radius-md $radius-md;
        background: transparent !important;
        overflow-x: auto;
        font-size: $text-sm;
      }

      ::ng-deep code {
        font-family: $font-mono;
        font-size: $text-sm;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsCodeCompareComponent {
  readonly title = input<string | undefined>(undefined);
  // Required inputs throw NG0950 when bound via NgComponentOutletInputs because
  // Angular checks for presence before the dynamic-outlet wiring resolves them.
  // Use optional inputs with empty defaults — the parser always provides values.
  readonly formly = input<string>('');
  readonly ngforge = input<string>('');
  readonly lang = input<string>('typescript');

  protected readonly tabs = TABS;
  /** ngx-formly is the default (migration guide — readers are coming from formly). */
  protected readonly active = signal<LibraryKey>('formly');
  protected readonly copiedKey = signal<LibraryKey | null>(null);

  private readonly shiki = inject(ShikiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly clipboard = inject(Clipboard);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  /** Plain SSR-safe markup — present in raw HTML for both panels before hydration. */
  private readonly plainHtml = computed(() => ({
    formly: this.trustHtml(plainCodeBlock(this.formly(), this.lang())),
    ngforge: this.trustHtml(plainCodeBlock(this.ngforge(), this.lang())),
  }));

  /** Browser-only Shiki upgrade — re-runs when inputs change. */
  private readonly highlighted = derivedFrom(
    [this.formly, this.ngforge, this.lang] as const,
    pipe(
      switchMap(([formlyCode, ngforgeCode, lang]) => {
        const both = Promise.all([this.shiki.highlightCode(formlyCode, lang), this.shiki.highlightCode(ngforgeCode, lang)]);
        return from(both);
      }),
    ),
    { initialValue: null as readonly [string, string] | null },
  );

  private readonly highlightedSafe = computed(() => {
    const result = this.highlighted();
    if (!result) return null;
    return {
      formly: this.trustHtml(result[0]),
      ngforge: this.trustHtml(result[1]),
    };
  });

  protected readonly highlightedFor = (key: LibraryKey): SafeHtml => {
    return this.highlightedSafe()?.[key] ?? this.plainHtml()[key];
  };

  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.copyTimer) clearTimeout(this.copyTimer);
    });
  }

  protected tabId(key: LibraryKey): string {
    return `code-compare-tab-${key}`;
  }

  protected panelId(key: LibraryKey): string {
    return `code-compare-panel-${key}`;
  }

  protected select(key: LibraryKey): void {
    this.active.set(key);
  }

  protected copy(key: LibraryKey): void {
    const code = key === 'formly' ? this.formly() : this.ngforge();
    this.clipboard.copy(code);
    this.copiedKey.set(key);
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => this.copiedKey.set(null), 2000);
  }

  protected resetCopied(key: LibraryKey): void {
    if (this.copiedKey() === key) this.copiedKey.set(null);
  }

  /** Roving tabindex keyboard nav (Left/Right/Home/End/Enter/Space). */
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.getAttribute('role') !== 'tab') return;

    const buttons = this.tabButtons().map((ref) => ref.nativeElement);
    if (buttons.length === 0) return;

    const currentIndex = buttons.findIndex((btn) => btn === target);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % buttons.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const key = TABS[currentIndex]?.key;
        if (key) this.select(key);
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    const nextKey = TABS[nextIndex]?.key;
    if (!nextKey) return;
    this.select(nextKey);
    buttons[nextIndex]?.focus();
  }

  private trustHtml(html: string): SafeHtml {
    // Safe: html is either plain code block we constructed (escaped via escapeHtml)
    // or Shiki-highlighted output from developer-authored code strings.
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

export default DocsCodeCompareComponent;

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ENVIRONMENT } from '../../config/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, map, merge, startWith } from 'rxjs';

@Component({
  selector: 'example-iframe',
  template: `
    <div class="example-iframe-container" [style.height.px]="iframeHeight()">
      @if (loading()) {
        <div class="example-loading">
          <div class="spinner"></div>
          <p>Loading example...</p>
        </div>
      }
      <iframe
        #iframeEl
        [src]="trustedSrc()"
        [style.height.px]="iframeHeight()"
        [style.width]="width()"
        (load)="onLoad()"
        [class.loaded]="!loading()"
        frameborder="0"
        title="Example: {{ example() }}"
      >
      </iframe>
    </div>
    @if (code()) {
      <details>
        <summary>Click to view config! 🔧</summary>
        <pre><code>{{ code() }}</code></pre>
      </details>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 1.5rem 0;
      }

      .example-iframe-container {
        position: relative;
        border: 1px solid var(--ng-doc-border-color, #e0e0e0);
        border-radius: 8px;
        overflow: hidden;
        background: var(--ng-doc-base-0, #ffffff);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .example-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--ng-doc-base-0, #ffffff);
        z-index: 10;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--ng-doc-border-color, #e0e0e0);
        border-top-color: var(--ng-doc-primary, #3f51b5);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .example-loading p {
        color: var(--ng-doc-text-muted, #757575);
        font-size: 0.875rem;
      }

      iframe {
        display: block;
        width: 100%;
        border: none;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }

      iframe.loaded {
        opacity: 1;
      }

      details {
        margin-top: 1rem;
        border: 1px solid var(--ng-doc-border-color, #e0e0e0);
        border-radius: 4px;
      }

      summary {
        cursor: pointer;
        font-weight: 500;
        padding: 0.75rem 1rem;
        background: var(--ng-doc-base-1, #f5f5f5);
        border-radius: 4px 4px 0 0;
        user-select: none;
        list-style: none;
      }

      summary::-webkit-details-marker {
        display: none;
      }

      summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 0.5rem;
        transition: transform 0.2s;
      }

      details[open] summary::before {
        transform: rotate(90deg);
      }

      summary:hover {
        background: var(--ng-doc-base-2, #eeeeee);
      }

      details pre {
        margin: 0;
        padding: 1rem;
        background: #282c34;
        border-radius: 0 0 4px 4px;
        overflow-x: auto;
      }

      details code {
        color: #abb2bf;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        white-space: pre;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleIframeComponent {
  library = input.required<'material' | 'primeng' | 'ionic' | 'bootstrap'>();
  example = input.required<string>();
  width = input<string>('100%');
  code = input<string>(); // Optional code snippet to display

  private readonly env = inject(ENVIRONMENT);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly iframeEl = viewChild<ElementRef<HTMLIFrameElement>>('iframeEl');

  loading = signal(true);
  iframeHeight = signal(100); // Start small, will adjust via postMessage
  currentTheme = signal<string>('auto');

  iframeSrc = computed(() => {
    const baseUrl = this.env.exampleBaseUrls[this.library()];
    const theme = this.currentTheme();
    return `${baseUrl}/#/examples/${this.example()}?theme=${theme}`;
  });

  trustedSrc = computed<SafeResourceUrl>(() => {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeSrc());
  });

  constructor() {
    if (this.isBrowser) {
      // Watch for theme changes on the document
      this.watchThemeChanges();

      // Listen for height messages from iframe
      fromEvent<MessageEvent>(window, 'message')
        .pipe(
          filter((event) => event.data?.type === 'example-iframe-height'),
          // Only accept messages from this iframe's URL (match by example route)
          filter((event) => {
            const messageUrl = event.data.url as string | undefined;
            return messageUrl !== undefined && messageUrl.includes(this.example());
          }),
          map((event) => event.data.height as number),
          filter((height) => height > 0),
          takeUntilDestroyed(),
        )
        .subscribe((height) => {
          this.iframeHeight.set(height);
        });

      // Send theme to iframe when theme changes
      effect(() => {
        const theme = this.currentTheme();
        const iframe = this.iframeEl();
        if (iframe?.nativeElement?.contentWindow) {
          iframe.nativeElement.contentWindow.postMessage({ type: 'theme-change', theme }, '*');
        }
      });
    }
  }

  private watchThemeChanges(): void {
    // Initial theme
    this.currentTheme.set(this.getTheme());

    // Watch for attribute changes on <html> element
    const observer = new MutationObserver(() => {
      this.currentTheme.set(this.getTheme());
    });

    observer.observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      // Only update if in auto mode (no explicit theme set)
      if (!this.document.documentElement.hasAttribute('data-theme')) {
        this.currentTheme.set(this.getTheme());
      }
    });
  }

  private getTheme(): string {
    const dataTheme = this.document.documentElement.getAttribute('data-theme');
    if (dataTheme) {
      return dataTheme;
    }
    // Auto mode - check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  onLoad(): void {
    this.loading.set(false);
    // Send initial theme to iframe after it loads
    const iframe = this.iframeEl();
    if (iframe?.nativeElement?.contentWindow) {
      iframe.nativeElement.contentWindow.postMessage({ type: 'theme-change', theme: this.currentTheme() }, '*');
    }
  }
}

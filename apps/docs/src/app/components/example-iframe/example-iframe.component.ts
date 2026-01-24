import { ChangeDetectionStrategy, Component, computed, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ENVIRONMENT } from '../../config/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, map } from 'rxjs';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';

@Component({
  selector: 'example-iframe',
  imports: [CodeHighlightDirective],
  template: `
    <div class="example-iframe-container" [style.height.px]="iframeHeight()">
      @if (loading()) {
        <div class="example-loading">
          <div class="spinner"></div>
          <p>Loading example...</p>
        </div>
      }
      <iframe
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
        <div class="code-container">
          <pre [codeHighlight]="code()!" lang="typescript"></pre>
        </div>
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

      .code-container {
        border-radius: 0 0 4px 4px;
        overflow-x: auto;
      }

      .code-container pre {
        margin: 0;
        padding: 1rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        overflow-x: auto;
        background: transparent;
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
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  loading = signal(true);
  iframeHeight = signal(100); // Start small, will adjust via postMessage

  iframeSrc = computed(() => {
    const baseUrl = this.env.exampleBaseUrls[this.library()];
    return `${baseUrl}/#/examples/${this.example()}`;
  });

  trustedSrc = computed<SafeResourceUrl>(() => {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeSrc());
  });

  constructor() {
    // Listen for height messages from iframe
    if (this.isBrowser) {
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
    }
  }

  onLoad(): void {
    this.loading.set(false);
  }
}

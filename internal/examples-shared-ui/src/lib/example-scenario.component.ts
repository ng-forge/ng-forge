import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { DOCUMENT, JsonPipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from './types';
import { injectQueryParams } from 'ngxtension/inject-query-params';

/**
 * Generic component for rendering a single example scenario.
 * Uses Forge design language with dark/light theme support.
 *
 * Reads scenario data from route data or accepts it as an input.
 * Supports `?minimal=true` query parameter to hide the form data output.
 * Supports `?theme=dark` query parameter to enable dark theme.
 */
@Component({
  selector: 'example-scenario',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'example-container',
  },
  styles: `
    /* ============================================
       CSS Custom Properties (Theme Tokens)
       ============================================ */
    :host {
      /* Light mode defaults */
      --bg-deep: #ffffff;
      --bg-surface: #f8f9fa;
      --bg-elevated: #f0f1f3;
      --steel: #1a1a1a;
      --steel-mid: #6b7280;
      --steel-dim: #9ca3af;
      --steel-dark: #e5e7eb;
      --ember-core: #ff4d00;
      --ember-hot: #ff6b2b;
      --ember-glow: #ff8c42;

      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      font-family:
        'Space Grotesk',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
      background: var(--bg-deep);
      color: var(--steel);
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    }

    /* Gradient top border (Forge signature) */
    :host::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--ember-core), var(--ember-glow), var(--ember-core), transparent);
      opacity: 0.7;
      z-index: 1;
    }

    /* Dark mode overrides */
    :host-context([data-theme='dark']) {
      --bg-deep: #0a0908;
      --bg-surface: #131210;
      --bg-elevated: #1a1916;
      --steel: #e8e4de;
      --steel-mid: #9a958c;
      --steel-dim: #5c5850;
      --steel-dark: #2a2824;
    }

    /* ============================================
       Icons (CSS Mask-based with data URIs)
       ============================================ */
    .icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      background-color: currentColor;
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
      flex-shrink: 0;
    }

    .icon--copy {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/%3E%3C/svg%3E");
    }

    .icon--check {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
    }

    .icon--external-link {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/%3E%3Cpolyline points='15 3 21 3 21 9'/%3E%3Cline x1='10' y1='14' x2='21' y2='3'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/%3E%3Cpolyline points='15 3 21 3 21 9'/%3E%3Cline x1='10' y1='14' x2='21' y2='3'/%3E%3C/svg%3E");
    }

    .icon--play {
      width: 12px;
      height: 12px;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpolygon points='5 3 19 12 5 21 5 3'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpolygon points='5 3 19 12 5 21 5 3'/%3E%3C/svg%3E");
    }

    .icon--code {
      width: 12px;
      height: 12px;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='16 18 22 12 16 6'/%3E%3Cpolyline points='8 6 2 12 8 18'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='16 18 22 12 16 6'/%3E%3Cpolyline points='8 6 2 12 8 18'/%3E%3C/svg%3E");
    }

    /* ============================================
       Header
       ============================================ */
    .example-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--steel-dark);
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 1rem;
    }

    .header-dots {
      display: flex;
      gap: 0.5rem;
    }

    .header-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .header-dot:nth-child(1) {
      background: #ff5f57;
    }
    .header-dot:nth-child(2) {
      background: #ffbd2e;
    }
    .header-dot:nth-child(3) {
      background: #28ca42;
    }

    .example-title {
      font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--steel-dim);
    }

    .header-actions {
      display: flex;
      gap: 0.25rem;
      padding-right: 1rem;
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--steel-dim);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .icon-btn:hover {
      background: var(--bg-elevated);
      color: var(--ember-glow);
      transform: scale(1.1);
    }

    .icon-btn:active {
      transform: scale(0.95);
    }

    /* ============================================
       Tabs
       ============================================ */
    .tabs {
      display: flex;
      gap: 0.25rem;
      padding: 0 1rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--steel-dark);
      width: 100%;
      box-sizing: border-box;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px 6px 0 0;
      color: var(--steel-dim);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: -1px;
    }

    .tab-btn:hover {
      color: var(--steel-mid);
      background: var(--bg-elevated);
    }

    .tab-btn.active {
      color: var(--ember-glow);
      background: var(--bg-deep);
      border-color: var(--steel-dark);
      border-bottom-color: var(--bg-deep);
    }

    /* ============================================
       Content
       ============================================ */
    .tab-content {
      padding: 1rem;
      flex: 1;
      background: var(--bg-deep);
      width: 100%;
      box-sizing: border-box;
    }

    .code-block {
      background: var(--bg-surface);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
      font-size: 0.8rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      color: var(--ember-glow);
    }

    .example-result {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--bg-surface);
      border-radius: 8px;
      border: 1px solid var(--steel-dark);
    }

    .example-result h4 {
      margin: 0 0 0.5rem 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--steel-dim);
    }

    .example-result pre {
      margin: 0;
      font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
      font-size: 0.75rem;
      line-height: 1.5;
      color: var(--steel);
    }

    /* ============================================
       Minimal Mode (iframe embedded)
       ============================================ */
    :host.minimal-mode {
      border: none;
      border-radius: 0;
    }

    :host.minimal-mode::before {
      display: none;
    }

    .minimal-content {
      padding: 1rem;
    }
  `,
  template: `
    @if (!minimal()) {
      <div class="example-header">
        <div class="header-left">
          <div class="header-dots">
            <span class="header-dot"></span>
            <span class="header-dot"></span>
            <span class="header-dot"></span>
          </div>
          @if (scenario().title) {
            <span class="example-title">{{ scenario().title }}</span>
          }
        </div>
        <div class="header-actions">
          <button class="icon-btn" type="button" [title]="copied() ? 'Copied!' : 'Copy config'" (click)="copyConfig()">
            <span class="icon" [class.icon--check]="copied()" [class.icon--copy]="!copied()"></span>
          </button>
          <button class="icon-btn" type="button" title="Open in new tab" (click)="openFullscreen()">
            <span class="icon icon--external-link"></span>
          </button>
        </div>
      </div>
      <div class="tabs">
        <button class="tab-btn" type="button" [class.active]="activeTab() === 'demo'" (click)="activeTab.set('demo')">
          <span class="icon icon--play" aria-hidden="true"></span>
          Live Demo
        </button>
        <button class="tab-btn" type="button" [class.active]="activeTab() === 'code'" (click)="activeTab.set('code')">
          <span class="icon icon--code" aria-hidden="true"></span>
          Config
        </button>
      </div>
      <div class="tab-content">
        @if (activeTab() === 'demo') {
          <form [dynamic-form]="scenario().config" [(value)]="formValue"></form>
          <div class="example-result">
            <h4>Form Data</h4>
            <pre>{{ formValue() | json }}</pre>
          </div>
        } @else {
          <pre class="code-block">{{ configJson() }}</pre>
        }
      </div>
    } @else {
      <div class="minimal-content">
        <form [dynamic-form]="scenario().config" [(value)]="formValue"></form>
      </div>
    }
  `,
})
export class ExampleScenarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly clipboard = inject(Clipboard);

  /** Scenario passed directly as input (for embedding in other components) */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  scenarioInput = input<ExampleScenario | undefined>(undefined, { alias: 'scenario' });

  /** Scenario loaded from route data */
  private readonly routeScenario = toSignal(this.route.data.pipe(map((data) => data['scenario'] as ExampleScenario | undefined)));

  /** Whether to hide the form data output (minimal mode) */
  minimal = injectQueryParams('minimal', { initialValue: false });

  /** Active tab */
  activeTab = signal<'demo' | 'code'>('demo');

  /** Copy feedback state */
  copied = signal(false);

  constructor() {
    // Apply theme from query params (default to dark) and set body background
    this.route.queryParams
      .pipe(
        map((params) => params['theme'] ?? 'dark'), // Default to dark theme
        takeUntilDestroyed(),
      )
      .subscribe((theme) => {
        this.document.documentElement.setAttribute('data-theme', theme);
        // Set body background to match theme
        const bgColor = theme === 'dark' ? '#0a0908' : '#ffffff';
        this.document.body.style.backgroundColor = bgColor;
        this.document.body.style.margin = '0';
        this.document.body.style.padding = '0';
        this.document.body.style.minHeight = '100vh';
      });
  }

  /** Resolved scenario - prefers input over route data */
  scenario = computed(() => {
    const fromInput = this.scenarioInput();
    const fromRoute = this.routeScenario();
    const resolved = fromInput ?? fromRoute;

    if (!resolved) {
      throw new Error('ExampleScenarioComponent requires a scenario via input or route data');
    }

    return resolved;
  });

  /** JSON representation of the config for display */
  configJson = computed(() => JSON.stringify(this.scenario().config, null, 2));

  formValue = linkedSignal<Record<string, unknown>>(() => this.scenario().initialValue ?? {});

  copyConfig(): void {
    this.clipboard.copy(this.configJson());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  openFullscreen(): void {
    const url = `${window.location.origin}${window.location.pathname}?minimal=true`;
    window.open(url, '_blank');
  }
}

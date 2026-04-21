import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { LiveExampleComponent } from '../components/live-example/live-example.component';
import { DocsAdapterPropsComponent } from '../components/adapter-props/adapter-props.component';
import { type ComponentRegistration, type ComponentSegment, type ContentSegment, parseContentSegments } from './content-segment-parser';

const COMPONENT_REGISTRY: ComponentRegistration[] = [
  {
    selector: 'docs-adapter-props',
    component: DocsAdapterPropsComponent,
    defer: false,
    extractInputs: (attrs) => ({ field: attrs['field'] ?? '' }),
  },
  {
    selector: 'docs-live-example',
    component: LiveExampleComponent,
    defer: true,
    extractInputs: (attrs) => ({
      scenario: attrs['scenario'] ?? '',
      hideForCustom: attrs['hideforcustom'] ?? attrs['hideForCustom'] ?? false,
    }),
  },
  {
    selector: 'docs-install-command',
    defer: true,
    loadComponent: () => import('../components/install-command/install-command.component'),
    extractInputs: (attrs) => ({ packages: attrs['packages'] ?? '' }),
  },
  {
    selector: 'docs-adapter-picker',
    defer: true,
    loadComponent: () => import('../components/adapter-picker/adapter-picker.component'),
  },
  {
    selector: 'docs-integration-view',
    defer: true,
    loadComponent: () => import('../components/integration-view/integration-view.component'),
  },
  {
    selector: 'docs-configuration-view',
    defer: true,
    loadComponent: () => import('../components/configuration-view/configuration-view.component'),
  },
  {
    selector: 'docs-cascade-visual',
    defer: true,
    loadComponent: () => import('../components/cascade-visual/cascade-visual.component'),
  },
  {
    selector: 'docs-wrapper-chain-visual',
    defer: true,
    loadComponent: () => import('../components/wrapper-chain-visual/wrapper-chain-visual.component'),
  },
  {
    selector: 'docs-nesting-rules',
    defer: true,
    loadComponent: () => import('../components/nesting-rules/nesting-rules.component'),
  },
  {
    selector: 'docs-logic-flow',
    defer: true,
    loadComponent: () => import('../components/logic-flow/logic-flow.component'),
  },
  {
    selector: 'docs-derivation-flow',
    defer: true,
    loadComponent: () => import('../components/derivation-flow/derivation-flow.component'),
  },
];

/**
 * Declaratively renders markdown HTML content with embedded Angular components.
 *
 * Parses raw HTML into segments (static HTML + component placeholders), then
 * renders each segment using `@for` + `NgComponentOutlet`. Heavy components
 * (like LiveExampleComponent) are deferred with `@defer (on viewport)` so
 * they only bootstrap when scrolled into view.
 *
 * Visualization components (adapter-picker, integration-view, etc.) are
 * lazy-loaded via dynamic `import()` — their JS is only fetched when a page
 * containing them is navigated to.
 *
 * HTML segments use `bypassSecurityTrustHtml()` since the content already
 * comes from our own trusted ContentService markdown pipeline — this avoids
 * expensive re-sanitization on each `[innerHTML]` binding.
 */
@Component({
  selector: 'app-content-segments',
  imports: [NgComponentOutlet],
  template: `
    @for (segment of resolvedSegments(); track $index) {
      @if (segment.type === 'html') {
        <div class="content-html" [innerHTML]="segment.html"></div>
      } @else if (segment.defer && segment.component) {
        @defer (on viewport; prefetch on idle) {
          <ng-container [ngComponentOutlet]="segment.component" [ngComponentOutletInputs]="segment.inputs" />
        } @placeholder {
          <div class="skeleton-live-example">
            <div class="skel-badge"></div>
            <div class="skel-field">
              <div class="skel-label"></div>
              <div class="skel-input"></div>
            </div>
            <div class="skel-field">
              <div class="skel-label"></div>
              <div class="skel-input"></div>
            </div>
            <div class="skel-field">
              <div class="skel-label skel-label--short"></div>
              <div class="skel-input"></div>
            </div>
            <div class="skel-button"></div>
          </div>
        }
      } @else if (segment.defer && !segment.component) {
        <!-- Lazy component still loading — show skeleton -->
        <div class="skeleton-generic">
          <div class="skel-generic-line skel-generic-line--long"></div>
          <div class="skel-generic-line"></div>
          <div class="skel-generic-line skel-generic-line--short"></div>
        </div>
      } @else {
        <ng-container [ngComponentOutlet]="segment.component!" [ngComponentOutletInputs]="segment.inputs" />
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .content-html {
      display: contents;
    }

    /* ---- Shared shimmer (GPU-composited via transform) ---- */
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @mixin shimmer-bg {
      position: relative;
      overflow: hidden;
      background: var(--forge-base-2, #1a1916);

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, var(--forge-base-3, #2a2824) 50%, transparent 100%);
        animation: shimmer 1.5s ease-in-out infinite;
        will-change: transform;
      }
    }

    /* ---- Live example skeleton (form-shaped) ---- */
    .skeleton-live-example {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 32px 24px 24px;
      margin: 16px 0;
      min-height: 300px;
      border-radius: 12px;
      border: 1px solid var(--forge-border-color, #2a2824);
      background: var(--forge-base-1, #131210);
    }

    .skel-badge {
      position: absolute;
      top: 10px;
      right: 12px;
      width: 72px;
      height: 22px;
      border-radius: 12px;
      @include shimmer-bg;
      opacity: 0.5;
    }

    .skel-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skel-label {
      width: 120px;
      height: 14px;
      border-radius: 4px;
      @include shimmer-bg;

      &--short {
        width: 80px;
      }
    }

    .skel-input {
      width: 100%;
      height: 40px;
      border-radius: 6px;
      @include shimmer-bg;
    }

    .skel-button {
      width: 100px;
      height: 36px;
      border-radius: 6px;
      margin-top: 4px;
      align-self: flex-start;
      @include shimmer-bg;
    }

    /* ---- Generic skeleton (for lazy viz components) ---- */
    .skeleton-generic {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 24px;
      margin: 16px 0;
      border-radius: 12px;
      border: 1px solid var(--forge-border-color, #2a2824);
      background: var(--forge-base-1, #131210);
      min-height: 120px;
    }

    .skel-generic-line {
      height: 14px;
      width: 75%;
      border-radius: 4px;
      @include shimmer-bg;

      &--long {
        width: 90%;
      }

      &--short {
        width: 50%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skel-badge::after,
      .skel-label::after,
      .skel-input::after,
      .skel-button::after,
      .skel-generic-line::after {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentSegmentsComponent {
  readonly contentHtml = input<string | null>(null);
  private readonly sanitizer = inject(DomSanitizer);

  /** Pre-bind the trust function so it can be passed to the pure parser. */
  private readonly trustHtml = (raw: string) => this.sanitizer.bypassSecurityTrustHtml(raw);

  private readonly segments = computed<ContentSegment[]>(() => {
    const html = this.contentHtml();
    if (!html) return [];
    return parseContentSegments(html, COMPONENT_REGISTRY, this.trustHtml);
  });

  /**
   * Mutable copy of parsed segments. Lazy component segments start with
   * `component: null` and are updated in-place once `loadComponent()` resolves.
   */
  readonly resolvedSegments = linkedSignal<ContentSegment[]>(() => this.segments());

  constructor() {
    explicitEffect([this.segments], ([segments]) => {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg.type === 'component' && !seg.component && seg.loadComponent) {
          this.loadLazyComponent(seg.loadComponent, i);
        }
      }
    });
  }

  private loadLazyComponent(loader: () => Promise<{ default: Type<unknown> }>, index: number): void {
    loader()
      .then((mod) => {
        this.resolvedSegments.update((segs) =>
          segs.map((s, j) => (j === index && s.type === 'component' ? { ...s, component: mod.default } : s)),
        );
      })
      .catch((err) => {
        console.error(`[ContentSegments] Failed to load lazy component at index ${index}:`, err);
        this.resolvedSegments.update((segs) => segs.filter((_, j) => j !== index));
      });
  }
}

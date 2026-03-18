import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { LiveExampleComponent } from '../components/live-example/live-example.component';
import { AdapterPickerComponent } from '../components/adapter-picker/adapter-picker.component';
import { DocsIntegrationViewComponent } from '../components/integration-view/integration-view.component';
import { DocsConfigurationViewComponent } from '../components/configuration-view/configuration-view.component';
import { CascadeVisualComponent } from '../components/cascade-visual/cascade-visual.component';
import { NestingRulesComponent } from '../components/nesting-rules/nesting-rules.component';
import { LogicFlowComponent } from '../components/logic-flow/logic-flow.component';
import { DerivationFlowComponent } from '../components/derivation-flow/derivation-flow.component';
import { type ComponentRegistration, type ContentSegment, parseContentSegments } from './content-segment-parser';

const COMPONENT_REGISTRY: ComponentRegistration[] = [
  {
    selector: 'docs-live-example',
    component: LiveExampleComponent,
    defer: true,
    extractInputs: (attrs) => ({ scenario: attrs['scenario'] ?? '' }),
  },
  {
    selector: 'docs-adapter-picker',
    component: AdapterPickerComponent,
    defer: false,
  },
  {
    selector: 'docs-integration-view',
    component: DocsIntegrationViewComponent,
    defer: false,
  },
  {
    selector: 'docs-configuration-view',
    component: DocsConfigurationViewComponent,
    defer: false,
  },
  {
    selector: 'docs-cascade-visual',
    component: CascadeVisualComponent,
    defer: false,
  },
  {
    selector: 'docs-nesting-rules',
    component: NestingRulesComponent,
    defer: false,
  },
  {
    selector: 'docs-logic-flow',
    component: LogicFlowComponent,
    defer: false,
  },
  {
    selector: 'docs-derivation-flow',
    component: DerivationFlowComponent,
    defer: false,
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
 * HTML segments use `bypassSecurityTrustHtml()` since the content already
 * comes from our own trusted ContentService markdown pipeline — this avoids
 * expensive re-sanitization on each `[innerHTML]` binding.
 */
@Component({
  selector: 'app-content-segments',
  imports: [NgComponentOutlet],
  template: `
    @for (segment of segments(); track $index) {
      @if (segment.type === 'html') {
        <div class="content-html" [innerHTML]="segment.html"></div>
      } @else if (segment.defer) {
        @defer (on viewport; prefetch on idle) {
          <ng-container [ngComponentOutlet]="segment.component" [ngComponentOutletInputs]="segment.inputs" />
        } @placeholder {
          <!-- Live example skeleton: mimics form with input fields + button -->
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
      } @else {
        <ng-container [ngComponentOutlet]="segment.component" [ngComponentOutletInputs]="segment.inputs" />
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

    /* ---- Shared shimmer ---- */
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @mixin shimmer-bg {
      background: linear-gradient(
        90deg,
        var(--forge-base-2, #1a1916) 0%,
        var(--forge-base-3, #2a2824) 50%,
        var(--forge-base-2, #1a1916) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
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

    @media (prefers-reduced-motion: reduce) {
      .skel-badge,
      .skel-label,
      .skel-input,
      .skel-button {
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

  readonly segments = computed<ContentSegment[]>(() => {
    const html = this.contentHtml();
    if (!html) return [];
    return parseContentSegments(html, COMPONENT_REGISTRY, this.trustHtml);
  });
}

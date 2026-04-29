import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Side-by-side visual contrasting formly's string-DSL expression with
 * ng-forge's typed structured-config equivalent. Anchors the migration
 * guide's central conceptual shift at the top of the page.
 */
@Component({
  selector: 'docs-dsl-shift',
  template: `
    <div class="dsl-shift">
      <div class="dsl-shift__card dsl-shift__card--formly">
        <div class="dsl-shift__pill dsl-shift__pill--formly">ngx-formly</div>
        <pre class="dsl-shift__code"><code>'<span class="t-prop">!model</span>.<span class="t-prop">country</span>'</code></pre>
        <span class="dsl-shift__caption">String DSL evaluated at runtime</span>
      </div>
      <span class="dsl-shift__arrow" aria-hidden="true">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <div class="dsl-shift__card dsl-shift__card--ngforge">
        <div class="dsl-shift__pill dsl-shift__pill--ngforge">ng-forge</div>
        <pre
          class="dsl-shift__code"
        ><code><span class="t-punct">&#123;</span> <span class="t-key">type</span><span class="t-punct">:</span> <span class="t-string">'fieldValue'</span><span class="t-punct">,</span>
  <span class="t-key">fieldPath</span><span class="t-punct">:</span> <span class="t-string">'country'</span><span class="t-punct">,</span>
  <span class="t-key">operator</span><span class="t-punct">:</span> <span class="t-string">'equals'</span><span class="t-punct">,</span>
  <span class="t-key">value</span><span class="t-punct">:</span> <span class="t-keyword">undefined</span> <span class="t-punct">&#125;</span></code></pre>
        <span class="dsl-shift__caption">Typed object — refactorable, CSP-safe</span>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
      margin: $space-6 0;
    }

    .dsl-shift {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $space-4;
      padding: $space-5 $space-4;
      border: 1px solid var(--forge-border-color, #2a2824);
      border-radius: $radius-md;
      background: var(--forge-base-1, #131210);
    }

    .dsl-shift__card {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $space-3;
    }

    .dsl-shift__pill {
      padding: $space-1 $space-3;
      border-radius: 999px;
      font-weight: 600;
      font-size: $text-xs;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .dsl-shift__pill--formly {
      background: rgba(255, 140, 66, 0.08);
      color: $ember-glow;
      border: 1.5px solid rgba(255, 140, 66, 0.3);
    }

    .dsl-shift__pill--ngforge {
      background: rgba(255, 77, 0, 0.1);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.4);
    }

    .dsl-shift__code {
      width: 100%;
      margin: 0;
      padding: $space-3 $space-4;
      background: var(--forge-base-0, #0a0908);
      border: 1px solid var(--forge-border-color, #2a2824);
      border-radius: $radius-sm;
      font-family: $font-mono;
      font-size: $text-sm;
      line-height: 1.55;
      color: var(--forge-text, #e8e4de);
      overflow-x: auto;
      white-space: pre;
    }

    .dsl-shift__code .t-string {
      color: $ember-glow;
    }
    .dsl-shift__code .t-key {
      color: #82aaff;
    }
    .dsl-shift__code .t-prop {
      color: #c792ea;
    }
    .dsl-shift__code .t-punct {
      color: var(--forge-text-muted, #9a958c);
    }
    .dsl-shift__code .t-keyword {
      color: #ff79c6;
    }

    .dsl-shift__caption {
      font-size: $text-xs;
      font-style: italic;
      color: var(--forge-text-muted, #9a958c);
    }

    .dsl-shift__arrow {
      display: flex;
      align-items: center;
      color: var(--forge-base-4, #5c5850);
      flex-shrink: 0;
      align-self: center;
    }

    @media (max-width: 768px) {
      .dsl-shift {
        flex-direction: column;
        gap: $space-3;
        padding: $space-4 $space-3;
      }

      .dsl-shift__arrow {
        transform: rotate(90deg);
        align-self: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DslShiftComponent {}

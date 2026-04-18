import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Nested wrapper-chain visual — three rounded tiers with pill labels and
 * config code, stacked as Russian nesting dolls. Intentionally compact:
 * no slot chrome, no mock field preview, just the composition metaphor.
 */
@Component({
  selector: 'docs-wrapper-chain-visual',
  template: `
    <div class="wv">
      <div class="wv__layer wv__layer--outer">
        <div class="wv__row">
          <span class="wv__pill wv__pill--outer">Outer wrapper</span>
          <code class="wv__code">&#123; type: 'section' &#125;</code>
        </div>
        <div class="wv__layer wv__layer--inner">
          <div class="wv__row">
            <span class="wv__pill wv__pill--inner">Inner wrapper</span>
            <code class="wv__code">&#123; type: 'css' &#125;</code>
          </div>
          <div class="wv__layer wv__layer--field">
            <div class="wv__row">
              <span class="wv__pill wv__pill--field">Field component</span>
              <code class="wv__code">type: 'input'</code>
            </div>
          </div>
        </div>
      </div>
      <p class="wv__caption">First entry is outermost; last is innermost.</p>
    </div>
  `,
  styles: `
    @use 'tokens' as *;
    @use 'themes' as *;

    :host {
      display: block;
    }

    .wv {
      display: block;
      margin: 24px 0;
      padding: 14px;
      border-radius: 12px;
      background: var(--forge-base-1, #{$bg-surface});
      border: 1px solid var(--forge-border-color, #{$steel-dark});
    }

    .wv__layer {
      padding: 12px;
      border-radius: 10px;
      border: 1.5px solid rgba(255, 77, 0, 0.28);
      background: color-mix(in srgb, currentColor 3%, transparent);
    }

    .wv__layer--outer {
      border-color: rgba(255, 77, 0, 0.32);
      background: color-mix(in srgb, $ember-core 5%, transparent);
    }

    .wv__layer--inner {
      margin-top: 10px;
      border-color: rgba(255, 107, 43, 0.38);
      background: color-mix(in srgb, $ember-hot 7%, transparent);
    }

    .wv__layer--field {
      margin-top: 10px;
      border-color: rgba(255, 77, 0, 0.45);
      background: color-mix(in srgb, $ember-glow 9%, transparent);
    }

    .wv__row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .wv__pill {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.78rem;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .wv__pill--outer {
      background: rgba(255, 77, 0, 0.12);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.38);
    }

    .wv__pill--inner {
      background: rgba(255, 107, 43, 0.14);
      color: $ember-hot;
      border: 1.5px solid rgba(255, 107, 43, 0.42);
    }

    .wv__pill--field {
      background: rgba(255, 77, 0, 0.18);
      color: $ember-glow;
      border: 1.5px solid rgba(255, 77, 0, 0.5);
    }

    .wv__code {
      font-family: $font-mono;
      font-size: 0.75rem;
      color: var(--forge-text-muted, #{$steel-mid});
    }

    .wv__caption {
      margin: 10px 0 0;
      color: var(--forge-text-muted, #{$steel-mid});
      font-size: 0.72rem;
      text-align: center;
      letter-spacing: 0.02em;
    }

    @media (max-width: 480px) {
      .wv__layer {
        padding: 10px;
      }

      .wv__code {
        font-size: 0.7rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WrapperChainVisualComponent {}

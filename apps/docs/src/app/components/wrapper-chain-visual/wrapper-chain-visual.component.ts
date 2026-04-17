import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Horizontal visual of the wrapper chain: outermost wrapper → inner wrapper
 * → field component, with arrows between steps. Matches the cascade-visual
 * style (pills + code + arrow) used on the Configuration page so the docs
 * share a visual language.
 */
@Component({
  selector: 'docs-wrapper-chain-visual',
  template: `
    <div class="chain">
      <div class="chain__step">
        <div class="chain__pill chain__pill--outer">Outer wrapper</div>
        <code class="chain__code">{{ '{' }} type: 'section' {{ '}' }}</code>
        <span class="chain__scope">Outermost</span>
      </div>
      <span class="chain__arrow" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <span class="chain__arrow-label">#fieldComponent</span>
      </span>
      <div class="chain__step">
        <div class="chain__pill chain__pill--inner">Inner wrapper</div>
        <code class="chain__code">{{ '{' }} type: 'css' {{ '}' }}</code>
        <span class="chain__scope">Next in chain</span>
      </div>
      <span class="chain__arrow" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <span class="chain__arrow-label">#fieldComponent</span>
      </span>
      <div class="chain__step">
        <div class="chain__pill chain__pill--field">Field component</div>
        <code class="chain__code">type: 'input'</code>
        <span class="chain__scope">Innermost</span>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;
    @use 'themes' as *;

    :host {
      display: block;
    }

    .chain {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 1rem;
      padding: 1.5rem 1rem;
      flex-wrap: wrap;
    }

    .chain__step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      max-width: 200px;
      min-width: 140px;
    }

    .chain__pill {
      padding: 0.5rem 1.25rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .chain__pill--outer {
      background: rgba(255, 77, 0, 0.08);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.3);
    }

    .chain__pill--inner {
      background: rgba(255, 107, 43, 0.1);
      color: $ember-hot;
      border: 1.5px solid rgba(255, 107, 43, 0.35);
    }

    .chain__pill--field {
      background: linear-gradient(135deg, $ember-core, $ember-hot);
      color: #fff;
      border: 1.5px solid transparent;
      box-shadow: 0 6px 14px -6px rgba(255, 77, 0, 0.55);
    }

    .chain__code {
      font-family: $font-mono;
      font-size: 0.75rem;
      color: var(--forge-text-muted, #{$steel-mid});
    }

    .chain__scope {
      font-size: 0.6875rem;
      color: var(--forge-text-muted, #{$steel-mid});
      font-style: italic;
    }

    .chain__arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--forge-base-4, #{$steel-dim});
      margin-top: 0.5rem;
    }

    .chain__arrow-label {
      font-family: $font-mono;
      font-size: 0.6875rem;
      color: var(--forge-text-muted, #{$steel-mid});
      letter-spacing: 0.01em;
    }

    @media (max-width: 720px) {
      .chain {
        flex-direction: column;
        align-items: stretch;
      }

      .chain__step {
        max-width: none;
      }

      .chain__arrow {
        transform: rotate(90deg);
      }

      .chain__arrow-label {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WrapperChainVisualComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Nested visual of the wrapper chain — each wrapper is a card with a header
 * strip (pill + config) whose body contains the next wrapper, with a mocked
 * field preview at the innermost layer. The nesting structure is the core
 * metaphor; the visual design language (pills, ember accents, mono code) is
 * borrowed from cascade-visual for consistency across docs.
 */
@Component({
  selector: 'docs-wrapper-chain-visual',
  template: `
    <div class="wv">
      <div class="wv__layer wv__layer--outer">
        <div class="wv__head">
          <span class="wv__pill wv__pill--outer">Outer wrapper</span>
          <code class="wv__code">&#123; type: 'section' &#125;</code>
        </div>
        <div class="wv__body">
          <span class="wv__slot">slot: fieldComponent</span>
          <div class="wv__layer wv__layer--inner">
            <div class="wv__head">
              <span class="wv__pill wv__pill--inner">Inner wrapper</span>
              <code class="wv__code">&#123; type: 'css' &#125;</code>
            </div>
            <div class="wv__body">
              <span class="wv__slot">slot: fieldComponent</span>
              <div class="wv__layer wv__layer--field">
                <div class="wv__head wv__head--field">
                  <span class="wv__pill wv__pill--field">Field component</span>
                  <code class="wv__code">type: 'input'</code>
                </div>
                <div class="wv__preview">
                  <span class="wv__preview-label">Email</span>
                  <div class="wv__preview-input">
                    <span class="wv__preview-placeholder">you&#64;example.com</span>
                  </div>
                </div>
              </div>
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
      margin: 32px 0;
      padding: 32px 28px 28px;
      border-radius: 14px;
      background: var(--forge-base-1, #{$bg-surface});
      border: 1px solid var(--forge-border-color, #{$steel-dark});
    }

    // Each layer is a rounded card. The border + background tint get
    // stronger at each level, so the nesting reads visually as "going
    // deeper". Hover gives the whole chain a subtle lift.
    .wv__layer {
      border-radius: 12px;
      overflow: hidden;
      border: 1.5px solid rgba(255, 77, 0, 0.28);
      background: color-mix(in srgb, currentColor 3%, transparent);
    }

    .wv__layer--outer {
      border-color: rgba(255, 77, 0, 0.32);
      background: color-mix(in srgb, $ember-core 4%, transparent);
    }

    .wv__layer--inner {
      border-color: rgba(255, 107, 43, 0.4);
      background: color-mix(in srgb, $ember-hot 6%, transparent);
    }

    .wv__layer--field {
      border-color: rgba(255, 77, 0, 0.55);
      background: linear-gradient(180deg, rgba(255, 77, 0, 0.14), rgba(255, 107, 43, 0.06));
      box-shadow: 0 6px 18px -10px rgba(255, 77, 0, 0.45);
    }

    // Header strip — pill label + config code, with a subtle divider line
    // below it. This is the identifying "chrome" of each wrapper.
    .wv__head {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      padding: 0.9rem 1.25rem;
      background: color-mix(in srgb, currentColor 5%, transparent);
      border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
    }

    .wv__head--field {
      background: linear-gradient(90deg, rgba(255, 77, 0, 0.18), rgba(255, 107, 43, 0.08));
      border-bottom-color: rgba(255, 77, 0, 0.25);
    }

    // Body hosts the next nested layer (or the field preview). Generous
    // padding so the nested layer does not butt up against the card edges
    // and the slot label has breathing room above the next layer.
    .wv__body {
      position: relative;
      padding: 1.5rem 1.5rem 1.5rem;
    }

    // Inline "slot" label shown above each nested layer — readers see where
    // each wrapper plugs the next one in via its fieldComponent slot.
    .wv__slot {
      display: inline-block;
      margin-bottom: 1rem;
      padding: 3px 10px;
      border-radius: 4px;
      font-family: $font-mono;
      font-size: 0.7rem;
      color: var(--forge-text-muted, #{$steel-mid});
      opacity: 0.85;
      background: color-mix(in srgb, currentColor 6%, transparent);
      border: 1px dashed color-mix(in srgb, currentColor 18%, transparent);
    }

    .wv__pill {
      display: inline-flex;
      align-items: center;
      padding: 0.3rem 0.85rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.78rem;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .wv__pill--outer {
      background: rgba(255, 77, 0, 0.1);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.35);
    }

    .wv__pill--inner {
      background: rgba(255, 107, 43, 0.12);
      color: $ember-hot;
      border: 1.5px solid rgba(255, 107, 43, 0.4);
    }

    .wv__pill--field {
      background: linear-gradient(135deg, $ember-core, $ember-hot);
      color: #fff;
      border: 1.5px solid transparent;
      box-shadow: 0 4px 10px -4px rgba(255, 77, 0, 0.55);
    }

    .wv__code {
      font-family: $font-mono;
      font-size: 0.75rem;
      color: var(--forge-text-muted, #{$steel-mid});
    }

    // Field preview — a mocked form field inside the innermost layer so
    // readers understand the field component is the actual UI, not another
    // abstraction.
    .wv__preview {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding: 0.5rem 0;
    }

    .wv__preview-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--forge-text, #{$steel});
    }

    .wv__preview-input {
      display: flex;
      align-items: center;
      padding: 0.6rem 0.85rem;
      border-radius: 6px;
      background: color-mix(in srgb, currentColor 6%, transparent);
      border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    }

    .wv__preview-placeholder {
      font-size: 0.85rem;
      color: var(--forge-text-muted, #{$steel-mid});
      opacity: 0.7;
    }

    .wv__caption {
      margin: 1.25rem 0 0;
      color: var(--forge-text-muted, #{$steel-mid});
      font-size: 0.75rem;
      text-align: center;
      letter-spacing: 0.02em;
    }

    @media (max-width: 480px) {
      .wv {
        padding: 16px 14px 14px;
      }

      .wv__body {
        padding: 0.75rem 0.75rem 0.75rem;
      }

      .wv__body::before {
        position: static;
        display: inline-block;
        margin-bottom: 0.5rem;
      }

      .wv__code {
        font-size: 0.7rem;
      }

      .wv__pill {
        font-size: 0.72rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WrapperChainVisualComponent {}

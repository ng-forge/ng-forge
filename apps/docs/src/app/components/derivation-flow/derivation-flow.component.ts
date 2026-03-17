import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'docs-derivation-flow',
  template: `
    <div class="graph">
      <h4 class="graph__title">Derivation Dependency Graph</h4>
      <p class="graph__subtitle">Fields are topologically sorted so dependencies resolve first</p>

      <div class="graph__track">
        <!-- Step 1 -->
        <div class="graph__step">
          <span class="graph__step-num">1</span>
          <div class="graph__card">
            <div class="graph__card-row">
              <code class="graph__field graph__field--input">quantity</code>
              <span class="graph__op">&times;</span>
              <code class="graph__field graph__field--input">unitPrice</code>
            </div>
            <svg class="graph__step-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="0" x2="8" y2="11" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M3.5 8L8 14 12.5 8"
                stroke="currentColor"
                stroke-width="1.5"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <code class="graph__field graph__field--derived">subtotal</code>
          </div>
        </div>

        <!-- Connector -->
        <div class="graph__connector">
          <svg width="40" height="2" viewBox="0 0 40 2">
            <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
          </svg>
        </div>

        <!-- Step 2 -->
        <div class="graph__step">
          <span class="graph__step-num">2</span>
          <div class="graph__card">
            <div class="graph__card-row">
              <code class="graph__field graph__field--derived">subtotal</code>
              <span class="graph__op">+</span>
              <code class="graph__field graph__field--input">tax</code>
            </div>
            <svg class="graph__step-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="0" x2="8" y2="11" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M3.5 8L8 14 12.5 8"
                stroke="currentColor"
                stroke-width="1.5"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <code class="graph__field graph__field--result">total</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
    }

    .graph {
      padding: $space-5 $space-6;
      border: 1px solid var(--forge-border-color);
      border-radius: $radius-lg;
      background: var(--forge-base-1);
    }

    .graph__title {
      margin: 0;
      text-align: center;
      font-size: $text-base;
      font-weight: 600;
      color: var(--forge-text);
    }

    .graph__subtitle {
      margin: $space-1 0 $space-5;
      text-align: center;
      font-size: $text-xs;
      color: var(--forge-text-muted);
    }

    .graph__track {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: $space-4;
    }

    .graph__step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $space-2;
    }

    .graph__step-num {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.65rem;
      font-weight: 700;
      font-family: $font-mono;
      background: rgba($ember-glow, 0.1);
      color: $ember-glow;
      border: 1.5px solid rgba($ember-glow, 0.3);
    }

    .graph__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $space-2;
      padding: $space-4;
      border: 1px solid var(--forge-border-color);
      border-radius: $radius-md;
    }

    .graph__card-row {
      display: flex;
      align-items: center;
      gap: $space-2;
    }

    .graph__op {
      font-size: $text-sm;
      font-weight: 500;
      color: var(--forge-text-muted);
    }

    .graph__step-arrow {
      color: var(--forge-text-muted);
    }

    .graph__field {
      padding: $space-1 $space-3;
      border-radius: $radius-pill;
      font-family: $font-mono;
      font-size: $text-xs;
      font-weight: 600;
      background: none;

      &--input {
        color: $ember-core;
        border: 1.5px solid rgba($ember-core, 0.25);
      }

      &--derived {
        color: $ember-hot;
        border: 1.5px solid rgba($ember-hot, 0.3);
      }

      &--result {
        color: $molten;
        border: 1.5px solid rgba($molten, 0.3);
      }
    }

    .graph__connector {
      color: var(--forge-text-muted);
      opacity: 0.4;
      display: flex;
      align-items: center;
      margin-top: 72px;
    }

    @media (max-width: $breakpoint-sm) {
      .graph {
        padding: $space-4;
      }

      .graph__track {
        flex-direction: column;
        align-items: center;
        gap: $space-3;
      }

      .graph__connector {
        margin-top: 0;
        transform: rotate(90deg);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DerivationFlowComponent {}

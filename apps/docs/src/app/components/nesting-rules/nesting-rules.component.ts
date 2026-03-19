import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'docs-nesting-rules',
  template: `
    <div class="nesting">
      <h4 class="nesting__title">Container Nesting Rules</h4>
      <p class="nesting__subtitle">TypeScript enforces valid nesting at compile-time</p>

      <div class="nesting__grid">
        <!-- PAGE -->
        <div class="nesting__card">
          <div class="nesting__card-header nesting__card-header--page">
            <span class="nesting__type-badge nesting__type-badge--page">PAGE</span>
            <span class="nesting__desc">Multi-step wizards</span>
          </div>
          <div class="nesting__card-body">
            <span class="nesting__section-label">Can contain</span>
            <div class="nesting__items">
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                ROW
              </span>
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                GROUP
              </span>
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                LEAF
              </span>
            </div>
            <span class="nesting__section-label nesting__section-label--blocked">Cannot contain</span>
            <div class="nesting__items">
              <span class="nesting__item nesting__item--no">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                PAGE
              </span>
            </div>
          </div>
        </div>

        <!-- ROW -->
        <div class="nesting__card">
          <div class="nesting__card-header nesting__card-header--row">
            <span class="nesting__type-badge nesting__type-badge--row">ROW</span>
            <span class="nesting__desc">Horizontal layouts</span>
          </div>
          <div class="nesting__card-body">
            <span class="nesting__section-label">Can contain</span>
            <div class="nesting__items">
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                GROUP
              </span>
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                LEAF
              </span>
            </div>
            <span class="nesting__section-label nesting__section-label--blocked">Cannot contain</span>
            <div class="nesting__items">
              <span class="nesting__item nesting__item--no">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                ROW
              </span>
              <span class="nesting__item nesting__item--no">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                PAGE
              </span>
            </div>
          </div>
        </div>

        <!-- GROUP -->
        <div class="nesting__card">
          <div class="nesting__card-header nesting__card-header--group">
            <span class="nesting__type-badge nesting__type-badge--group">GROUP</span>
            <span class="nesting__desc">Nested form sections</span>
          </div>
          <div class="nesting__card-body">
            <span class="nesting__section-label">Can contain</span>
            <div class="nesting__items">
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                ROW
              </span>
              <span class="nesting__item nesting__item--ok">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                LEAF
              </span>
            </div>
            <span class="nesting__section-label nesting__section-label--blocked">Cannot contain</span>
            <div class="nesting__items">
              <span class="nesting__item nesting__item--no">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                GROUP
              </span>
              <span class="nesting__item nesting__item--no">
                <svg class="nesting__icon" viewBox="0 0 24 24" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                PAGE
              </span>
            </div>
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

    .nesting {
      padding: $space-6;
      border: 1px solid var(--forge-border-color);
      border-radius: $radius-lg;
      background: var(--forge-base-1);
    }

    .nesting__title {
      margin: 0;
      text-align: center;
      font-size: $text-base;
      font-weight: 600;
      color: var(--forge-text);
    }

    .nesting__subtitle {
      margin: $space-1 0 $space-6;
      text-align: center;
      font-size: $text-xs;
      color: var(--forge-text-muted);
    }

    .nesting__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: $space-4;
    }

    .nesting__card {
      border-radius: $radius-md;
      overflow: hidden;
      border: 1px solid var(--forge-border-color);
      transition: border-color $transition-fast;
    }

    .nesting__card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $space-1;
      padding: $space-3 $space-3 $space-2;
    }

    .nesting__card-header--page {
      background: rgba($ember-core, 0.06);
      border-bottom: 1px solid rgba($ember-core, 0.15);
    }

    .nesting__card-header--row {
      background: rgba($ember-hot, 0.06);
      border-bottom: 1px solid rgba($ember-hot, 0.15);
    }

    .nesting__card-header--group {
      background: rgba($ember-glow, 0.06);
      border-bottom: 1px solid rgba($ember-glow, 0.15);
    }

    .nesting__type-badge {
      padding: $space-1 $space-3;
      border-radius: $radius-pill;
      font-weight: 700;
      font-size: $text-xs;
      font-family: $font-mono;
      letter-spacing: 0.06em;
    }

    .nesting__type-badge--page {
      background: rgba($ember-core, 0.12);
      color: $ember-core;
      border: 1.5px solid rgba($ember-core, 0.3);
    }

    .nesting__type-badge--row {
      background: rgba($ember-hot, 0.12);
      color: $ember-hot;
      border: 1.5px solid rgba($ember-hot, 0.3);
    }

    .nesting__type-badge--group {
      background: rgba($ember-glow, 0.12);
      color: $ember-glow;
      border: 1.5px solid rgba($ember-glow, 0.3);
    }

    .nesting__desc {
      font-size: 0.65rem;
      color: var(--forge-text-muted);
      font-style: italic;
    }

    .nesting__card-body {
      padding: $space-3;
      display: flex;
      flex-direction: column;
      gap: $space-2;
    }

    .nesting__section-label {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #28ca42;

      &--blocked {
        color: #ff5f57;
        margin-top: $space-1;
      }
    }

    .nesting__items {
      display: flex;
      flex-wrap: wrap;
      gap: $space-1;
    }

    .nesting__item {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px $space-2;
      border-radius: $radius-pill;
      font-family: $font-mono;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    .nesting__item--ok {
      background: rgba(#28ca42, 0.08);
      color: #28ca42;
      border: 1px solid rgba(#28ca42, 0.2);
    }

    .nesting__item--no {
      background: rgba(#ff5f57, 0.06);
      color: #ff5f57;
      border: 1px solid rgba(#ff5f57, 0.15);
    }

    .nesting__icon {
      fill: none;
      stroke: currentColor;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .nesting {
        padding: $space-4;
      }

      .nesting__grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NestingRulesComponent {}

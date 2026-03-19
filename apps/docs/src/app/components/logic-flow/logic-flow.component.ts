import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'docs-logic-flow',
  template: `
    <div class="flow">
      <h4 class="flow__title">Conditional Logic Evaluation</h4>

      <!-- Step 1: Form Value Changes -->
      <div class="flow__node flow__node--trigger">
        <span class="flow__label">Form Value Changes</span>
      </div>

      <svg class="flow__arrow flow__arrow--down" width="24" height="28" viewBox="0 0 24 28" fill="none">
        <line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" />
        <path d="M6 18l6 8 6-8" fill="currentColor" />
      </svg>

      <!-- Step 2: Signal Updates -->
      <div class="flow__node flow__node--signal">
        <span class="flow__label">Signal Updates</span>
        <span class="flow__hint">Angular's reactive system</span>
      </div>

      <svg class="flow__arrow flow__arrow--down" width="24" height="28" viewBox="0 0 24 28" fill="none">
        <line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" />
        <path d="M6 18l6 8 6-8" fill="currentColor" />
      </svg>

      <!-- Step 3: Evaluate -->
      <div class="flow__node flow__node--evaluate">
        <span class="flow__label">Evaluate Logic Conditions</span>
      </div>

      <!-- Fork arrow -->
      <svg class="flow__fork" width="200" height="40" viewBox="0 0 200 40" fill="none">
        <line x1="100" y1="0" x2="100" y2="12" stroke="currentColor" stroke-width="1.5" />
        <line x1="50" y1="12" x2="150" y2="12" stroke="currentColor" stroke-width="1.5" />
        <line x1="50" y1="12" x2="50" y2="32" stroke="currentColor" stroke-width="1.5" />
        <line x1="150" y1="12" x2="150" y2="32" stroke="currentColor" stroke-width="1.5" />
        <path d="M44 28l6 8 6-8" fill="currentColor" />
        <path d="M144 28l6 8 6-8" fill="currentColor" />
      </svg>

      <!-- Branches -->
      <div class="flow__branches">
        <!-- True branch -->
        <div class="flow__branch flow__branch--true">
          <div class="flow__node flow__node--true">
            <span class="flow__label">true</span>
          </div>

          <svg class="flow__arrow flow__arrow--down flow__arrow--true" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="0" x2="12" y2="18" stroke="currentColor" stroke-width="1.5" />
            <path d="M6 14l6 8 6-8" fill="currentColor" />
          </svg>

          <div class="flow__node flow__node--effect flow__node--effect-true">
            <span class="flow__label">Apply Effect</span>
          </div>

          <div class="flow__tags">
            <span class="flow__tag flow__tag--true">hide</span>
            <span class="flow__tag flow__tag--true">require</span>
            <span class="flow__tag flow__tag--true">readonly</span>
          </div>
        </div>

        <!-- False branch -->
        <div class="flow__branch flow__branch--false">
          <div class="flow__node flow__node--false">
            <span class="flow__label">false</span>
          </div>

          <svg class="flow__arrow flow__arrow--down flow__arrow--false" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="0" x2="12" y2="18" stroke="currentColor" stroke-width="1.5" />
            <path d="M6 14l6 8 6-8" fill="currentColor" />
          </svg>

          <div class="flow__node flow__node--effect flow__node--effect-false">
            <span class="flow__label">Remove Effect</span>
          </div>

          <div class="flow__tags">
            <span class="flow__tag flow__tag--false">show</span>
            <span class="flow__tag flow__tag--false">optional</span>
            <span class="flow__tag flow__tag--false">editable</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    $branch-true: $success;
    $branch-false: $ember-core;

    :host {
      display: block;
    }

    .flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: $space-6 $space-4;
      border: 1px solid var(--forge-border-color);
      border-radius: $radius-lg;
      background: var(--forge-base-1);
      gap: 0;
    }

    .flow__title {
      margin: 0 0 $space-5;
      text-align: center;
      font-size: $text-sm;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--forge-text-muted);
    }

    .flow__node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $space-1;
      padding: $space-2 $space-5;
      border-radius: $radius-pill;
      font-weight: 600;
      font-size: $text-sm;
      white-space: nowrap;
      transition: transform $transition-fast;
    }

    .flow__node--trigger {
      background: rgba($ember-core, 0.08);
      color: $ember-core;
      border: 1.5px solid rgba($ember-core, 0.3);
    }

    .flow__node--signal {
      background: rgba($ember-hot, 0.08);
      color: $ember-hot;
      border: 1.5px solid rgba($ember-hot, 0.3);
    }

    .flow__node--evaluate {
      background: rgba($ember-glow, 0.1);
      color: $ember-glow;
      border: 1.5px solid rgba($ember-glow, 0.35);
    }

    .flow__node--true {
      background: rgba($branch-true, 0.1);
      color: $branch-true;
      border: 1.5px solid rgba($branch-true, 0.35);
      padding: $space-1 $space-4;
      font-family: $font-mono;
      font-size: $text-xs;
    }

    .flow__node--false {
      background: rgba($branch-false, 0.1);
      color: $branch-false;
      border: 1.5px solid rgba($branch-false, 0.35);
      padding: $space-1 $space-4;
      font-family: $font-mono;
      font-size: $text-xs;
    }

    .flow__node--effect {
      padding: $space-2 $space-4;
      font-size: $text-xs;
    }

    .flow__node--effect-true {
      background: rgba($branch-true, 0.06);
      color: $branch-true;
      border: 1.5px solid rgba($branch-true, 0.2);
    }

    .flow__node--effect-false {
      background: rgba($branch-false, 0.06);
      color: $branch-false;
      border: 1.5px solid rgba($branch-false, 0.2);
    }

    .flow__hint {
      font-size: $text-xs;
      font-weight: 400;
      color: var(--forge-text-muted);
      font-style: italic;
    }

    .flow__label {
      letter-spacing: -0.01em;
    }

    .flow__arrow {
      color: var(--forge-text-muted);
      flex-shrink: 0;
    }

    .flow__arrow--true {
      color: rgba($branch-true, 0.5);
    }

    .flow__arrow--false {
      color: rgba($branch-false, 0.5);
    }

    .flow__fork {
      color: var(--forge-text-muted);
      flex-shrink: 0;
    }

    .flow__branches {
      display: flex;
      gap: $space-8;
      width: 200px;
      justify-content: space-between;
    }

    .flow__branch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .flow__tags {
      display: flex;
      flex-wrap: wrap;
      gap: $space-1;
      justify-content: center;
      margin-top: $space-2;
    }

    .flow__tag {
      padding: 2px $space-2;
      border-radius: $radius-pill;
      font-family: $font-mono;
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .flow__tag--true {
      background: rgba($branch-true, 0.08);
      color: $branch-true;
      border: 1px solid rgba($branch-true, 0.2);
    }

    .flow__tag--false {
      background: rgba($branch-false, 0.08);
      color: $branch-false;
      border: 1px solid rgba($branch-false, 0.2);
    }

    @media (max-width: $breakpoint-sm) {
      .flow__branches {
        gap: $space-4;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LogicFlowComponent {}

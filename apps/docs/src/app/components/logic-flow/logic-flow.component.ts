import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Conditional logic evaluation flow diagram.
 *
 * Linear stages (value change → signal update → evaluate) followed by a
 * symmetrical true/false fork. Connectors are drawn with CSS pseudo-elements
 * anchored to a 2-column grid so the arrows always line up with the pill
 * centres, regardless of pill content width.
 */
@Component({
  selector: 'docs-logic-flow',
  template: `
    <div class="flow">
      <h4 class="flow__title">Conditional Logic Evaluation</h4>

      <div class="flow__stage">
        <div class="flow__pill flow__pill--trigger">Form value changes</div>
      </div>
      <span class="flow__line" aria-hidden="true"></span>

      <div class="flow__stage">
        <div class="flow__pill flow__pill--signal">
          Signal updates
          <span class="flow__pill-hint">Angular's reactive system</span>
        </div>
      </div>
      <span class="flow__line" aria-hidden="true"></span>

      <div class="flow__stage">
        <div class="flow__pill flow__pill--evaluate">Evaluate logic conditions</div>
      </div>

      <div class="flow__fork" aria-hidden="true">
        <span class="flow__fork-stem"></span>
        <span class="flow__fork-cross"></span>
        <span class="flow__fork-leg flow__fork-leg--true"></span>
        <span class="flow__fork-leg flow__fork-leg--false"></span>
      </div>

      <div class="flow__branches">
        <div class="flow__branch flow__branch--true">
          <div class="flow__pill flow__pill--true">true</div>
          <span class="flow__line flow__line--true" aria-hidden="true"></span>
          <div class="flow__pill flow__pill--effect flow__pill--effect-true">Apply effect</div>
          <div class="flow__tags">
            <span class="flow__tag flow__tag--true">hide</span>
            <span class="flow__tag flow__tag--true">require</span>
            <span class="flow__tag flow__tag--true">readonly</span>
          </div>
        </div>

        <div class="flow__branch flow__branch--false">
          <div class="flow__pill flow__pill--false">false</div>
          <span class="flow__line flow__line--false" aria-hidden="true"></span>
          <div class="flow__pill flow__pill--effect flow__pill--effect-false">Remove effect</div>
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

    .flow__stage {
      display: flex;
      justify-content: center;
    }

    // Vertical connector lines with arrowhead at the bottom.
    .flow__line {
      display: block;
      width: 2px;
      height: 28px;
      background: var(--forge-base-4);
      position: relative;
      margin: 4px 0;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: -1px;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--forge-base-4);
        border-bottom: 2px solid var(--forge-base-4);
        transform-origin: 50% 50%;
        transform: translateX(-50%) rotate(45deg);
      }
    }

    .flow__pill {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: $space-2 $space-5;
      border-radius: $radius-pill;
      font-weight: 600;
      font-size: $text-sm;
      letter-spacing: -0.01em;
      text-align: center;
      white-space: nowrap;
    }

    .flow__pill-hint {
      font-size: $text-xs;
      font-weight: 400;
      color: var(--forge-text-muted);
      font-style: italic;
      letter-spacing: 0;
    }

    .flow__pill--trigger {
      background: rgba($ember-core, 0.08);
      color: $ember-core;
      border: 1.5px solid rgba($ember-core, 0.3);
    }

    .flow__pill--signal {
      background: rgba($ember-hot, 0.08);
      color: $ember-hot;
      border: 1.5px solid rgba($ember-hot, 0.3);
    }

    .flow__pill--evaluate {
      background: rgba($ember-glow, 0.1);
      color: $ember-glow;
      border: 1.5px solid rgba($ember-glow, 0.35);
    }

    // Fork connecting the evaluate pill to the two branches. Uses a 2-column
    // grid so stem + legs snap to the same centres as the branches grid
    // underneath, regardless of branch pill width.
    .flow__fork {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: 360px;
      height: 36px;
      margin: 4px 0 0;
    }

    .flow__fork-stem {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: 2px;
      height: 14px;
      background: var(--forge-base-4);
    }

    .flow__fork-cross {
      position: absolute;
      left: 25%;
      right: 25%;
      top: 14px;
      height: 2px;
      background: var(--forge-base-4);
    }

    .flow__fork-leg {
      position: absolute;
      top: 14px;
      width: 2px;
      height: 22px;
      background: var(--forge-base-4);

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: -1px;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--forge-base-4);
        border-bottom: 2px solid var(--forge-base-4);
        transform: translateX(-50%) rotate(45deg);
      }
    }

    .flow__fork-leg--true {
      left: 25%;
      transform: translateX(-1px);
    }

    .flow__fork-leg--false {
      left: 75%;
      transform: translateX(-1px);
    }

    // Two-column branch area. Pill centres land at 25% / 75% of its width,
    // matching the fork leg positions above.
    .flow__branches {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: 360px;
      gap: $space-4;
    }

    .flow__branch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .flow__pill--true {
      background: rgba($branch-true, 0.1);
      color: $branch-true;
      border: 1.5px solid rgba($branch-true, 0.35);
      padding: $space-1 $space-4;
      font-family: $font-mono;
      font-size: $text-xs;
      display: inline-block;
    }

    .flow__pill--false {
      background: rgba($branch-false, 0.1);
      color: $branch-false;
      border: 1.5px solid rgba($branch-false, 0.35);
      padding: $space-1 $space-4;
      font-family: $font-mono;
      font-size: $text-xs;
      display: inline-block;
    }

    .flow__pill--effect {
      padding: $space-2 $space-4;
      font-size: $text-xs;
      display: inline-block;
    }

    .flow__pill--effect-true {
      background: rgba($branch-true, 0.06);
      color: $branch-true;
      border: 1.5px solid rgba($branch-true, 0.2);
    }

    .flow__pill--effect-false {
      background: rgba($branch-false, 0.06);
      color: $branch-false;
      border: 1.5px solid rgba($branch-false, 0.2);
    }

    .flow__line--true {
      background: rgba($branch-true, 0.4);

      &::after {
        border-color: transparent rgba($branch-true, 0.4) rgba($branch-true, 0.4) transparent;
      }
    }

    .flow__line--false {
      background: rgba($branch-false, 0.4);

      &::after {
        border-color: transparent rgba($branch-false, 0.4) rgba($branch-false, 0.4) transparent;
      }
    }

    .flow__tags {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $space-1;
      margin-top: $space-3;
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

    // On narrow viewports, shrink the fork span so legs don't stretch too far
    // apart for small pills.
    @media (max-width: $breakpoint-sm) {
      .flow__fork,
      .flow__branches {
        max-width: 280px;
      }

      .flow__pill--evaluate,
      .flow__pill--signal,
      .flow__pill--trigger {
        white-space: normal;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LogicFlowComponent {}

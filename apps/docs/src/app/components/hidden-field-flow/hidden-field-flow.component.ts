import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Two-row pipeline contrasting formly's `resetOnHide` (mutates state) with
 * ng-forge's render-filter + submit-time exclusion model. Surfaces the
 * subtle migration footgun in the Hidden Field Values section.
 */
@Component({
  selector: 'docs-hidden-field-flow',
  template: `
    <div class="hff">
      <div class="hff__row">
        <div class="hff__lib hff__lib--formly">ngx-formly</div>
        <div class="hff__pipeline">
          <div class="hff__step hff__step--neutral">
            <code>hidden = true</code>
          </div>
          <span class="hff__arrow" aria-hidden="true">
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
          </span>
          <div class="hff__step hff__step--mutate">
            <code>model.field = undefined</code>
            <span class="hff__note">value gone from state</span>
          </div>
        </div>
      </div>
      <div class="hff__row">
        <div class="hff__lib hff__lib--ngforge">ng-forge</div>
        <div class="hff__pipeline">
          <div class="hff__step hff__step--neutral">
            <code>hidden = true</code>
          </div>
          <span class="hff__arrow" aria-hidden="true">
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
          </span>
          <div class="hff__step hff__step--keep">
            <code>field stays in formValue</code>
            <span class="hff__note">render filtered</span>
          </div>
          <span class="hff__arrow" aria-hidden="true">
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
          </span>
          <div class="hff__step hff__step--filter">
            <code>excludeValueIfHidden</code>
            <span class="hff__note">filter at submit only</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
      margin: $space-6 0;
    }

    .hff {
      display: flex;
      flex-direction: column;
      gap: $space-3;
      padding: $space-5 $space-4;
      border: 1px solid var(--forge-border-color, #2a2824);
      border-radius: $radius-md;
      background: var(--forge-base-1, #131210);
    }

    .hff__row {
      display: flex;
      align-items: center;
      gap: $space-4;
    }

    .hff__lib {
      flex-shrink: 0;
      width: 96px;
      padding: $space-1 $space-3;
      border-radius: 999px;
      font-weight: 600;
      font-size: $text-xs;
      text-align: center;
      white-space: nowrap;
    }

    .hff__lib--formly {
      background: rgba(255, 140, 66, 0.08);
      color: $ember-glow;
      border: 1.5px solid rgba(255, 140, 66, 0.3);
    }

    .hff__lib--ngforge {
      background: rgba(255, 77, 0, 0.1);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.4);
    }

    .hff__pipeline {
      flex: 1;
      display: flex;
      align-items: center;
      gap: $space-2;
      flex-wrap: wrap;
    }

    .hff__step {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding: $space-2 $space-3;
      border-radius: $radius-sm;
      border: 1px solid;
      background: var(--forge-base-0, #0a0908);
    }

    .hff__step code {
      font-family: $font-mono;
      font-size: $text-sm;
      color: var(--forge-text, #e8e4de);
      background: transparent;
      padding: 0;
      white-space: nowrap;
    }

    .hff__step--neutral {
      border-color: var(--forge-border-color, #2a2824);
    }

    .hff__step--mutate {
      border-color: rgba(255, 140, 66, 0.3);
    }

    .hff__step--keep {
      border-color: rgba(255, 107, 43, 0.35);
    }

    .hff__step--filter {
      border-color: rgba(255, 77, 0, 0.4);
    }

    .hff__note {
      font-size: 11px;
      font-style: italic;
      color: var(--forge-text-muted, #9a958c);
      white-space: nowrap;
    }

    .hff__arrow {
      display: flex;
      align-items: center;
      color: var(--forge-base-4, #5c5850);
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .hff__row {
        flex-direction: column;
        align-items: stretch;
        gap: $space-3;
      }

      .hff__lib {
        width: auto;
        align-self: flex-start;
      }

      .hff__pipeline {
        flex-direction: column;
        align-items: flex-start;
      }

      .hff__step code {
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .hff__arrow {
        transform: rotate(90deg);
        align-self: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HiddenFieldFlowComponent {}

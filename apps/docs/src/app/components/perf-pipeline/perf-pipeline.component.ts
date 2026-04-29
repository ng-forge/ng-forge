import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Two-row pipeline comparing what runs on a single value change in
 * ngx-formly (zone-driven CD + full expression sweep) versus ng-forge
 * (signal-graph dependents only). Used in the migration-reasons section
 * to back up the performance claim with a concrete picture.
 */
@Component({
  selector: 'docs-perf-pipeline',
  template: `
    <div class="pp">
      <div class="pp__row">
        <div class="pp__lib pp__lib--formly">ngx-formly</div>
        <div class="pp__pipeline">
          <div class="pp__step pp__step--neutral">
            <code>value change</code>
          </div>
          <span class="pp__arrow" aria-hidden="true">
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
          <div class="pp__step pp__step--cost">
            <code>zone change-detection cycle</code>
          </div>
          <span class="pp__arrow" aria-hidden="true">
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
          <div class="pp__step pp__step--cost">
            <code>all expressions re-evaluate</code>
            <span class="pp__note">across the whole field tree</span>
          </div>
        </div>
      </div>
      <div class="pp__row">
        <div class="pp__lib pp__lib--ngforge">ng-forge</div>
        <div class="pp__pipeline">
          <div class="pp__step pp__step--neutral">
            <code>value change</code>
          </div>
          <span class="pp__arrow" aria-hidden="true">
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
          <div class="pp__step pp__step--signal">
            <code>signal write</code>
          </div>
          <span class="pp__arrow" aria-hidden="true">
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
          <div class="pp__step pp__step--scoped">
            <code>only dependents re-run</code>
            <span class="pp__note">scoped render via OnPush</span>
          </div>
        </div>
      </div>
      <p class="pp__footnote">
        Add stable <code>track</code> keys, <code>reconcileFields</code>, deferred non-adjacent pages, and append-only array updates on top.
      </p>
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
      margin: $space-6 0;
    }

    .pp {
      display: flex;
      flex-direction: column;
      gap: $space-3;
      padding: $space-5 $space-4;
      border: 1px solid var(--forge-border-color, #2a2824);
      border-radius: $radius-md;
      background: var(--forge-base-1, #131210);
    }

    .pp__row {
      display: flex;
      align-items: center;
      gap: $space-4;
    }

    .pp__lib {
      flex-shrink: 0;
      width: 96px;
      padding: $space-1 $space-3;
      border-radius: 999px;
      font-weight: 600;
      font-size: $text-xs;
      text-align: center;
      white-space: nowrap;
    }

    .pp__lib--formly {
      background: rgba(255, 140, 66, 0.08);
      color: $ember-glow;
      border: 1.5px solid rgba(255, 140, 66, 0.3);
    }

    .pp__lib--ngforge {
      background: rgba(255, 77, 0, 0.1);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.4);
    }

    .pp__pipeline {
      flex: 1;
      display: flex;
      align-items: center;
      gap: $space-2;
      flex-wrap: wrap;
    }

    .pp__step {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding: $space-2 $space-3;
      border-radius: $radius-sm;
      border: 1px solid;
      background: var(--forge-base-0, #0a0908);
    }

    .pp__step code {
      font-family: $font-mono;
      font-size: $text-sm;
      color: var(--forge-text, #e8e4de);
      background: transparent;
      padding: 0;
      white-space: nowrap;
    }

    .pp__step--neutral {
      border-color: var(--forge-border-color, #2a2824);
    }

    .pp__step--cost {
      border-color: rgba(255, 140, 66, 0.3);
      background: rgba(255, 140, 66, 0.04);
    }

    .pp__step--signal {
      border-color: rgba(255, 107, 43, 0.35);
    }

    .pp__step--scoped {
      border-color: rgba(255, 77, 0, 0.4);
      background: rgba(255, 77, 0, 0.04);
    }

    .pp__note {
      font-size: 11px;
      font-style: italic;
      color: var(--forge-text-muted, #9a958c);
      white-space: nowrap;
    }

    .pp__arrow {
      display: flex;
      align-items: center;
      color: var(--forge-base-4, #5c5850);
      flex-shrink: 0;
    }

    .pp__footnote {
      margin: $space-2 0 0;
      padding: 0 $space-2;
      font-size: $text-xs;
      font-style: italic;
      color: var(--forge-text-muted, #9a958c);
      line-height: 1.5;
    }

    .pp__footnote code {
      font-family: $font-mono;
      font-style: normal;
      font-size: 0.9em;
      padding: 0 2px;
      color: var(--forge-text, #e8e4de);
    }

    @media (max-width: 768px) {
      .pp__row {
        flex-direction: column;
        align-items: stretch;
        gap: $space-3;
      }

      .pp__lib {
        width: auto;
        align-self: flex-start;
      }

      .pp__pipeline {
        flex-direction: column;
        align-items: flex-start;
      }

      .pp__step code {
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .pp__arrow {
        transform: rotate(90deg);
        align-self: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PerfPipelineComponent {}

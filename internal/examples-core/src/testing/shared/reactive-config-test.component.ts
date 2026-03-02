import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Configuration variants for reactive config testing.
 */
export interface ConfigVariants {
  [key: string]: FormConfig;
}

/**
 * Component for testing reactive config changes.
 * Allows switching between different form configurations at runtime.
 */
@Component({
  selector: 'example-reactive-config-test',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>{{ title() }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId()">
        <h2>{{ title() }}</h2>
        @if (description()) {
          <p class="scenario-description">{{ description() }}</p>
        }

        <div class="config-controls" data-testid="config-controls">
          @for (configKey of configKeys(); track configKey) {
            <button
              type="button"
              [attr.data-testid]="'switch-to-' + configKey"
              [class.active]="activeConfigKey() === configKey"
              (click)="switchConfig(configKey)"
            >
              {{ configKey }}
            </button>
          }
        </div>

        <form [dynamic-form]="activeConfig()" [(value)]="formValue" (submitted)="onSubmitted($event)"></form>

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId()">{{ formValue() | json }}</pre>
          <div data-testid="active-config-key">Active config: {{ activeConfigKey() }}</div>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
  styles: [
    `
      .config-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .config-controls button {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        background: #f5f5f5;
        cursor: pointer;
        border-radius: 4px;
      }
      .config-controls button.active {
        background: #1976d2;
        color: white;
        border-color: #1976d2;
      }
      .config-controls button:hover:not(.active) {
        background: #e0e0e0;
      }
    `,
  ],
})
export class ReactiveConfigTestComponent {
  readonly testId = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly configVariants = input.required<ConfigVariants>();
  readonly initialConfigKey = input<string>('initial');

  /** Computed list of config keys from variants */
  readonly configKeys = computed(() => Object.keys(this.configVariants()));

  /** Currently active config key */
  readonly activeConfigKey = linkedSignal(() => this.initialConfigKey());

  /** Currently active config, derived from activeConfigKey */
  readonly activeConfig = computed(() => {
    const variants = this.configVariants();
    const key = this.activeConfigKey();
    return variants[key] ?? { fields: [] };
  });

  readonly formValue = signal<Record<string, unknown>>({});

  switchConfig(configKey: string): void {
    this.activeConfigKey.set(configKey);
  }

  onSubmitted(value: Record<string, unknown>): void {
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: {
          timestamp: new Date().toISOString(),
          data: value,
          testId: this.testId(),
        },
      }),
    );
  }
}

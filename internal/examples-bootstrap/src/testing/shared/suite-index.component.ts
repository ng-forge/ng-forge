import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario, TestSuite } from './types';

/**
 * Generic component for rendering a suite index page.
 * Shows all scenarios in the suite with navigation links.
 */
@Component({
  selector: 'bs-example-suite-index',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page-container">
      <h1 class="page-title">{{ suite().title }}</h1>
      <p class="page-subtitle">{{ suite().description }}</p>

      <div class="test-scenarios">
        @for (scenario of suite().scenarios; track scenario.testId) {
          <section class="test-scenario" [attr.data-testid]="scenario.testId">
            <h2>{{ scenario.title }}</h2>
            @if (scenario.description) {
              <p class="scenario-description">{{ scenario.description }}</p>
            }
            <form
              [dynamic-form]="getEffectiveConfig(scenario)"
              [value]="getFormValue(scenario.testId)"
              (valueChange)="updateFormValue(scenario.testId, $event)"
              (submitted)="onSubmitted($event, scenario.testId)"
            ></form>

            <details class="debug-output">
              <summary>Debug Output</summary>
              <pre [attr.data-testid]="'form-value-' + scenario.testId">{{ getFormValue(scenario.testId) | json }}</pre>
            </details>
          </section>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .test-page-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-title {
        color: #0d6efd;
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .page-subtitle {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .test-scenarios {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .test-scenario {
        padding: 2rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fafafa;
      }

      .test-scenario h2 {
        margin-top: 0;
        color: #0d6efd;
      }

      .scenario-description {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
      }

      .debug-output {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
      }

      pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    `,
  ],
})
export class SuiteIndexComponent {
  private readonly route = inject(ActivatedRoute);

  /** Suite passed directly as input */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  suiteInput = input<TestSuite | undefined>(undefined, { alias: 'suite' });

  /** Suite loaded from route data */
  private readonly routeSuite = toSignal(this.route.data.pipe(map((data) => data['suite'] as TestSuite | undefined)));

  /** Resolved suite - prefers input over route data */
  suite = computed(() => {
    const fromInput = this.suiteInput();
    const fromRoute = this.routeSuite();
    const resolved = fromInput ?? fromRoute;

    if (!resolved) {
      throw new Error('SuiteIndexComponent requires a suite via input or route data');
    }

    return resolved;
  });

  /** Form values for each scenario, keyed by testId */
  private readonly formValues = signal<Record<string, Record<string, unknown>>>({});

  /** Cache for effective configs to avoid recalculating on every render */
  private readonly effectiveConfigs = new Map<string, FormConfig>();

  /**
   * Returns the effective config for a scenario, merging customFnConfig if present.
   */
  getEffectiveConfig(scenario: TestScenario): FormConfig {
    const cached = this.effectiveConfigs.get(scenario.testId);
    if (cached) return cached;

    let effectiveConfig: FormConfig = scenario.config;

    if (scenario.customFnConfig) {
      effectiveConfig = {
        ...scenario.config,
        customFnConfig: {
          ...scenario.config.customFnConfig,
          ...scenario.customFnConfig,
        },
      };
    }

    this.effectiveConfigs.set(scenario.testId, effectiveConfig);
    return effectiveConfig;
  }

  getFormValue(testId: string): Record<string, unknown> {
    return this.formValues()[testId] ?? {};
  }

  updateFormValue(testId: string, value: Partial<Record<string, unknown>> | undefined): void {
    if (!value) return;
    this.formValues.update((values) => ({
      ...values,
      [testId]: value as Record<string, unknown>,
    }));
  }

  onSubmitted(value: Record<string, unknown> | undefined, testId: string): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    // Dispatch custom event for E2E test interception
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { ...submission, testId },
      }),
    );
  }
}

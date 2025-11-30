import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { TestScenario } from './types';

/**
 * Generic component for rendering a single test scenario.
 * Reads scenario data from route data or accepts it as an input.
 */
@Component({
  selector: 'example-test-scenario',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>{{ scenario().title }}</h1>

      <section class="test-scenario" [attr.data-testid]="scenario().testId">
        <h2>{{ scenario().title }}</h2>
        @if (scenario().description) {
          <p class="scenario-description">{{ scenario().description }}</p>
        }
        <dynamic-form [config]="scenario().config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + scenario().testId">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class TestScenarioComponent {
  private readonly route = inject(ActivatedRoute);

  /** Scenario passed directly as input (for embedding in other components) */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  scenarioInput = input<TestScenario | undefined>(undefined, { alias: 'scenario' });

  /** Scenario loaded from route data */
  private readonly routeScenario = toSignal(this.route.data.pipe(map((data) => data['scenario'] as TestScenario | undefined)));

  /** Resolved scenario - prefers input over route data */
  scenario = computed(() => {
    const fromInput = this.scenarioInput();
    const fromRoute = this.routeScenario();
    const resolved = fromInput ?? fromRoute;

    if (!resolved) {
      throw new Error('TestScenarioComponent requires a scenario via input or route data');
    }

    return resolved;
  });

  /** Form value - initialized from scenario's initialValue if provided, resets when scenario changes */
  formValue = linkedSignal<Record<string, unknown>>(() => this.scenario().initialValue ?? {});

  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    // Dispatch custom event for E2E test interception
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { ...submission, testId: this.scenario().testId },
      }),
    );
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, isObservable, map, Observable, of, tap, timer } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { TestScenario } from './types';

/**
 * Generic component for rendering a single test scenario.
 * Reads scenario data from route data or accepts it as an input.
 *
 * Supports submission state tracking when scenario includes:
 * - `simulateSubmission`: Auto-injects a simulated async submission action
 * - `submissionAction`: Uses a custom submission action
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
        @if (hasSubmissionTracking()) {
          <form [dynamic-form]="effectiveConfig()" [(value)]="formValue"></form>
        } @else {
          <form [dynamic-form]="effectiveConfig()" [(value)]="formValue" (submitted)="onSubmitted($event)"></form>
        }

        @if (hasSubmissionTracking()) {
          @if (isSubmitting()) {
            <div class="submission-status submitting" data-testid="submitting-indicator">Submitting...</div>
          }

          @if (submissionResult()) {
            <div
              class="submission-status"
              [class.success]="!submissionResult()!.error"
              [class.error]="submissionResult()!.error"
              data-testid="submission-result"
            >
              {{ submissionResult()!.message }}
            </div>
          }
        }

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + scenario().testId">{{ formValue() | json }}</pre>
          @if (hasSubmissionTracking()) {
            <div data-testid="submission-count">Submission count: {{ submissionCount() }}</div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
  styles: [
    `
      .submission-status {
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
      }
      .submission-status.submitting {
        background: #fff3e0;
        border: 1px solid #ff9800;
      }
      .submission-status.success {
        background: #e8f5e9;
        border: 1px solid #4caf50;
      }
      .submission-status.error {
        background: #ffebee;
        border: 1px solid #f44336;
      }
    `,
  ],
})
export class TestScenarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

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

  /** Whether this scenario has submission tracking enabled */
  hasSubmissionTracking = computed(() => {
    const s = this.scenario();
    return !!(s.simulateSubmission || s.submissionAction || s.mockEndpoint);
  });

  /** Effective config with submission action and custom functions injected if needed */
  effectiveConfig = computed(() => {
    const s = this.scenario();
    let effectiveConfig = { ...s.config };

    // Merge customFnConfig if provided
    if (s.customFnConfig) {
      effectiveConfig = {
        ...effectiveConfig,
        customFnConfig: {
          ...effectiveConfig.customFnConfig,
          ...s.customFnConfig,
        },
      };
    }

    // If custom submission action provided, inject it
    if (s.submissionAction) {
      return {
        ...effectiveConfig,
        submission: {
          action: this.wrapSubmissionAction(s.submissionAction),
        },
      };
    }

    // If mock endpoint configured, create HTTP-based action
    if (s.mockEndpoint) {
      return {
        ...effectiveConfig,
        submission: {
          action: this.createHttpAction(s.mockEndpoint.url, s.mockEndpoint.method ?? 'POST'),
        },
      };
    }

    // If simulated submission configured, create and inject action
    if (s.simulateSubmission) {
      return {
        ...effectiveConfig,
        submission: {
          action: this.createSimulatedAction(
            s.simulateSubmission.delayMs,
            s.simulateSubmission.simulateError,
            s.simulateSubmission.errorMessage,
          ),
        },
      };
    }

    return effectiveConfig;
  });

  /** Form value - initialized from scenario's initialValue if provided, resets when scenario changes */
  formValue = linkedSignal<Record<string, unknown>>(() => this.scenario().initialValue ?? {});

  /** Submission state tracking */
  isSubmitting = signal(false);
  submissionCount = signal(0);
  submissionResult = signal<{ message: string; error: boolean } | null>(null);

  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  /**
   * Creates a simulated submission action with configurable delay.
   * Returns an Observable instead of a Promise for better RxJS integration.
   */
  private createSimulatedAction(delayMs: number, simulateError?: boolean, errorMessage?: string) {
    return (): Observable<undefined> => {
      this.isSubmitting.set(true);
      this.submissionResult.set(null);

      return timer(delayMs).pipe(
        map(() => {
          if (simulateError) {
            this.submissionResult.set({
              message: errorMessage ?? 'Submission failed',
              error: true,
            });
          } else {
            this.submissionResult.set({
              message: `Submission successful at ${new Date().toISOString()}`,
              error: false,
            });
          }
          // For test scenarios, we track errors via UI state, not form validation
          return undefined;
        }),
        tap(() => this.dispatchSubmissionEvent()),
        finalize(() => {
          this.isSubmitting.set(false);
          this.submissionCount.update((c) => c + 1);
        }),
      );
    };
  }

  /**
   * Creates an HTTP-based submission action that calls a real endpoint (intercepted by Playwright).
   * Returns an Observable directly without converting to Promise.
   */
  private createHttpAction(url: string, method: 'POST' | 'PUT' | 'PATCH') {
    return (): Observable<undefined> => {
      this.isSubmitting.set(true);
      this.submissionResult.set(null);

      return this.http
        .request<{ message?: string }>(method, url, {
          body: this.formValue(),
        })
        .pipe(
          map((data) => {
            this.submissionResult.set({
              message: data.message ?? `Submission successful at ${new Date().toISOString()}`,
              error: false,
            });
            return undefined;
          }),
          catchError((err) => {
            this.submissionResult.set({
              message: `Server error: ${err.status} - ${err.error?.error ?? 'Unknown error'}`,
              error: true,
            });
            return of(undefined);
          }),
          tap(() => this.dispatchSubmissionEvent()),
          finalize(() => {
            this.isSubmitting.set(false);
            this.submissionCount.update((c) => c + 1);
          }),
        );
    };
  }

  /**
   * Wraps a custom submission action to track submission state.
   * Handles both Observable and Promise returns.
   */
  private wrapSubmissionAction(action: NonNullable<TestScenario['submissionAction']>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (form: Parameters<typeof action>[0]): any => {
      this.isSubmitting.set(true);
      this.submissionResult.set(null);

      const result = action(form);

      // Handle Observable returns
      if (isObservable(result)) {
        return result.pipe(
          tap((validationResult) => {
            if (validationResult) {
              this.submissionResult.set({
                message: 'Submission completed with validation errors',
                error: true,
              });
            } else {
              this.submissionResult.set({
                message: `Submission successful at ${new Date().toISOString()}`,
                error: false,
              });
            }
            this.dispatchSubmissionEvent();
          }),
          catchError((err) => {
            this.submissionResult.set({
              message: `Submission error: ${err}`,
              error: true,
            });
            throw err;
          }),
          finalize(() => {
            this.isSubmitting.set(false);
            this.submissionCount.update((c) => c + 1);
          }),
        );
      }

      // Handle Promise returns (backwards compatibility)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as Promise<any>).then(
        (validationResult: unknown) => {
          this.isSubmitting.set(false);
          this.submissionCount.update((c) => c + 1);

          if (validationResult) {
            this.submissionResult.set({
              message: 'Submission completed with validation errors',
              error: true,
            });
          } else {
            this.submissionResult.set({
              message: `Submission successful at ${new Date().toISOString()}`,
              error: false,
            });
          }

          this.dispatchSubmissionEvent();
          return validationResult;
        },
        (err: unknown) => {
          this.isSubmitting.set(false);
          this.submissionResult.set({
            message: `Submission error: ${err}`,
            error: true,
          });
          throw err;
        },
      );
    };
  }

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    this.dispatchSubmissionEvent();
  }

  /**
   * Dispatches a custom event for E2E test interception.
   * Used by both (submitted) handler and submission actions.
   */
  private dispatchSubmissionEvent(): void {
    const submission = {
      timestamp: new Date().toISOString(),
      data: this.formValue(),
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { ...submission, testId: this.scenario().testId },
      }),
    );
  }
}

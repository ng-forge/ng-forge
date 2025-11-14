import { Component, signal, ViewChild, inject, effect, viewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, type FormConfig, SubmitEvent, EventBus, AddArrayItemEvent, RemoveArrayItemEvent } from '@ng-forge/dynamic-form';

/**
 * Simple E2E Test Page Component
 * Provides a basic testing endpoint for Playwright e2e tests without complex dependencies
 */
@Component({
  selector: 'demo-simple-e2e-test-page',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="e2e-test-page">
      <h1>Simple E2E Test Environment</h1>
      <p>Basic testing page for automated tests</p>

      @if (currentConfig()) {
      <div class="e2e-test-container" [id]="currentTestId()" [attr.data-testid]="currentTestId()">
        @if (currentTitle()) {
        <div class="form-header">
          <h2 [id]="currentTestId() + '-title'" [attr.data-testid]="currentTestId() + '-title'">{{ currentTitle() }}</h2>
          @if (currentDescription()) {
          <p class="description">{{ currentDescription() }}</p>
          }
        </div>
        }

        <dynamic-form
          [config]="currentConfig()!"
          [(value)]="formValue"
          (submitted)="onSubmitted($event)"
          (initialized)="onFormInitialized()"
          [attr.data-testid]="'dynamic-form-' + currentTestId()"
        >
        </dynamic-form>

        <div class="output" [attr.data-testid]="'form-output-' + currentTestId()">
          <details class="form-state">
            <summary>Form State (for debugging)</summary>
            <div class="form-data">
              <strong>Form Value:</strong>
              <pre [id]="'form-value-' + currentTestId()" [attr.data-testid]="'form-value-' + currentTestId()">{{
                formValue() | json
              }}</pre>
            </div>
            @if (submissionLog().length > 0) {
            <div class="submission-log">
              <strong>Submission Log:</strong>
              <ul [id]="'submission-log-' + currentTestId()" [attr.data-testid]="'submission-log-' + currentTestId()">
                @for (submission of submissionLog(); track submission.timestamp; let i = $index) {
                <li [id]="'submission-' + i" [attr.data-testid]="'submission-' + i">
                  {{ submission.timestamp }}: {{ submission.data | json }}
                </li>
                }
              </ul>
            </div>
            }
          </details>
        </div>
      </div>
      } @else {
      <div class="no-scenario">
        <h2>No Scenario Loaded</h2>
        <p>Use JavaScript to load a test scenario:</p>
        <pre><code>window.loadTestScenario(config);</code></pre>

        <button (click)="loadBasicScenario()" class="load-basic-btn">Load Basic Test Scenario</button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .e2e-test-page {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        font-family: 'Roboto', sans-serif;
      }

      .e2e-test-page h1 {
        color: #1976d2;
        margin-bottom: 1rem;
        text-align: center;
      }

      .e2e-test-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .form-header {
        margin-bottom: 2rem;
        text-align: center;
      }

      .form-header h2 {
        color: #1976d2;
        margin: 0 0 1rem 0;
        font-weight: 500;
      }

      .description {
        color: #666;
        font-style: italic;
        margin: 0;
      }

      .output {
        margin-top: 2rem;
        border-top: 1px solid #e0e0e0;
        padding-top: 1rem;
      }

      .form-state summary {
        cursor: pointer;
        font-weight: 500;
        color: #1976d2;
        margin-bottom: 1rem;
      }

      pre {
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 1rem;
        font-size: 0.875rem;
        line-height: 1.4;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 300px;
        overflow-y: auto;
      }

      ul {
        list-style-type: none;
        padding: 0;
      }

      li {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }

      .no-scenario {
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 2rem;
        margin-top: 2rem;
        text-align: center;
      }

      .no-scenario h2 {
        color: #1976d2;
        margin-bottom: 1rem;
      }

      .load-basic-btn {
        background: #1976d2;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
      }

      .load-basic-btn:hover {
        background: #1565c0;
      }
    `,
  ],
})
export class SimpleE2ETestPageComponent {
  private eventBus = inject(EventBus, { optional: true });

  currentConfig = signal<FormConfig | null>(null);
  currentTestId = signal<string>('default');
  currentTitle = signal<string>('');
  currentDescription = signal<string>('');

  formValue = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);
  formInitialized = signal<boolean>(false);

  constructor() {
    this.setupScenarioLoader();

    // Expose EventBus to window for E2E tests when it's available
    effect(() => {
      if (this.eventBus) {
        (window as any).testEventBus = this.eventBus;
      }
    });
  }

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) {
      return;
    }

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    console.log('Form Submitted:', submission);

    // Emit custom event for e2e test detection
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: submission,
      })
    );
  }

  onFormInitialized(): void {
    this.formInitialized.set(true);

    console.log('Form initialization complete');

    // Emit custom event for e2e test detection
    window.dispatchEvent(
      new CustomEvent('formInitialized', {
        detail: {
          testId: this.currentTestId(),
          timestamp: new Date().toISOString(),
        },
      })
    );
  }

  loadBasicScenario(): void {
    const basicConfig: FormConfig = {
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Enter your first name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Enter your last name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: {
            type: 'email',
            placeholder: 'Enter your email',
          },
          required: true,
          email: true,
        },
        {
          key: 'priority',
          type: 'radio',
          label: 'Priority Level',
          options: [
            { value: 'low', label: 'Low Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'high', label: 'High Priority' },
          ],
          props: {
            hint: 'Select task priority',
          },
          required: true,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
          props: {
            type: 'submit',
          },
        },
      ],
    };

    this.currentConfig.set(basicConfig);
    this.currentTestId.set('basic-test');
    this.currentTitle.set('Basic Test Scenario');
    this.currentDescription.set('Simple form for e2e testing');
    this.formInitialized.set(false);
  }

  private setupScenarioLoader(): void {
    // Expose events globally for e2e tests
    (window as any).SubmitEvent = SubmitEvent;
    (window as any).AddArrayItemEvent = AddArrayItemEvent;
    (window as any).RemoveArrayItemEvent = RemoveArrayItemEvent;

    // Create global function for loading test scenarios
    (window as any).loadTestScenario = (
      config: FormConfig,
      options?: {
        testId?: string;
        title?: string;
        description?: string;
      }
    ) => {
      this.currentConfig.set(config);
      this.currentTestId.set(options?.testId || 'default');
      this.currentTitle.set(options?.title || '');
      this.currentDescription.set(options?.description || '');
      this.formInitialized.set(false);
    };

    // Helper function to clear current scenario
    (window as any).clearTestScenario = () => {
      this.currentConfig.set(null);
      this.currentTestId.set('default');
      this.currentTitle.set('');
      this.currentDescription.set('');
      this.formValue.set({});
      this.submissionLog.set([]);
      this.formInitialized.set(false);
    };
  }
}

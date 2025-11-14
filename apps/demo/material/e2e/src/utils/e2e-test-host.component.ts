import { Component, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Test Host Component for E2E Testing
 * Provides a minimal container for mounting dynamic form configurations
 * Based on existing demo component patterns
 */
@Component({
  selector: 'e2e-test-host',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="e2e-test-container" [id]="testId()" [attr.data-testid]="testId()">
      @if (title()) {
      <div class="form-header">
        <h2 [id]="testId() + '-title'" [attr.data-testid]="testId() + '-title'">{{ title() }}</h2>
        @if (description()) {
        <p class="description">{{ description() }}</p>
        }
      </div>
      }

      <dynamic-form
        [config]="config()"
        [(value)]="formValue"
        (submitted)="onSubmitted($event)"
        [attr.data-testid]="'dynamic-form-' + testId()"
      >
      </dynamic-form>

      <div class="output" [attr.data-testid]="'form-output-' + testId()">
        <details class="form-state">
          <summary>Form State (for debugging)</summary>
          <div class="form-data">
            <strong>Form Value:</strong>
            <pre [id]="'form-value-' + testId()" [attr.data-testid]="'form-value-' + testId()">{{ formValue() | json }}</pre>
          </div>
          @if (showConfig()) {
          <div class="form-config">
            <strong>Form Config:</strong>
            <pre [attr.data-testid]="'form-config-' + testId()">{{ config() | json }}</pre>
          </div>
          } @if (submissionLog().length > 0) {
          <div class="submission-log">
            <strong>Submission Log:</strong>
            <ul [id]="'submission-log-' + testId()" [attr.data-testid]="'submission-log-' + testId()">
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
  `,
  styles: [
    `
      .e2e-test-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        font-family: 'Roboto', sans-serif;
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

      .form-data,
      .form-config,
      .submission-log {
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

      /* Responsive design */
      @media (max-width: 768px) {
        .e2e-test-container {
          padding: 1rem;
        }

        pre {
          font-size: 0.75rem;
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class E2ETestHostComponent {
  // Input properties for configuration
  config = input.required<FormConfig>();
  testId = input<string>('default');
  title = input<string>('');
  description = input<string>('');
  showConfig = input<boolean>(false);
  initialValue = input<Record<string, unknown>>({});

  // Form state management
  formValue = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  constructor() {
    // Initialize form value with provided initial value
    this.formValue.set(this.initialValue());
  }

  onSubmitted(value: any): void {
    const submission = {
      timestamp: new Date().toISOString(),
      data: value || {},
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

  // Utility methods for e2e test access
  getFormValue(): Record<string, unknown> {
    return this.formValue();
  }

  setFormValue(value: Record<string, unknown>): void {
    this.formValue.set(value);
  }

  clearSubmissionLog(): void {
    this.submissionLog.set([]);
  }

  getSubmissionCount(): number {
    return this.submissionLog().length;
  }

  getLastSubmission(): { timestamp: string; data: Record<string, unknown> } | null {
    const log = this.submissionLog();
    return log.length > 0 ? log[log.length - 1] : null;
  }
}

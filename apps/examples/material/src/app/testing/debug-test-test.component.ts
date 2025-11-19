import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Debug Test Component
 * Dedicated component with embedded test configs for debug test e2e tests
 */
@Component({
  selector: 'app-debug-test-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Debug Test</h1>

      <!-- Test scenarios defined directly in component -->
      @for (scenario of scenarios; track scenario.testId) {
        <section class="test-scenario" [attr.data-testid]="scenario.testId">
          <h2>{{ scenario.title }}</h2>
          <dynamic-form [config]="scenario.config" [(value)]="scenario.value" (submitted)="onSubmitted($event, scenario.testId)" />

          <details class="debug-output">
            <summary>Debug Output</summary>
            <pre [attr.data-testid]="'form-value-' + scenario.testId">{{ scenario.value() | json }}</pre>
          </details>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .test-page {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .test-scenario {
        margin-bottom: 3rem;
        padding: 2rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fafafa;
      }

      .test-scenario h2 {
        margin-top: 0;
        color: #1976d2;
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
export class DebugTestTestComponent {
  scenarios = [
    {
      testId: 'debug-page-load',
      title: 'Debug Page Load with Console Capture',
      config: {
        fields: [
          {
            key: 'testField',
            type: 'input',
            label: 'Test Field',
          },
        ],
      },
      value: signal<Record<string, unknown>>({}),
    },
  ];

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined, testId: string): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId,
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

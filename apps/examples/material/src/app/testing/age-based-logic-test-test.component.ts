import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Age-Based Logic Test Component
 * Dedicated component with embedded test configs for age-based conditional logic e2e tests
 */
@Component({
  selector: 'app-age-based-logic-test-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Age-Based Logic Tests</h1>

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
export class AgeBasedLogicTestTestComponent {
  scenarios = [
    {
      testId: 'dependent-validation',
      title: 'Dependent Validation',
      config: {
        fields: [
          {
            key: 'age',
            type: 'input' as const,
            label: 'Age',
            props: {
              type: 'number' as const,
              appearance: 'outline' as const,
            },
          },
          {
            key: 'guardianConsent',
            type: 'checkbox' as const,
            label: 'Guardian Consent Required',
            props: {
              color: 'primary' as const,
            },
            logic: [
              {
                type: 'hidden' as const,
                condition: {
                  type: 'javascript' as const,
                  expression: '!formValue.age || formValue.age >= 18',
                },
              },
            ],
          },
          {
            key: 'country',
            type: 'select' as const,
            label: 'Country',
            options: [
              { value: '', label: '' },
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
            ],
            props: {
              appearance: 'outline' as const,
            },
          },
          {
            key: 'state',
            type: 'select' as const,
            label: 'State/Province',
            options: [
              { value: '', label: '' },
              { value: 'ny', label: 'New York' },
              { value: 'ca', label: 'California' },
              { value: 'tx', label: 'Texas' },
            ],
            props: {
              appearance: 'outline' as const,
            },
            logic: [
              {
                type: 'disabled' as const,
                condition: {
                  type: 'fieldValue' as const,
                  fieldPath: 'country',
                  operator: 'notEquals' as const,
                  value: 'us',
                },
              },
            ],
          },
          {
            key: 'city',
            type: 'input' as const,
            label: 'City',
            props: {
              appearance: 'outline' as const,
            },
            logic: [
              {
                type: 'disabled' as const,
                condition: {
                  type: 'or' as const,
                  conditions: [
                    {
                      type: 'fieldValue' as const,
                      fieldPath: 'country',
                      operator: 'equals' as const,
                      value: '',
                    },
                    {
                      type: 'fieldValue' as const,
                      fieldPath: 'state',
                      operator: 'equals' as const,
                      value: '',
                    },
                  ],
                },
              },
            ],
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

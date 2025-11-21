import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';

/**
 * Conditional Fields Scenario Component
 * Tests conditional field visibility and state management based on form inputs
 */
@Component({
  selector: 'example-conditional-fields-scenario',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let idx = $index) {
                <div [attr.data-testid]="'submission-' + idx">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ConditionalFieldsScenarioComponent {
  testId = 'conditional-fields';
  title = 'Conditional Fields';

  config = {
    fields: [
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        props: {
          type: 'number',
          placeholder: 'Enter your age',
        },
        required: true,
      },
      {
        key: 'guardianConsent',
        type: 'checkbox',
        label: 'Guardian Consent Required',
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: '', label: 'Select a country' },
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
        ],
        required: true,
      },
      {
        key: 'state',
        type: 'select',
        label: 'State/Province',
        options: [
          { value: 'ca', label: 'California' },
          { value: 'ny', label: 'New York' },
          { value: 'tx', label: 'Texas' },
        ],
      },
      {
        key: 'city',
        type: 'input',
        label: 'City',
        props: {
          placeholder: 'Enter city',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: formValue,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: this.testId, ...submission },
      }),
    );
  }
}

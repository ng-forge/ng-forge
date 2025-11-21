import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Conditional Field Validation Test Component
 * Tests conditional field requirements based on checkbox selection
 */
@Component({
  selector: 'example-conditional-fields-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <div class="test-scenario" data-testid="conditional-validation">
        <h2>Conditional Field Validation</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-conditional-validation'">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let idx = $index) {
                <div [attr.data-testid]="'submission-' + idx">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </div>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ConditionalFieldsTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'hasAddress',
        type: 'checkbox',
        label: 'I have a different billing address',
        col: 12,
      },
      {
        key: 'streetAddress',
        type: 'input',
        label: 'Street Address',
        props: {
          placeholder: 'Enter street address',
        },
        col: 12,
      },
      {
        key: 'city',
        type: 'input',
        label: 'City',
        props: {
          placeholder: 'Enter city',
        },
        col: 6,
      },
      {
        key: 'zipCode',
        type: 'input',
        label: 'ZIP Code',
        props: {
          placeholder: 'Enter ZIP code',
        },
        pattern: '^[0-9]{5}(-[0-9]{4})?$',
        col: 6,
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'mx', label: 'Mexico' },
          { value: 'other', label: 'Other' },
        ],
        col: 12,
      },
      {
        key: 'submitConditional',
        type: 'submit',
        label: 'Submit Address',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: 'conditional-validation', ...submission },
      }),
    );
  }
}

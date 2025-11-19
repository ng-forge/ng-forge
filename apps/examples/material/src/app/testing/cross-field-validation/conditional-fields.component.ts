import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Conditional Field Validation Test Component
 * Tests conditional field requirements based on checkbox selection
 */
@Component({
  selector: 'app-conditional-fields-test',
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
  styleUrl: '../test-component.styles.scss',
})
export class ConditionalFieldsTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'hasAddress',
        type: 'checkbox' as const,
        label: 'I have a different billing address',
        col: 12,
      },
      {
        key: 'streetAddress',
        type: 'input' as const,
        label: 'Street Address',
        props: {
          placeholder: 'Enter street address',
        },
        col: 12,
      },
      {
        key: 'city',
        type: 'input' as const,
        label: 'City',
        props: {
          placeholder: 'Enter city',
        },
        col: 6,
      },
      {
        key: 'zipCode',
        type: 'input' as const,
        label: 'ZIP Code',
        props: {
          placeholder: 'Enter ZIP code',
        },
        pattern: '^[0-9]{5}(-[0-9]{4})?$',
        col: 6,
      },
      {
        key: 'country',
        type: 'select' as const,
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
        type: 'submit' as const,
        label: 'Submit Address',
        col: 12,
      },
    ],
  };

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

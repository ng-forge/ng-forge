import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Invalid Navigation Test Component
 * Tests invalid page navigation attempts
 */
@Component({
  selector: 'example-invalid-navigation-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class InvalidNavigationTestComponent {
  testId = 'invalid-navigation';
  title = 'Invalid Navigation Test';
  description = 'Testing invalid page navigation attempts';

  config = {
    fields: [
      {
        key: 'validPage1',
        type: 'page',
        title: 'Valid Page 1',
        fields: [
          {
            key: 'requiredField',
            type: 'input',
            label: 'Required Field',
            required: true,
            col: 12,
          },
        ],
      },
      {
        key: 'validPage2',
        type: 'page',
        title: 'Valid Page 2',
        fields: [
          {
            key: 'optionalField',
            type: 'input',
            label: 'Optional Field',
            col: 12,
          },
          {
            key: 'submitInvalid',
            type: 'submit',
            label: 'Submit',
            col: 12,
          },
        ],
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: formValue,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

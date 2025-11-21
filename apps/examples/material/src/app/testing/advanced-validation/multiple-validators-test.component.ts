import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Multiple Validators Test Component
 * Tests multiple validation rules applied to the same field
 */
@Component({
  selector: 'example-multiple-validators-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Multiple Validators Test</h1>
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">{{ description }}</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />
        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
})
export class MultipleValidatorsTestComponent {
  testId = 'multiple-validators-test';
  title = 'Multiple Validators Test';
  description = 'Username must be 3-20 characters, alphanumeric with underscores, and not "admin" or "root"';

  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
        validators: [
          {
            type: 'custom',
            expression: 'fieldValue !== "admin" && fieldValue !== "root"',
            kind: 'noReservedWords',
            errorMessage: 'Username cannot be "admin" or "root"',
          },
        ],
        col: 12,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

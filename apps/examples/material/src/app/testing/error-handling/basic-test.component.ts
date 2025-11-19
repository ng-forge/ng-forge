import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Basic Form Test Component
 * Tests basic form functionality with standard field types
 */
@Component({
  selector: 'example-basic-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Basic Form Test</h1>

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
export class BasicTestComponent {
  testId = 'basic-test';
  title = 'Basic Form Test';

  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        required: true,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        required: true,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'priority',
        type: 'radio',
        label: 'Priority',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
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

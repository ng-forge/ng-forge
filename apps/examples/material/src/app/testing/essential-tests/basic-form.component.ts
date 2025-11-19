import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Basic Form Functionality Test Component
 * Tests fundamental form functionality with password validation
 */
@Component({
  selector: 'example-basic-form-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Basic Form Functionality</h1>

      <section class="test-scenario" data-testid="basic-form">
        <h2>Basic Form Functionality</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-basic-form'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class BasicFormTestComponent {
  config = {
    fields: [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        props: {
          type: 'password',
        },
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        required: true,
        props: {
          type: 'password',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  formValue = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { ...submission, testId: 'basic-form' } }));
  }
}

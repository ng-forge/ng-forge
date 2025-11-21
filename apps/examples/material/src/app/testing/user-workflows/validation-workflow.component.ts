import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Validation Workflow Test Component
 * Tests multi-field validation with various constraints
 */
@Component({
  selector: 'example-validation-workflow',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="validation-workflow">
        <h2>Multi-Field Validation Workflow</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-validation-workflow'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ValidationWorkflowComponent {
  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        minLength: 3,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        required: true,
        min: 18,
        max: 120,
        props: {
          type: 'number',
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

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'validation-workflow',
      data: formValue,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

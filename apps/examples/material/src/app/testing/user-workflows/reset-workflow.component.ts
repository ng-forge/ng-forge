import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reset Workflow Test Component
 * Tests form reset functionality
 */
@Component({
  selector: 'example-reset-workflow',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="reset-workflow">
        <h2>Form Reset Workflow</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-reset-workflow'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ResetWorkflowComponent {
  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        value: 'Default Name',
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        value: 'Default description',
      },
      {
        key: 'active',
        type: 'checkbox',
        label: 'Active',
        value: true,
      },
      {
        key: 'reset',
        type: 'button',
        label: 'Reset Form',
        event: FormResetEvent,
        props: {
          type: 'button',
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
      testId: 'reset-workflow',
      data: formValue,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

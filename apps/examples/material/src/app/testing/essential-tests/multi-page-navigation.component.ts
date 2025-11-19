import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Multi-Page Navigation Test Component
 * Tests form submission with multiple input fields
 */
@Component({
  selector: 'app-multi-page-navigation-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Multi-Page Navigation</h1>

      <section class="test-scenario" data-testid="multi-page-navigation">
        <h2>Multi-Page Navigation</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-multi-page-navigation'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class MultiPageNavigationTestComponent {
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
        email: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  };

  formValue = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { ...submission, testId: 'multi-page-navigation' } }));
  }
}

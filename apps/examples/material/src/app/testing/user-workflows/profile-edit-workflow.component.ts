import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Profile Edit Workflow Test Component
 * Tests profile editing with pre-filled values
 */
@Component({
  selector: 'example-profile-edit-workflow',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="profile-edit">
        <h2>Profile Edit Workflow</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-profile-edit'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ProfileEditWorkflowComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: 'John',
        required: true,
        col: 6,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: 'Doe',
        required: true,
        col: 6,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: 'john.doe@example.com',
        required: true,
        email: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        value: 'Software engineer',
        props: {
          rows: 4,
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Save Changes',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'profile-edit',
      data: formValue,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';

/**
 * Profile Management Scenario Component
 * Tests a profile management form with password change and optional fields
 */
@Component({
  selector: 'app-profile-management-scenario',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let idx = $index) {
                <div [attr.data-testid]="'submission-' + idx">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class ProfileManagementScenarioComponent {
  testId = 'profile-management';
  title = 'Profile Management';

  config: FormConfig = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        props: {
          placeholder: 'Enter username',
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        props: {
          placeholder: 'Tell us about yourself',
          rows: 4,
        },
      },
      {
        key: 'currentPassword',
        type: 'input',
        label: 'Current Password',
        props: {
          type: 'password',
          placeholder: 'Enter current password',
        },
      },
      {
        key: 'newPassword',
        type: 'input',
        label: 'New Password',
        props: {
          type: 'password',
          placeholder: 'Enter new password',
        },
        minLength: 8,
      },
      {
        key: 'confirmNewPassword',
        type: 'input',
        label: 'Confirm New Password',
        props: {
          type: 'password',
          placeholder: 'Confirm new password',
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Update Profile',
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: formValue,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: this.testId, ...submission },
      }),
    );
  }
}

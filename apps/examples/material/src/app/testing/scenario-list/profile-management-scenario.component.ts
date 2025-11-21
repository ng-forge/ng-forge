import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Profile Management Scenario Component
 * Test scenario for a complex profile management form with multiple sections
 */
@Component({
  selector: 'example-profile-management-scenario',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" [attr.data-testid]="testId">
      <h2>{{ title }}</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class ProfileManagementScenarioComponent {
  testId = 'profile-management-scenario';
  title = 'Profile Management';

  config = {
    fields: [
      {
        key: 'personalInfo',
        type: 'group',
        label: 'Personal Information',
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
            key: 'dateOfBirth',
            type: 'datepicker',
            label: 'Date of Birth',
          },
        ],
      },
      {
        key: 'contactInfo',
        type: 'group',
        label: 'Contact Information',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: { type: 'email' },
            required: true,
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
            props: { type: 'tel' },
          },
          {
            key: 'address',
            type: 'textarea',
            label: 'Address',
            props: {
              rows: 3,
            },
          },
        ],
      },
      {
        key: 'preferences',
        type: 'group',
        label: 'Preferences',
        fields: [
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Subscribe to newsletter',
          },
          {
            key: 'notifications',
            type: 'checkbox',
            label: 'Enable notifications',
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Save Profile',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

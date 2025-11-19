import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Cross-Page Email Verification Scenario
 * Tests email collection, personal info, and confirmation across multiple pages
 */
@Component({
  selector: 'example-email-verification',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Cross-Page Email Verification</h1>

      <section class="test-scenario" data-testid="cross-page-email-verification">
        <h2>Cross-Page Email Verification</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-cross-page-email-verification'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class EmailVerificationComponent {
  value = signal<Record<string, unknown>>({});

  config = {
    fields: [
      // Page 1: Email Collection
      {
        key: 'emailPage',
        type: 'page',
        fields: [
          {
            key: 'emailPageTitle',
            type: 'text',
            label: 'Email Registration',
            props: {
              elementType: 'h2',
            },
            col: 12,
          },
          {
            key: 'emailPageDescription',
            type: 'text',
            label: 'Please provide your email address',
            col: 12,
          },
          {
            key: 'primaryEmail',
            type: 'input',
            label: 'Primary Email Address',
            props: {
              type: 'email',
              placeholder: 'Enter your primary email',
            },
            email: true,
            required: true,
            col: 12,
          },
          {
            key: 'emailType',
            type: 'radio',
            label: 'Email Type',
            options: [
              { value: 'personal', label: 'Personal Email' },
              { value: 'business', label: 'Business Email' },
              { value: 'other', label: 'Other' },
            ],
            required: true,
            col: 12,
          },
        ],
      },
      // Page 2: Personal Information
      {
        key: 'personalPage',
        type: 'page',
        fields: [
          {
            key: 'personalPageTitle',
            type: 'text',
            label: 'Personal Information',
            props: {
              elementType: 'h2',
            },
            col: 12,
          },
          {
            key: 'personalPageDescription',
            type: 'text',
            label: 'Tell us more about yourself',
            col: 12,
          },
          {
            key: 'fullName',
            type: 'input',
            label: 'Full Name',
            props: {
              placeholder: 'Enter your full name',
            },
            required: true,
            col: 12,
          },
          {
            key: 'companyName',
            type: 'input',
            label: 'Company Name',
            props: {
              placeholder: 'Enter company name (for business emails)',
            },
            col: 12,
          },
          {
            key: 'phoneNumber',
            type: 'input',
            label: 'Phone Number',
            props: {
              type: 'tel',
              placeholder: 'Enter phone number',
            },
            pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
            required: true,
            col: 12,
          },
        ],
      },
      // Page 3: Confirmation
      {
        key: 'confirmationPage',
        type: 'page',
        fields: [
          {
            key: 'confirmationPageTitle',
            type: 'text',
            label: 'Confirmation',
            props: {
              elementType: 'h2',
            },
            col: 12,
          },
          {
            key: 'confirmationPageDescription',
            type: 'text',
            label: 'Please confirm your information',
            col: 12,
          },
          {
            key: 'confirmEmail',
            type: 'input',
            label: 'Confirm Email Address',
            props: {
              type: 'email',
              placeholder: 'Re-enter your email to confirm',
            },
            email: true,
            required: true,
            col: 12,
          },
          {
            key: 'termsAgreement',
            type: 'checkbox',
            label: 'I agree to the Terms of Service and Privacy Policy',
            required: true,
            col: 12,
          },
          {
            key: 'emailNotifications',
            type: 'checkbox',
            label: 'Send me email notifications',
            col: 12,
          },
          {
            key: 'submitEmailVerification',
            type: 'submit',
            label: 'Complete Registration',
            col: 12,
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'cross-page-email-verification',
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}

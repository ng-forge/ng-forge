import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Registration Journey Test Component
 * Tests complete user registration flow across 5 pages
 */
@Component({
  selector: 'app-registration-journey-test',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.html',
  styleUrl: '../test-component.styles.scss',
})
export class RegistrationJourneyTestComponent {
  testId = 'registration-journey';
  title = 'Complete User Registration Journey';

  config = {
    fields: [
      // Page 1: Welcome & Account Type
      {
        key: 'welcomePage',
        type: 'page',
        title: 'Welcome to Our Platform',
        description: "Let's get you started with creating your account",
        fields: [
          {
            key: 'accountPurpose',
            type: 'radio',
            label: 'What will you use this account for?',
            options: [
              { value: 'personal', label: 'Personal Use' },
              { value: 'business', label: 'Business/Professional' },
              { value: 'education', label: 'Educational Purposes' },
              { value: 'nonprofit', label: 'Non-Profit Organization' },
            ],
            required: true,
            col: 12,
          },
          {
            key: 'referralSource',
            type: 'select',
            label: 'How did you hear about us?',
            options: [
              { value: 'search', label: 'Search Engine' },
              { value: 'social', label: 'Social Media' },
              { value: 'friend', label: 'Friend/Colleague' },
              { value: 'advertisement', label: 'Advertisement' },
              { value: 'other', label: 'Other' },
            ],
            col: 12,
          },
        ],
      },
      // Page 2: Personal Information
      {
        key: 'personalInfoPage',
        type: 'page',
        title: 'Personal Information',
        description: 'Please provide your personal details',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            props: {
              placeholder: 'Enter your first name',
            },
            required: true,
            col: 6,
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            props: {
              placeholder: 'Enter your last name',
            },
            required: true,
            col: 6,
          },
          {
            key: 'emailAddress',
            type: 'input',
            label: 'Email Address',
            props: {
              type: 'email',
              placeholder: 'Enter your email',
            },
            email: true,
            required: true,
            col: 12,
          },
          {
            key: 'phoneNumber',
            type: 'input',
            label: 'Phone Number',
            props: {
              type: 'tel',
              placeholder: 'Enter your phone number',
            },
            pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
            col: 6,
          },
          {
            key: 'birthDate',
            type: 'input',
            label: 'Date of Birth',
            props: {
              type: 'date',
            },
            required: true,
            col: 6,
          },
        ],
      },
      // Page 3: Address Information
      {
        key: 'addressPage',
        type: 'page',
        title: 'Address Information',
        description: 'Where can we reach you?',
        fields: [
          {
            key: 'streetAddress',
            type: 'input',
            label: 'Street Address',
            props: {
              placeholder: 'Enter your street address',
            },
            required: true,
            col: 12,
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            props: {
              placeholder: 'Enter your city',
            },
            required: true,
            col: 6,
          },
          {
            key: 'state',
            type: 'select',
            label: 'State/Province',
            options: [
              { value: 'ca', label: 'California' },
              { value: 'ny', label: 'New York' },
              { value: 'tx', label: 'Texas' },
              { value: 'fl', label: 'Florida' },
              { value: 'wa', label: 'Washington' },
              { value: 'other', label: 'Other' },
            ],
            required: true,
            col: 6,
          },
          {
            key: 'zipCode',
            type: 'input',
            label: 'ZIP/Postal Code',
            props: {
              placeholder: 'Enter ZIP or postal code',
            },
            pattern: '^[0-9]{5}(-[0-9]{4})?$|^[A-Z][0-9][A-Z]\\s?[0-9][A-Z][0-9]$',
            required: true,
            col: 6,
          },
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            options: [
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'other', label: 'Other' },
            ],
            value: 'us',
            col: 6,
          },
        ],
      },
      // Page 4: Security & Preferences
      {
        key: 'securityPage',
        type: 'page',
        title: 'Security & Preferences',
        description: 'Secure your account and set preferences',
        fields: [
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            props: {
              type: 'password',
              placeholder: 'Create a strong password',
            },
            required: true,
            minLength: 8,
            col: 6,
          },
          {
            key: 'confirmPassword',
            type: 'input',
            label: 'Confirm Password',
            props: {
              type: 'password',
              placeholder: 'Confirm your password',
            },
            required: true,
            col: 6,
          },
          {
            key: 'securityQuestion',
            type: 'select',
            label: 'Security Question',
            options: [
              { value: 'pet', label: "What was your first pet's name?" },
              { value: 'school', label: 'What was your elementary school?' },
              { value: 'city', label: 'In what city were you born?' },
              { value: 'mother', label: "What is your mother's maiden name?" },
            ],
            required: true,
            col: 12,
          },
          {
            key: 'securityAnswer',
            type: 'input',
            label: 'Security Answer',
            props: {
              placeholder: 'Answer to your security question',
            },
            required: true,
            col: 12,
          },
          {
            key: 'twoFactorAuth',
            type: 'checkbox',
            label: 'Enable two-factor authentication (recommended)',
            col: 12,
          },
          {
            key: 'emailNotifications',
            type: 'checkbox',
            label: 'Receive email notifications',
            col: 6,
          },
          {
            key: 'marketingEmails',
            type: 'checkbox',
            label: 'Receive marketing emails',
            col: 6,
          },
        ],
      },
      // Page 5: Review & Submit
      {
        key: 'reviewPage',
        type: 'page',
        title: 'Review & Submit',
        description: 'Please review your information and complete registration',
        fields: [
          {
            key: 'dataAccuracy',
            type: 'checkbox',
            label: 'I confirm that all the information provided is accurate',
            required: true,
            col: 12,
          },
          {
            key: 'termsOfService',
            type: 'checkbox',
            label: 'I agree to the Terms of Service',
            required: true,
            col: 6,
          },
          {
            key: 'privacyPolicy',
            type: 'checkbox',
            label: 'I agree to the Privacy Policy',
            required: true,
            col: 6,
          },
          {
            key: 'submitRegistration',
            type: 'submit',
            label: 'Complete Registration',
            col: 12,
          },
        ],
      },
    ],
  };

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

  getScenarioSubmissions() {
    return this.submissionLog();
  }
}

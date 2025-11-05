import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { submitButton, withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-complete-material-form',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <h4>Complete Material Design Form</h4>
    <p>Comprehensive form showcasing all Material components with theming and validation.</p>
    <dynamic-form [config]="config" [(value)]="model" (submitted)="submitted($event)" />
    <h4>Form Data:</h4>
    <pre>{{ model() | json }}</pre>
  `,
})
export class CompleteMaterialFormComponent {
  model = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    language: '',
    plan: '',
    notifications: [],
    newsletter: false,
    terms: false,
    privacy: false,
  });

  submitted(value: any): void {
    console.log('Form Submitted!', value);
  }

  config: FormConfig = {
    fields: [
      // Personal Information Section
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        props: {
          placeholder: 'Enter your first name',
          appearance: 'outline',
        },
        required: true,
        minLength: 2,
      },
      {
        key: 'lastName',
        type: 'input',
        props: {
          label: 'Last Name',
          placeholder: 'Enter your last name',
          appearance: 'outline',
        },
        required: true,
        minLength: 2,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          appearance: 'outline',
          hint: 'We will never share your email',
        },
        required: true,
        email: true,
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          appearance: 'outline',
          hint: 'Include country code',
        },
      },

      // Preferences Section
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        props: {
          placeholder: 'Select your country',
          appearance: 'outline',
        },
        required: true,
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
          { value: 'jp', label: 'Japan' },
        ],
      },
      {
        key: 'language',
        type: 'select',
        label: 'Language',
        props: {
          placeholder: 'Select your language',
          appearance: 'outline',
        },
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'ja', label: 'Japanese' },
        ],
      },
      {
        key: 'plan',
        type: 'select',
        label: 'Subscription Plan',
        required: true,
        props: {
          placeholder: 'Choose your plan',
          appearance: 'outline',
          hint: 'You can upgrade or downgrade anytime',
        },
        options: [
          { value: 'free', label: 'Free - $0/month' },
          { value: 'pro', label: 'Pro - $10/month' },
          { value: 'enterprise', label: 'Enterprise - $50/month' },
        ],
      },
      {
        key: 'notifications',
        type: 'select',
        label: 'Notification Types',
        props: {
          placeholder: 'Select notification preferences',
          appearance: 'outline',
          multiple: true,
          hint: 'Select all that apply',
        },
        options: [
          { value: 'email', label: 'Email notifications' },
          { value: 'sms', label: 'SMS notifications' },
          { value: 'push', label: 'Push notifications' },
          { value: 'newsletter', label: 'Newsletter' },
        ],
      },

      // Agreements Section
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          hint: 'Get updates about new features and tips',
          color: 'primary',
        },
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        props: {
          color: 'primary',
        },
        required: true,
      },
      {
        key: 'privacy',
        type: 'checkbox',
        label: 'I agree to the Privacy Policy',
        props: {
          color: 'primary',
        },
        required: true,
      },

      // Submit Button
      submitButton({
        key: 'submit',
        label: 'Create Account',
        className: 'button-btn',
        props: {
          color: 'primary',
        },
      }),
    ],
  };
}

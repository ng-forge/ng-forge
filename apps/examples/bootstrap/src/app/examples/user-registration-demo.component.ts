import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'bs-example-user-registration-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'User Registration Form',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'subtitle',
        type: 'text',
        label: 'Raw ng-forge form without custom styling - showing Bootstrap integration',
      },

      // Personal Info
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        required: true,
        minLength: 2,
        validationMessages: {
          required: 'This field is required',
          minLength: 'Must be at least {requiredLength} characters',
        },
        props: {
          placeholder: 'Enter your first name',
          floatingLabel: true,
        },
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        required: true,
        minLength: 2,
        validationMessages: {
          required: 'This field is required',
          minLength: 'Must be at least {requiredLength} characters',
        },
        props: {
          placeholder: 'Enter your last name',
          floatingLabel: true,
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        required: true,
        email: true,
        validationMessages: {
          required: 'This field is required',
          email: 'Please enter a valid email address',
        },
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          floatingLabel: true,
          helpText: 'We will never share your email',
        },
      },

      // Demographics
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        required: true,
        min: 18,
        max: 120,
        validationMessages: {
          required: 'This field is required',
          min: 'Must be at least {min}',
          max: 'Must not exceed {max}',
        },
        props: {
          type: 'number',
          placeholder: '18',
          helpText: 'Must be 18 or older',
        },
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
          { value: 'jp', label: 'Japan' },
        ],
        props: {
          placeholder: 'Select your country',
          floatingLabel: true,
        },
      },

      // Preferences
      {
        key: 'plan',
        type: 'select',
        label: 'Subscription Plan',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        options: [
          { value: 'free', label: 'Free - $0/month' },
          { value: 'pro', label: 'Pro - $10/month' },
          { value: 'enterprise', label: 'Enterprise - $50/month' },
        ],
        props: {
          placeholder: 'Choose a plan',
          floatingLabel: true,
          size: 'lg',
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        props: {
          placeholder: 'Tell us about yourself',
          floatingLabel: true,
          helpText: 'Optional - share a bit about yourself',
          rows: 4,
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          switch: true,
          helpText: 'Get updates about new features and special offers',
        },
      },

      // Submit button
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: {
          variant: 'primary',
          size: 'lg',
          block: true,
        },
      },
    ],
  } as const satisfies FormConfig;
}

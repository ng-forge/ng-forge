import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-complete-form-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    <div class="result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  styles: `
    .result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
  `,
  host: {
    class: 'example-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: '',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        props: {
          placeholder: 'Your first name',
        },
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: '',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        props: {
          placeholder: 'Your last name',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        value: '',
        required: true,
        email: true,
        validationMessages: {
          required: 'This field is required',
          email: 'Please enter a valid email address',
        },
        props: {
          type: 'email',
          placeholder: 'email@example.com',
        },
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        value: '',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 000-0000',
        },
      },
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          placeholder: 'Select your birth date',
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        value: '',
        maxLength: 500,
        validationMessages: {
          maxLength: 'Must not exceed {maxLength} characters',
        },
        props: {
          rows: 4,
          placeholder: 'Tell us about yourself',
        },
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
        ],
        props: {
          placeholder: 'Select your country',
        },
      },
      {
        key: 'plan',
        type: 'radio',
        label: 'Subscription Plan',
        options: [
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise' },
        ],
      },
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        options: [
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'technology', label: 'Technology' },
          { value: 'art', label: 'Art' },
        ],
      },
      {
        key: 'volume',
        type: 'slider',
        label: 'Notification Volume',
        minValue: 0,
        maxValue: 100,
        step: 10,
      },
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Dark Mode',
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-paginated-form-demo',
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
export class PaginatedFormDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'step1',
        type: 'page',
        title: 'Personal Information',
        description: 'Please provide your basic information',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            value: '',
            required: true,
            validationMessages: {
              required: 'First name is required',
            },
            props: {
              placeholder: 'Enter your first name',
            },
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            value: '',
            required: true,
            validationMessages: {
              required: 'Last name is required',
            },
            props: {
              placeholder: 'Enter your last name',
            },
          },
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Date of Birth',
            required: true,
            validationMessages: {
              required: 'Birth date is required',
            },
            props: {
              placeholder: 'Select your birth date',
            },
          },
          {
            type: 'next',
            key: 'step1Next',
            label: 'Continue to Contact Info',
            props: {
              color: 'primary',
            },
          },
        ],
      },
      {
        key: 'step2',
        type: 'page',
        title: 'Contact Information',
        description: 'How can we reach you?',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            value: '',
            required: true,
            email: true,
            validationMessages: {
              required: 'Email is required',
              email: 'Please enter a valid email address',
            },
            props: {
              type: 'email',
              placeholder: 'your.email@example.com',
            },
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone Number',
            value: '',
            required: true,
            validationMessages: {
              required: 'Phone number is required',
            },
            props: {
              type: 'tel',
              placeholder: '+1 (555) 000-0000',
            },
          },
          {
            key: 'contactPreference',
            type: 'radio',
            label: 'Preferred Contact Method',
            value: 'email',
            required: true,
            options: [
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'both', label: 'Either' },
            ],
          },
          {
            type: 'row',
            key: 'step2Buttons',
            fields: [
              {
                type: 'previous',
                key: 'step2Previous',
                label: 'Back',
                col: 6,
              },
              {
                type: 'next',
                key: 'step2Next',
                label: 'Continue to Address',
                col: 6,
                props: {
                  color: 'primary',
                },
              },
            ],
          },
        ],
      },
      {
        key: 'step3',
        type: 'page',
        title: 'Address',
        description: 'Where do you live?',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            value: '',
            required: true,
            validationMessages: {
              required: 'Street address is required',
            },
            props: {
              placeholder: '123 Main Street',
            },
          },
          {
            type: 'row',
            key: 'cityStateRow',
            fields: [
              {
                key: 'city',
                type: 'input',
                label: 'City',
                value: '',
                required: true,
                validationMessages: {
                  required: 'City is required',
                },
                props: {
                  placeholder: 'New York',
                },
                col: 6,
              },
              {
                key: 'state',
                type: 'select',
                label: 'State',
                required: true,
                validationMessages: {
                  required: 'State is required',
                },
                options: [
                  { value: 'ny', label: 'New York' },
                  { value: 'ca', label: 'California' },
                  { value: 'tx', label: 'Texas' },
                  { value: 'fl', label: 'Florida' },
                ],
                props: {
                  placeholder: 'Select state',
                },
                col: 6,
              },
            ],
          },
          {
            key: 'zipCode',
            type: 'input',
            label: 'ZIP Code',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
            validationMessages: {
              required: 'ZIP code is required',
              pattern: 'ZIP code must be 5 digits',
            },
            props: {
              placeholder: '10001',
            },
          },
          {
            type: 'row',
            key: 'step3Buttons',
            fields: [
              {
                type: 'previous',
                key: 'step3Previous',
                label: 'Back',
                col: 6,
              },
              {
                type: 'next',
                key: 'step3Next',
                label: 'Continue to Preferences',
                col: 6,
                props: {
                  color: 'primary',
                },
              },
            ],
          },
        ],
      },
      {
        key: 'step4',
        type: 'page',
        title: 'Preferences',
        description: 'Tell us about your preferences',
        fields: [
          {
            key: 'interests',
            type: 'multi-checkbox',
            label: 'Interests',
            options: [
              { value: 'technology', label: 'Technology' },
              { value: 'sports', label: 'Sports' },
              { value: 'music', label: 'Music' },
              { value: 'travel', label: 'Travel' },
              { value: 'food', label: 'Food & Cooking' },
              { value: 'art', label: 'Art & Design' },
            ],
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Subscribe to newsletter',
            checked: true,
          },
          {
            key: 'notifications',
            type: 'toggle',
            label: 'Enable notifications',
            checked: false,
          },
          {
            key: 'terms',
            type: 'checkbox',
            label: 'I agree to the terms and conditions',
            required: true,
            validationMessages: {
              required: 'You must agree to the terms and conditions',
            },
          },
          {
            type: 'row',
            key: 'step4Buttons',
            fields: [
              {
                type: 'previous',
                key: 'step4Previous',
                label: 'Back',
                col: 6,
              },
              {
                type: 'submit',
                key: 'submit',
                label: 'Complete Registration',
                col: 6,
                props: {
                  color: 'primary',
                },
              },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;
}

import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const paginatedFormScenario: ExampleScenario = {
  id: 'paginated-form',
  title: 'Paginated Form Demo',
  description: 'A multi-step wizard form with page navigation.',
  config: {
    fields: [
      {
        key: 'step1',
        type: 'page',
        fields: [
          {
            key: 'step1Title',
            type: 'text',
            label: 'Personal Information',
            props: {
              elementType: 'h2',
            },
          },
          {
            key: 'step1Description',
            type: 'text',
            label: 'Please provide your basic information',
          },
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
        fields: [
          {
            key: 'step2Title',
            type: 'text',
            label: 'Contact Information',
            props: {
              elementType: 'h2',
            },
          },
          {
            key: 'step2Description',
            type: 'text',
            label: 'How can we reach you?',
          },
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
              },
              {
                type: 'next',
                key: 'step2Next',
                label: 'Continue to Address',
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
        fields: [
          {
            key: 'step3Title',
            type: 'text',
            label: 'Address',
            props: {
              elementType: 'h2',
            },
          },
          {
            key: 'step3Description',
            type: 'text',
            label: 'Where do you live?',
          },
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
              },
              {
                type: 'next',
                key: 'step3Next',
                label: 'Continue to Preferences',
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
        fields: [
          {
            key: 'step4Title',
            type: 'text',
            label: 'Preferences',
            props: {
              elementType: 'h2',
            },
          },
          {
            key: 'step4Description',
            type: 'text',
            label: 'Tell us about your preferences',
          },
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
            value: true,
          },
          {
            key: 'notifications',
            type: 'toggle',
            label: 'Enable notifications',
            value: false,
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
              },
              {
                type: 'submit',
                key: 'submit',
                label: 'Complete Registration',
                props: {
                  color: 'primary',
                },
              },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig,
};

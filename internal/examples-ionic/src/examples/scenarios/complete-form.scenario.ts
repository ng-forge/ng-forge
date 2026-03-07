import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const completeFormScenario: ExampleScenario = {
  id: 'complete-form',
  title: 'Complete Form',
  description: 'Full user registration form',
  config: {
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
        label: 'Raw ng-forge form without custom styling - showing Ionic integration',
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
          minLength: 'Must be at least {{requiredLength}} characters',
        },
        props: {
          placeholder: 'Enter your first name',
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
          minLength: 'Must be at least {{requiredLength}} characters',
        },
        props: {
          placeholder: 'Enter your last name',
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
          hint: 'We will never share your email',
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
          min: 'Must be at least {{min}}',
          max: 'Must not exceed {{max}}',
        },
        props: {
          type: 'number',
          placeholder: '18',
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
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        props: {
          placeholder: 'Tell us about yourself',
          hint: 'Optional - share a bit about yourself',
          rows: 4,
          autoGrow: true,
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          labelPlacement: 'end',
        },
      },

      // Submit button
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: {
          color: 'primary',
          expand: 'block',
        },
      },
    ],
  } as const satisfies FormConfig,
};

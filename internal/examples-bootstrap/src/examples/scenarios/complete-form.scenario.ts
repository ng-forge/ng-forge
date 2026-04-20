import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const completeFormScenario: ExampleScenario = {
  id: 'complete-form',
  title: 'Complete Form Demo',
  description: 'A comprehensive form demonstrating all field types with Bootstrap styling.',
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
          minLength: 'Must be at least {{requiredLength}} characters',
        },
        placeholder: 'Enter your first name',
        props: {
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
          minLength: 'Must be at least {{requiredLength}} characters',
        },
        placeholder: 'Enter your last name',
        props: {
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
        placeholder: 'user@example.com',
        props: {
          type: 'email',
          floatingLabel: true,
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
        placeholder: '18',
        props: {
          type: 'number',
          floatingLabel: true,
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
        placeholder: 'Select your country',
        props: {
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
        placeholder: 'Choose a plan',
        props: {
          floatingLabel: true,
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        placeholder: 'Tell us about yourself',
        props: {
          floatingLabel: true,
          hint: 'Optional - share a bit about yourself',
          rows: 4,
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          switch: true,
          hint: 'Get updates about new features and special offers',
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
  } as const satisfies FormConfig,
};

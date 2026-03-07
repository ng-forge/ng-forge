import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const completeFormScenario: ExampleScenario = {
  id: 'complete-form',
  title: 'Complete Form Demo',
  description: 'A comprehensive form demonstrating all field types.',
  config: {
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Contact Us',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'subtitle',
        type: 'text',
        label: "Fill out the form below and we'll get back to you as soon as possible",
      },
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
          maxLength: 'Must not exceed 500 characters',
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
  } as const satisfies FormConfig,
};

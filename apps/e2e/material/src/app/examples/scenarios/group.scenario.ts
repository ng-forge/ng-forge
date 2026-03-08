import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const groupScenario: ExampleScenario = {
  id: 'group',
  title: 'Group Demo',
  description: 'Demonstrates nested form groups for structured data.',
  config: {
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'User Profile',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        value: '',
        required: true,
        props: {
          placeholder: 'Enter your full name',
        },
      },
      {
        key: 'address',
        type: 'group',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            value: '',
            required: true,
            props: {
              placeholder: '123 Main St',
            },
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            value: '',
            required: true,
            props: {
              placeholder: 'Springfield',
            },
          },
          {
            key: 'state',
            type: 'input',
            label: 'State',
            value: '',
            required: true,
            maxLength: 2,
            validationMessages: {
              maxLength: 'State abbreviation must be 2 characters',
            },
            props: {
              placeholder: 'IL',
              hint: 'Enter 2-letter state abbreviation',
            },
          },
          {
            key: 'zip',
            type: 'input',
            label: 'ZIP Code',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
            validationMessages: {
              pattern: 'Please enter a valid 5-digit ZIP code',
            },
            props: {
              placeholder: '62701',
            },
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Save Profile',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig,
};

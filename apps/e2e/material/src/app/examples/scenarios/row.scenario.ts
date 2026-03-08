import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const rowScenario: ExampleScenario = {
  id: 'row',
  title: 'Row Demo',
  description: 'Demonstrates row layout for side-by-side fields.',
  config: {
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Contact Form',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'nameRow',
        type: 'row',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            value: '',
            required: true,
            col: 6,
            props: {
              placeholder: 'John',
            },
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            value: '',
            required: true,
            col: 6,
            props: {
              placeholder: 'Doe',
            },
          },
        ],
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        value: '',
        required: true,
        email: true,
        props: {
          type: 'email',
          placeholder: 'john.doe@example.com',
        },
      },
      {
        key: 'addressRow',
        type: 'row',
        fields: [
          {
            key: 'city',
            type: 'input',
            label: 'City',
            value: '',
            required: true,
            col: 6,
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
            col: 3,
            validationMessages: {
              maxLength: 'Use 2-letter abbreviation',
            },
            props: {
              placeholder: 'IL',
            },
          },
          {
            key: 'zip',
            type: 'input',
            label: 'ZIP',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
            col: 3,
            validationMessages: {
              pattern: 'Must be 5 digits',
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
        label: 'Submit',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig,
};

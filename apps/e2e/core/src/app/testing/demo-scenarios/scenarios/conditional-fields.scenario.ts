import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      props: {
        type: 'number',
        placeholder: 'Enter your age',
      },
      required: true,
    },
    {
      key: 'guardianConsent',
      type: 'checkbox',
      label: 'Guardian Consent Required',
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { value: '', label: 'Select a country' },
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
      ],
      required: true,
    },
    {
      key: 'state',
      type: 'select',
      label: 'State/Province',
      options: [
        { value: 'ca', label: 'California' },
        { value: 'ny', label: 'New York' },
        { value: 'tx', label: 'Texas' },
      ],
    },
    {
      key: 'city',
      type: 'input',
      label: 'City',
      props: {
        placeholder: 'Enter city',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const conditionalFieldsScenario: TestScenario = {
  testId: 'conditional-fields',
  title: 'Conditional Fields',
  description: 'Tests conditional field visibility and state management based on form inputs',
  config,
};

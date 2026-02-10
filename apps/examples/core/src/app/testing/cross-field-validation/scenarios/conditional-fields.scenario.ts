import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    pattern: 'Invalid ZIP code format',
  },
  fields: [
    {
      key: 'hasAddress',
      type: 'checkbox',
      label: 'I have a different billing address',
      col: 12,
    },
    {
      key: 'streetAddress',
      type: 'input',
      label: 'Street Address',
      props: {
        placeholder: 'Enter street address',
      },
      col: 12,
    },
    {
      key: 'city',
      type: 'input',
      label: 'City',
      props: {
        placeholder: 'Enter city',
      },
      col: 6,
    },
    {
      key: 'zipCode',
      type: 'input',
      label: 'ZIP Code',
      props: {
        placeholder: 'Enter ZIP code',
      },
      pattern: '^[0-9]{5}(-[0-9]{4})?$',
      col: 6,
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'mx', label: 'Mexico' },
        { value: 'other', label: 'Other' },
      ],
      col: 12,
    },
    {
      key: 'submitConditional',
      type: 'submit',
      label: 'Submit Address',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const conditionalFieldsScenario: TestScenario = {
  testId: 'conditional-validation',
  title: 'Conditional Field Validation',
  description: 'Tests conditional field requirements based on checkbox selection',
  config,
};

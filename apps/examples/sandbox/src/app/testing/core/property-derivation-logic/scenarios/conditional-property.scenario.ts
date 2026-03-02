import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'accountType',
      type: 'select',
      label: 'Account Type',
      value: 'personal',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
      ],
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: '',
      col: 6,
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'label',
          value: 'Personal Email',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'personal',
          },
        },
        {
          type: 'propertyDerivation',
          targetProperty: 'label',
          value: 'Work Email',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const conditionalPropertyScenario: TestScenario = {
  testId: 'conditional-property-test',
  title: 'Conditional Static Property Derivation',
  description: 'Tests deriving field labels from static values based on conditions',
  config,
};

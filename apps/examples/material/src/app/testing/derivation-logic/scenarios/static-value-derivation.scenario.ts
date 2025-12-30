import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      value: '',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Germany', value: 'DE' },
        { label: 'Japan', value: 'JP' },
      ],
      col: 6,
      logic: [
        {
          type: 'derivation',
          targetField: 'phonePrefix',
          value: '+1',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'US',
          },
        },
        {
          type: 'derivation',
          targetField: 'phonePrefix',
          value: '+44',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'UK',
          },
        },
        {
          type: 'derivation',
          targetField: 'phonePrefix',
          value: '+49',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'DE',
          },
        },
        {
          type: 'derivation',
          targetField: 'phonePrefix',
          value: '+81',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'JP',
          },
        },
        {
          type: 'derivation',
          targetField: 'currency',
          value: 'USD',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'US',
          },
        },
        {
          type: 'derivation',
          targetField: 'currency',
          value: 'GBP',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'UK',
          },
        },
        {
          type: 'derivation',
          targetField: 'currency',
          value: 'EUR',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'DE',
          },
        },
        {
          type: 'derivation',
          targetField: 'currency',
          value: 'JPY',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'JP',
          },
        },
      ],
    },
    {
      key: 'phonePrefix',
      type: 'input',
      label: 'Phone Prefix',
      value: '',
      readonly: true,
      col: 6,
    },
    {
      key: 'currency',
      type: 'input',
      label: 'Currency',
      value: '',
      readonly: true,
      col: 6,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const staticValueDerivationScenario: TestScenario = {
  testId: 'static-value-derivation-test',
  title: 'Static Value Derivation',
  description: 'Tests deriving static values based on another field selection (e.g., phone prefix and currency from country)',
  config,
};

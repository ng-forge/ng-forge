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
      ],
      col: 6,
    },
    {
      key: 'phonePrefix',
      type: 'input',
      label: 'Phone Prefix',
      col: 6,
      logic: [
        {
          type: 'derivation',
          value: '+1',
          condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' },
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
          dependsOn: ['country'],
        },
        {
          type: 'derivation',
          value: '+44',
          condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'UK' },
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
          dependsOn: ['country'],
        },
        {
          type: 'derivation',
          value: '+49',
          condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'DE' },
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
          dependsOn: ['country'],
        },
      ],
    },
    {
      key: 'permanentPrefix',
      type: 'input',
      label: 'Permanent Prefix',
      col: 6,
      logic: [
        {
          type: 'derivation',
          value: '+1',
          condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' },
          stopOnUserOverride: true,
          dependsOn: ['country'],
        },
        {
          type: 'derivation',
          value: '+44',
          condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'UK' },
          stopOnUserOverride: true,
          dependsOn: ['country'],
        },
        {
          type: 'derivation',
          value: '+49',
          condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'DE' },
          stopOnUserOverride: true,
          dependsOn: ['country'],
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

export const reEngageOnDependencyChangeScenario: TestScenario = {
  testId: 're-engage-on-dependency-change-test',
  title: 'Re-engage On Dependency Change',
  description: 'Tests that derivation re-engages when a dependency changes after user override',
  config,
};

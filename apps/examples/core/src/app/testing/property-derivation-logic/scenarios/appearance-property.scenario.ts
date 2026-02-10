import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'style',
      type: 'select',
      label: 'Form Style',
      value: 'modern',
      options: [
        { label: 'Modern', value: 'modern' },
        { label: 'Classic', value: 'classic' },
      ],
      col: 6,
    },
    {
      key: 'notes',
      type: 'textarea',
      label: 'Notes',
      value: '',
      col: 6,
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'props.appearance',
          value: 'outline',
          condition: {
            type: 'fieldValue',
            fieldPath: 'style',
            operator: 'equals',
            value: 'modern',
          },
        },
        {
          type: 'propertyDerivation',
          targetProperty: 'props.appearance',
          value: 'fill',
          condition: {
            type: 'fieldValue',
            fieldPath: 'style',
            operator: 'equals',
            value: 'classic',
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

export const appearancePropertyScenario: TestScenario = {
  testId: 'appearance-property-test',
  title: 'Nested Property Derivation (props.appearance)',
  description: 'Tests deriving Material form field appearance via dot notation (props.appearance)',
  config,
};

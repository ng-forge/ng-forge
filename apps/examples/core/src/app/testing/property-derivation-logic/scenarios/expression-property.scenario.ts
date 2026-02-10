import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'department',
      type: 'select',
      label: 'Department',
      value: 'Engineering',
      options: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Design', value: 'Design' },
      ],
      col: 6,
    },
    {
      key: 'title',
      type: 'input',
      label: 'Job Title',
      value: '',
      col: 6,
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'label',
          expression: '"Job Title (" + formValue.department + ")"',
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

export const expressionPropertyScenario: TestScenario = {
  testId: 'expression-property-test',
  title: 'Expression-Based Property Derivation',
  description: 'Tests deriving field labels using JavaScript expressions with string concatenation',
  config,
};

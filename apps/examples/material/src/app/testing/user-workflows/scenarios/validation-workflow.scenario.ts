import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      minLength: 3,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      email: true,
      props: {
        type: 'email',
      },
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      min: 18,
      max: 120,
      props: {
        type: 'number',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const validationWorkflowScenario: TestScenario = {
  testId: 'validation-workflow',
  title: 'Multi-Field Validation Workflow',
  description: 'Tests multi-field validation with various constraints',
  config,
};

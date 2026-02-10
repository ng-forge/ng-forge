import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
    min: 'Value must be at least {{min}}',
    max: 'Value must be at most {{max}}',
  },
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

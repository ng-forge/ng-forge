import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      props: {
        type: 'email',
      },
    },
    {
      key: 'priority',
      type: 'radio',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const basicTestScenario: TestScenario = {
  testId: 'basic-test',
  title: 'Basic Form Test',
  description: 'Tests basic form functionality with standard field types',
  config,
};

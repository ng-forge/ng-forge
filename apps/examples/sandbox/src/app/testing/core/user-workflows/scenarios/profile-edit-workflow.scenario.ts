import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: 'John',
      required: true,
      col: 6,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: 'Doe',
      required: true,
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: 'john.doe@example.com',
      required: true,
      email: true,
      props: {
        type: 'email',
      },
    },
    {
      key: 'bio',
      type: 'textarea',
      label: 'Bio',
      value: 'Software engineer',
      props: {
        rows: 4,
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Save Changes',
    },
  ],
} as const satisfies FormConfig;

export const profileEditWorkflowScenario: TestScenario = {
  testId: 'profile-edit',
  title: 'Profile Edit Workflow',
  description: 'Tests profile editing with pre-filled values',
  config,
};

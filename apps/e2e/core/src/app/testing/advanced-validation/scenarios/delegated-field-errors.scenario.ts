import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * A leaf field wrapped by `field-errors` (#568 follow-up). The wrapper claims error
 * display, so the field component renders none of its own and the message appears once.
 * `email` is the control: same error, no wrapper, rendered by the field component.
 */
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      value: '',
      required: true,
      wrappers: [{ type: 'field-errors' }],
      validationMessages: { required: 'Username is required.' },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: '',
      required: true,
      validationMessages: { required: 'Email is required.' },
    },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

export const delegatedFieldErrorsScenario: TestScenario = {
  testId: 'delegated-field-errors-test',
  title: 'Delegated Field Errors',
  description: 'A leaf field whose errors are rendered by the field-errors wrapper rather than the field component',
  config,
};

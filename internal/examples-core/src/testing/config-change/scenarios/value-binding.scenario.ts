import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests that programmatically setting the [(value)] two-way binding
 * updates the form fields, and that config changes reflect correct values.
 */

export const valueBindingConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      props: {
        placeholder: 'Enter first name',
      },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      props: {
        placeholder: 'Enter last name',
      },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
        placeholder: 'Enter email',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const presetValueA: Record<string, unknown> = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
};

export const presetValueB: Record<string, unknown> = {
  firstName: 'Bob',
  lastName: 'Builder',
  email: 'bob@example.com',
};

export const valueBindingScenario: TestScenario = {
  testId: 'value-binding',
  title: 'Value Two-Way Binding',
  description: 'Programmatically set [(value)] and verify form fields update',
  config: valueBindingConfig,
};

import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Form configs for testing reactive config changes.
 * Used to test adding, removing, and reordering fields at runtime.
 */
export const reactiveConfigVariants = {
  /** Initial config with firstName, lastName, email */
  initial: {
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
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig,

  /** Config with an extra phone field added */
  withExtraField: {
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
        key: 'phone',
        type: 'input',
        label: 'Phone',
        props: {
          type: 'tel',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig,

  /** Config with email field removed */
  withFieldRemoved: {
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
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig,

  /** Config with fields in different order: email, firstName, lastName */
  reordered: {
    fields: [
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
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig,
};

/**
 * Reactive Config Changes Test Scenario
 * Tests dynamic config changes including adding, removing, and reordering fields.
 *
 * Note: This scenario requires a custom component that allows switching configs at runtime.
 */
export const reactiveConfigChangesScenario: TestScenario = {
  testId: 'reactive-config-changes',
  title: 'Reactive Config Changes',
  description: 'Tests adding, removing, and reordering fields at runtime without NG01902 errors',
  config: reactiveConfigVariants.initial,
};

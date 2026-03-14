import { FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: 'Default Name',
      props: { placeholder: 'Enter name' },
    },
    {
      key: 'address',
      type: 'group',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          value: '123 Main St',
          props: { placeholder: 'Enter street' },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          value: 'Springfield',
          props: { placeholder: 'Enter city' },
        },
      ],
    },
    {
      key: 'reset-button',
      type: 'button',
      label: 'Reset',
      event: FormResetEvent,
      props: {
        type: 'button',
      },
      col: 6,
    },
    {
      key: 'clear-button',
      type: 'button',
      label: 'Clear',
      event: FormClearEvent,
      props: {
        type: 'button',
      },
      col: 6,
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

export const resetWithGroupsScenario: TestScenario = {
  testId: 'reset-with-groups',
  title: 'Reset Form with Groups',
  description: 'Tests that reset restores group field values to their defaults',
  config,
};

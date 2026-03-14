import { FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'title',
      type: 'input',
      label: 'Title',
      value: 'Default Title',
      props: { placeholder: 'Enter title' },
    },
    {
      key: 'tags',
      type: 'array',
      fields: [
        [
          {
            key: 'tag',
            type: 'input',
            label: 'Tag',
            value: 'initial-tag',
            props: { placeholder: 'Enter tag' },
          },
        ],
      ],
    },
    {
      key: 'addTag',
      type: 'addArrayItem',
      arrayKey: 'tags',
      label: 'Add Tag',
      template: [
        {
          key: 'tag',
          type: 'input',
          label: 'Tag',
          props: { placeholder: 'Enter tag' },
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

export const resetWithArraysScenario: TestScenario = {
  testId: 'reset-with-arrays',
  title: 'Reset Form with Arrays',
  description: 'Tests that reset restores array fields to their initial state',
  config,
};

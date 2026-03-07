import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'notes',
      type: 'array',
      fields: [
        [
          {
            key: 'noteRow',
            type: 'row',
            fields: [
              {
                key: 'note',
                type: 'input',
                label: 'Note',
                value: 'First note',
              },
              {
                key: 'removeNoteButton',
                type: 'removeArrayItem',
                label: 'Remove',
                className: 'array-remove-button',
              },
            ],
          },
        ],
        [
          {
            key: 'noteRow',
            type: 'row',
            fields: [
              {
                key: 'note',
                type: 'input',
                label: 'Note',
                value: 'Second note',
              },
              {
                key: 'removeNoteButton',
                type: 'removeArrayItem',
                label: 'Remove',
                className: 'array-remove-button',
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addNoteButton',
      type: 'addArrayItem',
      arrayKey: 'notes',
      label: 'Add Note',
      className: 'array-add-button',
      template: [
        {
          key: 'noteRow',
          type: 'row',
          fields: [
            {
              key: 'note',
              type: 'input',
              label: 'Note',
            },
            {
              key: 'removeNoteButton',
              type: 'removeArrayItem',
              label: 'Remove',
              className: 'array-remove-button',
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayMultipleOpsScenario: TestScenario = {
  testId: 'array-multiple-ops',
  title: 'Multiple Operations',
  description: 'Test multiple array operations (add and remove) together',
  config,
};

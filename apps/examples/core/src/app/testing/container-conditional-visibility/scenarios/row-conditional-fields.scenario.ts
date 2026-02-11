import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'optionsRow',
      type: 'row',
      fields: [
        {
          key: 'hasMiddleName',
          type: 'checkbox',
          label: 'Has Middle Name',
          col: 6,
          value: false,
        },
        {
          key: 'hasNickname',
          type: 'checkbox',
          label: 'Has Nickname',
          col: 6,
          value: false,
        },
      ],
    },
    {
      key: 'namesRow',
      type: 'row',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 4,
          props: {
            placeholder: 'Enter first name',
          },
        },
        {
          key: 'middleName',
          type: 'input',
          label: 'Middle Name',
          col: 4,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'hasMiddleName',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter middle name',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 4,
          props: {
            placeholder: 'Enter last name',
          },
        },
      ],
    },
    {
      key: 'nicknameRow',
      type: 'row',
      fields: [
        {
          key: 'nickname',
          type: 'input',
          label: 'Nickname',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'hasNickname',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter nickname',
          },
        },
        {
          key: 'preferredName',
          type: 'select',
          label: 'Preferred Name',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'hasNickname',
                operator: 'equals',
                value: false,
              },
            },
          ],
          options: [
            { value: 'first', label: 'First Name' },
            { value: 'nickname', label: 'Nickname' },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const rowConditionalFieldsScenario: TestScenario = {
  testId: 'row-conditional-fields',
  title: 'Row with Conditional Fields',
  description: 'Verify that individual fields inside a row can have their own visibility logic',
  config,
};

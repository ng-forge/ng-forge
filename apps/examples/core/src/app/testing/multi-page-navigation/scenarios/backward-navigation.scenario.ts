import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        {
          key: 'step-1-title',
          type: 'text',
          label: 'Step 1',
          col: 12,
        },
        {
          key: 'field1',
          type: 'input',
          label: 'Field 1',
          props: {
            placeholder: 'Enter data for step 1',
          },
          col: 12,
        },
        {
          key: 'nextToPage2',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        {
          key: 'page2-title',
          type: 'text',
          label: 'Step 2',
          col: 12,
        },
        {
          key: 'field2',
          type: 'input',
          label: 'Field 2',
          props: {
            placeholder: 'Enter data for step 2',
          },
          col: 12,
        },
        {
          key: 'previousToPage1',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToPage3',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    {
      key: 'page3',
      type: 'page',
      fields: [
        {
          key: 'page-3-title',
          type: 'text',
          label: 'Step 3',
          col: 12,
        },
        {
          key: 'field3',
          type: 'input',
          label: 'Field 3',
          props: {
            placeholder: 'Enter data for step 3',
          },
          col: 12,
        },
        {
          key: 'previousToPage2',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitBackward',
          type: 'submit',
          label: 'Submit',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const backwardNavigationScenario: TestScenario = {
  testId: 'backward-navigation',
  title: 'Backward Navigation Test',
  description: 'Tests ability to navigate backwards through multi-page form',
  config,
};

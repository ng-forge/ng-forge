import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'loadingPage1',
      type: 'page',
      fields: [
        {
          key: 'loadingPage1-title',
          type: 'text',
          label: 'Page 1',
          col: 12,
        },
        {
          key: 'data1',
          type: 'textarea',
          label: 'Large Data Field',
          props: {
            placeholder: 'Enter large amount of data',
            rows: 5,
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
      key: 'loadingPage2',
      type: 'page',
      fields: [
        {
          key: 'loadingPage2-title',
          type: 'text',
          label: 'Page 2',
          col: 12,
        },
        {
          key: 'data2',
          type: 'textarea',
          label: 'More Data',
          props: {
            placeholder: 'Enter more data',
            rows: 5,
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
          key: 'submitTransition',
          type: 'submit',
          label: 'Submit',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const pageTransitionsScenario: TestScenario = {
  testId: 'page-transitions',
  title: 'Page Transition Testing',
  description: 'Tests smooth transitions between pages with large data sets',
  config,
};

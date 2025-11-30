import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'intro',
      type: 'page',
      fields: [
        {
          key: 'intro-title',
          type: 'text',
          label: 'Introduction',
          col: 12,
        },
        {
          key: 'introText',
          type: 'input',
          label: 'Introduction',
          props: {
            placeholder: 'Introduction text',
          },
          col: 12,
        },
        {
          key: 'nextToDetails',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    {
      key: 'details',
      type: 'page',
      fields: [
        {
          key: 'details-text',
          type: 'text',
          label: 'Details',
          col: 12,
        },
        {
          key: 'detailText',
          type: 'input',
          label: 'Details',
          props: {
            placeholder: 'Detail text',
          },
          col: 12,
        },
        {
          key: 'previousToIntro',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToSummary',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    {
      key: 'summary',
      type: 'page',
      fields: [
        {
          key: 'summary-title',
          type: 'text',
          label: 'Summary',
          col: 12,
        },
        {
          key: 'summaryText',
          type: 'input',
          label: 'Summary',
          props: {
            placeholder: 'Summary text',
          },
          col: 12,
        },
        {
          key: 'previousToDetails',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitDirect',
          type: 'submit',
          label: 'Submit',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const directNavigationScenario: TestScenario = {
  testId: 'direct-navigation',
  title: 'Direct Page Navigation',
  description: 'Tests ability to jump directly to specific pages',
  config,
};

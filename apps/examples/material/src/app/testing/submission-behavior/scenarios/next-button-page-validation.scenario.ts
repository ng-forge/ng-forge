import { TestScenario } from '../../shared/types';

/**
 * Next Button Page Validation Scenario
 * Tests that next button is disabled when current page is invalid
 */
export const nextButtonPageValidationScenario: TestScenario = {
  testId: 'next-button-page-validation',
  title: 'Next Button Page Validation',
  description:
    'Tests that the next button is disabled when the current page has invalid fields. Fill the required field on page 1 to enable the next button.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'page1',
        type: 'page',
        fields: [
          {
            key: 'page1Title',
            type: 'text',
            label: 'Page 1 - Required Field',
            col: 12,
          },
          {
            key: 'requiredField',
            type: 'input',
            label: 'Required Field',
            props: { placeholder: 'Fill this to enable Next button' },
            required: true,
            col: 12,
          },
          {
            key: 'nextToPage2',
            type: 'next',
            label: 'Next (disabled when page invalid)',
            col: 12,
          },
        ],
      },
      {
        key: 'page2',
        type: 'page',
        fields: [
          {
            key: 'page2Title',
            type: 'text',
            label: 'Page 2 - You made it!',
            col: 12,
          },
          {
            key: 'optionalField',
            type: 'input',
            label: 'Optional Field',
            props: { placeholder: 'This is optional' },
            col: 12,
          },
          {
            key: 'previousToPage1',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitPageValidation',
            type: 'submit',
            label: 'Submit',
            col: 6,
          },
        ],
      },
    ],
  },
  initialValue: {},
};

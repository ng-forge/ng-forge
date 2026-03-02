import { TestScenario } from '../../shared/types';

/**
 * Next Button Never Disabled Scenario
 * Tests that form options can disable the page validation behavior
 */
export const nextButtonNeverDisabledScenario: TestScenario = {
  testId: 'next-button-never-disabled',
  title: 'Next Button Never Auto-Disabled',
  description:
    'Tests that form options can disable the page validation behavior. This next button should never be auto-disabled based on page validity.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'page1b',
        type: 'page',
        fields: [
          {
            key: 'page1bTitle',
            type: 'text',
            label: 'Page 1 - Next Always Enabled',
            col: 12,
          },
          {
            key: 'requiredField2',
            type: 'input',
            label: 'Required Field (but next still enabled)',
            props: { placeholder: 'This is required but next stays enabled' },
            required: true,
            col: 12,
          },
          {
            key: 'nextToPage2b',
            type: 'next',
            label: 'Next (never auto-disabled)',
            col: 12,
          },
        ],
      },
      {
        key: 'page2b',
        type: 'page',
        fields: [
          {
            key: 'page2bTitle',
            type: 'text',
            label: 'Page 2 - You made it (even with invalid page 1)!',
            col: 12,
          },
          {
            key: 'previousToPage1b',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitNeverDisabled',
            type: 'submit',
            label: 'Submit',
            col: 6,
          },
        ],
      },
    ],
    options: {
      nextButton: {
        disableWhenPageInvalid: false,
      },
    },
  },
  initialValue: {},
};

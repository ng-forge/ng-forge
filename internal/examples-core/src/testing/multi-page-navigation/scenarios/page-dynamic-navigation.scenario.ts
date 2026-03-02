import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test dynamic page navigation with multiple conditional pages.
 * This test verifies that navigation correctly skips hidden pages
 * and the page sequence adjusts based on user selections.
 */
const config = {
  fields: [
    // Page 1: Survey Type Selection
    {
      key: 'surveyTypePage',
      type: 'page',
      fields: [
        {
          key: 'surveyTypeTitle',
          type: 'text',
          label: 'Survey Type Selection',
          col: 12,
        },
        {
          key: 'surveyType',
          type: 'radio',
          label: 'What type of survey would you like to complete?',
          options: [
            { value: 'quick', label: 'Quick Survey (2 pages)' },
            { value: 'standard', label: 'Standard Survey (3 pages)' },
            { value: 'detailed', label: 'Detailed Survey (4 pages)' },
          ],
          value: 'quick',
          col: 12,
        },
        {
          key: 'respondentName',
          type: 'input',
          label: 'Your Name',
          props: {
            placeholder: 'Enter your name',
          },
          col: 12,
        },
        {
          key: 'nextFromSurveyType',
          type: 'next',
          label: 'Start Survey',
          col: 12,
        },
      ],
    },
    // Page 2: Basic Questions (always shown)
    {
      key: 'basicQuestionsPage',
      type: 'page',
      fields: [
        {
          key: 'basicQuestionsTitle',
          type: 'text',
          label: 'Basic Questions',
          col: 12,
        },
        {
          key: 'satisfaction',
          type: 'slider',
          label: 'Overall Satisfaction (1-10)',
          minValue: 1,
          maxValue: 10,
          step: 1,
          value: 5,
          col: 12,
        },
        {
          key: 'recommend',
          type: 'radio',
          label: 'Would you recommend us?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'maybe', label: 'Maybe' },
          ],
          col: 12,
        },
        {
          key: 'previousToSurveyType',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextFromBasicQuestions',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Detailed Questions (shown for standard and detailed)
    {
      key: 'detailedQuestionsPage',
      type: 'page',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'surveyType',
            operator: 'equals',
            value: 'quick',
          },
        },
      ],
      fields: [
        {
          key: 'detailedQuestionsTitle',
          type: 'text',
          label: 'Detailed Questions',
          col: 12,
        },
        {
          key: 'usageFrequency',
          type: 'select',
          label: 'How often do you use our product?',
          options: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'rarely', label: 'Rarely' },
          ],
          col: 12,
        },
        {
          key: 'favoriteFeature',
          type: 'input',
          label: 'What is your favorite feature?',
          props: {
            placeholder: 'Enter your favorite feature',
          },
          col: 12,
        },
        {
          key: 'previousFromDetailed',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextFromDetailed',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 4: In-Depth Questions (shown only for detailed)
    {
      key: 'inDepthQuestionsPage',
      type: 'page',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'surveyType',
            operator: 'notEquals',
            value: 'detailed',
          },
        },
      ],
      fields: [
        {
          key: 'inDepthQuestionsTitle',
          type: 'text',
          label: 'In-Depth Questions',
          col: 12,
        },
        {
          key: 'improvementSuggestion',
          type: 'textarea',
          label: 'What improvements would you suggest?',
          props: {
            placeholder: 'Enter your suggestions',
            rows: 4,
          },
          col: 12,
        },
        {
          key: 'competitorComparison',
          type: 'radio',
          label: 'How do we compare to competitors?',
          options: [
            { value: 'better', label: 'Better' },
            { value: 'same', label: 'About the Same' },
            { value: 'worse', label: 'Worse' },
          ],
          col: 12,
        },
        {
          key: 'previousFromInDepth',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextFromInDepth',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 5: Summary (always shown as last page)
    {
      key: 'summaryPage',
      type: 'page',
      fields: [
        {
          key: 'summaryTitle',
          type: 'text',
          label: 'Survey Complete',
          col: 12,
        },
        {
          key: 'additionalComments',
          type: 'textarea',
          label: 'Any additional comments?',
          props: {
            placeholder: 'Optional additional comments',
            rows: 3,
          },
          col: 12,
        },
        {
          key: 'contactPermission',
          type: 'checkbox',
          label: 'May we contact you for follow-up?',
          col: 12,
        },
        {
          key: 'previousFromSummary',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitSurvey',
          type: 'submit',
          label: 'Submit Survey',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const pageDynamicNavigationScenario: TestScenario = {
  testId: 'page-dynamic-navigation',
  title: 'Page Dynamic Navigation',
  description: 'Tests dynamic page navigation where the number of visible pages depends on survey type selection',
  config,
};

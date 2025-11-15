import { FormConfig } from '@ng-forge/dynamic-form';

export const surveyConfig = {
  fields: [
    {
      key: 'introPage',
      type: 'page',
      fields: [
        {
          key: 'introTitle',
          type: 'text',
          label: 'Customer Survey',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'introDescription',
          type: 'text',
          label: 'Help us improve our service',
          col: 12,
        },
        {
          key: 'customerType',
          type: 'radio',
          label: 'What best describes you?',
          options: [
            { value: 'new', label: 'New Customer' },
            { value: 'returning', label: 'Returning Customer' },
            { value: 'business', label: 'Business Customer' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'visitFrequency',
          type: 'select',
          label: 'How often do you visit us?',
          options: [
            { value: 'first', label: 'This is my first visit' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'rarely', label: 'Rarely' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'nextToExperience',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    {
      key: 'experiencePage',
      type: 'page',
      fields: [
        {
          key: 'experienceTitle',
          type: 'text',
          label: 'Your Experience',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'experienceDescription',
          type: 'text',
          label: 'Rate your experience with us',
          col: 12,
        },
        {
          key: 'satisfaction',
          type: 'radio',
          label: 'Overall Satisfaction',
          options: [
            { value: '5', label: 'Very Satisfied' },
            { value: '4', label: 'Satisfied' },
            { value: '3', label: 'Neutral' },
            { value: '2', label: 'Dissatisfied' },
            { value: '1', label: 'Very Dissatisfied' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'recommend',
          type: 'radio',
          label: 'Would you recommend us?',
          options: [
            { value: 'yes', label: 'Yes, definitely' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'no', label: 'No' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'recommend-actions',
          type: 'row',
          fields: [
            {
              key: 'previousToIntro',
              type: 'previous',
              label: 'Previous',
              col: 6,
            },
            {
              key: 'nextToFeedback',
              type: 'next',
              label: 'Next',
              col: 6,
            },
          ],
        },
      ],
    },
    {
      key: 'feedbackPage',
      type: 'page',
      fields: [
        {
          key: 'feedbackTitle',
          type: 'text',
          label: 'Feedback',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'feedbackDescription',
          type: 'text',
          label: 'Share your thoughts',
          col: 12,
        },
        {
          key: 'improvements',
          type: 'textarea',
          label: 'What could we improve?',
          props: { rows: 4 },
          col: 12,
        },
        {
          key: 'favoriteFeature',
          type: 'textarea',
          label: 'What do you like most?',
          props: { rows: 3 },
          col: 12,
        },
        {
          key: 'contactPermission',
          type: 'checkbox',
          label: 'May we contact you about this feedback?',
          col: 12,
        },
        {
          key: 'previousToExperience',
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

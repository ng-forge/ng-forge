import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    // Page 1: Introduction & Demographics
    {
      key: 'introPage',
      type: 'page',
      fields: [
        {
          key: 'intro-page-title',
          type: 'text',
          label: 'Customer Satisfaction Survey',
          col: 12,
        },
        {
          key: 'intro-page-description',
          type: 'text',
          label: 'Help us improve by sharing your feedback',
          col: 12,
        },
        {
          key: 'participantType',
          type: 'radio',
          label: 'What best describes you?',
          options: [
            { value: 'new_customer', label: 'New Customer (< 6 months)' },
            { value: 'regular_customer', label: 'Regular Customer (6+ months)' },
            { value: 'business_customer', label: 'Business Customer' },
            { value: 'non_customer', label: 'Not Currently a Customer' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'ageGroup',
          type: 'select',
          label: 'Age Group',
          options: [
            { value: '18-24', label: '18-24' },
            { value: '25-34', label: '25-34' },
            { value: '35-44', label: '35-44' },
            { value: '45-54', label: '45-54' },
            { value: '55-64', label: '55-64' },
            { value: '65+', label: '65+' },
          ],
          required: true,
          col: 6,
        },
        {
          key: 'region',
          type: 'select',
          label: 'Region',
          options: [
            { value: 'north', label: 'North America' },
            { value: 'europe', label: 'Europe' },
            { value: 'asia', label: 'Asia Pacific' },
            { value: 'other', label: 'Other' },
          ],
          required: true,
          col: 6,
        },
        {
          key: 'nextToExperiencePage',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Product/Service Experience
    {
      key: 'experiencePage',
      type: 'page',
      fields: [
        {
          key: 'experience-page-title',
          type: 'text',
          label: 'Your Experience',
          col: 12,
        },
        {
          key: 'experience-page-description',
          type: 'text',
          label: 'Tell us about your experience with our products/services',
          col: 12,
        },
        {
          key: 'overallSatisfaction',
          type: 'radio',
          label: 'Overall Satisfaction',
          options: [
            { value: 'very_satisfied', label: 'Very Satisfied' },
            { value: 'satisfied', label: 'Satisfied' },
            { value: 'neutral', label: 'Neutral' },
            { value: 'dissatisfied', label: 'Dissatisfied' },
            { value: 'very_dissatisfied', label: 'Very Dissatisfied' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'productQuality',
          type: 'radio',
          label: 'Product Quality Rating',
          options: [
            { value: '5', label: 'Excellent' },
            { value: '4', label: 'Good' },
            { value: '3', label: 'Average' },
            { value: '2', label: 'Poor' },
            { value: '1', label: 'Very Poor' },
          ],
          required: true,
          col: 6,
        },
        {
          key: 'customerService',
          type: 'radio',
          label: 'Customer Service Rating',
          options: [
            { value: '5', label: 'Excellent' },
            { value: '4', label: 'Good' },
            { value: '3', label: 'Average' },
            { value: '2', label: 'Poor' },
            { value: '1', label: 'Very Poor' },
          ],
          required: true,
          col: 6,
        },
        {
          key: 'mostImportantFeature',
          type: 'select',
          label: 'Most Important Feature to You',
          options: [
            { value: 'price', label: 'Competitive Pricing' },
            { value: 'quality', label: 'High Quality' },
            { value: 'service', label: 'Customer Service' },
            { value: 'speed', label: 'Fast Delivery' },
            { value: 'variety', label: 'Product Variety' },
          ],
          col: 12,
        },
        {
          key: 'previousToIntroPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToFeedbackPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Feedback & Suggestions
    {
      key: 'feedbackPage',
      type: 'page',
      fields: [
        {
          key: 'feedback-page-title',
          type: 'text',
          label: 'Feedback & Suggestions',
          col: 12,
        },
        {
          key: 'feedback-page-description',
          type: 'text',
          label: 'Share your thoughts and suggestions',
          col: 12,
        },
        {
          key: 'improvements',
          type: 'textarea',
          label: 'What could we improve?',
          props: {
            placeholder: 'Share your suggestions for improvement...',
            rows: 4,
          },
          col: 12,
        },
        {
          key: 'favoriteAspect',
          type: 'textarea',
          label: 'What do you like most about us?',
          props: {
            placeholder: 'Tell us what you appreciate...',
            rows: 3,
          },
          col: 12,
        },
        {
          key: 'recommendToFriend',
          type: 'radio',
          label: 'How likely are you to recommend us to a friend?',
          options: [
            { value: '10', label: '10 - Extremely Likely' },
            { value: '9', label: '9' },
            { value: '8', label: '8' },
            { value: '7', label: '7' },
            { value: '6', label: '6' },
            { value: '5', label: '5 - Neutral' },
            { value: '4', label: '4' },
            { value: '3', label: '3' },
            { value: '2', label: '2' },
            { value: '1', label: '1' },
            { value: '0', label: '0 - Not at All Likely' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'futureInterest',
          type: 'multi-checkbox',
          label: 'Future interests (select all that apply)',
          options: [
            { value: 'new_products', label: 'Information about new products' },
            { value: 'promotions', label: 'Special promotions and discounts' },
            { value: 'events', label: 'Company events and webinars' },
            { value: 'newsletter', label: 'Monthly newsletter' },
          ],
          col: 12,
        },
        {
          key: 'previousToExperiencePage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToCompletionPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 4: Contact & Completion
    {
      key: 'completionPage',
      type: 'page',
      fields: [
        {
          key: 'completion-page-title',
          type: 'text',
          label: 'Complete Survey',
          col: 12,
        },
        {
          key: 'completion-page-description',
          type: 'text',
          label: 'Final details and survey completion',
          col: 12,
        },
        {
          key: 'followUpContact',
          type: 'checkbox',
          label: "I'm willing to be contacted for follow-up questions",
          col: 12,
        },
        {
          key: 'contactEmail',
          type: 'input',
          label: 'Contact Email (if willing to be contacted)',
          props: {
            type: 'email',
            placeholder: 'your.email@example.com',
          },
          email: true,
          col: 12,
        },
        {
          key: 'additionalComments',
          type: 'textarea',
          label: 'Any additional comments?',
          props: {
            placeholder: "Anything else you'd like to share...",
            rows: 3,
          },
          col: 12,
        },
        {
          key: 'surveyConsent',
          type: 'checkbox',
          label: 'I consent to the use of this feedback for improvement purposes',
          required: true,
          col: 12,
        },
        {
          key: 'previousToFeedbackPage',
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

export const surveyJourneyScenario: TestScenario = {
  testId: 'survey-journey',
  title: 'Customer Satisfaction Survey Journey',
  description: 'Tests customer satisfaction survey flow across 4 pages',
  config,
};

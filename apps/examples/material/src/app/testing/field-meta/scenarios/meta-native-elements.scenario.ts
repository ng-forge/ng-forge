import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test scenario for verifying that meta attributes are properly applied
 * to native HTML elements (input, textarea, select).
 */
const config = {
  fields: [
    // Input with meta
    {
      key: 'emailInput',
      type: 'input',
      label: 'Email Address',
      meta: {
        'data-testid': 'email-input',
        autocomplete: 'email',
        inputmode: 'email',
      },
      col: 6,
    },
    // Input with password meta
    {
      key: 'passwordInput',
      type: 'input',
      label: 'Password',
      props: { type: 'password' },
      meta: {
        'data-testid': 'password-input',
        autocomplete: 'current-password',
      },
      col: 6,
    },
    // Textarea with meta
    {
      key: 'commentsTextarea',
      type: 'textarea',
      label: 'Comments',
      meta: {
        'data-testid': 'comments-textarea',
        spellcheck: 'true',
      },
      col: 12,
    },
    // Submit
    {
      key: 'submitNative',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const metaNativeElementsScenario: TestScenario = {
  testId: 'meta-native-elements-test',
  title: 'Meta Attributes on Native Elements',
  description: 'Testing meta attribute application on input and textarea elements',
  config,
};

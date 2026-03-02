import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Keyboard Navigation Test Scenario
 * Tests that all form elements can be navigated using keyboard
 */
export const keyboardNavigationScenario: TestScenario = {
  testId: 'keyboard-navigation',
  title: 'Keyboard Navigation',
  description: 'Tests that form elements can be navigated and operated using keyboard only',
  config: {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
      },
      {
        key: 'agreeToTerms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
      },
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable notifications',
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig,
};

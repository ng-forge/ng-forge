import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test scenario for verifying that meta attributes are properly propagated
 * to native input elements in wrapped components (checkbox, toggle, radio, multi-checkbox).
 */
const config = {
  fields: [
    // Checkbox with meta
    {
      key: 'termsCheckbox',
      type: 'checkbox',
      label: 'Accept Terms',
      meta: {
        'data-testid': 'terms-checkbox-input',
        'data-analytics': 'terms-acceptance',
      },
      col: 6,
    },
    // Toggle with meta
    {
      key: 'notificationsToggle',
      type: 'toggle',
      label: 'Enable Notifications',
      meta: {
        'data-testid': 'notifications-toggle-input',
        'data-analytics': 'notification-setting',
      },
      col: 6,
    },
    // Radio with meta
    {
      key: 'preferenceRadio',
      type: 'radio',
      label: 'Contact Preference',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'mail', label: 'Mail' },
      ],
      meta: {
        'data-testid': 'preference-radio-input',
        'data-analytics': 'contact-preference',
      },
      col: 12,
    },
    // Multi-checkbox with meta
    {
      key: 'interestsMultiCheckbox',
      type: 'multi-checkbox',
      label: 'Interests',
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'tech', label: 'Technology' },
      ],
      meta: {
        'data-testid': 'interests-multi-checkbox-input',
        'data-analytics': 'user-interests',
      },
      col: 12,
    },
    // Select with meta (applied to host element since mat-select has no native input)
    {
      key: 'countrySelect',
      type: 'select',
      label: 'Country',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
      ],
      meta: {
        'data-testid': 'country-select-host',
        'data-analytics': 'country-selection',
      },
      col: 6,
    },
    // Submit
    {
      key: 'submitMeta',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const metaWrappedComponentsScenario: TestScenario = {
  testId: 'meta-wrapped-components-test',
  title: 'Meta Attributes on Wrapped Components',
  description:
    'Testing meta attribute propagation to native input elements in checkbox, toggle, radio, multi-checkbox, and select components',
  config,
};

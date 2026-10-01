import type { FormConfig } from '@ng-forge/dynamic-forms';
import type { TestSuite } from '../types';

export const selectionFieldsSuite: TestSuite = {
  id: 'selection-fields',
  title: 'Selection Fields',
  scenarios: [
    {
      testId: 'checkbox-required',
      title: 'Required Checkbox',
      description: 'A required checkbox shows its error once touched and unlocks submit when checked',
      config: {
        defaultValidationMessages: { required: 'You must accept the terms' },
        fields: [
          { key: 'terms', type: 'checkbox', label: 'I accept the terms', required: true, value: false },
          { key: 'submitTerms', type: 'submit', label: 'Continue' },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'radio-plan',
      title: 'Radio Group',
      description: 'One option at a time; disabled options cannot be picked',
      config: {
        fields: [
          {
            key: 'plan',
            type: 'radio',
            label: 'Plan',
            options: [
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'team', label: 'Team (unavailable)', disabled: true },
            ],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'multi-checkbox-tags',
      title: 'Multi-Checkbox',
      description: 'Several options toggle in and out of an array value',
      config: {
        fields: [
          {
            key: 'interests',
            type: 'multi-checkbox',
            label: 'Interests',
            value: [],
            options: [
              { value: 'angular', label: 'Angular' },
              { value: 'native', label: 'Native apps' },
              { value: 'forms', label: 'Forms' },
            ],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
  ],
};

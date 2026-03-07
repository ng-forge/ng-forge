import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Age-Based Logic Test Scenario
 * Tests conditional field visibility based on age value
 */
export const ageBasedLogicScenario: TestScenario = {
  testId: 'age-based-logic',
  title: 'Age-Based Logic',
  description: 'Tests conditional field visibility based on age value',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        required: true,
        props: {
          type: 'number',
        },
      },
      {
        key: 'guardianConsent',
        type: 'checkbox',
        label: 'Guardian Consent Required',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'greaterOrEqual',
              value: 18,
            },
          },
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

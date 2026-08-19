import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * `required` on a group cascades to its children (#568). `apartment` opts out with its
 * own `required: false`, so the cascade must not force it.
 */
const config = {
  fields: [
    {
      key: 'address',
      type: 'group',
      required: true,
      fields: [
        { key: 'street', type: 'input', label: 'Street', value: '', col: 6 },
        { key: 'apartment', type: 'input', label: 'Apartment', value: '', required: false, col: 6 },
      ],
    },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

export const requiredCascadeScenario: TestScenario = {
  testId: 'required-cascade-test',
  title: 'Required Cascade',
  description: 'required on a group cascades to children, and a child opts out with its own required',
  config,
};

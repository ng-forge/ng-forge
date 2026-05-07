import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Array → required leaves with logic-based hidden. Each item has a
 * `hasContact` toggle that hides `email` and `phone` via field-level
 * `logic`. Default cascade behavior: hidden fields skip required validation,
 * so the form is valid as long as the visible required fields (name) are
 * filled — independently per item.
 */
const hiddenWhenNoContactLogic = [
  {
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'hasContact',
      operator: 'notEquals',
      value: true,
    },
  },
];

const itemFields = [
  {
    key: 'name',
    type: 'input',
    label: 'Member Name',
    required: true,
  },
  {
    key: 'hasContact',
    type: 'checkbox',
    label: 'Add Contact Info',
    value: false,
  },
  {
    key: 'email',
    type: 'input',
    label: 'Email',
    required: true,
    email: true,
    logic: hiddenWhenNoContactLogic,
  },
  {
    key: 'phone',
    type: 'input',
    label: 'Phone',
    required: true,
    logic: hiddenWhenNoContactLogic,
  },
];

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'members',
      type: 'array',
      fields: [itemFields],
    },
    {
      key: 'addMember',
      type: 'addArrayItem',
      arrayKey: 'members',
      label: 'Add Member',
      template: itemFields,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as FormConfig;

export const arrayNestedHiddenRequiredScenario: TestScenario = {
  testId: 'array-nested-hidden-required',
  title: 'Array → Hidden Required Leaves',
  description: 'Required leaves with hidden-logic inside an array item skip validation per-item until shown',
  config,
  simulateSubmission: { delayMs: 0 },
};

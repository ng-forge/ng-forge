import { type CustomValidator, type FormConfig } from '@ng-forge/dynamic-forms';

const noSpaces: CustomValidator = (ctx) => {
  const value = ctx.value();
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' };
  }
  return null;
};

export const expressionValidatorsConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least 8 characters',
    passwordMismatch: 'Passwords must match',
    endDateBeforeStart: 'End date must be after start date',
    ageOutOfRange: 'Age must be within the specified range',
    noSpaces: 'Spaces are not allowed',
  },
  fields: [
    {
      type: 'group',
      key: 'expressionExamples',
      fields: [
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          value: '',
          required: true,
          minLength: 8,
          props: { type: 'password' },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: 'Confirm Password',
          value: '',
          required: true,
          validators: [
            {
              type: 'custom',
              expression: 'fieldValue === formValue.expressionExamples.password',
              kind: 'passwordMismatch',
            },
          ],
          props: { type: 'password' },
        },
        {
          key: 'startDate',
          type: 'datepicker',
          label: 'Start Date',
          required: true,
        },
        {
          key: 'endDate',
          type: 'datepicker',
          label: 'End Date',
          required: true,
          validators: [
            {
              type: 'custom',
              expression: '!fieldValue || !formValue.expressionExamples.startDate || fieldValue > formValue.expressionExamples.startDate',
              kind: 'endDateBeforeStart',
            },
          ],
          validationMessages: {
            endDateBeforeStart: 'End date must be after start date',
          },
        },
        {
          key: 'minAge',
          type: 'input',
          label: 'Minimum Age',
          value: 18,
          required: true,
          props: { type: 'number' },
        },
        {
          key: 'maxAge',
          type: 'input',
          label: 'Maximum Age',
          value: 65,
          required: true,
          props: { type: 'number' },
        },
        {
          key: 'age',
          type: 'input',
          label: 'Your Age',
          required: true,
          props: { type: 'number' },
          validators: [
            {
              type: 'custom',
              expression: 'fieldValue >= formValue.expressionExamples.minAge && fieldValue <= formValue.expressionExamples.maxAge',
              kind: 'ageOutOfRange',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      key: 'functionExample',
      fields: [
        {
          key: 'nickname',
          type: 'input',
          label: 'Nickname (no spaces allowed)',
          value: '',
          required: true,
          validators: [
            {
              type: 'custom',
              functionName: 'noSpaces',
            },
          ],
          validationMessages: {
            noSpaces: 'Spaces are not allowed in nicknames',
          },
        },
      ],
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Submit Form',
    },
  ],
  customFnConfig: {
    validators: { noSpaces },
  },
} as const satisfies FormConfig;

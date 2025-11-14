import { FormConfig } from '@ng-forge/dynamic-form';

export const dependentValidationConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Dependent Validation Demo',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Form fields that depend on each other for validation and options.',
      col: 12,
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
      ],
      props: {
        placeholder: 'Select your country',
        appearance: 'outline',
      },
      required: true,
      col: 4,
    },
    {
      key: 'state',
      type: 'select',
      label: 'State/Province',
      options: [
        { value: 'ca', label: 'California' },
        { value: 'ny', label: 'New York' },
        { value: 'tx', label: 'Texas' },
        { value: 'on', label: 'Ontario' },
        { value: 'bc', label: 'British Columbia' },
        { value: 'qc', label: 'Quebec' },
        { value: 'en', label: 'England' },
        { value: 'sc', label: 'Scotland' },
        { value: 'wa', label: 'Wales' },
      ],
      props: {
        placeholder: 'Select state/province',
        appearance: 'outline',
      },
      required: true,
      col: 4,
      logic: [
        {
          type: 'disabled',
          condition: {
            type: 'javascript',
            expression: '!formValue.country',
          },
        },
      ],
    },
    {
      key: 'city',
      type: 'input',
      label: 'City',
      props: {
        placeholder: 'Enter your city',
        appearance: 'outline',
      },
      required: true,
      col: 4,
      logic: [
        {
          type: 'disabled',
          condition: {
            type: 'javascript',
            expression: '!formValue.state',
          },
        },
      ],
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      props: {
        type: 'number',
        placeholder: 'Enter your age',
        appearance: 'outline',
      },
      min: 1,
      max: 120,
      required: true,
      col: 6,
    },
    {
      key: 'guardianConsent',
      type: 'checkbox',
      label: 'Guardian Consent Required',
      props: {
        color: 'warn',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: '!formValue.age || Number(formValue.age) >= 18',
          },
        },
      ],
    },
    {
      key: 'employmentStatus',
      type: 'select',
      label: 'Employment Status',
      options: [
        { value: 'employed', label: 'Employed' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'student', label: 'Student' },
        { value: 'retired', label: 'Retired' },
      ],
      props: {
        placeholder: 'Select employment status',
        appearance: 'outline',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: 'formValue.age && Number(formValue.age) < 18',
          },
        },
      ],
    },
    {
      key: 'company',
      type: 'input',
      label: 'Company Name',
      props: {
        placeholder: 'Enter your company name',
        appearance: 'outline',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'employmentStatus',
            operator: 'notEquals',
            value: 'employed',
          },
        },
      ],
    },
    {
      key: 'school',
      type: 'input',
      label: 'School Name',
      props: {
        placeholder: 'Enter your school name',
        appearance: 'outline',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'employmentStatus',
            operator: 'notEquals',
            value: 'student',
          },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit Information',
      props: {
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

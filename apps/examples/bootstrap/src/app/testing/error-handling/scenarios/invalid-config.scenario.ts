import { TestScenario } from '../../shared/types';

// Using 'any' type to test error handling with intentionally invalid field configurations
const config: any = {
  fields: [
    // Field with missing required properties
    {
      key: 'missingType',
      label: 'Field without type',
      // type property is missing
    },
    // Field with invalid type
    {
      key: 'invalidType',
      type: 'nonexistent-field-type',
      label: 'Invalid Field Type',
    },
    // Valid field for comparison
    {
      key: 'validField',
      type: 'input',
      label: 'Valid Field',
      props: {
        placeholder: 'This should work',
      },
    },
    {
      key: 'submitInvalid',
      type: 'submit',
      label: 'Submit Invalid Config',
    },
  ],
};

export const invalidConfigScenario: TestScenario = {
  testId: 'invalid-config',
  title: 'Invalid Configuration Test',
  description: 'Tests error handling for invalid field configurations',
  config,
};

import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional visibility of fields inside array items.
 * Uses custom functions to resolve sibling field values within the same array item,
 * since logic conditions evaluate with the root form value and need dynamic path resolution.
 */
const config = {
  fields: [
    {
      key: 'addresses',
      type: 'array',
      fields: [
        [
          {
            key: 'street',
            type: 'input',
            label: 'Street',
            props: {
              placeholder: 'Enter street address',
            },
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            props: {
              placeholder: 'Enter city',
            },
          },
          {
            key: 'hasApartment',
            type: 'checkbox',
            label: 'Has Apartment/Unit Number',
            value: false,
          },
          {
            key: 'apartmentNumber',
            type: 'input',
            label: 'Apartment/Unit Number',
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'custom',
                  expression: 'hideApartmentNumber',
                },
              },
            ],
            props: {
              placeholder: 'Enter apartment/unit number',
            },
          },
          {
            key: 'addressType',
            type: 'radio',
            label: 'Address Type',
            options: [
              { value: 'residential', label: 'Residential' },
              { value: 'commercial', label: 'Commercial' },
            ],
            value: 'residential',
          },
          {
            key: 'businessName',
            type: 'input',
            label: 'Business Name',
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'custom',
                  expression: 'hideBusinessName',
                },
              },
            ],
            props: {
              placeholder: 'Enter business name',
            },
          },
        ],
      ],
    },
    {
      key: 'addAddress',
      type: 'addArrayItem',
      arrayKey: 'addresses',
      label: 'Add Address',
      template: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          props: {
            placeholder: 'Enter street address',
          },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          props: {
            placeholder: 'Enter city',
          },
        },
        {
          key: 'hasApartment',
          type: 'checkbox',
          label: 'Has Apartment/Unit Number',
          value: false,
        },
        {
          key: 'apartmentNumber',
          type: 'input',
          label: 'Apartment/Unit Number',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'custom',
                expression: 'hideApartmentNumber',
              },
            },
          ],
          props: {
            placeholder: 'Enter apartment/unit number',
          },
        },
        {
          key: 'addressType',
          type: 'radio',
          label: 'Address Type',
          options: [
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
          ],
          value: 'residential',
        },
        {
          key: 'businessName',
          type: 'input',
          label: 'Business Name',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'custom',
                expression: 'hideBusinessName',
              },
            },
          ],
          props: {
            placeholder: 'Enter business name',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

/**
 * Helper to resolve a sibling field value within the same array item.
 * Given a fieldPath like 'addresses.0.apartmentNumber', extracts the array item path
 * ('addresses.0') and looks up the sibling field value.
 */
function getArraySiblingValue(formValue: Record<string, unknown>, fieldPath: string, siblingKey: string): unknown {
  const parts = fieldPath.split('.');
  // Navigate to the array item: e.g., addresses.0
  const arrayItemPath = parts.slice(0, -1);
  let current: unknown = formValue;
  for (const part of arrayItemPath) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (current == null || typeof current !== 'object') return undefined;
  return (current as Record<string, unknown>)[siblingKey];
}

export const arrayItemsConditionalFieldsScenario: TestScenario = {
  testId: 'array-items-conditional-fields',
  title: 'Array Items with Conditional Fields',
  description: 'Verify that individual fields within array items can have their own conditional visibility',
  config,
  customFnConfig: {
    customFunctions: {
      hideApartmentNumber: (context: EvaluationContext) => {
        const hasApartment = getArraySiblingValue(context.formValue, context.fieldPath, 'hasApartment');
        return hasApartment !== true;
      },
      hideBusinessName: (context: EvaluationContext) => {
        const addressType = getArraySiblingValue(context.formValue, context.fieldPath, 'addressType');
        return addressType !== 'commercial';
      },
    },
  },
};

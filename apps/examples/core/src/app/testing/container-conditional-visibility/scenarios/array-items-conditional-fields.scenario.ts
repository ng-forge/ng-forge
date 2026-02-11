import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional visibility of fields inside array items.
 * Uses native fieldValue conditions that are automatically scoped to the
 * current array item, so sibling field lookups work without custom functions.
 */
const addressFields = [
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
          type: 'fieldValue',
          fieldPath: 'hasApartment',
          operator: 'notEquals',
          value: true,
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
          type: 'fieldValue',
          fieldPath: 'addressType',
          operator: 'notEquals',
          value: 'commercial',
        },
      },
    ],
    props: {
      placeholder: 'Enter business name',
    },
  },
];

const config = {
  fields: [
    {
      key: 'addresses',
      type: 'array',
      fields: [addressFields],
    },
    {
      key: 'addAddress',
      type: 'addArrayItem',
      arrayKey: 'addresses',
      label: 'Add Address',
      template: addressFields,
    },
  ],
} as FormConfig;

export const arrayItemsConditionalFieldsScenario: TestScenario = {
  testId: 'array-items-conditional-fields',
  title: 'Array Items with Conditional Fields',
  description: 'Verify that individual fields within array items can have their own conditional visibility',
  config,
};

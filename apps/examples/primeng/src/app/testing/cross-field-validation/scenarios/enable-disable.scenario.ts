import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'shippingMethod',
      type: 'radio',
      label: 'Shipping Method',
      options: [
        { value: 'standard', label: 'Standard (5-7 days)' },
        { value: 'express', label: 'Express (2-3 days)' },
        { value: 'overnight', label: 'Overnight' },
        { value: 'pickup', label: 'Store Pickup' },
      ],
      required: true,
      col: 12,
    },
    {
      key: 'shippingAddress',
      type: 'textarea',
      label: 'Shipping Address',
      props: {
        placeholder: 'Enter shipping address',
        rows: 3,
      },
      col: 12,
    },
    {
      key: 'expressInstructions',
      type: 'textarea',
      label: 'Special Delivery Instructions',
      props: {
        placeholder: 'Special instructions for express/overnight delivery',
        rows: 2,
      },
      col: 12,
    },
    {
      key: 'storeLocation',
      type: 'select',
      label: 'Store Pickup Location',
      options: [
        { value: 'downtown', label: 'Downtown Store' },
        { value: 'mall', label: 'Shopping Mall Store' },
        { value: 'airport', label: 'Airport Store' },
      ],
      col: 12,
    },
    {
      key: 'submitEnableDisable',
      type: 'submit',
      label: 'Complete Order',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const enableDisableScenario: TestScenario = {
  testId: 'enable-disable',
  title: 'Field Enable/Disable Testing',
  description: 'Tests enabling/disabling fields based on radio selection',
  config,
};

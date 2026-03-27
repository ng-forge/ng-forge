import { FormConfig } from '@ng-forge/dynamic-forms';

export const shippingBillingAddressConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'billingTitle',
      type: 'text',
      label: 'Billing Address',
      props: { elementType: 'h4' },
    },
    {
      key: 'billingAddress',
      type: 'group',
      fields: [
        {
          key: 'street',
          type: 'input',
          value: '',
          label: 'Street Address',
          required: true,
        },
        {
          key: 'city',
          type: 'input',
          value: '',
          label: 'City',
          required: true,
        },
        {
          key: 'state',
          type: 'input',
          value: '',
          label: 'State/Province',
          required: true,
        },
        {
          key: 'zipCode',
          type: 'input',
          value: '',
          label: 'ZIP/Postal Code',
          required: true,
        },
      ],
    },
    {
      key: 'sameAsBilling',
      type: 'checkbox',
      value: false,
      label: 'Shipping address is same as billing address',
    },
    {
      key: 'shippingTitle',
      type: 'text',
      label: 'Shipping Address',
      props: { elementType: 'h4' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
      ],
    },
    {
      key: 'shippingStreet',
      type: 'input',
      value: '',
      label: 'Street Address',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'notEquals',
            value: true,
          },
        },
      ],
    },
    {
      key: 'shippingCity',
      type: 'input',
      value: '',
      label: 'City',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'notEquals',
            value: true,
          },
        },
      ],
    },
    {
      key: 'shippingState',
      type: 'input',
      value: '',
      label: 'State/Province',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'notEquals',
            value: true,
          },
        },
      ],
    },
    {
      key: 'shippingZipCode',
      type: 'input',
      value: '',
      label: 'ZIP/Postal Code',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'notEquals',
            value: true,
          },
        },
      ],
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Continue to Payment',
    },
  ],
} as const satisfies FormConfig;

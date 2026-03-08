import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const shippingBillingAddressScenario: ExampleScenario = {
  id: 'shipping-billing-address',
  title: 'Shipping Same-as-Billing',
  description: 'Checkout form demonstrating the common "same as billing" pattern for shipping addresses.',
  config: {
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
            props: { appearance: 'outline' },
          },
          {
            key: 'city',
            type: 'input',
            value: '',
            label: 'City',
            required: true,
            props: { appearance: 'outline' },
          },
          {
            key: 'state',
            type: 'input',
            value: '',
            label: 'State/Province',
            required: true,
            props: { appearance: 'outline' },
          },
          {
            key: 'zipCode',
            type: 'input',
            value: '',
            label: 'ZIP/Postal Code',
            required: true,
            props: { appearance: 'outline' },
          },
        ],
      },
      {
        key: 'sameAsBilling',
        type: 'checkbox',
        value: false,
        label: 'Shipping address is same as billing address',
        props: { color: 'primary' },
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
        props: { appearance: 'outline' },
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
        props: { appearance: 'outline' },
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
        props: { appearance: 'outline' },
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
        props: { appearance: 'outline' },
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
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};

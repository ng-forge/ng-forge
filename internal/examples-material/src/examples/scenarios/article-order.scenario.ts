import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

const itemTemplate = [
  {
    key: 'product',
    type: 'input',
    label: 'Product',
    required: true,
    value: '',
    placeholder: 'Product name',
  },
  {
    key: 'quantity',
    type: 'input',
    label: 'Qty',
    required: true,
    value: 1,
    min: 1,
    props: { type: 'number' },
  },
  {
    key: 'removeItem',
    type: 'removeArrayItem',
    label: 'Remove',
    props: { color: 'warn' },
  },
] as const;

export const articleOrderScenario: ExampleScenario = {
  id: 'article-order',
  title: 'Create Order',
  description: 'Generated from POST /orders — nested group + array containers.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email',
    },
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Create Order',
        props: { elementType: 'h2' },
      },
      {
        key: 'customer',
        type: 'group',
        fields: [
          {
            key: 'sectionLabel',
            type: 'text',
            label: 'Customer',
            props: { elementType: 'h3' },
          },
          {
            key: 'name',
            type: 'input',
            label: 'Name',
            required: true,
            value: 'Jane Cooper',
            placeholder: 'Full name',
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            required: true,
            email: true,
            value: 'jane@company.com',
            placeholder: 'Email address',
            props: { type: 'email' },
          },
        ],
      },
      {
        key: 'itemsLabel',
        type: 'text',
        label: 'Order Items',
        props: { elementType: 'h3' },
      },
      {
        key: 'items',
        type: 'array',
        fields: [
          [
            {
              key: 'product',
              type: 'input',
              label: 'Product',
              required: true,
              value: 'Widget Pro',
              placeholder: 'Product name',
            },
            {
              key: 'quantity',
              type: 'input',
              label: 'Qty',
              required: true,
              value: 3,
              min: 1,
              props: { type: 'number' },
            },
            {
              key: 'removeItem',
              type: 'removeArrayItem',
              label: 'Remove',
              props: { color: 'warn' },
            },
          ],
          [
            {
              key: 'product',
              type: 'input',
              label: 'Product',
              required: true,
              value: 'Gadget Mini',
              placeholder: 'Product name',
            },
            {
              key: 'quantity',
              type: 'input',
              label: 'Qty',
              required: true,
              value: 1,
              min: 1,
              props: { type: 'number' },
            },
            {
              key: 'removeItem',
              type: 'removeArrayItem',
              label: 'Remove',
              props: { color: 'warn' },
            },
          ],
        ],
      },
      {
        key: 'addItem',
        type: 'addArrayItem',
        label: 'Add Item',
        arrayKey: 'items',
        template: itemTemplate,
        props: { color: 'primary' },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit Order',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};

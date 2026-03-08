import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const contactDynamicFieldsScenario: ExampleScenario = {
  id: 'contact-dynamic-fields',
  title: 'Contact Form with Dynamic Fields',
  description: 'Contact form demonstrating dynamic field visibility based on preferred contact method selection.',
  config: {
    fields: [
      {
        key: 'name',
        type: 'input',
        value: '',
        label: 'Full Name',
        required: true,
        props: { appearance: 'outline' },
      },
      {
        key: 'contactMethod',
        type: 'select',
        value: '',
        label: 'Preferred Contact Method',
        required: true,
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'mail', label: 'Postal Mail' },
        ],
        props: { appearance: 'outline' },
      },
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        email: true,
        props: { appearance: 'outline' },
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'email',
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'email',
            },
          },
        ],
      },
      {
        key: 'phone',
        type: 'input',
        value: '',
        label: 'Phone Number',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'phone',
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'phone',
            },
          },
        ],
        props: { type: 'tel', appearance: 'outline' },
      },
      {
        key: 'address',
        type: 'textarea',
        value: '',
        label: 'Mailing Address',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'mail',
            },
          },
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'mail',
            },
          },
        ],
        props: { rows: 3, appearance: 'outline' },
      },
      {
        key: 'message',
        type: 'textarea',
        value: '',
        label: 'Message',
        required: true,
        minLength: 10,
        props: { rows: 4, appearance: 'outline' },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Send Message',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};

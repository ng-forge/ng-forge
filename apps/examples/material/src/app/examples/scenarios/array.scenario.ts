import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

// Array item templates - define the structure for new items added via buttons
const tagTemplate = {
  key: 'tag',
  type: 'row',
  fields: [
    {
      key: 'value',
      type: 'input',
      label: 'Tag',
      required: true,
      minLength: 2,
      props: {
        placeholder: 'Enter a tag',
        hint: 'Tags must be at least 2 characters',
      },
    },
    {
      key: 'removeTag',
      type: 'removeArrayItem',
      label: 'Remove',
      className: 'remove-tag-button',
      props: {
        color: 'warn',
      },
    },
  ],
} as const;

const contactTemplate = [
  {
    key: 'name',
    type: 'input',
    label: 'Contact Name',
    required: true,
    minLength: 2,
    props: {
      placeholder: 'Enter contact name',
      hint: 'Full name of the emergency contact',
    },
  },
  {
    key: 'phone',
    type: 'input',
    label: 'Phone Number',
    required: true,
    pattern: /^\d{10}$/,
    validationMessages: {
      pattern: 'Please enter a valid 10-digit phone number',
    },
    props: {
      type: 'tel',
      placeholder: '5551234567',
      hint: 'Enter 10-digit phone number without spaces or dashes',
    },
  },
  {
    key: 'relationship',
    type: 'select',
    label: 'Relationship',
    required: true,
    options: [
      { label: 'Family', value: 'family' },
      { label: 'Friend', value: 'friend' },
      { label: 'Colleague', value: 'colleague' },
      { label: 'Other', value: 'other' },
    ],
    props: {
      hint: 'Select your relationship to this contact',
    },
  },
  {
    key: 'removeContact',
    type: 'removeArrayItem',
    label: 'Remove Contact',
    className: 'remove-contact-button',
    props: {
      color: 'warn',
    },
  },
] as const;

export const arrayScenario: ExampleScenario = {
  id: 'array',
  title: 'Array Demo',
  description: 'Demonstrates dynamic array fields with declarative add/remove buttons.',
  formClassName: 'array-example-form',
  config: {
    fields: [
      {
        key: 'sectionTitle1',
        type: 'text',
        label: 'Flat Array Example',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'description1',
        type: 'text',
        label: 'Tags use addArrayItem (outside) and removeArrayItem (inside each item) buttons.',
      },
      {
        key: 'tags',
        type: 'array',
        fields: [
          [
            {
              key: 'tag',
              type: 'row',
              fields: [
                {
                  key: 'value',
                  type: 'input',
                  label: 'Tag',
                  required: true,
                  minLength: 2,
                  props: {
                    placeholder: 'Enter a tag',
                    hint: 'Tags must be at least 2 characters',
                  },
                  value: 'angular',
                },
                {
                  key: 'removeTag',
                  type: 'removeArrayItem',
                  label: 'Remove',
                  className: 'remove-tag-button',
                  props: {
                    color: 'warn',
                  },
                },
              ],
            },
          ],
          [
            {
              key: 'tag',
              type: 'row',
              fields: [
                {
                  key: 'value',
                  type: 'input',
                  label: 'Tag',
                  required: true,
                  minLength: 2,
                  props: {
                    placeholder: 'Enter a tag',
                    hint: 'Tags must be at least 2 characters',
                  },
                  value: 'typescript',
                },
                {
                  key: 'removeTag',
                  type: 'removeArrayItem',
                  label: 'Remove',
                  className: 'remove-tag-button',
                  props: {
                    color: 'warn',
                  },
                },
              ],
            },
          ],
        ],
      },
      {
        key: 'addTagButton',
        type: 'addArrayItem',
        label: 'Add Tag',
        arrayKey: 'tags',
        template: [tagTemplate],
        className: 'add-tag-button',
        props: {
          color: 'primary',
        },
      },
      {
        key: 'sectionTitle2',
        type: 'text',
        label: 'Object Array Example',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'description2',
        type: 'text',
        label: 'Contacts demonstrate addArrayItem and prependArrayItem buttons outside the array.',
      },
      {
        key: 'contacts',
        type: 'array',
        fields: [
          [
            {
              key: 'name',
              type: 'input',
              label: 'Contact Name',
              required: true,
              minLength: 2,
              props: {
                placeholder: 'Enter contact name',
                hint: 'Full name of the emergency contact',
              },
              value: 'Jane Smith',
            },
            {
              key: 'phone',
              type: 'input',
              label: 'Phone Number',
              required: true,
              pattern: /^\d{10}$/,
              validationMessages: {
                pattern: 'Please enter a valid 10-digit phone number',
              },
              props: {
                type: 'tel',
                placeholder: '5551234567',
                hint: 'Enter 10-digit phone number without spaces or dashes',
              },
              value: '5551234567',
            },
            {
              key: 'relationship',
              type: 'select',
              label: 'Relationship',
              required: true,
              options: [
                { label: 'Family', value: 'family' },
                { label: 'Friend', value: 'friend' },
                { label: 'Colleague', value: 'colleague' },
                { label: 'Other', value: 'other' },
              ],
              props: {
                hint: 'Select your relationship to this contact',
              },
              value: 'family',
            },
            {
              key: 'removeContact',
              type: 'removeArrayItem',
              label: 'Remove Contact',
              className: 'remove-contact-button',
              props: {
                color: 'warn',
              },
            },
          ],
        ],
      },
      {
        key: 'contactButtons',
        type: 'row',
        className: 'df-row-mobile-keep-cols',
        fields: [
          {
            key: 'prependContactButton',
            type: 'prependArrayItem',
            label: 'Add First',
            arrayKey: 'contacts',
            template: contactTemplate,
            className: 'prepend-contact-button df-col-auto',
            props: {
              color: 'accent',
            },
          },
          {
            key: 'addContactButton',
            type: 'addArrayItem',
            label: 'Add Contact',
            arrayKey: 'contacts',
            template: contactTemplate,
            className: 'add-contact-button df-col-auto',
            props: {
              color: 'primary',
            },
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Save All',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig,
};

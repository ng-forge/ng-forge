import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const simplifiedArrayScenario: ExampleScenario = {
  id: 'simplified-array',
  title: 'Simplified Array Demo',
  description:
    'Demonstrates the simplified array API with template-based definitions, auto-generated add/remove buttons, and both primitive and object arrays.',
  formClassName: 'simplified-array-example-form',
  config: {
    fields: [
      {
        key: 'sectionTitle1',
        type: 'text',
        label: 'Primitive Array (Tags)',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'description1',
        type: 'text',
        label: 'A simplified primitive array with auto-generated add/remove buttons.',
      },
      {
        key: 'tags',
        type: 'array',
        template: {
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
        value: ['angular', 'typescript'],
        addButton: { label: 'Add Tag', props: { color: 'primary' } },
        removeButton: { label: 'Remove', props: { color: 'warn' } },
      },
      {
        key: 'sectionTitle2',
        type: 'text',
        label: 'Object Array (Contacts)',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'description2',
        type: 'text',
        label: 'A simplified object array where each item has multiple fields.',
      },
      {
        key: 'contacts',
        type: 'array',
        template: [
          {
            key: 'name',
            type: 'input',
            label: 'Contact Name',
            required: true,
            minLength: 2,
            props: {
              placeholder: 'Enter contact name',
            },
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone Number',
            props: {
              type: 'tel',
              placeholder: '5551234567',
            },
          },
        ],
        value: [
          { name: 'Jane Smith', phone: '5551234567' },
          { name: 'John Doe', phone: '5559876543' },
        ],
        addButton: { label: 'Add Contact', props: { color: 'primary' } },
      },
      {
        key: 'sectionTitle3',
        type: 'text',
        label: 'Empty Array (Start Fresh)',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'description3',
        type: 'text',
        label: 'An empty simplified array — start with no items and add via button.',
      },
      {
        key: 'notes',
        type: 'array',
        template: {
          key: 'text',
          type: 'input',
          label: 'Note',
          props: {
            placeholder: 'Enter a note',
          },
        },
        addButton: { label: 'Add Note' },
      },
      {
        key: 'sectionTitle4',
        type: 'text',
        label: 'No Remove Button',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'description4',
        type: 'text',
        label: 'Simplified array with remove button disabled.',
      },
      {
        key: 'categories',
        type: 'array',
        template: {
          key: 'name',
          type: 'input',
          label: 'Category',
        },
        value: ['Frontend', 'Backend'],
        removeButton: false,
        addButton: { label: 'Add Category' },
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

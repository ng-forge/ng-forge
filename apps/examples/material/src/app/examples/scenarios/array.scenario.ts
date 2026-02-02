import { AppendArrayItemEvent, FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

// Array item templates
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

export class AddTagsEvent extends AppendArrayItemEvent {
  constructor() {
    super('tags', [tagTemplate]);
  }
}

const contactTemplate = {
  key: 'contact',
  type: 'group',
  fields: [
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
      label: 'Remove',
      className: 'remove-contact-button',
      props: {
        color: 'warn',
      },
    },
  ],
} as const;

export class AddContactEvent extends AppendArrayItemEvent {
  constructor() {
    super('contacts', [contactTemplate]);
  }
}

export const arrayScenario: ExampleScenario = {
  id: 'array',
  title: 'Array Demo',
  description: 'Demonstrates dynamic array fields with add/remove functionality.',
  initialValue: {
    tags: [{ value: 'angular' }, { value: 'typescript' }],
    contacts: [
      {
        contact: {
          name: 'Jane Smith',
          phone: '5551234567',
          relationship: 'family',
        },
      },
    ],
  },
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
        label: 'Tags are stored as a flat array of strings: ["tag1", "tag2"]',
      },
      {
        key: 'tags',
        type: 'array',
        fields: [tagTemplate],
      },
      {
        key: 'addTagButton',
        type: 'button',
        label: 'Add Tag',
        className: 'add-tag-button',
        event: AddTagsEvent,
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
        label: 'Contacts are stored as an array of objects: [{name: "", phone: "", relationship: ""}]',
      },
      {
        key: 'contacts',
        type: 'array',
        fields: [contactTemplate],
      },
      {
        key: 'addContactButton',
        type: 'button',
        label: 'Add Contact',
        className: 'add-contact-button',
        event: AddContactEvent,
        props: {
          color: 'primary',
        },
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

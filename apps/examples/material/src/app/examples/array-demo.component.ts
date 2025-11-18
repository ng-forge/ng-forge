import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AddArrayItemEvent, DynamicForm, type FormConfig, RemoveArrayItemEvent } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';
import { submitButton } from '@ng-forge/dynamic-form-material';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Array item templates
const tagTemplate = {
  key: 'tag',
  type: 'row',
  fields: [
    {
      key: 'value',
      type: 'input',
      label: 'Tag',
      value: '',
      required: true,
      minLength: 2,
      props: {
        placeholder: 'Enter a tag',
        hint: 'Tags must be at least 2 characters',
      },
    },
    {
      key: 'removeTag',
      type: 'button',
      label: 'Remove',
      className: 'remove-tag-button',
      event: RemoveArrayItemEvent,
      eventArgs: ['$arrayKey', '$index'],
      props: {
        color: 'warn',
      },
      // TODO: Add hide logic to hide when array length is 1
    },
  ],
} as const;

class AddTagsEvent extends AddArrayItemEvent {
  constructor() {
    super('tags', tagTemplate);
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
      value: '',
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
      value: '',
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
      value: 'friend',
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
      type: 'button',
      label: 'Remove',
      className: 'remove-contact-button',
      event: RemoveArrayItemEvent,
      eventArgs: ['$arrayKey', '$index'],
      props: {
        color: 'warn',
      },
      // TODO: Add hide logic to hide when array length is 1
    },
  ],
} as const;

class AddContactEvent extends AddArrayItemEvent {
  constructor() {
    super('contacts', contactTemplate);
  }
}

@Component({
  selector: 'example-array-demo',
  imports: [DynamicForm, JsonPipe, MatButtonModule, MatIconModule],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />

    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  styles: [
    `
      .example-result {
        margin-top: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }
      .example-result pre {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayDemoComponent {
  formValue = signal({
    tags: [],
    contacts: [],
  });

  config = {
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
        label: 'Tags',
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
        label: 'Emergency Contacts',
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
      submitButton({
        key: 'submit',
        label: 'Save All',
        props: {
          color: 'primary',
        },
      }),
    ],
  } as const satisfies FormConfig;
}

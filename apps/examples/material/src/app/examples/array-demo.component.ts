import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DynamicForm, type FormConfig, EventBus, AddArrayItemEvent, RemoveArrayItemEvent } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';
import { submitButton } from '@ng-forge/dynamic-form-material';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'example-array-demo',
  imports: [DynamicForm, JsonPipe, MatButtonModule, MatIconModule],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />

    <div class="button-group">
      <button mat-raised-button color="primary" (click)="addTag()">
        <mat-icon>add</mat-icon>
        Add Tag
      </button>
      <button mat-raised-button color="primary" (click)="addContact()">
        <mat-icon>add</mat-icon>
        Add Contact
      </button>
    </div>

    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  styles: [
    `
      .button-group {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
      }
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
  private eventBus = inject(EventBus);
  formValue = signal({
    tags: [],
    contacts: [],
  });

  // Field templates for array items
  private readonly tagTemplate = {
    key: 'tag',
    type: 'input',
    label: 'Tag',
    value: '',
    required: true,
    minLength: 2,
    props: {
      placeholder: 'Enter a tag',
      hint: 'Tags must be at least 2 characters',
    },
  } as const;

  private readonly contactTemplate = {
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
    ],
  } as const;

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
        fields: [this.tagTemplate],
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
        fields: [this.contactTemplate],
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

  addTag() {
    this.eventBus.dispatch(AddArrayItemEvent, 'tags', this.tagTemplate);
  }

  addContact() {
    this.eventBus.dispatch(AddArrayItemEvent, 'contacts', this.contactTemplate);
  }

  removeTag(index: number) {
    this.eventBus.dispatch(RemoveArrayItemEvent, 'tags', index);
  }

  removeContact(index: number) {
    this.eventBus.dispatch(RemoveArrayItemEvent, 'contacts', index);
  }
}

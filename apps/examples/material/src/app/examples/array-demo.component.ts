import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';
import { submitButton } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-array-demo',
  imports: [DynamicForm, JsonPipe],
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Emergency Contacts',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'contacts',
        type: 'array',
        label: 'Contact Information',
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
      },
      submitButton({
        key: 'submit',
        label: 'Save Contacts',
        props: {
          color: 'primary',
        },
      }),
    ],
  } as const satisfies FormConfig;
}

import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-textarea-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class TextareaDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        props: {
          placeholder: 'Tell us about yourself...',
          rows: 3, // Number of visible text lines
          hint: 'Brief personal bio',
        },
      },
      {
        key: 'feedback',
        type: 'textarea',
        label: 'Feedback with Auto-Resize',
        props: {
          placeholder: 'Share your thoughts...',
          rows: 4,
          autoResize: true, // Enable automatic resizing based on content
          hint: 'This textarea will grow as you type',
        },
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Project Description',
        props: {
          placeholder: 'Describe your project...',
          rows: 5,
          maxlength: 500, // Maximum number of characters allowed
          hint: 'Maximum 500 characters',
        },
        required: true,
        maxLength: 500,
      },
      {
        key: 'comments',
        type: 'textarea',
        label: 'Comments with Custom Styling',
        props: {
          placeholder: 'Leave your comments...',
          rows: 4,
          autoResize: true,
          styleClass: 'custom-textarea-class', // Custom CSS class
          hint: 'Comments are optional',
        },
      },
    ],
  } as const satisfies FormConfig;
}

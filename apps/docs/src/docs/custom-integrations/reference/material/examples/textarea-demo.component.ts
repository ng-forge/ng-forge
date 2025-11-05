import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-textarea-demo',
  imports: [DynamicForm, JsonPipe],
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
          appearance: 'outline',
          rows: 3,
          hint: 'Brief personal bio',
        },
      },
      {
        key: 'feedback',
        type: 'textarea',
        label: 'Feedback',
        props: {
          placeholder: 'Share your thoughts...',
          appearance: 'fill',
          rows: 4,
          hint: 'Your feedback helps us improve',
        },
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Project Description',
        props: {
          placeholder: 'Describe your project...',
          appearance: 'outline',
          rows: 5,
          hint: 'Detailed project description',
        },
        // validation: {
        //   maxLength: 500,
        // },
      },
    ],
  } as const satisfies FormConfig;
}

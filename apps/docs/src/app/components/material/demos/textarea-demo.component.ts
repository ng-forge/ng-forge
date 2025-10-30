import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-textarea-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [(value)]="formOutput"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin: 1rem 0;
      }
      .output {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }
      pre {
        background: #f5f5f5;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin: 0.5rem 0;
      }
    `,
  ],
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

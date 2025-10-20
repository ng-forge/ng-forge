import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'textarea-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
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
  model = signal({
    bio: '',
    feedback: '',
    description: '',
  });

  fields: FieldConfig[] = [
    {
      key: 'bio',
      type: 'textarea',
      props: {
        label: 'Biography',
        placeholder: 'Tell us about yourself...',
        appearance: 'outline',
        rows: 3,
        hint: 'Brief personal bio',
      },
    },
    {
      key: 'feedback',
      type: 'textarea',
      props: {
        label: 'Feedback',
        placeholder: 'Share your thoughts...',
        appearance: 'fill',
        rows: 4,
        hint: 'Your feedback helps us improve',
      },
    },
    {
      key: 'description',
      type: 'textarea',
      props: {
        label: 'Project Description',
        placeholder: 'Describe your project...',
        appearance: 'outline',
        rows: 5,
        hint: 'Detailed project description',
      },
      validators: {
        maxLength: 500,
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-textarea-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="example-result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'basicTextarea',
        type: 'textarea',
        label: 'Basic Textarea',
        props: {
          placeholder: 'Enter your text here...',
          rows: 3,
          helpText: 'Default textarea with 3 rows',
        },
      },
      {
        key: 'floatingTextarea',
        type: 'textarea',
        label: 'Floating Label Textarea',
        props: {
          placeholder: 'Enter your comment...',
          floatingLabel: true,
          rows: 4,
          helpText: 'Textarea with floating label',
        },
      },
      {
        key: 'largeTextarea',
        type: 'textarea',
        label: 'Large Textarea',
        props: {
          placeholder: 'Write your essay...',
          rows: 6,
          size: 'lg',
          helpText: 'Large textarea for longer content',
        },
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        props: {
          placeholder: 'Enter your message...',
          rows: 5,
          helpText: 'This field is required',
        },
        required: true,
        minLength: 10,
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
        props: {
          variant: 'primary',
        },
      },
    ],
  };

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}

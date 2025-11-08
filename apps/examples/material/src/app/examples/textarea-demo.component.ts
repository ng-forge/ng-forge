import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-textarea-demo',
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
export class TextareaDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        value: '',
        maxLength: 500,
        props: {
          rows: 4,
          placeholder: 'Tell us about yourself',
        },
      },
    ],
  } as const satisfies FormConfig;
}

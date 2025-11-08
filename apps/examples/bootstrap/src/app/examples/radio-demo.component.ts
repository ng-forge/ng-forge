import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-radio-demo',
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
export class RadioDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'basicRadio',
        type: 'radio',
        label: 'Basic Radio Buttons',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
        props: {
          helpText: 'Default radio button styling',
        },
      },
      {
        key: 'inlineRadio',
        type: 'radio',
        label: 'Inline Radio Buttons',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
        props: {
          inline: true,
          helpText: 'Radio buttons displayed inline',
        },
      },
      {
        key: 'buttonGroupRadio',
        type: 'radio',
        label: 'Button Group Radio',
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ],
        props: {
          buttonGroup: true,
          helpText: 'Radio buttons rendered as button group',
        },
        required: true,
      },
      {
        key: 'buttonGroupOutline',
        type: 'radio',
        label: 'Outline Button Group',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'maybe', label: 'Maybe' },
        ],
        props: {
          buttonGroup: true,
          helpText: 'Button group style',
        },
      },
    ],
  } as const satisfies FormConfig;
}

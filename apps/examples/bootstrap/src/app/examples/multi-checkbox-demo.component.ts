import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-multi-checkbox-demo',
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
export class MultiCheckboxDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'basicMulti',
        type: 'multi-checkbox',
        label: 'Basic Multi-Checkbox',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
        props: {
          helpText: 'Default multi-checkbox styling',
        },
      },
      {
        key: 'inlineMulti',
        type: 'multi-checkbox',
        label: 'Inline Multi-Checkbox',
        options: [
          { value: 'html', label: 'HTML' },
          { value: 'css', label: 'CSS' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'typescript', label: 'TypeScript' },
        ],
        props: {
          inline: true,
          helpText: 'Checkboxes displayed inline',
        },
      },
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Areas of Interest',
        options: [
          { value: 'frontend', label: 'Frontend Development' },
          { value: 'backend', label: 'Backend Development' },
          { value: 'mobile', label: 'Mobile Development' },
          { value: 'devops', label: 'DevOps' },
        ],
        props: {
          helpText: 'Select all that apply',
        },
        required: true,
      },
    ],
  } as const satisfies FormConfig;
}

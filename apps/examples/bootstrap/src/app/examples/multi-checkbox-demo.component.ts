import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-multi-checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  styles: `
    .result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.375rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
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

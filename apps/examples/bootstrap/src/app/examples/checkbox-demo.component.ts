import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-checkbox-demo',
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
export class CheckboxDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'basicCheckbox',
        type: 'checkbox',
        label: 'Basic Checkbox',
        props: {
          helpText: 'Default checkbox styling',
        },
      },
      {
        key: 'switchCheckbox',
        type: 'checkbox',
        label: 'Switch Style Checkbox',
        props: {
          switch: true,
          helpText: 'Checkbox rendered as a switch toggle',
        },
      },
      {
        key: 'inlineCheckbox',
        type: 'checkbox',
        label: 'Inline Checkbox',
        props: {
          inline: true,
          helpText: 'Checkbox with inline layout',
        },
      },
      {
        key: 'reverseCheckbox',
        type: 'checkbox',
        label: 'Reverse Layout',
        props: {
          reverse: true,
          helpText: 'Checkbox with label on the left',
        },
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        required: true,
        props: {
          helpText: 'This checkbox is required',
        },
      },
    ],
  } as const satisfies FormConfig;
}

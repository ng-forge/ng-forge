import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-checkbox-demo',
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
export class CheckboxDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
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
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
        props: {
          variant: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}

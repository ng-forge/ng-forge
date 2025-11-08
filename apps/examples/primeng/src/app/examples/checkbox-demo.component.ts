import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="fields" [(value)]="formValue" />
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
})
export class CheckboxDemoComponent {
  formValue = signal({});

  fields = {
    fields: [
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          binary: true, // Binary mode for boolean values (true/false)
          hint: 'Get updates about new features and tips',
        },
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        props: {
          binary: true,
          hint: 'Please read our terms carefully',
        },
        required: true,
      },
      {
        key: 'privacy',
        type: 'checkbox',
        label: 'I agree to the Privacy Policy',
        props: {
          binary: true,
        },
        required: true,
      },
      {
        key: 'customValues',
        type: 'checkbox',
        label: 'Checkbox with Custom Values',
        props: {
          binary: true,
          trueValue: 'yes', // Custom value when checked
          falseValue: 'no', // Custom value when unchecked
          hint: 'Returns "yes" or "no" instead of true/false',
        },
      },
      {
        key: 'marketing',
        type: 'checkbox',
        label: 'Receive marketing communications',
        props: {
          binary: true,
          styleClass: 'custom-checkbox-class', // Custom CSS class
          hint: 'Optional - we respect your privacy',
        },
      },
    ],
  } as const satisfies FormConfig;
}

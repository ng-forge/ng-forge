import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class CheckboxDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicCheckbox',
        type: 'checkbox',
        label: 'Basic Checkbox',
        props: {
          hint: 'Default checkbox styling',
          color: 'primary',
          labelPosition: 'after',
        },
      },
      {
        key: 'primaryCheckbox',
        type: 'checkbox',
        label: 'Primary Color',
        props: {
          hint: 'Primary theme color',
          color: 'primary',
          labelPosition: 'after',
        },
      },
      {
        key: 'accentCheckbox',
        type: 'checkbox',
        label: 'Accent Color',
        props: {
          hint: 'Accent theme color',
          color: 'accent',
          labelPosition: 'after',
        },
      },
    ],
  } as const satisfies FormConfig;
}

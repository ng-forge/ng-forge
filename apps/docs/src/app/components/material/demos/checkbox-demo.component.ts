import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [(value)]="formOutput"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ formOutput() | json }}</pre>
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

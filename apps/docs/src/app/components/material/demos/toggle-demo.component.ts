import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'toggle-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" (valueChange)="formOutput.set($event)"></dynamic-form>
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
export class ToggleDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable Notifications',
        props: {
          // appearance: 'outline',
          color: 'primary',
          labelPosition: 'before',
          hint: 'Receive email notifications',
        },
      },
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Dark Mode',
        props: {
          // appearance: 'outline',
          color: 'accent',
          labelPosition: 'after',
          hint: 'Switch to dark theme',
        },
      },
      {
        key: 'autoSave',
        type: 'toggle',
        label: 'Auto Save',
        props: {
          // appearance: 'outline',
          color: 'primary',
          labelPosition: 'before',
          hint: 'Automatically save changes',
        },
      },
    ],
  } as const satisfies FormConfig;
}

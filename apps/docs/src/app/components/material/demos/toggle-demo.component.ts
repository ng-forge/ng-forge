import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'toggle-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
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
  model = signal({
    notifications: false,
    darkMode: false,
    autoSave: false,
  });

  fields: FieldConfig[] = [
    {
      key: 'notifications',
      type: 'toggle',
      props: {
        label: 'Enable Notifications',
        appearance: 'outline',
        color: 'primary',
        labelPosition: 'before',
        hint: 'Receive email notifications',
      },
    },
    {
      key: 'darkMode',
      type: 'toggle',
      props: {
        label: 'Dark Mode',
        appearance: 'outline',
        color: 'accent',
        labelPosition: 'after',
        hint: 'Switch to dark theme',
      },
    },
    {
      key: 'autoSave',
      type: 'toggle',
      props: {
        label: 'Auto Save',
        appearance: 'outline',
        color: 'primary',
        labelPosition: 'before',
        hint: 'Automatically save changes',
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}

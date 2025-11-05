import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-toggle-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
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

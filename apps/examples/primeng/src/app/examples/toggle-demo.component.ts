import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-toggle-demo',
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
export class ToggleDemoComponent {
  formValue = signal({});

  fields = {
    fields: [
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Dark Mode',
        props: {
          hint: 'Enable dark mode theme',
        },
      },
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable Notifications',
        props: {
          hint: 'Receive push notifications',
        },
      },
      {
        key: 'twoFactor',
        type: 'toggle',
        label: 'Two-Factor Authentication',
        props: {
          hint: 'Add an extra layer of security',
        },
      },
      {
        key: 'customValuesToggle',
        type: 'toggle',
        label: 'Toggle with Custom Values',
        props: {
          trueValue: 'enabled', // Custom value when toggled on
          falseValue: 'disabled', // Custom value when toggled off
          hint: 'Returns "enabled" or "disabled" instead of true/false',
        },
      },
      {
        key: 'emailNotifications',
        type: 'toggle',
        label: 'Email Notifications',
        props: {
          styleClass: 'custom-toggle-class', // Custom CSS class
          hint: 'Get notified via email',
        },
      },
    ],
  } as const satisfies FormConfig;
}

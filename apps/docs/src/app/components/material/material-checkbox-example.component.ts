import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-material-checkbox-example',
  imports: [DynamicFormComponent, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Material Checkbox Fields</h4>
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .example-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
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
      h4 {
        margin-top: 0;
        color: #1976d2;
      }
    `,
  ],
})
export class MaterialCheckboxExampleComponent {
  model = signal({
    newsletter: false,
    terms: false,
    privacy: false,
    notifications: {
      email: true,
      sms: false,
      push: false,
    },
    preferences: {
      darkMode: false,
      analytics: false,
    },
  });

  fields: FieldConfig[] = [
    {
      key: 'newsletter',
      type: 'checkbox',
      props: {
        label: 'Subscribe to newsletter',
        hint: 'Get updates about new features and tips',
        color: 'primary',
      },
    },
    {
      key: 'terms',
      type: 'checkbox',
      props: {
        label: 'I agree to the Terms and Conditions',
        color: 'primary',
        required: true,
      },
      validators: {
        required: true,
      },
    },
    {
      key: 'privacy',
      type: 'checkbox',
      props: {
        label: 'I agree to the Privacy Policy',
        color: 'accent',
        required: true,
      },
      validators: {
        required: true,
      },
    },
    {
      key: 'notifications.email',
      type: 'checkbox',
      props: {
        label: 'Email notifications',
        hint: 'Receive notifications via email',
        color: 'primary',
      },
    },
    {
      key: 'notifications.sms',
      type: 'checkbox',
      props: {
        label: 'SMS notifications',
        hint: 'Receive notifications via SMS',
        color: 'primary',
      },
    },
    {
      key: 'notifications.push',
      type: 'checkbox',
      props: {
        label: 'Push notifications',
        hint: 'Receive push notifications on your device',
        color: 'primary',
      },
    },
    {
      key: 'preferences.darkMode',
      type: 'checkbox',
      props: {
        label: 'Enable dark mode',
        color: 'accent',
      },
    },
    {
      key: 'preferences.analytics',
      type: 'checkbox',
      props: {
        label: 'Help improve our service',
        hint: 'Allow anonymous usage analytics',
        color: 'warn',
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}

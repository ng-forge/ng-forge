import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-radio-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class RadioDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'plan',
        type: 'radio',
        label: 'Select Plan',
        options: [
          { value: 'free', label: 'Free - $0/month' },
          { value: 'pro', label: 'Pro - $10/month' },
          { value: 'enterprise', label: 'Enterprise - $50/month' },
        ],
        props: {
          color: 'primary',
          hint: 'Choose your subscription plan',
        },
      },
      {
        key: 'priority',
        type: 'radio',
        label: 'Priority Level',
        options: [
          { value: 'low', label: 'Low Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'high', label: 'High Priority' },
          { value: 'urgent', label: 'Urgent' },
        ],
        props: {
          color: 'accent',
          hint: 'Select task priority',
        },
      },
    ],
  } as const satisfies FormConfig;
}

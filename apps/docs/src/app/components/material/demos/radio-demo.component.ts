import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'radio-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
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
export class RadioDemoComponent {
  model = signal({
    plan: '',
    priority: '',
  });

  fields: FormConfig = {
    fields: [
      {
        key: 'plan',
        type: 'radio',
        label: 'Select Plan',
        props: {
          appearance: 'outline',
          color: 'primary',
          hint: 'Choose your subscription plan',
          options: [
            { value: 'free', label: 'Free - $0/month' },
            { value: 'pro', label: 'Pro - $10/month' },
            { value: 'enterprise', label: 'Enterprise - $50/month' },
          ],
        },
      },
      {
        key: 'priority',
        type: 'radio',
        label: 'Priority Level',
        props: {
          appearance: 'outline',
          color: 'accent',
          hint: 'Select task priority',
          options: [
            { value: 'low', label: 'Low Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'high', label: 'High Priority' },
            { value: 'urgent', label: 'Urgent' },
          ],
        },
      },
    ],
  };

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}

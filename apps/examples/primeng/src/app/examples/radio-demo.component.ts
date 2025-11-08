import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-radio-demo',
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
export class RadioDemoComponent {
  formValue = signal({});

  fields = {
    fields: [
      {
        key: 'gender',
        type: 'radio',
        label: 'Gender',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ],
        props: {
          name: 'gender', // Name attribute for the radio button group
          hint: 'Select your gender',
        },
      },
      {
        key: 'subscriptionPlan',
        type: 'radio',
        label: 'Subscription Plan',
        options: [
          { value: 'free', label: 'Free - $0/month' },
          { value: 'pro', label: 'Pro - $10/month' },
          { value: 'enterprise', label: 'Enterprise - $50/month' },
        ],
        props: {
          name: 'subscriptionPlan',
          hint: 'Choose your plan',
        },
        required: true,
      },
      {
        key: 'contactMethod',
        type: 'radio',
        label: 'Preferred Contact Method',
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'sms', label: 'SMS' },
        ],
        props: {
          name: 'contactMethod',
        },
        required: true,
      },
      {
        key: 'size',
        type: 'radio',
        label: 'T-Shirt Size',
        options: [
          { value: 'xs', label: 'Extra Small' },
          { value: 's', label: 'Small' },
          { value: 'm', label: 'Medium' },
          { value: 'l', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ],
        props: {
          name: 'size',
          styleClass: 'custom-radio-class', // Custom CSS class
          hint: 'Select your size',
        },
      },
    ],
  } as const satisfies FormConfig;
}

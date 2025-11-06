import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng/no-augmentation';

@Component({
  selector: 'app-radio-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withPrimeNGFields())],
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
        key: 'gender',
        type: 'radio',
        label: 'Gender',
        props: {
          name: 'gender', // Name attribute for the radio button group
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ],
          hint: 'Select your gender',
        },
      },
      {
        key: 'subscriptionPlan',
        type: 'radio',
        label: 'Subscription Plan',
        props: {
          name: 'subscriptionPlan',
          options: [
            { value: 'free', label: 'Free - $0/month' },
            { value: 'pro', label: 'Pro - $10/month' },
            { value: 'enterprise', label: 'Enterprise - $50/month' },
          ],
          hint: 'Choose your plan',
        },
        required: true,
      },
      {
        key: 'contactMethod',
        type: 'radio',
        label: 'Preferred Contact Method',
        props: {
          name: 'contactMethod',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'sms', label: 'SMS' },
          ],
        },
        required: true,
      },
      {
        key: 'size',
        type: 'radio',
        label: 'T-Shirt Size',
        props: {
          name: 'size',
          options: [
            { value: 'xs', label: 'Extra Small' },
            { value: 's', label: 'Small' },
            { value: 'm', label: 'Medium' },
            { value: 'l', label: 'Large' },
            { value: 'xl', label: 'Extra Large' },
          ],
          styleClass: 'custom-radio-class', // Custom CSS class
          hint: 'Select your size',
        },
      },
    ],
  } as const satisfies FormConfig;
}

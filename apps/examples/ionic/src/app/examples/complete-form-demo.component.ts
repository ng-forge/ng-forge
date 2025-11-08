import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'example-complete-form-demo',
  imports: [DynamicForm, JsonPipe, IonContent],
  template: `
    <ion-content>
      <div style="padding: 1rem;">
        <h4>Complete Ionic Form</h4>
        <p>Comprehensive form showcasing all Ionic field components with validation.</p>

        <dynamic-form [config]="config" [(value)]="formValue" />

        <div class="example-result">
          <h4>Form Data:</h4>
          <pre>{{ formValue() | json }}</pre>
        </div>
      </div>
    </ion-content>
  `,
  host: {
    class: 'example-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: '',
        required: true,
        props: {
          placeholder: 'Your first name',
        },
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: '',
        required: true,
        props: {
          placeholder: 'Your last name',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        value: '',
        required: true,
        email: true,
        props: {
          type: 'email',
          placeholder: 'email@example.com',
        },
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        value: '',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 000-0000',
        },
      },
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          placeholder: 'Select your birth date',
          presentation: 'date' as const,
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        value: '',
        maxLength: 500,
        props: {
          rows: 4,
          placeholder: 'Tell us about yourself',
          autoGrow: true,
        },
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
        ],
        props: {
          placeholder: 'Select your country',
        },
      },
      {
        key: 'plan',
        type: 'radio',
        label: 'Subscription Plan',
        options: [
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise' },
        ],
      },
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        options: [
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'technology', label: 'Technology' },
          { value: 'art', label: 'Art' },
        ],
      },
      {
        key: 'volume',
        type: 'slider',
        label: 'Notification Volume',
        minValue: 0,
        maxValue: 100,
        step: 10,
        props: {
          pin: true,
        },
      },
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Dark Mode',
        props: {
          labelPlacement: 'start',
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          labelPlacement: 'end',
        },
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
        props: {
          labelPlacement: 'end',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;
}

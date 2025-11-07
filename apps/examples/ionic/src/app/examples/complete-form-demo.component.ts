import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-complete-form-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Complete Form Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div style="padding: 1rem;">
        <h4>Complete Ionic Form</h4>
        <p>Comprehensive form showcasing all Ionic field components with validation.</p>

        <dynamic-form [config]="config" [(value)]="formOutput" />

        <h4>Form Data:</h4>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </ion-content>
  `,
  host: {
    class: 'example-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
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
          presentation: 'date',
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
        props: {
          placeholder: 'Select your country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
            { value: 'au', label: 'Australia' },
          ],
        },
      },
      {
        key: 'plan',
        type: 'radio',
        label: 'Subscription Plan',
        props: {
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
        },
      },
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        props: {
          options: [
            { value: 'sports', label: 'Sports' },
            { value: 'music', label: 'Music' },
            { value: 'technology', label: 'Technology' },
            { value: 'art', label: 'Art' },
          ],
        },
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
  };
}

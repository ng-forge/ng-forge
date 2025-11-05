import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { submitButton, withMaterialFields } from '@ng-forge/dynamic-form-material';

interface UserFormModel {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  age: number;
  newsletter: boolean;
  plan: string;
  bio: string;
}

@Component({
  selector: 'app-quick-start-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <div>
      <h2>User Registration Form</h2>
      <p>Raw ng-forge form without custom styling - showing Material Design integration</p>

      <dynamic-form [config]="userFormFields" [(value)]="userModel" />

      <h3>Form Output (Live)</h3>
      <pre>{{ userModel() | json }}</pre>
    </div>
  `,
})
export class QuickStartDemoComponent {
  userModel = signal<UserFormModel>({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    age: 18,
    newsletter: false,
    plan: '',
    bio: '',
  });

  userFormFields: FormConfig = {
    fields: [
      // Personal Info
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        required: true,
        minLength: 2,
        props: {
          placeholder: 'Enter your first name',
        },
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        required: true,
        minLength: 2,
        props: {
          placeholder: 'Enter your last name',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        required: true,
        email: true,
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          hint: 'We will never share your email',
        },
      },

      // Demographics
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        required: true,
        min: 18,
        max: 120,
        props: {
          type: 'number',
          placeholder: '18',
        },
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        required: true,
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
          { value: 'jp', label: 'Japan' },
        ],
        props: {
          placeholder: 'Select your country',
        },
      },

      // Preferences
      {
        key: 'plan',
        type: 'select',
        label: 'Subscription Plan',
        required: true,
        options: [
          { value: 'free', label: 'Free - $0/month' },
          { value: 'pro', label: 'Pro - $10/month' },
          { value: 'enterprise', label: 'Enterprise - $50/month' },
        ],
        props: {
          placeholder: 'Choose a plan',
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        props: {
          placeholder: 'Tell us about yourself',
          hint: 'Optional - share a bit about yourself',
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          hint: 'Get updates about new features and special offers',
        },
      },

      // Submit button
      submitButton({
        key: 'submit',
        label: 'Create Account',
        className: 'button-btn',
        props: {
          color: 'primary',
        },
      }),
    ],
  };
}

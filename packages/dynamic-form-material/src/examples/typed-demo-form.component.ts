import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { MatField } from '../lib/types/material-field-types.enum';

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
  selector: 'app-typed-demo-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <h1>ng-forge Dynamic Forms Demo (Type-Safe)</h1>
      <p class="description">Using MatField enum for better type safety and autocompletion</p>

      <div class="form-section">
        <h2>User Registration Form</h2>
        <dynamic-form [config]="userFormFields" [value]="userModel()" (valueChange)="onValueChange($event)" />
      </div>

      <div class="output-section">
        <h3>Form Data (Live)</h3>
        <pre><code>{{ userModel() | json }}</code></pre>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      h1 {
        color: #1976d2;
        text-align: center;
        margin-bottom: 1rem;
      }

      .description {
        text-align: center;
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .form-section {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        margin-bottom: 2rem;
      }

      .form-section h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #333;
      }

      .output-section {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .output-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #333;
      }

      pre {
        background: #2d2d2d;
        color: #f8f8f2;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.9rem;
      }

      code {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      }
    `,
  ],
})
export class TypedDemoFormComponent {
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
      // Personal Info - using MatField enum for type safety
      {
        key: 'firstName',
        type: MatField.INPUT, // Type-safe!
        props: {
          label: 'First Name',
          placeholder: 'Enter your first name',
          required: true,
        },
        validators: {
          required: true,
          minLength: 2,
        },
      },
      {
        key: 'lastName',
        type: MatField.INPUT, // Type-safe!
        props: {
          label: 'Last Name',
          placeholder: 'Enter your last name',
          required: true,
        },
        validators: {
          required: true,
          minLength: 2,
        },
      },
      {
        key: 'email',
        type: MatField.EMAIL, // Type-safe with specific email validation!
        props: {
          label: 'Email Address',
          placeholder: 'user@example.com',
          hint: 'We will never share your email',
          required: true,
        },
        validators: {
          required: true,
          email: true,
        },
      },

      // Demographics
      {
        key: 'age',
        type: MatField.NUMBER, // Type-safe number input!
        props: {
          label: 'Age',
          placeholder: '18',
          required: true,
        },
        validators: {
          required: true,
          min: 18,
          max: 120,
        },
      },
      {
        key: 'country',
        type: MatField.SELECT, // Type-safe select!
        props: {
          label: 'Country',
          placeholder: 'Select your country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
            { value: 'au', label: 'Australia' },
            { value: 'de', label: 'Germany' },
            { value: 'fr', label: 'France' },
            { value: 'jp', label: 'Japan' },
          ],
          required: true,
        },
        validators: {
          required: true,
        },
      },

      // Preferences
      {
        key: 'plan',
        type: MatField.SELECT, // Type-safe select!
        props: {
          label: 'Subscription Plan',
          placeholder: 'Choose a plan',
          options: [
            { value: 'free', label: 'Free - $0/month' },
            { value: 'pro', label: 'Pro - $10/month' },
            { value: 'enterprise', label: 'Enterprise - $50/month' },
          ],
          required: true,
        },
        validators: {
          required: true,
        },
      },
      {
        key: 'bio',
        type: MatField.TEXTAREA, // Type-safe textarea!
        props: {
          label: 'Bio',
          placeholder: 'Tell us about yourself',
          hint: 'Optional - share a bit about yourself',
        },
      },
      {
        key: 'newsletter',
        type: MatField.CHECKBOX, // Type-safe checkbox!
        props: {
          label: 'Subscribe to newsletter',
          hint: 'Get updates about new features and special offers',
        },
      },

      // Submit button
      submitButton({
        label: 'Create Account',
        color: 'primary',
        className: 'submit-btn',
      }),
    ],
  };

  onValueChange(newValue: UserFormModel) {
    this.userModel.set(newValue);
  }
}

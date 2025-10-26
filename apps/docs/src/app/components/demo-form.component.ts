import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-material';

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
  selector: 'app-demo-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <h1>ng-forge Dynamic Forms Demo</h1>
      <p class="description">Showcase of ng-forge dynamic forms library built with Angular 21 signal forms architecture.</p>

      <div class="form-section">
        <h2>User Registration Form</h2>
        <dynamic-form [config]="userFormFields" [(value)]="userModel" />
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
export class DemoFormComponent {
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
        props: {
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
        },
      },

      // Preferences
      {
        key: 'plan',
        type: 'select',
        label: 'Subscription Plan',
        required: true,
        props: {
          placeholder: 'Choose a plan',
          options: [
            { value: 'free', label: 'Free - $0/month' },
            { value: 'pro', label: 'Pro - $10/month' },
            { value: 'enterprise', label: 'Enterprise - $50/month' },
          ],
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
        label: 'Create Account',
        color: 'primary',
        className: 'submit-btn',
      }),
    ],
  };
}

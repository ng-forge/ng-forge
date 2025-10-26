import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-material';

interface CompleteFormModel {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  preferences: {
    country: string;
    language: string;
    plan: string;
    notifications: string[];
  };
  agreements: {
    newsletter: boolean;
    terms: boolean;
    privacy: boolean;
  };
}

@Component({
  selector: 'app-complete-material-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Complete Material Design Form</h4>
      <p class="description">A comprehensive form showcasing all Material components with proper theming and validation.</p>
      <dynamic-form [config]="config" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
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
        padding: 2rem;
        margin: 1rem 0;
        max-width: 800px;
      }
      .description {
        color: #666;
        margin-bottom: 1.5rem;
        font-style: italic;
      }
      .output {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }
      pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin: 0.5rem 0;
        max-height: 300px;
        overflow-y: auto;
      }
      h4 {
        margin-top: 0;
        color: #1976d2;
      }
    `,
  ],
})
export class CompleteMaterialFormComponent {
  model = signal<CompleteFormModel>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    preferences: {
      country: '',
      language: '',
      plan: '',
      notifications: [],
    },
    agreements: {
      newsletter: false,
      terms: false,
      privacy: false,
    },
  });

  config: FormConfig = {
    fields: [
      // Personal Information Section
      {
        key: 'personalInfo.firstName',
        type: 'input',
        label: 'First Name',
        props: {
          placeholder: 'Enter your first name',
          appearance: 'outline',
          required: true,
        },
        validation: {
          required: true,
          minLength: 2,
        },
      },
      {
        key: 'personalInfo.lastName',
        type: 'input',
        props: {
          label: 'Last Name',
          placeholder: 'Enter your last name',
          appearance: 'outline',
          required: true,
        },
        validation: {
          required: true,
          minLength: 2,
        },
      },
      {
        key: 'personalInfo.email',
        type: 'input',
        label: 'Email Address',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          appearance: 'outline',
          required: true,
          hint: 'We will never share your email',
        },
        validation: {
          required: true,
          email: true,
        },
      },
      {
        key: 'personalInfo.phone',
        type: 'input',
        label: 'Phone Number',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          appearance: 'outline',
          hint: 'Include country code',
        },
      },

      // Preferences Section
      {
        key: 'preferences.country',
        type: 'select',
        label: 'Country',
        props: {
          placeholder: 'Select your country',
          appearance: 'outline',
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
        },
        validation: {
          required: true,
        },
      },
      {
        key: 'preferences.language',
        type: 'select',
        label: 'Language',
        props: {
          placeholder: 'Select your language',
          appearance: 'outline',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
          ],
        },
      },
      {
        key: 'preferences.plan',
        type: 'select',
        label: 'Subscription Plan',
        props: {
          placeholder: 'Choose your plan',
          appearance: 'outline',
          required: true,
          hint: 'You can upgrade or downgrade anytime',
          options: [
            { value: 'free', label: 'Free - $0/month', description: 'Basic features' },
            { value: 'pro', label: 'Pro - $10/month', description: 'Advanced features' },
            { value: 'enterprise', label: 'Enterprise - $50/month', description: 'Full features + support' },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        key: 'preferences.notifications',
        type: 'select',
        label: 'Notification Types',
        props: {
          placeholder: 'Select notification preferences',
          appearance: 'outline',
          multiple: true,
          hint: 'Select all that apply',
          options: [
            { value: 'email', label: 'Email notifications' },
            { value: 'sms', label: 'SMS notifications' },
            { value: 'push', label: 'Push notifications' },
            { value: 'newsletter', label: 'Newsletter' },
          ],
        },
      },

      // Agreements Section
      {
        key: 'agreements.newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          hint: 'Get updates about new features and tips',
          color: 'primary',
        },
      },
      {
        key: 'agreements.terms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        props: {
          color: 'primary',
          required: true,
        },
        validation: {
          required: true,
        },
      },
      {
        key: 'agreements.privacy',
        type: 'checkbox',
        label: 'I agree to the Privacy Policy',
        props: {
          color: 'primary',
          required: true,
        },
        validation: {
          required: true,
        },
      },

      // Submit Button
      submitButton({
        label: 'Create Account',
        color: 'primary',
        className: 'submit-btn',
      }),
    ],
  };

  onValueChange(newValue: CompleteFormModel) {
    this.model.set(newValue);
  }
}

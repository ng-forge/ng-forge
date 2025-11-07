import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-complete-prime-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <h4>Complete PrimeNG Form</h4>
    <p>Comprehensive form showcasing all PrimeNG field components with validation.</p>
    <dynamic-form [config]="config" [(value)]="model" (submitted)="submitted($event)" />
    <h4>Form Data:</h4>
    <pre>{{ model() | json }}</pre>
  `,
})
export class CompletePrimeFormComponent {
  model = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    bio: '',
    country: '',
    language: '',
    plan: '',
    skills: [],
    gender: '',
    birthDate: null,
    preferences: [],
    newsletter: false,
    darkMode: false,
    terms: false,
    privacy: false,
    experienceLevel: 0,
  });

  submitted(value: any): void {
    console.log('Form Submitted!', value);
    alert('Form submitted successfully! Check the console for details.');
  }

  config: FormConfig = {
    fields: [
      // ============================================
      // PERSONAL INFORMATION SECTION
      // ============================================
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        props: {
          placeholder: 'Enter your first name',
          variant: 'outlined',
          hint: 'Your legal first name',
        },
        required: true,
        minLength: 2,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        props: {
          placeholder: 'Enter your last name',
          variant: 'outlined',
        },
        required: true,
        minLength: 2,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          variant: 'outlined',
          hint: 'We will never share your email',
        },
        required: true,
        email: true,
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          variant: 'outlined',
          hint: 'Include country code',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        props: {
          type: 'password',
          placeholder: 'Enter a secure password',
          variant: 'outlined',
          hint: 'At least 8 characters',
        },
        required: true,
        minLength: 8,
      },
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          dateFormat: 'mm/dd/yy',
          showIcon: true,
          showButtonBar: true,
          hint: 'Select your birth date',
        },
        required: true,
      },
      {
        key: 'gender',
        type: 'radio',
        label: 'Gender',
        props: {
          name: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' },
          ],
        },
      },

      // ============================================
      // PROFILE SECTION
      // ============================================
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        props: {
          placeholder: 'Tell us about yourself...',
          rows: 4,
          autoResize: true,
          maxlength: 500,
          hint: 'Brief personal bio (max 500 characters)',
        },
      },

      // ============================================
      // PREFERENCES SECTION
      // ============================================
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        props: {
          placeholder: 'Select your country',
          filter: true,
          showClear: true,
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
            { value: 'au', label: 'Australia' },
            { value: 'de', label: 'Germany' },
            { value: 'fr', label: 'France' },
            { value: 'jp', label: 'Japan' },
            { value: 'in', label: 'India' },
          ],
        },
        required: true,
      },
      {
        key: 'language',
        type: 'select',
        label: 'Preferred Language',
        props: {
          placeholder: 'Select your language',
          showClear: true,
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
        key: 'plan',
        type: 'select',
        label: 'Subscription Plan',
        props: {
          placeholder: 'Choose your plan',
          options: [
            { value: 'free', label: 'Free - $0/month' },
            { value: 'pro', label: 'Pro - $10/month' },
            { value: 'enterprise', label: 'Enterprise - $50/month' },
          ],
          hint: 'You can upgrade or downgrade anytime',
        },
        required: true,
      },

      // ============================================
      // SKILLS & INTERESTS
      // ============================================
      {
        key: 'skills',
        type: 'multi-checkbox',
        label: 'Technical Skills',
        props: {
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'node', label: 'Node.js' },
          ],
          hint: 'Select all that apply',
        },
      },
      {
        key: 'preferences',
        type: 'select',
        label: 'Notification Preferences',
        props: {
          placeholder: 'Select notification types',
          multiple: true,
          filter: true,
          showClear: true,
          options: [
            { value: 'email', label: 'Email notifications' },
            { value: 'sms', label: 'SMS notifications' },
            { value: 'push', label: 'Push notifications' },
            { value: 'newsletter', label: 'Newsletter' },
          ],
          hint: 'How would you like to be notified?',
        },
      },

      // ============================================
      // SETTINGS
      // ============================================
      {
        key: 'experienceLevel',
        type: 'slider',
        label: 'Experience Level (Years)',
        props: {
          min: 0,
          max: 20,
          step: 1,
          hint: 'Years of professional experience',
        },
      },
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Enable Dark Mode',
        props: {
          hint: 'Toggle dark mode theme',
        },
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          binary: true,
          hint: 'Get updates about new features and tips',
        },
      },

      // ============================================
      // AGREEMENTS
      // ============================================
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        props: {
          binary: true,
        },
        required: true,
      },
      {
        key: 'privacy',
        type: 'checkbox',
        label: 'I agree to the Privacy Policy',
        props: {
          binary: true,
        },
        required: true,
      },

      // ============================================
      // SUBMIT BUTTON
      // ============================================
      submitButton({
        key: 'submit',
        label: 'Create Account',
        props: {
          severity: 'primary',
          raised: true,
          icon: 'pi pi-user-plus',
          iconPos: 'right',
        },
      }),
    ],
  };
}

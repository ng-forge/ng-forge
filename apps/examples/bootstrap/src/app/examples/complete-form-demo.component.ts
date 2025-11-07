import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-complete-form-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="container my-4">
      <h2>Complete Bootstrap Form</h2>
      <p>A comprehensive example showcasing all Bootstrap field types with validation.</p>
      <div class="row">
        <div class="col-lg-8">
          <dynamic-form [config]="config" [(value)]="model" (submitted)="submitted($event)" />
        </div>
        <div class="col-lg-4">
          <h4>Form Data:</h4>
          <pre>{{ model() | json }}</pre>
          @if (submittedData()) {
          <h4>Submitted:</h4>
          <pre>{{ submittedData() | json }}</pre>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      max-width: 1200px;
    }
    pre {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      overflow-x: auto;
    }
  `,
  host: {
    class: 'example-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormDemoComponent {
  model = signal({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    country: '',
    city: '',
    address: '',
    skillLevel: '',
    technologies: [],
    interests: [],
    experienceYears: 3,
    availability: '',
    remoteWork: false,
    emailNotifications: false,
    smsNotifications: false,
    terms: false,
    privacy: false,
    newsletter: false,
  });

  submittedData = signal<unknown>(null);

  submitted(value: unknown): void {
    console.log('Form Submitted!', value);
    this.submittedData.set({ timestamp: new Date().toISOString(), data: value });
  }

  config: FormConfig = {
    fields: [
      // Personal Information Section
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        props: {
          placeholder: 'Enter your first name',
          floatingLabel: true,
          validFeedback: 'Looks good!',
          invalidFeedback: 'Please enter your first name (at least 2 characters)',
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
          floatingLabel: true,
          validFeedback: 'Looks good!',
          invalidFeedback: 'Please enter your last name (at least 2 characters)',
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
          floatingLabel: true,
          helpText: 'We will never share your email with anyone',
          validFeedback: 'Email format is correct',
          invalidFeedback: 'Please enter a valid email address',
        },
        required: true,
        email: true,
      },
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        props: {
          placeholder: 'Choose a username',
          floatingLabel: true,
          helpText: '3-20 characters, alphanumeric only',
          invalidFeedback: 'Username must be 3-20 characters',
        },
        required: true,
        minLength: 3,
        maxLength: 20,
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        props: {
          type: 'password',
          placeholder: 'Create a password',
          floatingLabel: true,
          helpText: 'At least 8 characters',
          invalidFeedback: 'Password must be at least 8 characters',
        },
        required: true,
        minLength: 8,
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        props: {
          type: 'password',
          placeholder: 'Confirm your password',
          floatingLabel: true,
          invalidFeedback: 'Please confirm your password',
        },
        required: true,
        minLength: 8,
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          floatingLabel: true,
          helpText: 'Include country code',
        },
      },
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Date of Birth',
        props: {
          floatingLabel: true,
          helpText: 'You must be 18 or older to register',
        },
        required: true,
      },

      // Location Information
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        props: {
          placeholder: 'Select your country',
          floatingLabel: true,
          size: 'lg',
        },
        required: true,
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
      {
        key: 'city',
        type: 'input',
        label: 'City',
        props: {
          placeholder: 'Enter your city',
          floatingLabel: true,
        },
        required: true,
      },
      {
        key: 'address',
        type: 'textarea',
        label: 'Street Address',
        props: {
          placeholder: 'Enter your full address',
          floatingLabel: true,
          rows: 3,
        },
      },

      // Professional Information
      {
        key: 'skillLevel',
        type: 'radio',
        label: 'Skill Level',
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'expert', label: 'Expert' },
        ],
        props: {
          buttonGroup: true,
          helpText: 'Select your current skill level',
        },
        required: true,
      },
      {
        key: 'technologies',
        type: 'select',
        label: 'Technologies',
        props: {
          placeholder: 'Select technologies you know',
          multiple: true,
          helpText: 'Select all that apply',
        },
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue.js' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'node', label: 'Node.js' },
          { value: 'python', label: 'Python' },
          { value: 'java', label: 'Java' },
        ],
      },
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Areas of Interest',
        options: [
          { value: 'frontend', label: 'Frontend Development' },
          { value: 'backend', label: 'Backend Development' },
          { value: 'mobile', label: 'Mobile Development' },
          { value: 'devops', label: 'DevOps' },
          { value: 'design', label: 'UI/UX Design' },
          { value: 'testing', label: 'Testing & QA' },
        ],
        props: {
          inline: true,
          helpText: 'Select all areas you are interested in',
        },
      },
      {
        key: 'experienceYears',
        type: 'slider',
        label: 'Years of Experience',
        props: {
          min: 0,
          max: 20,
          step: 1,
          showValue: true,
          valueSuffix: ' years',
          helpText: 'Total years of professional experience',
        },
      },
      {
        key: 'availability',
        type: 'radio',
        label: 'Availability',
        options: [
          { value: 'immediately', label: 'Immediately' },
          { value: '2weeks', label: 'Within 2 weeks' },
          { value: '1month', label: 'Within 1 month' },
          { value: 'flexible', label: 'Flexible' },
        ],
        props: {
          inline: true,
        },
      },

      // Preferences
      {
        key: 'remoteWork',
        type: 'toggle',
        label: 'Open to Remote Work',
        props: {
          size: 'lg',
          helpText: 'Are you willing to work remotely?',
        },
      },
      {
        key: 'emailNotifications',
        type: 'checkbox',
        label: 'Email Notifications',
        props: {
          switch: true,
          helpText: 'Receive job alerts via email',
        },
      },
      {
        key: 'smsNotifications',
        type: 'checkbox',
        label: 'SMS Notifications',
        props: {
          switch: true,
          helpText: 'Receive job alerts via SMS',
        },
      },

      // Agreements
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        required: true,
      },
      {
        key: 'privacy',
        type: 'checkbox',
        label: 'I agree to the Privacy Policy',
        required: true,
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter for updates and tips',
      },

      // Submit Button
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: {
          variant: 'primary',
          size: 'lg',
          block: true,
        },
      },
    ],
  };
}

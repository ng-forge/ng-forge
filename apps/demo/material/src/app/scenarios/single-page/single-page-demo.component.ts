import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { TranslationService } from '../../services/mock-translate.service';

@Component({
  selector: 'demo-single-page',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container" data-testid="single-page-demo">
      <h2>Single Page Form Demo</h2>
      <p>Complete form example with all Material Design field types, validation, and translations.</p>

      <dynamic-form [config]="formConfig" data-testid="demo-form" (submitted)="onFormSubmit($event)" [(value)]="currentFormValue" />

      @if (submittedData(); as data) {
      <div class="submission-result" data-testid="submission-result">
        <h3>Form Submitted Successfully!</h3>
        <pre>{{ data | json }}</pre>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;

        h2 {
          color: #1976d2;
          margin-bottom: 0.5rem;
        }

        > p {
          color: #666;
          margin-bottom: 2rem;
        }

        :global(.section-header) {
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
          color: #1976d2 !important;
          font-weight: 500 !important;
        }

        :global(.demo-welcome-text) {
          text-align: center !important;
          margin-bottom: 2rem !important;
          color: #1976d2 !important;
        }
      }

      .submission-result {
        margin-top: 2rem;
        padding: 1rem;
        background: #e8f5e8;
        border: 1px solid #4caf50;
        border-radius: 4px;

        h3 {
          color: #2e7d32;
          margin: 0 0 1rem 0;
        }

        pre {
          background: white;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.9rem;
          margin: 0;
        }
      }
    `,
  ],
})
export default class SinglePageDemoComponent {
  private translationService = inject(TranslationService);

  formConfig: any = {
    fields: [
      // Welcome text
      {
        key: 'welcome-text',
        type: 'text',
        label: this.translationService.translate('form.text.welcomeMessage'),
        props: {
          elementType: 'h3',
        },
        className: 'demo-welcome-text',
      },

      // Personal Information Section
      {
        key: 'personal-info-text',
        type: 'text',
        label: this.translationService.translate('form.text.personalInfo'),
        props: {
          elementType: 'h4',
        },
        className: 'section-header',
      },

      // Row with first and last name
      {
        key: 'name-row',
        type: 'row',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: this.translationService.translate('form.labels.firstName'),
            props: {
              placeholder: this.translationService.translate('form.placeholders.enterFirstName'),
            },
            col: 6,
            required: true,
          },
          {
            key: 'lastName',
            type: 'input',
            label: this.translationService.translate('form.labels.lastName'),
            props: {
              placeholder: this.translationService.translate('form.placeholders.enterLastName'),
            },
            col: 6,
            required: true,
          },
        ],
      },

      // Email field
      {
        key: 'email',
        type: 'input',
        label: this.translationService.translate('form.labels.email'),
        props: {
          type: 'email',
          placeholder: this.translationService.translate('form.placeholders.enterEmail'),
        },
        required: true,
        email: true,
      },

      // Phone number
      {
        key: 'phoneNumber',
        type: 'input',
        label: this.translationService.translate('form.labels.phoneNumber'),
        props: {
          type: 'tel',
          placeholder: this.translationService.translate('form.placeholders.enterPhone'),
        },
      },

      // Birth date
      {
        key: 'birthDate',
        type: 'datepicker',
        label: this.translationService.translate('form.labels.birthDate'),
        required: true,
      },

      // Gender selection
      {
        key: 'gender',
        type: 'radio',
        label: this.translationService.translate('form.labels.gender'),
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say' },
        ],
      },

      // Account Details Section
      {
        key: 'account-details-text',
        type: 'text',
        label: this.translationService.translate('form.text.accountDetails'),
        props: {
          elementType: 'h4',
        },
        className: 'section-header',
      },

      // Password fields
      {
        key: 'password-row',
        type: 'row',
        fields: [
          {
            key: 'password',
            type: 'input',
            label: this.translationService.translate('form.labels.password'),
            props: {
              type: 'password',
              placeholder: this.translationService.translate('form.placeholders.enterPassword'),
            },
            col: 6,
            required: true,
            minLength: 8,
          },
          {
            key: 'confirmPassword',
            type: 'input',
            label: this.translationService.translate('form.labels.confirmPassword'),
            props: {
              type: 'password',
              placeholder: this.translationService.translate('form.placeholders.confirmPassword'),
            },
            col: 6,
            required: true,
            validators: [{ type: 'required', errorMessage: this.translationService.translate('form.errors.required') }],
          },
        ],
      },

      // Address Information Section
      {
        key: 'address-info-text',
        type: 'text',
        label: this.translationService.translate('form.text.addressInfo'),
        props: {
          elementType: 'h4',
        },
        className: 'section-header',
      },

      // Country selection
      {
        key: 'country',
        type: 'select',
        label: this.translationService.translate('form.labels.country'),
        props: {
          placeholder: this.translationService.translate('form.placeholders.selectCountry'),
        },
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
          { value: 'au', label: 'Australia' },
          { value: 'jp', label: 'Japan' },
        ],
      },

      // City and postal code row
      {
        key: 'location-row',
        type: 'row',
        fields: [
          {
            key: 'city',
            type: 'input',
            label: this.translationService.translate('form.labels.city'),
            props: {
              placeholder: this.translationService.translate('form.placeholders.enterCity'),
            },
            col: 8,
          },
          {
            key: 'postalCode',
            type: 'input',
            label: this.translationService.translate('form.labels.postalCode'),
            props: {
              placeholder: this.translationService.translate('form.placeholders.enterPostalCode'),
            },
            col: 4,
          },
        ],
      },

      // Full address
      {
        key: 'address',
        type: 'textarea',
        label: this.translationService.translate('form.labels.address'),
        props: {
          placeholder: this.translationService.translate('form.placeholders.enterAddress'),
          rows: 3,
        },
      },

      // Preferences Section
      {
        key: 'preferences-text',
        type: 'text',
        label: this.translationService.translate('form.text.preferences'),
        props: {
          elementType: 'h4',
        },
        className: 'section-header',
      },

      // Newsletter subscription toggle
      {
        key: 'newsletter',
        type: 'toggle',
        label: this.translationService.translate('form.labels.newsletter'),
        value: false,
      },

      // Interest areas (multi-checkbox)
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Areas of Interest',
        options: [
          { value: 'technology', label: 'Technology' },
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'travel', label: 'Travel' },
          { value: 'food', label: 'Food & Cooking' },
          { value: 'books', label: 'Books & Literature' },
        ],
      },

      // Communication frequency slider
      {
        key: 'communicationFrequency',
        type: 'slider',
        label: 'Communication Frequency (per month)',
        props: {
          min: 0,
          max: 10,
          step: 1,
          tickInterval: 1,
        },
        value: 2,
      },

      // Terms and conditions
      {
        key: 'agreeToTerms',
        type: 'checkbox',
        label: this.translationService.translate('form.labels.agreeToTerms'),
        required: true,
      },

      // Submit button
      {
        key: 'submit',
        type: 'submit',
        label: this.translationService.translate('form.labels.submit'),
        props: {
          color: 'primary',
        },
      },
    ],
  };

  submittedData = signal<any>(undefined);
  currentFormValue = signal<any>(undefined);

  onFormSubmit(data: any): void {
    console.log('Form submitted:', data);
    this.submittedData.set(data);
  }
}

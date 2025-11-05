import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-material-validation',
  imports: [DynamicForm, JsonPipe],
  template: `
    <h4>Validation Examples</h4>
    <dynamic-form [config]="fields" [(value)]="model" />
    <h4>Form Data:</h4>
    <pre>{{ model() | json }}</pre>
  `,
})
export class MaterialValidationComponent {
  model = signal({
    requiredInput: '',
    emailInput: '',
    passwordInput: '',
    confirmPassword: '',
    phoneInput: '',
    ageInput: null,
    websiteInput: '',
    requiredSelect: '',
    requiredCheckbox: false,
    termsCheckbox: false,
  });

  fields: FormConfig = {
    fields: [
      // === REQUIRED VALIDATION ===
      {
        key: 'requiredInput',
        type: 'input',
        props: {
          label: 'Required Field',
          placeholder: 'This field is required...',
          appearance: 'outline',
          hint: 'Required validation with custom error message',
          required: true,
        },
        // validators: {
        //   required: true,
        // },
      },

      // === EMAIL VALIDATION ===
      {
        key: 'emailInput',
        type: 'input',
        props: {
          label: 'Email Address',
          type: 'email',
          placeholder: 'user@example.com',
          appearance: 'outline',
          hint: 'Must be a valid email format',
          required: true,
        },
        // validators: {
        //   required: true,
        //   email: true,
        // },
      },

      // === PASSWORD VALIDATION ===
      {
        key: 'passwordInput',
        type: 'input',
        props: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter password...',
          appearance: 'outline',
          hint: 'Minimum 8 characters, maximum 50',
          required: true,
        },
        // validators: {
        //   required: true,
        //   minLength: 8,
        //   maxLength: 50,
        // },
      },

      // === PATTERN VALIDATION ===
      {
        key: 'phoneInput',
        type: 'input',
        props: {
          label: 'Phone Number',
          type: 'tel',
          placeholder: '(555) 123-4567',
          appearance: 'outline',
          hint: 'Format: (XXX) XXX-XXXX',
        },
        // validators: {
        //   pattern: '/^(d{3}) d{3}-d{4}$/',
        // },
      },

      // === NUMERIC VALIDATION ===
      {
        key: 'ageInput',
        type: 'input',
        props: {
          label: 'Age',
          type: 'number',
          placeholder: 'Enter your age...',
          appearance: 'outline',
          hint: 'Must be between 18 and 120',
          required: true,
        },
        // validators: {
        //   required: true,
        //   min: 18,
        //   max: 120,
        // },
      },

      // === URL VALIDATION ===
      {
        key: 'websiteInput',
        type: 'input',
        props: {
          label: 'Website URL',
          type: 'url',
          placeholder: 'https://example.com',
          appearance: 'outline',
          hint: 'Must be a valid URL starting with http:// or https://',
        },
        // validators: {
        //   pattern: '/^https?://.+/',
        // },
      },

      // === SELECT VALIDATION ===
      {
        key: 'requiredSelect',
        type: 'select',
        props: {
          label: 'Required Selection',
          placeholder: 'Please select an option...',
          appearance: 'outline',
          hint: 'You must select one option',
          required: true,
          options: [
            { value: 'option1', label: 'First Option' },
            { value: 'option2', label: 'Second Option' },
            { value: 'option3', label: 'Third Option' },
          ],
        },
        // validators: {
        //   required: true,
        // },
      },

      // === CHECKBOX VALIDATION ===
      {
        key: 'requiredCheckbox',
        type: 'checkbox',
        props: {
          label: 'Required Agreement',
          hint: 'You must check this box to continue',
          color: 'primary',
          required: true,
        },
        // validators: {
        //   required: true,
        // },
      },

      // === TERMS CHECKBOX ===
      {
        key: 'termsCheckbox',
        type: 'checkbox',
        props: {
          label: 'I agree to the Terms and Conditions',
          hint: 'Required to proceed with registration',
          color: 'primary',
          required: true,
        },
        // validators: {
        //   required: true,
        // },
      },

      // === SUBMIT BUTTON ===
      submitButton({
        key: 'submit',
        label: 'Submit Form',
        className: 'button-btn',
        props: {
          color: 'primary',
        },
      }),
    ],
  };
}

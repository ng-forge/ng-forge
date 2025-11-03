import { FieldDef, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Configuration options for form generation
 */
export interface E2EFormConfig {
  /** Include text components for form descriptions */
  includeTextComponents?: boolean;
  /** Use Material appearance styling */
  materialAppearance?: 'fill' | 'outline';
  /** Include CSS classes for styling tests */
  includeCssClasses?: boolean;
  /** Include validation rules */
  includeValidation?: boolean;
  /** Enable translation keys for i18n testing */
  enableTranslation?: boolean;
}

/**
 * E2E Form Configuration Factory
 * Based on existing DynamicFormTestUtils patterns but optimized for e2e testing
 */
export class E2EFormConfigFactory {
  private static defaultConfig: E2EFormConfig = {
    includeTextComponents: true,
    materialAppearance: 'outline',
    includeCssClasses: true,
    includeValidation: true,
    enableTranslation: false,
  };

  /**
   * Creates a comprehensive single-page registration form for e2e testing
   * Based on complete-material-form.component.ts patterns
   */
  static createUserRegistrationForm(config: E2EFormConfig = {}): FormConfig {
    const options = { ...this.defaultConfig, ...config };

    const fields: FieldDef<Record<string, unknown>>[] = [];

    // Add text component for form description
    if (options.includeTextComponents) {
      fields.push({
        key: 'form-intro',
        type: 'text',
        content: 'Please fill out this registration form to create your account.',
        className: options.includeCssClasses ? 'form-intro-text' : undefined,
      });
    }

    // Personal Information Section
    if (options.includeTextComponents) {
      fields.push({
        key: 'personal-info-header',
        type: 'text',
        content: '## Personal Information',
        className: options.includeCssClasses ? 'section-header' : undefined,
      });
    }

    // Use row layout for first/last name
    fields.push({
      key: 'name-row',
      type: 'row',
      className: options.includeCssClasses ? 'name-row-container' : undefined,
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: options.enableTranslation ? 'labels.firstName' : 'First Name',
          required: options.includeValidation,
          minLength: options.includeValidation ? 2 : undefined,
          className: options.includeCssClasses ? 'first-name-input' : undefined,
          props: {
            placeholder: options.enableTranslation ? 'placeholders.firstName' : 'Enter your first name',
            appearance: options.materialAppearance,
            'data-testid': 'firstName-input',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: options.enableTranslation ? 'labels.lastName' : 'Last Name',
          required: options.includeValidation,
          minLength: options.includeValidation ? 2 : undefined,
          className: options.includeCssClasses ? 'last-name-input' : undefined,
          props: {
            placeholder: options.enableTranslation ? 'placeholders.lastName' : 'Enter your last name',
            appearance: options.materialAppearance,
            'data-testid': 'lastName-input',
          },
        },
      ],
    } as FieldDef<Record<string, unknown>>);

    // Contact Information Group
    fields.push({
      key: 'contact-group',
      type: 'group',
      label: options.enableTranslation ? 'labels.contactInfo' : 'Contact Information',
      className: options.includeCssClasses ? 'contact-info-group' : undefined,
      fields: [
        {
          key: 'email',
          type: 'input',
          label: options.enableTranslation ? 'labels.email' : 'Email Address',
          required: options.includeValidation,
          email: options.includeValidation,
          className: options.includeCssClasses ? 'email-input' : undefined,
          props: {
            type: 'email',
            placeholder: options.enableTranslation ? 'placeholders.email' : 'user@example.com',
            appearance: options.materialAppearance,
            hint: options.enableTranslation ? 'hints.email' : 'We will never share your email',
            'data-testid': 'email-input',
          },
        },
        {
          key: 'phone',
          type: 'input',
          label: options.enableTranslation ? 'labels.phone' : 'Phone Number',
          className: options.includeCssClasses ? 'phone-input' : undefined,
          props: {
            type: 'tel',
            placeholder: options.enableTranslation ? 'placeholders.phone' : '+1 (555) 123-4567',
            appearance: options.materialAppearance,
            hint: options.enableTranslation ? 'hints.phone' : 'Include country code',
            'data-testid': 'phone-input',
          },
        },
      ],
    } as FieldDef<Record<string, unknown>>);

    // Preferences Section
    if (options.includeTextComponents) {
      fields.push({
        key: 'preferences-header',
        type: 'text',
        content: '## Preferences',
        className: options.includeCssClasses ? 'section-header' : undefined,
      });
    }

    fields.push({
      key: 'country',
      type: 'select',
      label: options.enableTranslation ? 'labels.country' : 'Country',
      required: options.includeValidation,
      className: options.includeCssClasses ? 'country-select' : undefined,
      props: {
        placeholder: options.enableTranslation ? 'placeholders.country' : 'Select your country',
        appearance: options.materialAppearance,
        'data-testid': 'country-select',
      },
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
        { value: 'de', label: 'Germany' },
      ],
    });

    // Agreements Section
    if (options.includeTextComponents) {
      fields.push({
        key: 'agreements-header',
        type: 'text',
        content: '## Terms and Agreements',
        className: options.includeCssClasses ? 'section-header' : undefined,
      });
    }

    fields.push({
      key: 'terms',
      type: 'checkbox',
      label: options.enableTranslation ? 'labels.terms' : 'I agree to the Terms and Conditions',
      required: options.includeValidation,
      className: options.includeCssClasses ? 'terms-checkbox' : undefined,
      props: {
        color: 'primary',
        'data-testid': 'terms-checkbox',
      },
    });

    fields.push({
      key: 'submit',
      type: 'button',
      label: options.enableTranslation ? 'labels.submit' : 'Create Account',
      className: options.includeCssClasses ? 'submit-button' : undefined,
      props: {
        type: 'submit',
        color: 'primary',
        'data-testid': 'submit-button',
      },
    });

    return { fields } as unknown as FormConfig;
  }

  /**
   * Creates a multi-page form for pagination testing
   * Based on page-orchestration.spec.ts patterns
   */
  static createMultiPageForm(config: E2EFormConfig = {}): FormConfig {
    const options = { ...this.defaultConfig, ...config };

    const fields: FieldDef<Record<string, unknown>>[] = [];

    // Page 1: Personal Information
    fields.push({
      key: 'page1',
      type: 'page',
      title: options.enableTranslation ? 'pages.personalInfo' : 'Personal Information',
      className: options.includeCssClasses ? 'page-personal-info' : undefined,
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: options.enableTranslation ? 'labels.firstName' : 'First Name',
          required: options.includeValidation,
          className: options.includeCssClasses ? 'first-name-input' : undefined,
          props: {
            appearance: options.materialAppearance,
            'data-testid': 'page1-firstName',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: options.enableTranslation ? 'labels.lastName' : 'Last Name',
          required: options.includeValidation,
          className: options.includeCssClasses ? 'last-name-input' : undefined,
          props: {
            appearance: options.materialAppearance,
            'data-testid': 'page1-lastName',
          },
        },
        {
          key: 'email',
          type: 'input',
          label: options.enableTranslation ? 'labels.email' : 'Email Address',
          required: options.includeValidation,
          email: options.includeValidation,
          className: options.includeCssClasses ? 'email-input' : undefined,
          props: {
            type: 'email',
            appearance: options.materialAppearance,
            'data-testid': 'page1-email',
          },
        },
      ],
    } as FieldDef<Record<string, unknown>>);

    // Page 2: Preferences
    fields.push({
      key: 'page2',
      type: 'page',
      title: options.enableTranslation ? 'pages.preferences' : 'Preferences',
      className: options.includeCssClasses ? 'page-preferences' : undefined,
      fields: [
        {
          key: 'country',
          type: 'select',
          label: options.enableTranslation ? 'labels.country' : 'Country',
          required: options.includeValidation,
          className: options.includeCssClasses ? 'country-select' : undefined,
          props: {
            appearance: options.materialAppearance,
            'data-testid': 'page2-country',
          },
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
          ],
        },
        {
          key: 'notifications',
          type: 'select',
          label: options.enableTranslation ? 'labels.notifications' : 'Notification Preferences',
          className: options.includeCssClasses ? 'notifications-select' : undefined,
          props: {
            multiple: true,
            appearance: options.materialAppearance,
            'data-testid': 'page2-notifications',
          },
          options: [
            { value: 'email', label: 'Email notifications' },
            { value: 'sms', label: 'SMS notifications' },
            { value: 'push', label: 'Push notifications' },
          ],
        },
      ],
    } as FieldDef<Record<string, unknown>>);

    // Page 3: Final Steps
    fields.push({
      key: 'page3',
      type: 'page',
      title: options.enableTranslation ? 'pages.finalSteps' : 'Final Steps',
      className: options.includeCssClasses ? 'page-final-steps' : undefined,
      fields: [
        {
          key: 'terms',
          type: 'checkbox',
          label: options.enableTranslation ? 'labels.terms' : 'I agree to the Terms and Conditions',
          required: options.includeValidation,
          className: options.includeCssClasses ? 'terms-checkbox' : undefined,
          props: {
            'data-testid': 'page3-terms',
          },
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          label: options.enableTranslation ? 'labels.newsletter' : 'Subscribe to newsletter',
          className: options.includeCssClasses ? 'newsletter-checkbox' : undefined,
          props: {
            'data-testid': 'page3-newsletter',
          },
        },
        {
          key: 'submit',
          type: 'button',
          label: options.enableTranslation ? 'labels.submit' : 'Complete Registration',
          className: options.includeCssClasses ? 'submit-button' : undefined,
          props: {
            type: 'submit',
            color: 'primary',
            'data-testid': 'page3-submit',
          },
        },
      ],
    } as FieldDef<Record<string, unknown>>);

    return { fields } as unknown as FormConfig;
  }

  /**
   * Creates a form with cross-field validation scenarios
   * For testing complex validation interactions
   */
  static createCrossFieldValidationForm(config: E2EFormConfig = {}): FormConfig {
    const options = { ...this.defaultConfig, ...config };

    const fields: FieldDef<Record<string, unknown>>[] = [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: options.includeValidation,
        minLength: options.includeValidation ? 8 : undefined,
        className: options.includeCssClasses ? 'password-input' : undefined,
        props: {
          type: 'password',
          appearance: options.materialAppearance,
          'data-testid': 'password-input',
        },
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        required: options.includeValidation,
        className: options.includeCssClasses ? 'confirm-password-input' : undefined,
        props: {
          type: 'password',
          appearance: options.materialAppearance,
          'data-testid': 'confirm-password-input',
        },
        // Cross-field validation would be implemented in the test scenarios
      },
      {
        key: 'birthdate',
        type: 'input',
        label: 'Birth Date',
        required: options.includeValidation,
        className: options.includeCssClasses ? 'birthdate-input' : undefined,
        props: {
          type: 'date',
          appearance: options.materialAppearance,
          'data-testid': 'birthdate-input',
        },
      },
      {
        key: 'parentConsent',
        type: 'checkbox',
        label: 'Parent/Guardian Consent (required for users under 18)',
        className: options.includeCssClasses ? 'parent-consent-checkbox' : undefined,
        props: {
          'data-testid': 'parent-consent-checkbox',
        },
        // Conditional validation based on age calculation from birthdate
      },
    ];

    return { fields } as unknown as FormConfig;
  }

  /**
   * Creates a layout testing form with various grid configurations
   * Tests col, rows, and group properties
   */
  static createLayoutTestForm(config: E2EFormConfig = {}): FormConfig {
    const options = { ...this.defaultConfig, ...config };

    const fields: FieldDef<Record<string, unknown>>[] = [
      // Test row layout with multiple fields
      {
        key: 'contact-row',
        type: 'row',
        className: options.includeCssClasses ? 'contact-row-layout' : undefined,
        fields: [
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
            className: options.includeCssClasses ? 'phone-input-row' : undefined,
            props: {
              appearance: options.materialAppearance,
              'data-testid': 'row-phone',
            },
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            className: options.includeCssClasses ? 'email-input-row' : undefined,
            props: {
              appearance: options.materialAppearance,
              'data-testid': 'row-email',
            },
          },
        ],
      } as FieldDef<Record<string, unknown>>,

      // Test group layout with nested structure
      {
        key: 'address-group',
        type: 'group',
        label: 'Address Information',
        className: options.includeCssClasses ? 'address-group-container' : undefined,
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            className: options.includeCssClasses ? 'street-input-group' : undefined,
            props: {
              appearance: options.materialAppearance,
              'data-testid': 'group-street',
            },
          },
          {
            key: 'city-state-row',
            type: 'row',
            className: options.includeCssClasses ? 'city-state-row' : undefined,
            fields: [
              {
                key: 'city',
                type: 'input',
                label: 'City',
                className: options.includeCssClasses ? 'city-input' : undefined,
                props: {
                  appearance: options.materialAppearance,
                  'data-testid': 'group-city',
                },
              },
              {
                key: 'state',
                type: 'select',
                label: 'State',
                className: options.includeCssClasses ? 'state-select' : undefined,
                props: {
                  appearance: options.materialAppearance,
                  'data-testid': 'group-state',
                },
                options: [
                  { value: 'ca', label: 'California' },
                  { value: 'ny', label: 'New York' },
                  { value: 'tx', label: 'Texas' },
                ],
              },
            ],
          } as FieldDef<Record<string, unknown>>,
        ],
      } as FieldDef<Record<string, unknown>>,
    ];

    return { fields } as unknown as FormConfig;
  }
}

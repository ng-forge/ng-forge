import { ConditionalExpression, FormConfig, ValidatorConfig } from '@ng-forge/dynamic-form';

/**
 * Configuration options for field generation
 */
export interface FieldOptions {
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  className?: string;
  tabIndex?: number;
  props?: Record<string, any>;
  validators?: ValidatorConfig[];
  logic?: Array<{
    type: 'hidden' | 'disabled' | 'readonly';
    condition: ConditionalExpression;
  }>;
}

/**
 * Layout configuration options
 */
export interface LayoutOptions {
  col?: number; // Grid column span (1-12)
  rows?: number; // Multi-element row layouts
  group?: boolean; // Nested form structures
  text?: string; // Informational content display
}

/**
 * Page configuration options
 */
export interface PageOptions {
  title?: string;
  description?: string;
  showNavigation?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
}

/**
 * Translation configuration
 */
export interface TranslationConfig {
  [language: string]: {
    [key: string]: string;
  };
}

/**
 * Factory class for generating dynamic form test configurations
 * Based on patterns discovered from unit tests analysis
 */
export class FormConfigurationFactory {
  protected fields: any[] = [];
  private schemas: any[] = [];
  private translations: TranslationConfig = {};

  /**
   * Basic Input Fields
   */
  inputField(key: string, label?: string, options: FieldOptions = {}): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'input',
      label: label || this.capitalizeFirst(key),
      ...this.buildFieldOptions(options),
    };

    this.fields.push(field);
    return this;
  }

  emailField(key: string = 'email', label?: string, options: FieldOptions = {}): FormConfigurationFactory {
    return this.inputField(key, label || 'Email', {
      ...options,
      props: {
        type: 'email',
        placeholder: options.placeholder || 'Enter email address',
        ...options.props,
      },
      validators: [{ type: 'required' }, { type: 'email' }, ...(options.validators || [])],
    });
  }

  passwordField(key: string = 'password', label?: string, options: FieldOptions = {}): FormConfigurationFactory {
    return this.inputField(key, label || 'Password', {
      ...options,
      props: {
        type: 'password',
        placeholder: options.placeholder || 'Enter password',
        ...options.props,
      },
      validators: [{ type: 'required' }, { type: 'minLength', value: 8 }, ...(options.validators || [])],
    });
  }

  numberField(key: string, label?: string, min?: number, max?: number, options: FieldOptions = {}): FormConfigurationFactory {
    const validators: ValidatorConfig[] = [...(options.validators || [])];

    if (min !== undefined) {
      validators.push({ type: 'min', value: min });
    }
    if (max !== undefined) {
      validators.push({ type: 'max', value: max });
    }

    return this.inputField(key, label, {
      ...options,
      props: {
        type: 'number',
        min,
        max,
        placeholder: options.placeholder || `Enter ${label || key}`,
        ...options.props,
      },
      validators,
    });
  }

  /**
   * Select Fields
   */
  selectField(
    key: string,
    options: Array<{ value: string; label: string }>,
    label?: string,
    fieldOptions: FieldOptions = {}
  ): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'select',
      label: label || this.capitalizeFirst(key),
      options,
      ...this.buildFieldOptions(fieldOptions),
    };

    this.fields.push(field);
    return this;
  }

  countrySelectField(key: string = 'country', label?: string, options: FieldOptions = {}): FormConfigurationFactory {
    const countryOptions = [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'jp', label: 'Japan' },
      { value: 'au', label: 'Australia' },
    ];

    return this.selectField(key, countryOptions, label || 'Country', options);
  }

  /**
   * Checkbox Fields
   */
  checkboxField(key: string, label?: string, options: FieldOptions = {}): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'checkbox',
      label: label || this.capitalizeFirst(key),
      ...this.buildFieldOptions(options),
    };

    this.fields.push(field);
    return this;
  }

  /**
   * Button Fields
   */
  buttonField(
    key: string,
    label?: string,
    buttonType: 'button' | 'submit' | 'reset' = 'button',
    options: FieldOptions = {}
  ): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'button',
      label: label || this.capitalizeFirst(key),
      props: {
        type: buttonType,
        ...options.props,
      },
      ...this.buildFieldOptions(options),
    };

    this.fields.push(field);
    return this;
  }

  /**
   * Layout Fields
   */
  rowField(key: string, fields: any[], label?: string): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'row',
      label: label || this.capitalizeFirst(key),
      fields,
    };

    this.fields.push(field);
    return this;
  }

  groupField(key: string, fields: any[], label?: string): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'group',
      label: label || this.capitalizeFirst(key),
      fields,
    };

    this.fields.push(field);
    return this;
  }

  pageField(key: string, fields: any[], options: PageOptions = {}): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'page',
      fields,
      props: {
        title: options.title || this.capitalizeFirst(key),
        description: options.description,
        showNavigation: options.showNavigation !== false,
        nextButtonText: options.nextButtonText || 'Next',
        previousButtonText: options.previousButtonText || 'Previous',
      },
    };

    this.fields.push(field);
    return this;
  }

  textField(key: string, content: string, label?: string): FormConfigurationFactory {
    const field: any = {
      key,
      type: 'text',
      label: label || '',
      props: {
        content,
      },
    };

    this.fields.push(field);
    return this;
  }

  /**
   * Cross-field Validation Scenarios
   */
  passwordConfirmationFields(passwordKey: string = 'password', confirmKey: string = 'confirmPassword'): FormConfigurationFactory {
    this.passwordField(passwordKey, 'Password');

    this.inputField(confirmKey, 'Confirm Password', {
      props: { type: 'password', placeholder: 'Confirm your password' },
      validators: [
        { type: 'required' },
        {
          type: 'custom',
          expression: `formValue.${passwordKey} === fieldValue`,
          errorMessage: 'Passwords do not match',
        },
      ],
    });

    return this;
  }

  conditionalEmailField(key: string = 'email', dependsOnField: string, dependsOnValue: any): FormConfigurationFactory {
    return this.emailField(key, 'Email Address', {
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: dependsOnField,
            operator: 'notEquals',
            value: dependsOnValue,
          },
        },
      ],
    });
  }

  ageBasedValidation(ageKey: string = 'age', dependentField: string): FormConfigurationFactory {
    this.numberField(ageKey, 'Age', 0, 120, { required: true });

    this.checkboxField(dependentField, 'Adult Content', {
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: `formValue.${ageKey} < 18`,
          },
        },
      ],
    });

    return this;
  }

  /**
   * Validation Schema Management
   */
  addSchema(name: string, validators: ValidatorConfig[], description?: string): FormConfigurationFactory {
    this.schemas.push({
      name,
      description,
      validators,
    });
    return this;
  }

  addEmailSchema(): FormConfigurationFactory {
    return this.addSchema('emailValidation', [{ type: 'required' }, { type: 'email' }], 'Standard email validation');
  }

  addPhoneSchema(): FormConfigurationFactory {
    return this.addSchema(
      'phoneValidation',
      [{ type: 'required' }, { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
      'International phone number validation'
    );
  }

  /**
   * Translation Support
   */
  addTranslation(language: string, translations: Record<string, string>): FormConfigurationFactory {
    this.translations[language] = {
      ...this.translations[language],
      ...translations,
    };
    return this;
  }

  addEnglishTranslations(translations: Record<string, string>): FormConfigurationFactory {
    return this.addTranslation('en', translations);
  }

  addSpanishTranslations(translations: Record<string, string>): FormConfigurationFactory {
    return this.addTranslation('es', translations);
  }

  addFrenchTranslations(translations: Record<string, string>): FormConfigurationFactory {
    return this.addTranslation('fr', translations);
  }

  /**
   * Realistic Form Builders
   */
  userProfileForm(): FormConfigurationFactory {
    return this.inputField('firstName', 'First Name', { required: true, defaultValue: 'John' })
      .inputField('lastName', 'Last Name', { required: true, defaultValue: 'Doe' })
      .emailField('email', 'Email Address', { required: true, defaultValue: 'john.doe@example.com' })
      .numberField('age', 'Age', 18, 100, { required: true, defaultValue: 30 })
      .countrySelectField('country', 'Country', { defaultValue: 'us' })
      .checkboxField('newsletter', 'Subscribe to Newsletter', { defaultValue: true })
      .checkboxField('terms', 'Accept Terms of Service', { required: true, defaultValue: false });
  }

  contactForm(): FormConfigurationFactory {
    return this.inputField('name', 'Full Name', { required: true, placeholder: 'Enter your full name' })
      .emailField('email', 'Email Address', { required: true })
      .inputField('subject', 'Subject', { required: true, placeholder: 'What is this about?' })
      .inputField('message', 'Message', {
        required: true,
        props: { type: 'textarea', rows: 4, placeholder: 'Enter your message' },
      })
      .selectField(
        'department',
        [
          { value: 'sales', label: 'Sales' },
          { value: 'support', label: 'Support' },
          { value: 'billing', label: 'Billing' },
          { value: 'general', label: 'General Inquiry' },
        ],
        'Department',
        { required: true }
      );
  }

  registrationForm(): FormConfigurationFactory {
    return this.inputField('username', 'Username', {
      required: true,
      validators: [
        { type: 'required' },
        { type: 'minLength', value: 3 },
        { type: 'pattern', value: '^[a-zA-Z0-9_]+$', errorMessage: 'Only letters, numbers, and underscores allowed' },
      ],
    })
      .emailField('email', 'Email Address', { required: true })
      .passwordConfirmationFields()
      .inputField('firstName', 'First Name', { required: true })
      .inputField('lastName', 'Last Name', { required: true })
      .ageBasedValidation('age', 'adultContent')
      .checkboxField('terms', 'I accept the Terms of Service', { required: true })
      .checkboxField('privacy', 'I accept the Privacy Policy', { required: true });
  }

  multiPageSurveyForm(): FormConfigurationFactory {
    // Page 1: Personal Information
    this.pageField(
      'personal',
      [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          required: true,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          required: true,
        },
        {
          key: 'age',
          type: 'input',
          label: 'Age',
          props: { type: 'number', min: 18, max: 100 },
          required: true,
        },
      ],
      { title: 'Personal Information', description: 'Tell us about yourself' }
    );

    // Page 2: Preferences
    this.pageField(
      'preferences',
      [
        {
          key: 'contactMethod',
          type: 'select',
          label: 'Preferred Contact Method',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'mail', label: 'Mail' },
          ],
          required: true,
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
        },
      ],
      { title: 'Contact Preferences', description: 'How would you like us to contact you?' }
    );

    // Page 3: Review
    this.pageField(
      'review',
      [
        {
          key: 'reviewText',
          type: 'text',
          props: {
            content: 'Please review your information before submitting.',
          },
        },
      ],
      { title: 'Review & Submit', description: 'Please review your information' }
    );

    return this;
  }

  /**
   * Layout Testing Forms
   */
  gridLayoutForm(): FormConfigurationFactory {
    // Row layout with multiple fields
    this.rowField(
      'nameRow',
      [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          defaultValue: 'John',
          col: 6, // Half width
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          defaultValue: 'Doe',
          col: 6, // Half width
        },
      ],
      'Full Name'
    );

    // Group layout with nested structure
    this.groupField(
      'address',
      [
        {
          key: 'street',
          type: 'input',
          label: 'Street Address',
          col: 12, // Full width
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          col: 6, // Half width
        },
        {
          key: 'zipCode',
          type: 'input',
          label: 'ZIP Code',
          col: 6, // Half width
        },
      ],
      'Address'
    );

    return this;
  }

  /**
   * Build final configuration
   */
  build(): FormConfig {
    const config: any = {
      fields: this.fields,
    };

    if (this.schemas.length > 0) {
      config.schemas = this.schemas;
    }

    if (Object.keys(this.translations).length > 0) {
      config.translations = this.translations;
    }

    return config;
  }

  /**
   * Reset factory for reuse
   */
  reset(): FormConfigurationFactory {
    this.fields = [];
    this.schemas = [];
    this.translations = {};
    return this;
  }

  /**
   * Private helper methods
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private buildFieldOptions(options: FieldOptions): any {
    const fieldOptions: any = {};

    if (options.defaultValue !== undefined) {
      fieldOptions.defaultValue = options.defaultValue;
    }

    if (options.required) {
      fieldOptions.required = true;
    }

    if (options.className) {
      fieldOptions.className = options.className;
    }

    if (options.tabIndex !== undefined) {
      fieldOptions.tabIndex = options.tabIndex;
    }

    if (options.props) {
      fieldOptions.props = {
        placeholder: options.placeholder,
        ...options.props,
      };
    } else if (options.placeholder) {
      fieldOptions.props = { placeholder: options.placeholder };
    }

    if (options.validators && options.validators.length > 0) {
      fieldOptions.validators = options.validators;
    }

    if (options.logic && options.logic.length > 0) {
      fieldOptions.logic = options.logic;
    }

    return fieldOptions;
  }
}

/**
 * Static factory methods for common scenarios
 */
export class FormConfigurationFactoryPresets {
  static userProfile(): FormConfig {
    return new FormConfigurationFactory().userProfileForm().build();
  }

  static contactForm(): FormConfig {
    return new FormConfigurationFactory().contactForm().build();
  }

  static registrationForm(): FormConfig {
    return new FormConfigurationFactory().registrationForm().build();
  }

  static multiPageSurvey(): FormConfig {
    return new FormConfigurationFactory().multiPageSurveyForm().build();
  }

  static gridLayout(): FormConfig {
    return new FormConfigurationFactory().gridLayoutForm().build();
  }

  static simpleForm(): FormConfig {
    return new FormConfigurationFactory()
      .inputField('name', 'Full Name', { required: true })
      .emailField('email', 'Email Address', { required: true })
      .checkboxField('terms', 'Accept Terms', { required: true })
      .build();
  }

  static complexValidationForm(): FormConfig {
    return new FormConfigurationFactory()
      .passwordConfirmationFields()
      .ageBasedValidation('age', 'adultContent')
      .conditionalEmailField('email', 'contactMethod', 'email')
      .build();
  }

  static translatedForm(): FormConfig {
    return new FormConfigurationFactory()
      .inputField('name', 'Name', { required: true })
      .emailField('email', 'Email', { required: true })
      .addEnglishTranslations({
        Name: 'Name',
        Email: 'Email Address',
        Submit: 'Submit',
      })
      .addSpanishTranslations({
        Name: 'Nombre',
        Email: 'Correo Electrónico',
        Submit: 'Enviar',
      })
      .addFrenchTranslations({
        Name: 'Nom',
        Email: 'Adresse Email',
        Submit: 'Soumettre',
      })
      .build();
  }
}

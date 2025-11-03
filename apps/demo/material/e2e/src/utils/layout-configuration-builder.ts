import { FormConfigurationFactory } from './form-configuration-factory';

/**
 * Enhanced layout configuration builder that extends the base factory
 * with layout capabilities using only the actual properties available in the codebase
 */
export class LayoutConfigurationBuilder extends FormConfigurationFactory {
  /**
   * Grid System Implementation using the 'col' property
   */

  /**
   * Creates a row with fields that have specific column spans
   */
  gridRow(key: string, fields: Array<{ field: any; col?: number }>): LayoutConfigurationBuilder {
    const rowFields = fields.map(({ field, col }) => ({
      ...field,
      col: col || 12,
    }));

    const rowField: any = {
      key,
      type: 'row',
      label: key,
      fields: rowFields,
    };

    this.fields.push(rowField);
    return this;
  }

  /**
   * Creates a two-column layout with specified fields
   */
  twoColumnRow(key: string, leftField: any, rightField: any, leftCol = 6, rightCol = 6): LayoutConfigurationBuilder {
    return this.gridRow(key, [
      { field: leftField, col: leftCol },
      { field: rightField, col: rightCol },
    ]);
  }

  /**
   * Creates a three-column layout with equal width columns
   */
  threeColumnRow(key: string, fields: [any, any, any]): LayoutConfigurationBuilder {
    return this.gridRow(
      key,
      fields.map((field) => ({ field, col: 4 }))
    );
  }

  /**
   * Creates a four-column layout
   */
  fourColumnRow(key: string, fields: [any, any, any, any]): LayoutConfigurationBuilder {
    return this.gridRow(
      key,
      fields.map((field) => ({ field, col: 3 }))
    );
  }

  /**
   * Group Layout Implementation
   */

  /**
   * Creates a simple group with fields
   */
  simpleGroup(key: string, fields: any[], label: string): LayoutConfigurationBuilder {
    const groupField: any = {
      key,
      type: 'group',
      label,
      fields,
    };

    this.fields.push(groupField);
    return this;
  }

  /**
   * Text Components using actual TextField implementation
   */

  /**
   * Creates a text component with specified HTML element type
   */
  textElement(key: string, content: string, elementType: string = 'p'): LayoutConfigurationBuilder {
    const textField: any = {
      key,
      type: 'text',
      label: content,
      props: {
        elementType,
      },
    };

    this.fields.push(textField);
    return this;
  }

  /**
   * Creates a heading text component
   */
  heading(key: string, text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2): LayoutConfigurationBuilder {
    const elementType = `h${level}`;
    return this.textElement(key, text, elementType);
  }

  /**
   * Creates a paragraph text component
   */
  paragraph(key: string, text: string): LayoutConfigurationBuilder {
    return this.textElement(key, text, 'p');
  }

  /**
   * Creates a span text component
   */
  span(key: string, text: string): LayoutConfigurationBuilder {
    return this.textElement(key, text, 'span');
  }

  /**
   * Page Layout Implementation
   */

  /**
   * Creates a page with title, description and fields
   */
  createPage(key: string, fields: any[], title?: string, description?: string): LayoutConfigurationBuilder {
    const pageField: any = {
      key,
      type: 'page',
      fields,
      title,
      description,
    };

    this.fields.push(pageField);
    return this;
  }

  /**
   * Pre-built Layout Templates using only available properties
   */

  /**
   * Creates a standard contact form layout
   */
  contactFormLayout(): LayoutConfigurationBuilder {
    this.heading('contact_title', 'Contact Us');
    this.paragraph('contact_description', "We'd love to hear from you. Send us a message and we'll respond as soon as possible.");

    // Personal information row (two columns)
    this.twoColumnRow(
      'personal_info',
      { key: 'firstName', type: 'input', label: 'First Name', required: true },
      { key: 'lastName', type: 'input', label: 'Last Name', required: true }
    );

    // Contact information row (two columns)
    this.twoColumnRow(
      'contact_info',
      { key: 'email', type: 'input', label: 'Email', required: true, props: { type: 'email' } },
      { key: 'phone', type: 'input', label: 'Phone', props: { type: 'tel' } }
    );

    // Subject (full width)
    this.inputField('subject', 'Subject', { required: true });

    // Message (full width)
    this.inputField('message', 'Message', {
      required: true,
      props: { type: 'textarea', rows: 5 },
    });

    // Submit button
    this.buttonField('submit', 'Send Message', 'submit');

    return this;
  }

  /**
   * Creates a user profile form layout
   */
  userProfileLayout(): LayoutConfigurationBuilder {
    this.heading('profile_title', 'User Profile');

    // Basic Information Section
    this.simpleGroup(
      'basic_info',
      [
        {
          key: 'name_row',
          type: 'row',
          fields: [
            { key: 'firstName', type: 'input', label: 'First Name', required: true, col: 6 },
            { key: 'lastName', type: 'input', label: 'Last Name', required: true, col: 6 },
          ],
        },
        { key: 'email', type: 'input', label: 'Email', required: true, props: { type: 'email' } },
        {
          key: 'demographics_row',
          type: 'row',
          fields: [
            { key: 'age', type: 'input', label: 'Age', props: { type: 'number', min: 18, max: 100 }, col: 4 },
            {
              key: 'country',
              type: 'select',
              label: 'Country',
              options: [
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
              ],
              col: 8,
            },
          ],
        },
      ],
      'Basic Information'
    );

    // Preferences Section
    this.simpleGroup(
      'preferences',
      [
        { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
        { key: 'notifications', type: 'checkbox', label: 'Enable push notifications' },
        { key: 'marketing', type: 'checkbox', label: 'Receive marketing emails' },
      ],
      'Preferences'
    );

    return this;
  }

  /**
   * Creates a survey form layout
   */
  surveyFormLayout(): LayoutConfigurationBuilder {
    this.heading('survey_title', 'Customer Satisfaction Survey');
    this.paragraph('survey_intro', 'Please take a few minutes to share your feedback with us.');

    // Rating questions
    this.simpleGroup(
      'ratings',
      [
        {
          key: 'overall_satisfaction',
          type: 'select',
          label: 'Overall satisfaction with our service',
          options: [
            { value: '5', label: 'Very Satisfied' },
            { value: '4', label: 'Satisfied' },
            { value: '3', label: 'Neutral' },
            { value: '2', label: 'Dissatisfied' },
            { value: '1', label: 'Very Dissatisfied' },
          ],
          required: true,
        },
        {
          key: 'rating_grid',
          type: 'row',
          fields: [
            {
              key: 'quality_rating',
              type: 'select',
              label: 'Quality',
              options: [
                { value: '5', label: 'Excellent' },
                { value: '4', label: 'Good' },
                { value: '3', label: 'Average' },
                { value: '2', label: 'Poor' },
                { value: '1', label: 'Very Poor' },
              ],
              col: 6,
            },
            {
              key: 'speed_rating',
              type: 'select',
              label: 'Speed',
              options: [
                { value: '5', label: 'Excellent' },
                { value: '4', label: 'Good' },
                { value: '3', label: 'Average' },
                { value: '2', label: 'Poor' },
                { value: '1', label: 'Very Poor' },
              ],
              col: 6,
            },
          ],
        },
      ],
      'Service Ratings'
    );

    // Feedback section
    this.simpleGroup(
      'feedback',
      [
        {
          key: 'improvements',
          type: 'input',
          label: 'What could we improve?',
          props: { type: 'textarea', rows: 3 },
        },
        {
          key: 'recommend',
          type: 'select',
          label: 'Would you recommend us to others?',
          options: [
            { value: 'yes', label: 'Yes, definitely' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'no', label: 'No, probably not' },
          ],
        },
      ],
      'Additional Feedback'
    );

    // Submit button
    this.buttonField('submit_survey', 'Submit Survey', 'submit');

    return this;
  }

  /**
   * Creates a form showcasing the grid system
   */
  gridShowcaseLayout(): LayoutConfigurationBuilder {
    this.heading('grid_title', 'Grid System Showcase');

    // Single column (12/12)
    this.gridRow('full_width', [{ field: { key: 'full', type: 'input', label: 'Full Width (12 columns)' }, col: 12 }]);

    // Two columns (6/6)
    this.gridRow('half_width', [
      { field: { key: 'half1', type: 'input', label: 'Half Width (6 columns)' }, col: 6 },
      { field: { key: 'half2', type: 'input', label: 'Half Width (6 columns)' }, col: 6 },
    ]);

    // Three columns (4/4/4)
    this.gridRow('third_width', [
      { field: { key: 'third1', type: 'input', label: 'One Third (4 columns)' }, col: 4 },
      { field: { key: 'third2', type: 'input', label: 'One Third (4 columns)' }, col: 4 },
      { field: { key: 'third3', type: 'input', label: 'One Third (4 columns)' }, col: 4 },
    ]);

    // Four columns (3/3/3/3)
    this.gridRow('quarter_width', [
      { field: { key: 'quarter1', type: 'input', label: 'Quarter (3 columns)' }, col: 3 },
      { field: { key: 'quarter2', type: 'input', label: 'Quarter (3 columns)' }, col: 3 },
      { field: { key: 'quarter3', type: 'input', label: 'Quarter (3 columns)' }, col: 3 },
      { field: { key: 'quarter4', type: 'input', label: 'Quarter (3 columns)' }, col: 3 },
    ]);

    // Asymmetric layout (8/4)
    this.gridRow('asymmetric', [
      { field: { key: 'large', type: 'input', label: 'Large (8 columns)' }, col: 8 },
      { field: { key: 'small', type: 'input', label: 'Small (4 columns)' }, col: 4 },
    ]);

    // Mixed layout (3/6/3)
    this.gridRow('mixed_layout', [
      { field: { key: 'side1', type: 'input', label: 'Side (3 columns)' }, col: 3 },
      { field: { key: 'center', type: 'input', label: 'Center (6 columns)' }, col: 6 },
      { field: { key: 'side2', type: 'input', label: 'Side (3 columns)' }, col: 3 },
    ]);

    return this;
  }

  /**
   * Creates a multi-page form layout
   */
  multiPageLayout(): LayoutConfigurationBuilder {
    // Page 1: Personal Information
    this.createPage(
      'personal',
      [
        {
          key: 'personal_title',
          type: 'text',
          label: 'Personal Information',
          props: { elementType: 'h2' },
        },
        {
          key: 'name_row',
          type: 'row',
          fields: [
            { key: 'firstName', type: 'input', label: 'First Name', required: true, col: 6 },
            { key: 'lastName', type: 'input', label: 'Last Name', required: true, col: 6 },
          ],
        },
        { key: 'age', type: 'input', label: 'Age', props: { type: 'number', min: 18, max: 100 }, required: true },
      ],
      'Personal Information',
      'Tell us about yourself'
    );

    // Page 2: Contact Information
    this.createPage(
      'contact',
      [
        {
          key: 'contact_title',
          type: 'text',
          label: 'Contact Information',
          props: { elementType: 'h2' },
        },
        { key: 'email', type: 'input', label: 'Email', props: { type: 'email' }, required: true },
        { key: 'phone', type: 'input', label: 'Phone', props: { type: 'tel' } },
        {
          key: 'address_group',
          type: 'group',
          label: 'Address',
          fields: [
            { key: 'street', type: 'input', label: 'Street Address' },
            {
              key: 'city_zip_row',
              type: 'row',
              fields: [
                { key: 'city', type: 'input', label: 'City', col: 8 },
                { key: 'zipCode', type: 'input', label: 'ZIP Code', col: 4 },
              ],
            },
          ],
        },
      ],
      'Contact Information',
      'How can we reach you?'
    );

    // Page 3: Preferences
    this.createPage(
      'preferences',
      [
        {
          key: 'preferences_title',
          type: 'text',
          label: 'Preferences',
          props: { elementType: 'h2' },
        },
        { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
        { key: 'notifications', type: 'checkbox', label: 'Enable notifications' },
        {
          key: 'contactMethod',
          type: 'select',
          label: 'Preferred Contact Method',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'mail', label: 'Mail' },
          ],
        },
      ],
      'Preferences',
      'Tell us your preferences'
    );

    return this;
  }
}

/**
 * Static factory methods for common layout patterns
 */
export class LayoutPresets {
  static contactForm(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder().contactFormLayout();
  }

  static userProfile(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder().userProfileLayout();
  }

  static survey(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder().surveyFormLayout();
  }

  static gridShowcase(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder().gridShowcaseLayout();
  }

  static multiPage(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder().multiPageLayout();
  }

  static twoColumnForm(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder()
      .twoColumnRow(
        'name_row',
        { key: 'firstName', type: 'input', label: 'First Name', required: true },
        { key: 'lastName', type: 'input', label: 'Last Name', required: true }
      )
      .twoColumnRow(
        'contact_row',
        { key: 'email', type: 'input', label: 'Email', required: true, props: { type: 'email' } },
        { key: 'phone', type: 'input', label: 'Phone', props: { type: 'tel' } }
      );
  }

  static threeColumnForm(): LayoutConfigurationBuilder {
    return new LayoutConfigurationBuilder().threeColumnRow('info_row', [
      { key: 'firstName', type: 'input', label: 'First Name', required: true },
      { key: 'lastName', type: 'input', label: 'Last Name', required: true },
      { key: 'middleName', type: 'input', label: 'Middle Name' },
    ]);
  }
}

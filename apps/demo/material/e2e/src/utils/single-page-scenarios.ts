/**
 * Single-page form scenarios with cross-field validation
 * Based on actual field types and validation patterns from unit tests
 */
export class SinglePageScenarios {
  /**
   * User Profile Form - Basic cross-field validation
   */
  static userProfile(): any {
    return {
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          required: true,
          defaultValue: 'John',
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          required: true,
          defaultValue: 'Doe',
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          defaultValue: 'john.doe@example.com',
          props: { type: 'email' },
          validators: [{ type: 'required' }, { type: 'email' }],
        },
        {
          key: 'age',
          type: 'input',
          label: 'Age',
          required: true,
          defaultValue: '30',
          props: { type: 'number', min: 18, max: 100 },
          validators: [{ type: 'required' }, { type: 'min', value: 18 }, { type: 'max', value: 100 }],
          col: 4,
        },
        {
          key: 'country',
          type: 'select',
          label: 'Country',
          defaultValue: 'us',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'fr', label: 'France' },
            { value: 'de', label: 'Germany' },
          ],
          col: 8,
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
          defaultValue: true,
        },
        {
          key: 'terms',
          type: 'checkbox',
          label: 'I accept the Terms of Service',
          required: true,
          defaultValue: false,
        },
      ],
    };
  }

  /**
   * Contact Form - Simple validation
   */
  static contactForm(): any {
    return {
      fields: [
        {
          key: 'name',
          type: 'input',
          label: 'Full Name',
          required: true,
          defaultValue: 'Jane Smith',
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          required: true,
          defaultValue: 'jane.smith@example.com',
          props: { type: 'email' },
          validators: [{ type: 'required' }, { type: 'email' }],
          col: 6,
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone Number',
          defaultValue: '+1-555-0123',
          props: { type: 'tel' },
          validators: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
          col: 6,
        },
        {
          key: 'department',
          type: 'select',
          label: 'Department',
          required: true,
          defaultValue: 'support',
          options: [
            { value: 'sales', label: 'Sales' },
            { value: 'support', label: 'Support' },
            { value: 'billing', label: 'Billing' },
            { value: 'general', label: 'General Inquiry' },
          ],
          col: 6,
        },
        {
          key: 'subject',
          type: 'input',
          label: 'Subject',
          required: true,
          defaultValue: 'Need assistance with product',
        },
        {
          key: 'message',
          type: 'input',
          label: 'Message',
          required: true,
          defaultValue: 'I would like to know more about your services.',
          props: { type: 'textarea', rows: 4 },
        },
      ],
    };
  }

  /**
   * Registration Form - Cross-field validation scenarios
   */
  static registrationForm(): any {
    return {
      fields: [
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          required: true,
          defaultValue: 'johndoe123',
          validators: [
            { type: 'required' },
            { type: 'minLength', value: 3 },
            { type: 'pattern', value: '^[a-zA-Z0-9_]+$', errorMessage: 'Only letters, numbers, and underscores allowed' },
          ],
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          defaultValue: 'john@example.com',
          props: { type: 'email' },
          validators: [{ type: 'required' }, { type: 'email' }],
        },
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          required: true,
          defaultValue: 'SecurePass123!',
          props: { type: 'password' },
          validators: [{ type: 'required' }, { type: 'minLength', value: 8 }],
          col: 6,
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: 'Confirm Password',
          required: true,
          defaultValue: 'SecurePass123!',
          props: { type: 'password' },
          validators: [
            { type: 'required' },
            {
              type: 'custom',
              expression: 'formValue.password === fieldValue',
              errorMessage: 'Passwords do not match',
            },
          ],
          col: 6,
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          required: true,
          defaultValue: 'John',
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          required: true,
          defaultValue: 'Doe',
          col: 6,
        },
        {
          key: 'birthDate',
          type: 'input',
          label: 'Birth Date',
          required: true,
          defaultValue: '1990-01-15',
          props: { type: 'date' },
        },
        {
          key: 'agreeTerms',
          type: 'checkbox',
          label: 'I agree to the Terms of Service',
          required: true,
          defaultValue: false,
        },
        {
          key: 'agreePrivacy',
          type: 'checkbox',
          label: 'I agree to the Privacy Policy',
          required: true,
          defaultValue: false,
        },
        {
          key: 'marketingEmails',
          type: 'checkbox',
          label: 'I want to receive marketing emails',
          defaultValue: true,
        },
      ],
    };
  }

  /**
   * Survey Form - Conditional logic scenarios
   */
  static surveyForm(): any {
    return {
      fields: [
        {
          key: 'overallSatisfaction',
          type: 'select',
          label: 'Overall Satisfaction',
          required: true,
          defaultValue: '4',
          options: [
            { value: '5', label: 'Very Satisfied' },
            { value: '4', label: 'Satisfied' },
            { value: '3', label: 'Neutral' },
            { value: '2', label: 'Dissatisfied' },
            { value: '1', label: 'Very Dissatisfied' },
          ],
        },
        {
          key: 'recommendToFriend',
          type: 'select',
          label: 'Would you recommend us to a friend?',
          required: true,
          defaultValue: 'yes',
          options: [
            { value: 'yes', label: 'Yes, definitely' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'no', label: 'No, probably not' },
          ],
        },
        {
          key: 'improvementSuggestions',
          type: 'input',
          label: 'What could we improve?',
          defaultValue: 'Better customer support response time.',
          props: { type: 'textarea', rows: 3 },
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'overallSatisfaction',
                operator: 'equals',
                value: '5',
              },
            },
          ],
        },
        {
          key: 'contactForFollowup',
          type: 'checkbox',
          label: 'May we contact you for follow-up?',
          defaultValue: false,
        },
        {
          key: 'followupEmail',
          type: 'input',
          label: 'Follow-up Email Address',
          defaultValue: 'customer@example.com',
          props: { type: 'email' },
          validators: [
            {
              type: 'email',
              when: {
                type: 'fieldValue',
                fieldPath: 'contactForFollowup',
                operator: 'equals',
                value: true,
              },
            },
          ],
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'contactForFollowup',
                operator: 'notEquals',
                value: true,
              },
            },
          ],
        },
        {
          key: 'additionalComments',
          type: 'input',
          label: 'Additional Comments',
          defaultValue: 'Thank you for the great service!',
          props: { type: 'textarea', rows: 4 },
        },
      ],
    };
  }

  /**
   * Address Form - Nested group structure
   */
  static addressForm(): any {
    return {
      fields: [
        {
          key: 'personalInfo',
          type: 'group',
          label: 'Personal Information',
          fields: [
            {
              key: 'fullName',
              type: 'input',
              label: 'Full Name',
              required: true,
              defaultValue: 'Alice Johnson',
            },
            {
              key: 'email',
              type: 'input',
              label: 'Email',
              required: true,
              defaultValue: 'alice.johnson@example.com',
              props: { type: 'email' },
              validators: [{ type: 'required' }, { type: 'email' }],
            },
          ],
        },
        {
          key: 'address',
          type: 'group',
          label: 'Address',
          fields: [
            {
              key: 'street',
              type: 'input',
              label: 'Street Address',
              required: true,
              defaultValue: '123 Main Street',
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              required: true,
              defaultValue: 'Springfield',
              col: 6,
            },
            {
              key: 'state',
              type: 'select',
              label: 'State',
              required: true,
              defaultValue: 'CA',
              options: [
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
                { value: 'TX', label: 'Texas' },
                { value: 'FL', label: 'Florida' },
              ],
              col: 3,
            },
            {
              key: 'zipCode',
              type: 'input',
              label: 'ZIP Code',
              required: true,
              defaultValue: '12345',
              props: { type: 'text', pattern: '[0-9]{5}' },
              validators: [{ type: 'required' }, { type: 'pattern', value: '^[0-9]{5}$', errorMessage: 'ZIP code must be 5 digits' }],
              col: 3,
            },
          ],
        },
        {
          key: 'sameAsBilling',
          type: 'checkbox',
          label: 'Shipping address same as billing',
          defaultValue: true,
        },
        {
          key: 'shippingAddress',
          type: 'group',
          label: 'Shipping Address',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'sameAsBilling',
                operator: 'equals',
                value: true,
              },
            },
          ],
          fields: [
            {
              key: 'shippingStreet',
              type: 'input',
              label: 'Street Address',
              defaultValue: '456 Oak Avenue',
            },
            {
              key: 'shippingCity',
              type: 'input',
              label: 'City',
              defaultValue: 'Oakland',
              col: 6,
            },
            {
              key: 'shippingState',
              type: 'select',
              label: 'State',
              defaultValue: 'CA',
              options: [
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
                { value: 'TX', label: 'Texas' },
                { value: 'FL', label: 'Florida' },
              ],
              col: 3,
            },
            {
              key: 'shippingZipCode',
              type: 'input',
              label: 'ZIP Code',
              defaultValue: '54321',
              props: { type: 'text', pattern: '[0-9]{5}' },
              col: 3,
            },
          ],
        },
      ],
    };
  }

  /**
   * Complex Validation Form - Multiple cross-field scenarios
   */
  static complexValidationForm(): any {
    return {
      fields: [
        {
          key: 'userType',
          type: 'select',
          label: 'User Type',
          required: true,
          defaultValue: 'individual',
          options: [
            { value: 'individual', label: 'Individual' },
            { value: 'business', label: 'Business' },
            { value: 'nonprofit', label: 'Non-Profit' },
          ],
        },
        {
          key: 'personalName',
          type: 'input',
          label: 'Full Name',
          required: true,
          defaultValue: 'John Doe',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'userType',
                operator: 'notEquals',
                value: 'individual',
              },
            },
          ],
        },
        {
          key: 'businessName',
          type: 'input',
          label: 'Business Name',
          defaultValue: 'Acme Corporation',
          validators: [
            {
              type: 'required',
              when: {
                type: 'javascript',
                expression: 'formValue.userType === "business" || formValue.userType === "nonprofit"',
              },
            },
          ],
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'userType',
                operator: 'equals',
                value: 'individual',
              },
            },
          ],
        },
        {
          key: 'taxId',
          type: 'input',
          label: 'Tax ID',
          defaultValue: '12-3456789',
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'userType',
                operator: 'notEquals',
                value: 'individual',
              },
            },
            {
              type: 'pattern',
              value: '^[0-9]{2}-[0-9]{7}$',
              errorMessage: 'Tax ID must be in format XX-XXXXXXX',
              when: {
                type: 'fieldValue',
                fieldPath: 'userType',
                operator: 'notEquals',
                value: 'individual',
              },
            },
          ],
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'userType',
                operator: 'equals',
                value: 'individual',
              },
            },
          ],
        },
        {
          key: 'primaryEmail',
          type: 'input',
          label: 'Primary Email',
          required: true,
          defaultValue: 'primary@example.com',
          props: { type: 'email' },
          validators: [{ type: 'required' }, { type: 'email' }],
        },
        {
          key: 'hasSecondaryEmail',
          type: 'checkbox',
          label: 'I have a secondary email address',
          defaultValue: false,
        },
        {
          key: 'secondaryEmail',
          type: 'input',
          label: 'Secondary Email',
          defaultValue: 'secondary@example.com',
          props: { type: 'email' },
          validators: [
            {
              type: 'email',
              when: {
                type: 'fieldValue',
                fieldPath: 'hasSecondaryEmail',
                operator: 'equals',
                value: true,
              },
            },
            {
              type: 'custom',
              expression: 'formValue.primaryEmail !== fieldValue',
              errorMessage: 'Secondary email must be different from primary email',
              when: {
                type: 'fieldValue',
                fieldPath: 'hasSecondaryEmail',
                operator: 'equals',
                value: true,
              },
            },
          ],
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'hasSecondaryEmail',
                operator: 'notEquals',
                value: true,
              },
            },
          ],
        },
        {
          key: 'agreeToTerms',
          type: 'checkbox',
          label: 'I agree to the Terms and Conditions',
          required: true,
          defaultValue: false,
        },
      ],
    };
  }

  /**
   * Grid Layout Testing Form - Various column configurations
   */
  static gridLayoutForm(): any {
    return {
      fields: [
        // Full width field
        {
          key: 'title',
          type: 'input',
          label: 'Full Width Title',
          defaultValue: 'Grid Layout Test Form',
          col: 12,
        },
        // Two columns
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name (6 columns)',
          defaultValue: 'John',
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name (6 columns)',
          defaultValue: 'Doe',
          col: 6,
        },
        // Three columns
        {
          key: 'city',
          type: 'input',
          label: 'City (4 columns)',
          defaultValue: 'Springfield',
          col: 4,
        },
        {
          key: 'state',
          type: 'input',
          label: 'State (4 columns)',
          defaultValue: 'CA',
          col: 4,
        },
        {
          key: 'zip',
          type: 'input',
          label: 'ZIP (4 columns)',
          defaultValue: '12345',
          col: 4,
        },
        // Four columns
        {
          key: 'field1',
          type: 'input',
          label: 'Field 1 (3 columns)',
          defaultValue: 'Value 1',
          col: 3,
        },
        {
          key: 'field2',
          type: 'input',
          label: 'Field 2 (3 columns)',
          defaultValue: 'Value 2',
          col: 3,
        },
        {
          key: 'field3',
          type: 'input',
          label: 'Field 3 (3 columns)',
          defaultValue: 'Value 3',
          col: 3,
        },
        {
          key: 'field4',
          type: 'input',
          label: 'Field 4 (3 columns)',
          defaultValue: 'Value 4',
          col: 3,
        },
        // Asymmetric layout
        {
          key: 'description',
          type: 'input',
          label: 'Description (8 columns)',
          defaultValue: 'This field takes 8 columns',
          props: { type: 'textarea', rows: 2 },
          col: 8,
        },
        {
          key: 'priority',
          type: 'select',
          label: 'Priority (4 columns)',
          defaultValue: 'medium',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
          col: 4,
        },
      ],
    };
  }
}

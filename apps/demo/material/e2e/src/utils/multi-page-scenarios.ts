/**
 * Multi-page form scenarios with pagination and cross-page validation
 * Uses actual PageField implementation for realistic e2e testing
 */
export class MultiPageScenarios {
  /**
   * User Registration Wizard - 3 pages with cross-page validation
   */
  static registrationWizard(): any {
    return {
      fields: [
        // Page 1: Account Information
        {
          key: 'accountPage',
          type: 'page',
          props: {
            title: 'Account Information',
            description: 'Create your account credentials',
          },
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
          ],
        },

        // Page 2: Personal Information
        {
          key: 'personalPage',
          type: 'page',
          props: {
            title: 'Personal Information',
            description: 'Tell us about yourself',
          },
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
              key: 'birthDate',
              type: 'input',
              label: 'Date of Birth',
              required: true,
              defaultValue: '1990-01-15',
              props: { type: 'date' },
            },
            {
              key: 'phone',
              type: 'input',
              label: 'Phone Number',
              defaultValue: '+1-555-0123',
              props: { type: 'tel' },
              validators: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
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
                  key: 'zipCode',
                  type: 'input',
                  label: 'ZIP Code',
                  required: true,
                  defaultValue: '12345',
                  props: { type: 'text', pattern: '[0-9]{5}' },
                  validators: [{ type: 'required' }, { type: 'pattern', value: '^[0-9]{5}$', errorMessage: 'ZIP code must be 5 digits' }],
                  col: 6,
                },
              ],
            },
          ],
        },

        // Page 3: Preferences & Review
        {
          key: 'preferencesPage',
          type: 'page',
          props: {
            title: 'Preferences & Review',
            description: 'Set your preferences and review your information',
          },
          fields: [
            {
              key: 'contactPreferences',
              type: 'group',
              label: 'Contact Preferences',
              fields: [
                {
                  key: 'preferredContact',
                  type: 'select',
                  label: 'Preferred Contact Method',
                  required: true,
                  defaultValue: 'email',
                  options: [
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'mail', label: 'Mail' },
                  ],
                },
                {
                  key: 'newsletter',
                  type: 'checkbox',
                  label: 'Subscribe to newsletter',
                  defaultValue: true,
                },
                {
                  key: 'marketingEmails',
                  type: 'checkbox',
                  label: 'Receive marketing emails',
                  defaultValue: false,
                },
              ],
            },
            {
              key: 'terms',
              type: 'group',
              label: 'Terms and Conditions',
              fields: [
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
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * Customer Survey - 4 pages with conditional navigation
   */
  static customerSurvey(): any {
    return {
      fields: [
        // Page 1: Basic Information
        {
          key: 'basicInfoPage',
          type: 'page',
          props: {
            title: 'Basic Information',
            description: 'Tell us about yourself',
          },
          fields: [
            {
              key: 'customerType',
              type: 'select',
              label: 'Customer Type',
              required: true,
              defaultValue: 'existing',
              options: [
                { value: 'new', label: 'New Customer' },
                { value: 'existing', label: 'Existing Customer' },
                { value: 'prospect', label: 'Prospective Customer' },
              ],
            },
            {
              key: 'customerSince',
              type: 'input',
              label: 'Customer Since',
              defaultValue: '2020-01-01',
              props: { type: 'date' },
              validators: [
                {
                  type: 'required',
                  when: {
                    type: 'fieldValue',
                    fieldPath: 'customerType',
                    operator: 'equals',
                    value: 'existing',
                  },
                },
              ],
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'customerType',
                    operator: 'notEquals',
                    value: 'existing',
                  },
                },
              ],
            },
            {
              key: 'howDidYouHear',
              type: 'select',
              label: 'How did you hear about us?',
              defaultValue: 'referral',
              options: [
                { value: 'search', label: 'Search Engine' },
                { value: 'social', label: 'Social Media' },
                { value: 'referral', label: 'Referral' },
                { value: 'advertising', label: 'Advertising' },
                { value: 'other', label: 'Other' },
              ],
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'customerType',
                    operator: 'equals',
                    value: 'existing',
                  },
                },
              ],
            },
          ],
        },

        // Page 2: Service Experience
        {
          key: 'experiencePage',
          type: 'page',
          props: {
            title: 'Service Experience',
            description: 'Rate your experience with our services',
          },
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
              key: 'serviceRatings',
              type: 'group',
              label: 'Service Ratings',
              fields: [
                {
                  key: 'qualityRating',
                  type: 'select',
                  label: 'Quality of Service',
                  required: true,
                  defaultValue: '4',
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
                  key: 'speedRating',
                  type: 'select',
                  label: 'Speed of Service',
                  required: true,
                  defaultValue: '5',
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
            {
              key: 'likelyToRecommend',
              type: 'select',
              label: 'How likely are you to recommend us?',
              required: true,
              defaultValue: '8',
              options: [
                { value: '10', label: '10 - Extremely Likely' },
                { value: '9', label: '9' },
                { value: '8', label: '8' },
                { value: '7', label: '7' },
                { value: '6', label: '6' },
                { value: '5', label: '5 - Neutral' },
                { value: '4', label: '4' },
                { value: '3', label: '3' },
                { value: '2', label: '2' },
                { value: '1', label: '1' },
                { value: '0', label: '0 - Not at all Likely' },
              ],
            },
          ],
        },

        // Page 3: Feedback (shown only if satisfaction is low)
        {
          key: 'feedbackPage',
          type: 'page',
          props: {
            title: 'Feedback',
            description: 'Help us improve our services',
          },
          fields: [
            {
              key: 'improvementAreas',
              type: 'input',
              label: 'What areas need improvement?',
              required: true,
              defaultValue: 'Response time could be faster.',
              props: { type: 'textarea', rows: 4 },
            },
            {
              key: 'specificIssues',
              type: 'input',
              label: 'Describe any specific issues you encountered',
              defaultValue: 'Had trouble reaching customer support.',
              props: { type: 'textarea', rows: 3 },
            },
            {
              key: 'suggestions',
              type: 'input',
              label: 'Any suggestions for improvement?',
              defaultValue: 'Provide multiple contact options.',
              props: { type: 'textarea', rows: 3 },
            },
            {
              key: 'contactForFollowup',
              type: 'checkbox',
              label: 'May we contact you to discuss this feedback?',
              defaultValue: true,
            },
          ],
        },

        // Page 4: Thank You / Summary
        {
          key: 'summaryPage',
          type: 'page',
          props: {
            title: 'Thank You',
            description: 'Thank you for your valuable feedback',
          },
          fields: [
            {
              key: 'additionalComments',
              type: 'input',
              label: 'Any additional comments?',
              defaultValue: 'Thank you for the opportunity to provide feedback.',
              props: { type: 'textarea', rows: 3 },
            },
            {
              key: 'futureContact',
              type: 'checkbox',
              label: 'I would like to be contacted about future surveys',
              defaultValue: false,
            },
            {
              key: 'emailForUpdates',
              type: 'input',
              label: 'Email for updates',
              defaultValue: 'customer@example.com',
              props: { type: 'email' },
              validators: [
                {
                  type: 'email',
                  when: {
                    type: 'fieldValue',
                    fieldPath: 'futureContact',
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
                    fieldPath: 'futureContact',
                    operator: 'notEquals',
                    value: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * Job Application Form - 3 pages with file uploads and references
   */
  static jobApplication(): any {
    return {
      fields: [
        // Page 1: Personal Information
        {
          key: 'personalInfoPage',
          type: 'page',
          props: {
            title: 'Personal Information',
            description: 'Please provide your personal details',
          },
          fields: [
            {
              key: 'personalDetails',
              type: 'group',
              label: 'Personal Details',
              fields: [
                {
                  key: 'firstName',
                  type: 'input',
                  label: 'First Name',
                  required: true,
                  defaultValue: 'Sarah',
                  col: 6,
                },
                {
                  key: 'lastName',
                  type: 'input',
                  label: 'Last Name',
                  required: true,
                  defaultValue: 'Johnson',
                  col: 6,
                },
                {
                  key: 'email',
                  type: 'input',
                  label: 'Email Address',
                  required: true,
                  defaultValue: 'sarah.johnson@email.com',
                  props: { type: 'email' },
                  validators: [{ type: 'required' }, { type: 'email' }],
                },
                {
                  key: 'phone',
                  type: 'input',
                  label: 'Phone Number',
                  required: true,
                  defaultValue: '+1-555-0199',
                  props: { type: 'tel' },
                  validators: [{ type: 'required' }, { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
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
                  defaultValue: '456 Oak Avenue',
                },
                {
                  key: 'city',
                  type: 'input',
                  label: 'City',
                  required: true,
                  defaultValue: 'Portland',
                  col: 4,
                },
                {
                  key: 'state',
                  type: 'select',
                  label: 'State',
                  required: true,
                  defaultValue: 'OR',
                  options: [
                    { value: 'CA', label: 'California' },
                    { value: 'NY', label: 'New York' },
                    { value: 'TX', label: 'Texas' },
                    { value: 'FL', label: 'Florida' },
                    { value: 'OR', label: 'Oregon' },
                  ],
                  col: 4,
                },
                {
                  key: 'zipCode',
                  type: 'input',
                  label: 'ZIP Code',
                  required: true,
                  defaultValue: '97201',
                  props: { type: 'text', pattern: '[0-9]{5}' },
                  validators: [{ type: 'required' }, { type: 'pattern', value: '^[0-9]{5}$' }],
                  col: 4,
                },
              ],
            },
          ],
        },

        // Page 2: Professional Experience
        {
          key: 'experienceInfoPage',
          type: 'page',
          props: {
            title: 'Professional Experience',
            description: 'Tell us about your work experience and qualifications',
          },
          fields: [
            {
              key: 'position',
              type: 'input',
              label: 'Position Applied For',
              required: true,
              defaultValue: 'Senior Software Engineer',
            },
            {
              key: 'experience',
              type: 'group',
              label: 'Work Experience',
              fields: [
                {
                  key: 'currentEmployer',
                  type: 'input',
                  label: 'Current/Most Recent Employer',
                  required: true,
                  defaultValue: 'Tech Solutions Inc.',
                },
                {
                  key: 'currentPosition',
                  type: 'input',
                  label: 'Current/Most Recent Position',
                  required: true,
                  defaultValue: 'Software Engineer',
                },
                {
                  key: 'startDate',
                  type: 'input',
                  label: 'Start Date',
                  required: true,
                  defaultValue: '2020-03-01',
                  props: { type: 'date' },
                  col: 6,
                },
                {
                  key: 'endDate',
                  type: 'input',
                  label: 'End Date (or current)',
                  defaultValue: '2024-11-01',
                  props: { type: 'date' },
                  col: 6,
                },
                {
                  key: 'responsibilities',
                  type: 'input',
                  label: 'Key Responsibilities',
                  required: true,
                  defaultValue: 'Developed web applications using React and Node.js, collaborated with cross-functional teams.',
                  props: { type: 'textarea', rows: 4 },
                },
              ],
            },
            {
              key: 'qualifications',
              type: 'group',
              label: 'Qualifications',
              fields: [
                {
                  key: 'education',
                  type: 'input',
                  label: 'Highest Education Level',
                  required: true,
                  defaultValue: 'Bachelor of Science in Computer Science',
                },
                {
                  key: 'skills',
                  type: 'input',
                  label: 'Relevant Skills',
                  required: true,
                  defaultValue: 'JavaScript, TypeScript, React, Angular, Node.js, Python',
                  props: { type: 'textarea', rows: 3 },
                },
                {
                  key: 'yearsExperience',
                  type: 'select',
                  label: 'Years of Experience',
                  required: true,
                  defaultValue: '3-5',
                  options: [
                    { value: '0-1', label: '0-1 years' },
                    { value: '1-3', label: '1-3 years' },
                    { value: '3-5', label: '3-5 years' },
                    { value: '5-10', label: '5-10 years' },
                    { value: '10+', label: '10+ years' },
                  ],
                },
              ],
            },
          ],
        },

        // Page 3: References and Final Details
        {
          key: 'referencesPage',
          type: 'page',
          props: {
            title: 'References & Final Details',
            description: 'Provide references and any additional information',
          },
          fields: [
            {
              key: 'references',
              type: 'group',
              label: 'Professional References',
              fields: [
                {
                  key: 'reference1Name',
                  type: 'input',
                  label: 'Reference 1 - Name',
                  required: true,
                  defaultValue: 'Michael Chen',
                  col: 6,
                },
                {
                  key: 'reference1Title',
                  type: 'input',
                  label: 'Reference 1 - Title',
                  required: true,
                  defaultValue: 'Senior Manager',
                  col: 6,
                },
                {
                  key: 'reference1Company',
                  type: 'input',
                  label: 'Reference 1 - Company',
                  required: true,
                  defaultValue: 'Tech Solutions Inc.',
                  col: 6,
                },
                {
                  key: 'reference1Phone',
                  type: 'input',
                  label: 'Reference 1 - Phone',
                  required: true,
                  defaultValue: '+1-555-0167',
                  props: { type: 'tel' },
                  col: 6,
                },
                {
                  key: 'reference2Name',
                  type: 'input',
                  label: 'Reference 2 - Name',
                  defaultValue: 'Jessica Rodriguez',
                  col: 6,
                },
                {
                  key: 'reference2Title',
                  type: 'input',
                  label: 'Reference 2 - Title',
                  defaultValue: 'Team Lead',
                  col: 6,
                },
                {
                  key: 'reference2Company',
                  type: 'input',
                  label: 'Reference 2 - Company',
                  defaultValue: 'Innovation Labs',
                  col: 6,
                },
                {
                  key: 'reference2Phone',
                  type: 'input',
                  label: 'Reference 2 - Phone',
                  defaultValue: '+1-555-0184',
                  props: { type: 'tel' },
                  col: 6,
                },
              ],
            },
            {
              key: 'availability',
              type: 'group',
              label: 'Availability',
              fields: [
                {
                  key: 'startDate',
                  type: 'input',
                  label: 'Available Start Date',
                  required: true,
                  defaultValue: '2024-12-01',
                  props: { type: 'date' },
                },
                {
                  key: 'salaryExpectation',
                  type: 'input',
                  label: 'Salary Expectation',
                  defaultValue: '$85,000',
                  props: { type: 'text' },
                },
                {
                  key: 'additionalInfo',
                  type: 'input',
                  label: 'Additional Information',
                  defaultValue: 'I am excited about the opportunity to contribute to your team.',
                  props: { type: 'textarea', rows: 3 },
                },
              ],
            },
            {
              key: 'consent',
              type: 'group',
              label: 'Consent',
              fields: [
                {
                  key: 'agreeBackgroundCheck',
                  type: 'checkbox',
                  label: 'I consent to a background check',
                  required: true,
                  defaultValue: false,
                },
                {
                  key: 'agreeContactReferences',
                  type: 'checkbox',
                  label: 'I consent to contacting my references',
                  required: true,
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * E-commerce Checkout - 4 pages with cross-page validation
   */
  static ecommerceCheckout(): any {
    return {
      fields: [
        // Page 1: Cart Review
        {
          key: 'cartPage',
          type: 'page',
          props: {
            title: 'Shopping Cart',
            description: 'Review your items',
          },
          fields: [
            {
              key: 'items',
              type: 'group',
              label: 'Order Summary',
              fields: [
                {
                  key: 'itemCount',
                  type: 'input',
                  label: 'Number of Items',
                  defaultValue: '3',
                  props: { type: 'number', readonly: true },
                },
                {
                  key: 'subtotal',
                  type: 'input',
                  label: 'Subtotal',
                  defaultValue: '$129.97',
                  props: { readonly: true },
                },
                {
                  key: 'promoCode',
                  type: 'input',
                  label: 'Promotion Code',
                  defaultValue: 'SAVE10',
                  placeholder: 'Enter promo code',
                },
              ],
            },
          ],
        },

        // Page 2: Shipping Information
        {
          key: 'shippingPage',
          type: 'page',
          props: {
            title: 'Shipping Information',
            description: 'Where should we send your order?',
          },
          fields: [
            {
              key: 'customerInfo',
              type: 'group',
              label: 'Customer Information',
              fields: [
                {
                  key: 'email',
                  type: 'input',
                  label: 'Email Address',
                  required: true,
                  defaultValue: 'customer@example.com',
                  props: { type: 'email' },
                  validators: [{ type: 'required' }, { type: 'email' }],
                },
                {
                  key: 'phone',
                  type: 'input',
                  label: 'Phone Number',
                  required: true,
                  defaultValue: '+1-555-0145',
                  props: { type: 'tel' },
                  validators: [{ type: 'required' }, { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
                },
              ],
            },
            {
              key: 'shippingAddress',
              type: 'group',
              label: 'Shipping Address',
              fields: [
                {
                  key: 'firstName',
                  type: 'input',
                  label: 'First Name',
                  required: true,
                  defaultValue: 'Emma',
                  col: 6,
                },
                {
                  key: 'lastName',
                  type: 'input',
                  label: 'Last Name',
                  required: true,
                  defaultValue: 'Wilson',
                  col: 6,
                },
                {
                  key: 'address1',
                  type: 'input',
                  label: 'Address Line 1',
                  required: true,
                  defaultValue: '789 Pine Street',
                },
                {
                  key: 'address2',
                  type: 'input',
                  label: 'Address Line 2 (Optional)',
                  defaultValue: 'Apt 4B',
                },
                {
                  key: 'city',
                  type: 'input',
                  label: 'City',
                  required: true,
                  defaultValue: 'Seattle',
                  col: 6,
                },
                {
                  key: 'zipCode',
                  type: 'input',
                  label: 'ZIP Code',
                  required: true,
                  defaultValue: '98101',
                  props: { type: 'text', pattern: '[0-9]{5}' },
                  validators: [{ type: 'required' }, { type: 'pattern', value: '^[0-9]{5}$' }],
                  col: 6,
                },
              ],
            },
            {
              key: 'shippingOptions',
              type: 'group',
              label: 'Shipping Options',
              fields: [
                {
                  key: 'shippingSpeed',
                  type: 'select',
                  label: 'Shipping Speed',
                  required: true,
                  defaultValue: 'standard',
                  options: [
                    { value: 'standard', label: 'Standard (5-7 days) - Free' },
                    { value: 'expedited', label: 'Expedited (2-3 days) - $9.99' },
                    { value: 'overnight', label: 'Overnight - $24.99' },
                  ],
                },
              ],
            },
          ],
        },

        // Page 3: Payment Information
        {
          key: 'paymentPage',
          type: 'page',
          props: {
            title: 'Payment Information',
            description: 'How would you like to pay?',
          },
          fields: [
            {
              key: 'paymentMethod',
              type: 'select',
              label: 'Payment Method',
              required: true,
              defaultValue: 'credit',
              options: [
                { value: 'credit', label: 'Credit Card' },
                { value: 'debit', label: 'Debit Card' },
                { value: 'paypal', label: 'PayPal' },
              ],
            },
            {
              key: 'creditCardInfo',
              type: 'group',
              label: 'Credit Card Information',
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'paymentMethod',
                    operator: 'equals',
                    value: 'paypal',
                  },
                },
              ],
              fields: [
                {
                  key: 'cardNumber',
                  type: 'input',
                  label: 'Card Number',
                  required: true,
                  defaultValue: '4111111111111111',
                  props: { type: 'text', placeholder: '1234 5678 9012 3456' },
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'notEquals',
                        value: 'paypal',
                      },
                    },
                  ],
                },
                {
                  key: 'expiryDate',
                  type: 'input',
                  label: 'Expiry Date',
                  required: true,
                  defaultValue: '12/25',
                  props: { type: 'text', placeholder: 'MM/YY' },
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'notEquals',
                        value: 'paypal',
                      },
                    },
                  ],
                  col: 6,
                },
                {
                  key: 'cvv',
                  type: 'input',
                  label: 'CVV',
                  required: true,
                  defaultValue: '123',
                  props: { type: 'text', placeholder: '123' },
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'notEquals',
                        value: 'paypal',
                      },
                    },
                  ],
                  col: 6,
                },
                {
                  key: 'cardholderName',
                  type: 'input',
                  label: 'Cardholder Name',
                  required: true,
                  defaultValue: 'Emma Wilson',
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'notEquals',
                        value: 'paypal',
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'billingAddress',
              type: 'group',
              label: 'Billing Address',
              fields: [
                {
                  key: 'sameAsShipping',
                  type: 'checkbox',
                  label: 'Same as shipping address',
                  defaultValue: true,
                },
                {
                  key: 'billingFirstName',
                  type: 'input',
                  label: 'First Name',
                  defaultValue: 'Emma',
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'sameAsShipping',
                        operator: 'equals',
                        value: true,
                      },
                    },
                  ],
                  col: 6,
                },
                {
                  key: 'billingLastName',
                  type: 'input',
                  label: 'Last Name',
                  defaultValue: 'Wilson',
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'sameAsShipping',
                        operator: 'equals',
                        value: true,
                      },
                    },
                  ],
                  col: 6,
                },
              ],
            },
          ],
        },

        // Page 4: Order Review & Confirmation
        {
          key: 'confirmationPage',
          type: 'page',
          props: {
            title: 'Order Review',
            description: 'Review your order before submitting',
          },
          fields: [
            {
              key: 'orderSummary',
              type: 'group',
              label: 'Order Summary',
              fields: [
                {
                  key: 'orderTotal',
                  type: 'input',
                  label: 'Order Total',
                  defaultValue: '$144.96',
                  props: { readonly: true },
                },
                {
                  key: 'estimatedDelivery',
                  type: 'input',
                  label: 'Estimated Delivery',
                  defaultValue: '2024-11-15',
                  props: { readonly: true },
                },
              ],
            },
            {
              key: 'finalConfirmation',
              type: 'group',
              label: 'Confirmation',
              fields: [
                {
                  key: 'agreeTerms',
                  type: 'checkbox',
                  label: 'I agree to the Terms and Conditions',
                  required: true,
                  defaultValue: false,
                },
                {
                  key: 'subscribeUpdates',
                  type: 'checkbox',
                  label: 'Send me order updates and promotional emails',
                  defaultValue: true,
                },
              ],
            },
          ],
        },
      ],
    };
  }
}

/**
 * Complete realistic form scenarios combining all features
 * for comprehensive e2e testing of the dynamic form system
 */
export class RealisticScenarios {
  /**
   * Complete E-commerce Customer Registration
   * Combines multi-page layout, validation, conditional logic, and translations
   */
  static ecommerceRegistration(): any {
    return {
      translations: {
        en: {
          'registration.title': 'Create Your Account',
          'registration.welcome': 'Join thousands of satisfied customers',
          'page1.title': 'Account Information',
          'page1.description': 'Set up your login credentials',
          'page2.title': 'Personal Details',
          'page2.description': 'Tell us about yourself',
          'page3.title': 'Shipping & Preferences',
          'page3.description': 'Complete your profile',
          'fields.email': 'Email Address',
          'fields.password': 'Password',
          'fields.confirmPassword': 'Confirm Password',
          'fields.firstName': 'First Name',
          'fields.lastName': 'Last Name',
          'fields.phone': 'Phone Number',
          'fields.birthDate': 'Date of Birth',
          'fields.gender': 'Gender',
          'fields.address': 'Street Address',
          'fields.city': 'City',
          'fields.zipCode': 'ZIP Code',
          'fields.country': 'Country',
          'fields.newsletter': 'Subscribe to newsletter and special offers',
          'fields.smsUpdates': 'Receive SMS order updates',
          'fields.terms': 'I agree to the Terms of Service',
          'fields.privacy': 'I agree to the Privacy Policy',
          'fields.age18': 'I confirm I am 18 years or older',
          'genders.male': 'Male',
          'genders.female': 'Female',
          'genders.other': 'Other',
          'genders.prefer_not_say': 'Prefer not to say',
          'countries.us': 'United States',
          'countries.ca': 'Canada',
          'countries.uk': 'United Kingdom',
          'countries.de': 'Germany',
          'countries.fr': 'France',
        },
      },
      fields: [
        // Page 1: Account Setup
        {
          key: 'accountPage',
          type: 'page',
          props: { title: 'page1.title', description: 'page1.description' },
          fields: [
            {
              key: 'accountCredentials',
              type: 'group',
              label: 'Account Credentials',
              fields: [
                {
                  key: 'email',
                  type: 'input',
                  label: 'fields.email',
                  required: true,
                  defaultValue: 'customer@example.com',
                  props: { type: 'email', placeholder: 'Enter your email address' },
                  validators: [
                    { type: 'required', errorMessage: 'Email is required' },
                    { type: 'email', errorMessage: 'Please enter a valid email address' },
                  ],
                },
                {
                  key: 'password',
                  type: 'input',
                  label: 'fields.password',
                  required: true,
                  defaultValue: 'SecurePass123!',
                  props: { type: 'password', placeholder: 'At least 8 characters' },
                  validators: [
                    { type: 'required', errorMessage: 'Password is required' },
                    { type: 'minLength', value: 8, errorMessage: 'Password must be at least 8 characters' },
                  ],
                  col: 6,
                },
                {
                  key: 'confirmPassword',
                  type: 'input',
                  label: 'fields.confirmPassword',
                  required: true,
                  defaultValue: 'SecurePass123!',
                  props: { type: 'password', placeholder: 'Confirm your password' },
                  validators: [
                    { type: 'required', errorMessage: 'Please confirm your password' },
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
          ],
        },

        // Page 2: Personal Information
        {
          key: 'personalPage',
          type: 'page',
          props: { title: 'page2.title', description: 'page2.description' },
          fields: [
            {
              key: 'basicInfo',
              type: 'group',
              label: 'Basic Information',
              fields: [
                {
                  key: 'firstName',
                  type: 'input',
                  label: 'fields.firstName',
                  required: true,
                  defaultValue: 'Sarah',
                  props: { placeholder: 'Enter your first name' },
                  col: 6,
                },
                {
                  key: 'lastName',
                  type: 'input',
                  label: 'fields.lastName',
                  required: true,
                  defaultValue: 'Johnson',
                  props: { placeholder: 'Enter your last name' },
                  col: 6,
                },
                {
                  key: 'phone',
                  type: 'input',
                  label: 'fields.phone',
                  defaultValue: '+1-555-0123',
                  props: { type: 'tel', placeholder: '+1-555-0123' },
                  validators: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', errorMessage: 'Please enter a valid phone number' }],
                  col: 6,
                },
                {
                  key: 'birthDate',
                  type: 'input',
                  label: 'fields.birthDate',
                  required: true,
                  defaultValue: '1990-01-15',
                  props: { type: 'date' },
                  col: 6,
                },
                {
                  key: 'gender',
                  type: 'select',
                  label: 'fields.gender',
                  defaultValue: 'prefer_not_say',
                  options: [
                    { value: 'male', label: 'genders.male' },
                    { value: 'female', label: 'genders.female' },
                    { value: 'other', label: 'genders.other' },
                    { value: 'prefer_not_say', label: 'genders.prefer_not_say' },
                  ],
                },
              ],
            },
          ],
        },

        // Page 3: Address & Preferences
        {
          key: 'preferencesPage',
          type: 'page',
          props: { title: 'page3.title', description: 'page3.description' },
          fields: [
            {
              key: 'shippingAddress',
              type: 'group',
              label: 'Shipping Address',
              fields: [
                {
                  key: 'address',
                  type: 'input',
                  label: 'fields.address',
                  required: true,
                  defaultValue: '123 Main Street',
                  props: { placeholder: 'Enter your street address' },
                },
                {
                  key: 'city',
                  type: 'input',
                  label: 'fields.city',
                  required: true,
                  defaultValue: 'Springfield',
                  props: { placeholder: 'Enter your city' },
                  col: 6,
                },
                {
                  key: 'zipCode',
                  type: 'input',
                  label: 'fields.zipCode',
                  required: true,
                  defaultValue: '12345',
                  props: { type: 'text', pattern: '[0-9]{5}', placeholder: '12345' },
                  validators: [
                    { type: 'required', errorMessage: 'ZIP code is required' },
                    { type: 'pattern', value: '^[0-9]{5}$', errorMessage: 'ZIP code must be 5 digits' },
                  ],
                  col: 6,
                },
                {
                  key: 'country',
                  type: 'select',
                  label: 'fields.country',
                  required: true,
                  defaultValue: 'us',
                  options: [
                    { value: 'us', label: 'countries.us' },
                    { value: 'ca', label: 'countries.ca' },
                    { value: 'uk', label: 'countries.uk' },
                    { value: 'de', label: 'countries.de' },
                    { value: 'fr', label: 'countries.fr' },
                  ],
                },
              ],
            },
            {
              key: 'preferences',
              type: 'group',
              label: 'Communication Preferences',
              fields: [
                {
                  key: 'newsletter',
                  type: 'checkbox',
                  label: 'fields.newsletter',
                  defaultValue: true,
                },
                {
                  key: 'smsUpdates',
                  type: 'checkbox',
                  label: 'fields.smsUpdates',
                  defaultValue: false,
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'phone',
                        operator: 'equals',
                        value: '',
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'legalAgreements',
              type: 'group',
              label: 'Legal Agreements',
              fields: [
                {
                  key: 'age18',
                  type: 'checkbox',
                  label: 'fields.age18',
                  required: true,
                  defaultValue: false,
                },
                {
                  key: 'agreeTerms',
                  type: 'checkbox',
                  label: 'fields.terms',
                  required: true,
                  defaultValue: false,
                },
                {
                  key: 'agreePrivacy',
                  type: 'checkbox',
                  label: 'fields.privacy',
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
   * Healthcare Patient Registration
   * Complex form with conditional sections and sensitive data validation
   */
  static healthcareRegistration(): any {
    return {
      fields: [
        // Patient Information
        {
          key: 'patientInfo',
          type: 'group',
          label: 'Patient Information',
          fields: [
            {
              key: 'firstName',
              type: 'input',
              label: 'First Name',
              required: true,
              defaultValue: 'Michael',
              col: 4,
            },
            {
              key: 'middleName',
              type: 'input',
              label: 'Middle Name',
              defaultValue: 'James',
              col: 4,
            },
            {
              key: 'lastName',
              type: 'input',
              label: 'Last Name',
              required: true,
              defaultValue: 'Thompson',
              col: 4,
            },
            {
              key: 'dateOfBirth',
              type: 'input',
              label: 'Date of Birth',
              required: true,
              defaultValue: '1985-03-20',
              props: { type: 'date' },
              col: 6,
            },
            {
              key: 'ssn',
              type: 'input',
              label: 'Social Security Number',
              required: true,
              defaultValue: '123-45-6789',
              props: { type: 'text', pattern: '[0-9]{3}-[0-9]{2}-[0-9]{4}' },
              validators: [
                { type: 'required', errorMessage: 'SSN is required' },
                { type: 'pattern', value: '^[0-9]{3}-[0-9]{2}-[0-9]{4}$', errorMessage: 'SSN must be in format XXX-XX-XXXX' },
              ],
              col: 6,
            },
            {
              key: 'gender',
              type: 'select',
              label: 'Gender',
              required: true,
              defaultValue: 'male',
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ],
              col: 4,
            },
            {
              key: 'maritalStatus',
              type: 'select',
              label: 'Marital Status',
              defaultValue: 'single',
              options: [
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ],
              col: 4,
            },
            {
              key: 'preferredLanguage',
              type: 'select',
              label: 'Preferred Language',
              defaultValue: 'english',
              options: [
                { value: 'english', label: 'English' },
                { value: 'spanish', label: 'Spanish' },
                { value: 'french', label: 'French' },
                { value: 'other', label: 'Other' },
              ],
              col: 4,
            },
          ],
        },

        // Contact Information
        {
          key: 'contactInfo',
          type: 'group',
          label: 'Contact Information',
          fields: [
            {
              key: 'primaryPhone',
              type: 'input',
              label: 'Primary Phone',
              required: true,
              defaultValue: '+1-555-0156',
              props: { type: 'tel' },
              validators: [
                { type: 'required', errorMessage: 'Primary phone is required' },
                { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', errorMessage: 'Please enter a valid phone number' },
              ],
              col: 6,
            },
            {
              key: 'secondaryPhone',
              type: 'input',
              label: 'Secondary Phone',
              defaultValue: '+1-555-0157',
              props: { type: 'tel' },
              validators: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', errorMessage: 'Please enter a valid phone number' }],
              col: 6,
            },
            {
              key: 'email',
              type: 'input',
              label: 'Email Address',
              required: true,
              defaultValue: 'michael.thompson@email.com',
              props: { type: 'email' },
              validators: [
                { type: 'required', errorMessage: 'Email is required' },
                { type: 'email', errorMessage: 'Please enter a valid email address' },
              ],
            },
            {
              key: 'address',
              type: 'input',
              label: 'Street Address',
              required: true,
              defaultValue: '456 Oak Street',
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
              validators: [
                { type: 'required', errorMessage: 'ZIP code is required' },
                { type: 'pattern', value: '^[0-9]{5}$', errorMessage: 'ZIP code must be 5 digits' },
              ],
              col: 4,
            },
          ],
        },

        // Insurance Information
        {
          key: 'insuranceInfo',
          type: 'group',
          label: 'Insurance Information',
          fields: [
            {
              key: 'hasInsurance',
              type: 'checkbox',
              label: 'I have health insurance',
              defaultValue: true,
            },
            {
              key: 'insuranceProvider',
              type: 'input',
              label: 'Insurance Provider',
              defaultValue: 'Blue Cross Blue Shield',
              validators: [
                {
                  type: 'required',
                  when: {
                    type: 'fieldValue',
                    fieldPath: 'hasInsurance',
                    operator: 'equals',
                    value: true,
                  },
                  errorMessage: 'Insurance provider is required',
                },
              ],
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'hasInsurance',
                    operator: 'notEquals',
                    value: true,
                  },
                },
              ],
              col: 6,
            },
            {
              key: 'policyNumber',
              type: 'input',
              label: 'Policy Number',
              defaultValue: 'BC12345678',
              validators: [
                {
                  type: 'required',
                  when: {
                    type: 'fieldValue',
                    fieldPath: 'hasInsurance',
                    operator: 'equals',
                    value: true,
                  },
                  errorMessage: 'Policy number is required',
                },
              ],
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'hasInsurance',
                    operator: 'notEquals',
                    value: true,
                  },
                },
              ],
              col: 6,
            },
            {
              key: 'groupNumber',
              type: 'input',
              label: 'Group Number',
              defaultValue: 'GRP001',
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'hasInsurance',
                    operator: 'notEquals',
                    value: true,
                  },
                },
              ],
            },
          ],
        },

        // Emergency Contact
        {
          key: 'emergencyContact',
          type: 'group',
          label: 'Emergency Contact',
          fields: [
            {
              key: 'emergencyName',
              type: 'input',
              label: 'Full Name',
              required: true,
              defaultValue: 'Jennifer Thompson',
              col: 6,
            },
            {
              key: 'emergencyRelationship',
              type: 'select',
              label: 'Relationship',
              required: true,
              defaultValue: 'spouse',
              options: [
                { value: 'spouse', label: 'Spouse' },
                { value: 'parent', label: 'Parent' },
                { value: 'child', label: 'Child' },
                { value: 'sibling', label: 'Sibling' },
                { value: 'friend', label: 'Friend' },
                { value: 'other', label: 'Other' },
              ],
              col: 6,
            },
            {
              key: 'emergencyPhone',
              type: 'input',
              label: 'Phone Number',
              required: true,
              defaultValue: '+1-555-0189',
              props: { type: 'tel' },
              validators: [
                { type: 'required', errorMessage: 'Emergency contact phone is required' },
                { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', errorMessage: 'Please enter a valid phone number' },
              ],
            },
          ],
        },

        // Medical History
        {
          key: 'medicalHistory',
          type: 'group',
          label: 'Medical History',
          fields: [
            {
              key: 'primaryPhysician',
              type: 'input',
              label: 'Primary Care Physician',
              defaultValue: 'Dr. Sarah Wilson',
            },
            {
              key: 'allergies',
              type: 'input',
              label: 'Known Allergies',
              defaultValue: 'Penicillin, shellfish',
              props: { type: 'textarea', rows: 3 },
            },
            {
              key: 'medications',
              type: 'input',
              label: 'Current Medications',
              defaultValue: 'Lisinopril 10mg daily',
              props: { type: 'textarea', rows: 3 },
            },
            {
              key: 'medicalConditions',
              type: 'input',
              label: 'Medical Conditions',
              defaultValue: 'Hypertension',
              props: { type: 'textarea', rows: 3 },
            },
          ],
        },

        // Consent & Authorization
        {
          key: 'consent',
          type: 'group',
          label: 'Consent & Authorization',
          fields: [
            {
              key: 'treatmentConsent',
              type: 'checkbox',
              label: 'I consent to medical treatment',
              required: true,
              defaultValue: false,
            },
            {
              key: 'informationSharing',
              type: 'checkbox',
              label: 'I authorize sharing of medical information with insurance providers',
              required: true,
              defaultValue: false,
            },
            {
              key: 'hipaaAcknowledgment',
              type: 'checkbox',
              label: 'I acknowledge receipt of HIPAA Privacy Notice',
              required: true,
              defaultValue: false,
            },
            {
              key: 'financialResponsibility',
              type: 'checkbox',
              label: 'I accept financial responsibility for services',
              required: true,
              defaultValue: false,
            },
          ],
        },
      ],
    };
  }

  /**
   * Corporate Event Registration
   * Multi-page form with dynamic content based on event type
   */
  static corporateEventRegistration(): any {
    return {
      fields: [
        // Page 1: Event & Attendee Information
        {
          key: 'eventInfoPage',
          type: 'page',
          props: {
            title: 'Event & Attendee Information',
            description: 'Select your event and provide attendee details',
          },
          fields: [
            {
              key: 'eventSelection',
              type: 'group',
              label: 'Event Selection',
              fields: [
                {
                  key: 'eventType',
                  type: 'select',
                  label: 'Event Type',
                  required: true,
                  defaultValue: 'conference',
                  options: [
                    { value: 'conference', label: 'Annual Conference' },
                    { value: 'workshop', label: 'Technical Workshop' },
                    { value: 'seminar', label: 'Leadership Seminar' },
                    { value: 'networking', label: 'Networking Event' },
                  ],
                },
                {
                  key: 'attendeeType',
                  type: 'select',
                  label: 'Attendee Type',
                  required: true,
                  defaultValue: 'employee',
                  options: [
                    { value: 'employee', label: 'Company Employee' },
                    { value: 'contractor', label: 'Contractor' },
                    { value: 'partner', label: 'Business Partner' },
                    { value: 'client', label: 'Client' },
                    { value: 'guest', label: 'Guest' },
                  ],
                },
              ],
            },
            {
              key: 'attendeeInfo',
              type: 'group',
              label: 'Attendee Information',
              fields: [
                {
                  key: 'firstName',
                  type: 'input',
                  label: 'First Name',
                  required: true,
                  defaultValue: 'David',
                  col: 6,
                },
                {
                  key: 'lastName',
                  type: 'input',
                  label: 'Last Name',
                  required: true,
                  defaultValue: 'Chen',
                  col: 6,
                },
                {
                  key: 'email',
                  type: 'input',
                  label: 'Email Address',
                  required: true,
                  defaultValue: 'david.chen@company.com',
                  props: { type: 'email' },
                  validators: [
                    { type: 'required', errorMessage: 'Email is required' },
                    { type: 'email', errorMessage: 'Please enter a valid email address' },
                  ],
                },
                {
                  key: 'jobTitle',
                  type: 'input',
                  label: 'Job Title',
                  required: true,
                  defaultValue: 'Senior Software Engineer',
                },
                {
                  key: 'company',
                  type: 'input',
                  label: 'Company',
                  required: true,
                  defaultValue: 'Tech Solutions Inc.',
                  col: 6,
                },
                {
                  key: 'department',
                  type: 'input',
                  label: 'Department',
                  defaultValue: 'Engineering',
                  col: 6,
                },
              ],
            },
          ],
        },

        // Page 2: Workshop Selection (conditional)
        {
          key: 'workshopSelectionPage',
          type: 'page',
          props: {
            title: 'Workshop Selection',
            description: 'Choose your workshop sessions',
          },
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'eventType',
                operator: 'notEquals',
                value: 'workshop',
              },
            },
          ],
          fields: [
            {
              key: 'workshopPreferences',
              type: 'group',
              label: 'Workshop Preferences',
              fields: [
                {
                  key: 'primaryWorkshop',
                  type: 'select',
                  label: 'Primary Workshop',
                  required: true,
                  defaultValue: 'cloud_architecture',
                  options: [
                    { value: 'cloud_architecture', label: 'Cloud Architecture Patterns' },
                    { value: 'microservices', label: 'Microservices Design' },
                    { value: 'devops_practices', label: 'DevOps Best Practices' },
                    { value: 'security_fundamentals', label: 'Security Fundamentals' },
                    { value: 'ai_ml_intro', label: 'Introduction to AI/ML' },
                  ],
                },
                {
                  key: 'secondaryWorkshop',
                  type: 'select',
                  label: 'Secondary Workshop (Optional)',
                  defaultValue: 'devops_practices',
                  options: [
                    { value: '', label: 'None' },
                    { value: 'cloud_architecture', label: 'Cloud Architecture Patterns' },
                    { value: 'microservices', label: 'Microservices Design' },
                    { value: 'devops_practices', label: 'DevOps Best Practices' },
                    { value: 'security_fundamentals', label: 'Security Fundamentals' },
                    { value: 'ai_ml_intro', label: 'Introduction to AI/ML' },
                  ],
                },
                {
                  key: 'skillLevel',
                  type: 'select',
                  label: 'Technical Skill Level',
                  required: true,
                  defaultValue: 'intermediate',
                  options: [
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                    { value: 'expert', label: 'Expert' },
                  ],
                },
              ],
            },
          ],
        },

        // Page 3: Accommodation & Travel
        {
          key: 'accommodationPage',
          type: 'page',
          props: {
            title: 'Accommodation & Travel',
            description: 'Let us know about your travel and accommodation needs',
          },
          fields: [
            {
              key: 'travelInfo',
              type: 'group',
              label: 'Travel Information',
              fields: [
                {
                  key: 'needsAccommodation',
                  type: 'checkbox',
                  label: 'I need hotel accommodation',
                  defaultValue: true,
                },
                {
                  key: 'arrivalDate',
                  type: 'input',
                  label: 'Arrival Date',
                  defaultValue: '2024-11-15',
                  props: { type: 'date' },
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'needsAccommodation',
                        operator: 'equals',
                        value: true,
                      },
                      errorMessage: 'Arrival date is required for accommodation',
                    },
                  ],
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'needsAccommodation',
                        operator: 'notEquals',
                        value: true,
                      },
                    },
                  ],
                  col: 6,
                },
                {
                  key: 'departureDate',
                  type: 'input',
                  label: 'Departure Date',
                  defaultValue: '2024-11-17',
                  props: { type: 'date' },
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'needsAccommodation',
                        operator: 'equals',
                        value: true,
                      },
                      errorMessage: 'Departure date is required for accommodation',
                    },
                  ],
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'needsAccommodation',
                        operator: 'notEquals',
                        value: true,
                      },
                    },
                  ],
                  col: 6,
                },
                {
                  key: 'roomPreference',
                  type: 'select',
                  label: 'Room Preference',
                  defaultValue: 'single',
                  options: [
                    { value: 'single', label: 'Single Room' },
                    { value: 'double', label: 'Double Room' },
                    { value: 'suite', label: 'Suite' },
                  ],
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'needsAccommodation',
                        operator: 'notEquals',
                        value: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'specialRequests',
              type: 'group',
              label: 'Special Requests',
              fields: [
                {
                  key: 'dietaryRestrictions',
                  type: 'input',
                  label: 'Dietary Restrictions',
                  defaultValue: 'Vegetarian',
                  props: { placeholder: 'e.g., Vegetarian, Gluten-free, Allergies' },
                },
                {
                  key: 'accessibilityNeeds',
                  type: 'input',
                  label: 'Accessibility Needs',
                  defaultValue: '',
                  props: { placeholder: 'Any special accessibility requirements' },
                },
                {
                  key: 'additionalRequests',
                  type: 'input',
                  label: 'Additional Requests',
                  defaultValue: 'Quiet room preferred',
                  props: { type: 'textarea', rows: 3, placeholder: 'Any other special requests or comments' },
                },
              ],
            },
          ],
        },

        // Page 4: Payment & Confirmation
        {
          key: 'paymentPage',
          type: 'page',
          props: {
            title: 'Payment & Confirmation',
            description: 'Review your registration and provide payment information',
          },
          fields: [
            {
              key: 'paymentInfo',
              type: 'group',
              label: 'Payment Information',
              fields: [
                {
                  key: 'paymentMethod',
                  type: 'select',
                  label: 'Payment Method',
                  required: true,
                  defaultValue: 'company_billing',
                  options: [
                    { value: 'company_billing', label: 'Bill to Company' },
                    { value: 'credit_card', label: 'Credit Card' },
                    { value: 'purchase_order', label: 'Purchase Order' },
                  ],
                },
                {
                  key: 'billingContact',
                  type: 'input',
                  label: 'Billing Contact',
                  defaultValue: 'accounts@company.com',
                  props: { type: 'email' },
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'equals',
                        value: 'company_billing',
                      },
                      errorMessage: 'Billing contact is required',
                    },
                    {
                      type: 'email',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'equals',
                        value: 'company_billing',
                      },
                      errorMessage: 'Please enter a valid email address',
                    },
                  ],
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'notEquals',
                        value: 'company_billing',
                      },
                    },
                  ],
                },
                {
                  key: 'poNumber',
                  type: 'input',
                  label: 'Purchase Order Number',
                  defaultValue: 'PO-2024-1157',
                  validators: [
                    {
                      type: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'equals',
                        value: 'purchase_order',
                      },
                      errorMessage: 'Purchase Order number is required',
                    },
                  ],
                  logic: [
                    {
                      type: 'hidden',
                      condition: {
                        type: 'fieldValue',
                        fieldPath: 'paymentMethod',
                        operator: 'notEquals',
                        value: 'purchase_order',
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'finalConfirmation',
              type: 'group',
              label: 'Final Confirmation',
              fields: [
                {
                  key: 'agreeTerms',
                  type: 'checkbox',
                  label: 'I agree to the event terms and conditions',
                  required: true,
                  defaultValue: false,
                },
                {
                  key: 'agreeCancellation',
                  type: 'checkbox',
                  label: 'I understand the cancellation policy',
                  required: true,
                  defaultValue: false,
                },
                {
                  key: 'marketingConsent',
                  type: 'checkbox',
                  label: 'I consent to receive future event notifications',
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

/**
 * Export all scenario configurations for easy access
 */
export const ALL_REALISTIC_SCENARIOS = {
  ecommerceRegistration: RealisticScenarios.ecommerceRegistration,
  healthcareRegistration: RealisticScenarios.healthcareRegistration,
  corporateEventRegistration: RealisticScenarios.corporateEventRegistration,
} as const;

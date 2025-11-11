import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-conditional-logic-showcase-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" (formSubmit)="onSubmit($event)" />

    @let message = submitMessage();
    @if (message) {
      <div class="success-message" style="margin-top: 2rem; padding: 1.5rem; background-color: #4caf50; color: white; border-radius: 4px; text-align: center;">
        {{ message }}
      </div>
    }

    <div class="example-result" style="margin-top: 2rem;">
      <h4>Form Data:</h4>
      <pre style="max-height: 400px; overflow-y: auto;">{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionalLogicShowcaseDemoComponent {
  formValue = signal({
    employmentStatus: 'employed',
    hasPortfolio: false,
    backgroundCheck: false,
    ethicsAgreement: false,
    acknowledgement: false,
    marketingConsent: false,
    professionalMemberships: [],
  });

  submitMessage = signal<string>('');

  config = {
    fields: [
      // ============================================================
      // PAGE 1: PERSONAL INFORMATION
      // ============================================================
      {
        type: 'page',
        key: 'personalInfoPage',
        title: 'Personal Information',
        fields: [
          {
            type: 'text',
            key: 'pageTitle',
            label: 'Professional Certification Application',
            props: { class: 'text-2xl font-bold mb-4' },
          },
          {
            type: 'text',
            key: 'pageDescription',
            label: 'Please provide your personal information to begin the certification process.',
          },
          {
            type: 'row',
            key: 'nameRow',
            fields: [
              {
                key: 'firstName',
                type: 'input',
                value: '',
                label: 'First Name',
                required: true,
                col: 6,
                props: { appearance: 'outline' },
              },
              {
                key: 'lastName',
                type: 'input',
                value: '',
                label: 'Last Name',
                required: true,
                col: 6,
                props: { appearance: 'outline' },
              },
            ],
          },
          {
            key: 'email',
            type: 'input',
            value: '',
            label: 'Email Address',
            required: true,
            email: true,
            props: {
              type: 'email',
              appearance: 'outline',
              hint: 'We will send certification updates to this email',
            },
          },
          {
            key: 'phone',
            type: 'input',
            value: '',
            label: 'Phone Number',
            required: true,
            props: {
              type: 'tel',
              appearance: 'outline',
            },
          },
          {
            key: 'dateOfBirth',
            type: 'datepicker',
            value: null,
            label: 'Date of Birth',
            required: true,
            maxDate: new Date(new Date().getFullYear() - 18, 0, 1),
            validationMessages: {
              required: 'Date of birth is required',
              maxDate: 'You must be at least 18 years old to apply',
            },
            props: {
              appearance: 'outline',
              hint: 'Must be 18 or older',
            },
          },
          {
            key: 'certificationType',
            type: 'select',
            value: '',
            label: 'Certification Type',
            required: true,
            options: [
              { value: 'associate', label: 'Associate Level - Entry level certification' },
              { value: 'professional', label: 'Professional Level - Mid-level certification' },
              { value: 'expert', label: 'Expert Level - Advanced certification' },
              { value: 'specialist', label: 'Specialist - Domain-specific certification' },
            ],
            props: {
              appearance: 'outline',
              placeholder: 'Select certification level',
              hint: 'This determines the requirements for your application',
            },
          },
          {
            key: 'country',
            type: 'select',
            value: '',
            label: 'Country',
            required: true,
            options: [
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'au', label: 'Australia' },
              { value: 'other', label: 'Other' },
            ],
            props: {
              appearance: 'outline',
              placeholder: 'Select your country',
            },
          },
          {
            key: 'state',
            type: 'select',
            value: '',
            label: 'State/Province',
            options: [
              { value: 'ny', label: 'New York' },
              { value: 'ca', label: 'California' },
              { value: 'tx', label: 'Texas' },
              { value: 'fl', label: 'Florida' },
              { value: 'wa', label: 'Washington' },
            ],
            // DEMO: Disabled until country is selected
            logic: [
              {
                type: 'disabled',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'country',
                  operator: 'equals',
                  value: '',
                },
              },
              // DEMO: Hidden for non-US/CA countries
              {
                type: 'hidden',
                condition: {
                  type: 'and',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'country',
                      operator: 'notEquals',
                      value: 'us',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'country',
                      operator: 'notEquals',
                      value: 'ca',
                    },
                  ],
                },
              },
              // DEMO: Required for US/CA
              {
                type: 'required',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'country',
                      operator: 'equals',
                      value: 'us',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'country',
                      operator: 'equals',
                      value: 'ca',
                    },
                  ],
                },
                errorMessage: 'State/Province is required for US and Canada',
              },
            ],
            props: {
              appearance: 'outline',
              placeholder: 'Select state/province',
              hint: 'Select your country first',
            },
          },
          {
            type: 'next',
            key: 'nextToEducation',
            label: 'Continue to Education',
            props: { color: 'primary' },
          },
        ],
      },

      // ============================================================
      // PAGE 2: EDUCATION & EXPERIENCE
      // ============================================================
      {
        type: 'page',
        key: 'educationPage',
        title: 'Education & Experience',
        fields: [
          {
            type: 'text',
            key: 'educationTitle',
            label: 'Education & Professional Experience',
            props: { class: 'text-xl font-semibold mb-4' },
          },
          {
            key: 'educationLevel',
            type: 'select',
            value: '',
            label: 'Highest Education Level',
            required: true,
            options: [
              { value: 'highschool', label: 'High School Diploma' },
              { value: 'associate', label: 'Associate Degree' },
              { value: 'bachelor', label: 'Bachelor Degree' },
              { value: 'master', label: 'Master Degree' },
              { value: 'doctorate', label: 'Doctorate' },
            ],
            props: {
              appearance: 'outline',
            },
          },
          {
            key: 'graduationYear',
            type: 'input',
            value: '',
            label: 'Graduation Year',
            required: true,
            pattern: '^(19|20)\\d{2}$',
            validationMessages: {
              pattern: 'Please enter a valid year (e.g., 2020)',
            },
            props: {
              type: 'number',
              appearance: 'outline',
              min: 1950,
              max: new Date().getFullYear(),
            },
          },
          {
            key: 'yearsExperience',
            type: 'input',
            value: '',
            label: 'Years of Professional Experience',
            required: true,
            // DEMO: Conditional validation based on certification type
            validators: [
              {
                type: 'custom',
                expression: 'formValue.certificationType === "associate" || Number(fieldValue) >= 2',
                errorMessage: 'Professional and Expert certifications require at least 2 years of experience',
                when: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'professional',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'expert',
                    },
                  ],
                },
              },
              {
                type: 'custom',
                expression: 'Number(fieldValue) >= 5',
                errorMessage: 'Expert certification requires at least 5 years of experience',
                when: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'expert',
                },
              },
            ],
            props: {
              type: 'number',
              appearance: 'outline',
              min: 0,
              hint: 'Enter total years of relevant professional experience',
            },
          },
          {
            key: 'employmentStatus',
            type: 'radio',
            value: 'employed',
            label: 'Current Employment Status',
            required: true,
            options: [
              { value: 'employed', label: 'Currently Employed' },
              { value: 'self-employed', label: 'Self-Employed' },
              { value: 'unemployed', label: 'Currently Unemployed' },
              { value: 'student', label: 'Full-Time Student' },
            ],
            props: { color: 'primary' },
          },
          {
            key: 'currentCompany',
            type: 'input',
            value: '',
            label: 'Current Company/Organization',
            // DEMO: Hidden if unemployed or student
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'unemployed',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'student',
                    },
                  ],
                },
              },
              // DEMO: Required if employed or self-employed
              {
                type: 'required',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'employed',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'self-employed',
                    },
                  ],
                },
                errorMessage: 'Company name is required for employed applicants',
              },
            ],
            props: {
              appearance: 'outline',
            },
          },
          {
            key: 'jobTitle',
            type: 'input',
            value: '',
            label: 'Current Job Title',
            // DEMO: Same conditional logic as company
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'unemployed',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'student',
                    },
                  ],
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'employed',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'employmentStatus',
                      operator: 'equals',
                      value: 'self-employed',
                    },
                  ],
                },
                errorMessage: 'Job title is required for employed applicants',
              },
            ],
            props: {
              appearance: 'outline',
            },
          },
          {
            key: 'industry',
            type: 'select',
            value: '',
            label: 'Industry/Sector',
            options: [
              { value: 'technology', label: 'Technology/IT' },
              { value: 'finance', label: 'Finance/Banking' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'education', label: 'Education' },
              { value: 'manufacturing', label: 'Manufacturing' },
              { value: 'retail', label: 'Retail' },
              { value: 'consulting', label: 'Consulting' },
              { value: 'government', label: 'Government/Public Sector' },
              { value: 'other', label: 'Other' },
            ],
            // DEMO: Hidden if unemployed, required otherwise
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'employmentStatus',
                  operator: 'equals',
                  value: 'unemployed',
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'employmentStatus',
                  operator: 'notEquals',
                  value: 'unemployed',
                },
                errorMessage: 'Please select your industry',
              },
            ],
            props: {
              appearance: 'outline',
              placeholder: 'Select your industry',
            },
          },
          {
            key: 'specialization',
            type: 'input',
            value: '',
            label: 'Area of Specialization',
            // DEMO: Only for Specialist certification type (cross-page conditional)
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'notEquals',
                  value: 'specialist',
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'specialist',
                },
                errorMessage: 'Specialist certification requires an area of specialization',
              },
            ],
            props: {
              appearance: 'outline',
              hint: 'e.g., Cloud Architecture, Data Science, Cybersecurity',
            },
          },
          {
            key: 'relevantProjects',
            type: 'textarea',
            value: '',
            label: 'Relevant Projects or Achievements',
            // DEMO: Required for Expert level (cross-page conditional)
            logic: [
              {
                type: 'required',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'expert',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'specialist',
                    },
                  ],
                },
                errorMessage: 'Expert and Specialist certifications require documented projects',
              },
            ],
            props: {
              appearance: 'outline',
              rows: 4,
              hint: 'Describe 2-3 significant projects or achievements',
            },
          },
          {
            type: 'row',
            key: 'educationNavigation',
            fields: [
              {
                type: 'previous',
                key: 'backToPersonal',
                label: 'Back',
                col: 6,
              },
              {
                type: 'next',
                key: 'nextToRequirements',
                label: 'Continue',
                col: 6,
                props: { color: 'primary' },
              },
            ],
          },
        ],
      },

      // ============================================================
      // PAGE 3: PROFESSIONAL REQUIREMENTS
      // ============================================================
      {
        type: 'page',
        key: 'requirementsPage',
        title: 'Professional Requirements',
        fields: [
          {
            type: 'text',
            key: 'requirementsTitle',
            label: 'Professional Requirements',
            props: { class: 'text-xl font-semibold mb-4' },
          },
          {
            type: 'text',
            key: 'requirementsDescription',
            label: 'Please provide professional references and additional requirements.',
          },
          {
            type: 'text',
            key: 'referencesInfo',
            label: 'Professional References',
            props: { class: 'text-lg font-medium mt-4 mb-2' },
          },
          {
            type: 'text',
            key: 'referencesNote',
            label: 'Based on your certification type, you need to provide professional references.',
            props: { class: 'text-sm text-gray-600 mb-4' },
          },
          // Reference 1 (Always Required)
          {
            type: 'text',
            key: 'reference1Header',
            label: 'Reference #1',
            props: { class: 'font-medium mt-4' },
          },
          {
            type: 'row',
            key: 'reference1Row',
            fields: [
              {
                key: 'reference1Name',
                type: 'input',
                value: '',
                label: 'Reference Name',
                required: true,
                col: 6,
                props: { appearance: 'outline' },
              },
              {
                key: 'reference1Email',
                type: 'input',
                value: '',
                label: 'Reference Email',
                required: true,
                email: true,
                col: 6,
                props: { type: 'email', appearance: 'outline' },
              },
            ],
          },
          {
            key: 'reference1Relationship',
            type: 'input',
            value: '',
            label: 'Professional Relationship',
            required: true,
            props: {
              appearance: 'outline',
              hint: 'e.g., Former Manager, Colleague, Client',
            },
          },
          // Reference 2 (Required for Professional, Expert, Specialist)
          {
            type: 'text',
            key: 'reference2Header',
            label: 'Reference #2',
            props: { class: 'font-medium mt-4' },
            // DEMO: Hidden for Associate level
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'associate',
                },
              },
            ],
          },
          {
            type: 'row',
            key: 'reference2Row',
            fields: [
              {
                key: 'reference2Name',
                type: 'input',
                value: '',
                label: 'Reference Name',
                col: 6,
                props: { appearance: 'outline' },
                // DEMO: Required for non-Associate
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'associate',
                    },
                  },
                  {
                    type: 'required',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'notEquals',
                      value: 'associate',
                    },
                    errorMessage: 'Second reference is required for this certification level',
                  },
                ],
              },
              {
                key: 'reference2Email',
                type: 'input',
                value: '',
                label: 'Reference Email',
                email: true,
                col: 6,
                props: { type: 'email', appearance: 'outline' },
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'associate',
                    },
                  },
                  {
                    type: 'required',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'notEquals',
                      value: 'associate',
                    },
                    errorMessage: 'Reference email is required',
                  },
                ],
              },
            ],
          },
          {
            key: 'reference2Relationship',
            type: 'input',
            value: '',
            label: 'Professional Relationship',
            props: {
              appearance: 'outline',
              hint: 'e.g., Former Manager, Colleague, Client',
            },
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'associate',
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'notEquals',
                  value: 'associate',
                },
                errorMessage: 'Professional relationship is required',
              },
            ],
          },
          // Reference 3 (Required for Expert only)
          {
            type: 'text',
            key: 'reference3Header',
            label: 'Reference #3',
            props: { class: 'font-medium mt-4' },
            // DEMO: Only for Expert
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'notEquals',
                  value: 'expert',
                },
              },
            ],
          },
          {
            type: 'row',
            key: 'reference3Row',
            fields: [
              {
                key: 'reference3Name',
                type: 'input',
                value: '',
                label: 'Reference Name',
                col: 6,
                props: { appearance: 'outline' },
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'notEquals',
                      value: 'expert',
                    },
                  },
                  {
                    type: 'required',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'expert',
                    },
                    errorMessage: 'Third reference is required for Expert certification',
                  },
                ],
              },
              {
                key: 'reference3Email',
                type: 'input',
                value: '',
                label: 'Reference Email',
                email: true,
                col: 6,
                props: { type: 'email', appearance: 'outline' },
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'notEquals',
                      value: 'expert',
                    },
                  },
                  {
                    type: 'required',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'expert',
                    },
                    errorMessage: 'Reference email is required',
                  },
                ],
              },
            ],
          },
          {
            key: 'reference3Relationship',
            type: 'input',
            value: '',
            label: 'Professional Relationship',
            props: {
              appearance: 'outline',
              hint: 'e.g., Former Manager, Colleague, Client',
            },
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'notEquals',
                  value: 'expert',
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'expert',
                },
                errorMessage: 'Professional relationship is required',
              },
            ],
          },
          // Professional Memberships
          {
            type: 'text',
            key: 'membershipsHeader',
            label: 'Professional Memberships',
            props: { class: 'text-lg font-medium mt-6 mb-2' },
            // DEMO: Hidden for Associate level
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'associate',
                },
              },
            ],
          },
          {
            key: 'professionalMemberships',
            type: 'multi-checkbox',
            value: [],
            label: 'Select any professional organizations you belong to',
            options: [
              { value: 'ieee', label: 'IEEE - Institute of Electrical and Electronics Engineers' },
              { value: 'acm', label: 'ACM - Association for Computing Machinery' },
              { value: 'pmi', label: 'PMI - Project Management Institute' },
              { value: 'isaca', label: 'ISACA - Information Systems Audit and Control Association' },
              { value: 'issa', label: 'ISSA - Information Systems Security Association' },
              { value: 'other', label: 'Other professional organizations' },
            ],
            props: { color: 'primary' },
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'associate',
                },
              },
            ],
          },
          {
            key: 'otherMembership',
            type: 'input',
            value: '',
            label: 'Other Professional Organization',
            props: {
              appearance: 'outline',
              hint: 'Please specify the organization name',
            },
            // DEMO: Complex AND condition - shown only if "other" is selected AND not Associate
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'associate',
                    },
                    {
                      type: 'javascript',
                      expression: '!formValue.professionalMemberships || !formValue.professionalMemberships.includes("other")',
                    },
                  ],
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'and',
                  conditions: [
                    {
                      type: 'javascript',
                      expression: 'formValue.professionalMemberships && formValue.professionalMemberships.includes("other")',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'notEquals',
                      value: 'associate',
                    },
                  ],
                },
                errorMessage: 'Please specify the organization name',
              },
            ],
          },
          // Background Check & Compliance
          {
            type: 'text',
            key: 'complianceHeader',
            label: 'Background Check & Compliance',
            props: { class: 'text-lg font-medium mt-6 mb-2' },
          },
          {
            key: 'backgroundCheck',
            type: 'checkbox',
            value: false,
            label: 'I consent to a background check as part of the certification process',
            required: true,
            validationMessages: {
              required: 'You must consent to a background check to proceed',
            },
            props: { color: 'primary' },
          },
          {
            key: 'ethicsAgreement',
            type: 'checkbox',
            value: false,
            label: 'I agree to abide by the professional code of ethics',
            required: true,
            validationMessages: {
              required: 'You must agree to the code of ethics',
            },
            props: { color: 'primary' },
          },
          // Additional Documentation
          {
            type: 'text',
            key: 'documentsHeader',
            label: 'Additional Documentation',
            props: { class: 'text-lg font-medium mt-6 mb-2' },
            // DEMO: Only for Professional, Expert, Specialist
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'associate',
                },
              },
            ],
          },
          {
            key: 'hasPortfolio',
            type: 'toggle',
            value: false,
            label: 'I will submit a professional portfolio',
            props: { color: 'primary' },
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'certificationType',
                  operator: 'equals',
                  value: 'associate',
                },
              },
            ],
          },
          {
            key: 'portfolioUrl',
            type: 'input',
            value: '',
            label: 'Portfolio URL',
            props: {
              type: 'url',
              appearance: 'outline',
              hint: 'Link to your online portfolio or GitHub profile',
            },
            validators: [
              {
                type: 'pattern',
                value: '^https?://.*',
                errorMessage: 'Please enter a valid URL starting with http:// or https://',
                when: {
                  type: 'javascript',
                  expression: 'fieldValue && fieldValue.length > 0',
                },
              },
            ],
            // DEMO: Complex multi-condition logic
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'equals',
                      value: 'associate',
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'hasPortfolio',
                      operator: 'equals',
                      value: false,
                    },
                  ],
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'and',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'hasPortfolio',
                      operator: 'equals',
                      value: true,
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'certificationType',
                      operator: 'notEquals',
                      value: 'associate',
                    },
                  ],
                },
                errorMessage: 'Portfolio URL is required if you selected to submit a portfolio',
              },
            ],
          },
          {
            type: 'row',
            key: 'requirementsNavigation',
            fields: [
              {
                type: 'previous',
                key: 'backToEducation',
                label: 'Back',
                col: 6,
              },
              {
                type: 'next',
                key: 'nextToReview',
                label: 'Review Application',
                col: 6,
                props: { color: 'primary' },
              },
            ],
          },
        ],
      },

      // ============================================================
      // PAGE 4: REVIEW & SUBMIT
      // ============================================================
      {
        type: 'page',
        key: 'reviewPage',
        title: 'Review & Submit',
        fields: [
          {
            type: 'text',
            key: 'reviewTitle',
            label: 'Review Your Application',
            props: { class: 'text-xl font-semibold mb-4' },
          },
          {
            type: 'text',
            key: 'reviewDescription',
            label: 'Please review your information before submitting. You can go back to make changes.',
          },
          {
            type: 'text',
            key: 'reviewNote',
            label: 'Note: Once submitted, you will receive a confirmation email and can track your application status.',
            props: { class: 'text-sm text-gray-600 mb-6 p-4 bg-blue-50 rounded' },
          },
          {
            key: 'acknowledgement',
            type: 'checkbox',
            value: false,
            label: 'I certify that all information provided in this application is true and accurate',
            required: true,
            validationMessages: {
              required: 'You must certify the accuracy of your information',
            },
            props: { color: 'primary' },
          },
          {
            key: 'marketingConsent',
            type: 'checkbox',
            value: false,
            label: 'I would like to receive updates about certification programs and professional development opportunities',
            props: { color: 'primary' },
          },
          {
            type: 'row',
            key: 'finalNavigation',
            fields: [
              {
                type: 'previous',
                key: 'backToRequirements',
                label: 'Back',
                col: 6,
              },
              {
                type: 'submit',
                key: 'submitApplication',
                label: 'Submit Application',
                col: 6,
                props: { color: 'primary' },
              },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: any) {
    console.log('Certification application submitted:', value);

    const certType =
      value.certificationType === 'associate'
        ? 'Associate'
        : value.certificationType === 'professional'
          ? 'Professional'
          : value.certificationType === 'expert'
            ? 'Expert'
            : 'Specialist';

    this.submitMessage.set(
      `Thank you, ${value.firstName}! Your ${certType} certification application has been submitted successfully. ` +
        `You will receive a confirmation email at ${value.email} within 24 hours.`
    );
  }
}

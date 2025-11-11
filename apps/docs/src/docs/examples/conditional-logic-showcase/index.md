---
title: Conditional Logic Showcase
keyword: ConditionalLogicShowcaseExample
---

A comprehensive example demonstrating all conditional logic capabilities in ng-forge through a multi-page Professional Certification Application form.

## Live Demo

{{ NgDocActions.demo("ConditionalLogicShowcaseDemoComponent", { container: false }) }}

## Overview

This example showcases the full power of ng-forge's conditional logic system through a realistic certification application form. It demonstrates:

- **All Logic Types**: Hidden, readonly, and required conditionals
- **Multiple Operators**: equals, notEquals, greater, less, greaterOrEqual, contains
- **Complex Conditions**: AND/OR combinations
- **JavaScript Expressions**: Dynamic calculations and validations
- **Cross-Page Logic**: Fields on later pages dependent on earlier selections
- **Dynamic Validation**: Conditional validators based on form state
- **Real-World Use Case**: Practical application of conditional logic

## What This Example Demonstrates

### Logic Types

1. **Hidden Logic** - Show/hide entire sections based on certification type
2. **Readonly Logic** - Lock fields based on conditions
3. **Required Logic** - Make fields conditionally required

### Expression Types

1. **fieldValue** - Check specific field values across pages
2. **javascript** - Execute safe expressions for complex logic
3. **and/or** - Combine multiple conditions

### Operators

- **Equality**: `equals`, `notEquals`
- **Numeric**: `greater`, `less`, `greaterOrEqual`, `lessOrEqual`
- **String**: `contains`, `startsWith`, `endsWith`

## Form Flow

The form consists of 4 pages with increasingly complex conditional logic:

### Page 1: Personal Information

- Basic contact information
- **Certification type selection** - Drives conditionals throughout the form
- Country/state selection with dependent dropdowns

### Page 2: Education & Experience

- Education level
- Years of experience (conditionally required)
- Employment information (conditional on status)
- Certification-specific requirements

### Page 3: Professional Requirements

- Reference count varies by certification type
- Professional memberships (conditional)
- Background check consent
- Additional documentation requirements

### Page 4: Review & Submit

- Summary of selections
- Terms acceptance
- Final submission

## Complete Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicFormComponent, FormConfig, InferFormValue } from '@ng-forge/dynamic-form';

const certificationConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    // ============================================================
    // PAGE 1: PERSONAL INFORMATION
    // ============================================================
    {
      type: 'page',
      key: 'personalInfoPage',
      fields: [
        {
          type: 'text',
          key: 'pageTitle',
          label: 'Professional Certification Application',
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
          // DEMO: Readonly once certification type is selected
          logic: [
            {
              type: 'readonly',
              condition: {
                type: 'fieldValue',
                fieldPath: 'certificationType',
                operator: 'notEquals',
                value: '',
              },
            },
          ],
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
          // DEMO: Hidden for non-US/CA countries
          logic: [
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
            hint: 'Only shown for US/Canada',
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
      fields: [
        {
          type: 'text',
          key: 'educationTitle',
          label: 'Education & Professional Experience',
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
          },
        },
        {
          key: 'yearsExperience',
          type: 'input',
          value: '',
          label: 'Years of Professional Experience',
          required: true,
          validationMessages: {
            required: 'Years of experience is required',
          },
          props: {
            type: 'number',
            appearance: 'outline',
            hint: 'Minimum experience varies by certification level',
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
      fields: [
        {
          type: 'text',
          key: 'requirementsTitle',
          label: 'Professional Requirements',
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
        },
        {
          type: 'text',
          key: 'referencesNote',
          label: 'Based on your certification type, you need to provide professional references.',
        },
        // Reference 1 (Always Required)
        {
          type: 'text',
          key: 'reference1Header',
          label: 'Reference #1',
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
        },
        {
          key: 'backgroundCheck',
          type: 'checkbox',
          checked: false,
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
          checked: false,
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
          checked: false,
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
      fields: [
        {
          type: 'text',
          key: 'reviewTitle',
          label: 'Review Your Application',
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
        },
        {
          key: 'acknowledgement',
          type: 'checkbox',
          checked: false,
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
          checked: false,
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

type CertificationFormValue = InferFormValue<typeof certificationConfig.fields>;

@Component({
  selector: 'app-conditional-logic-showcase',
  imports: [DynamicFormComponent],
  template: `
    <div class="certification-container">
      <df-dynamic-form [config]="config" [(value)]="formValue" (formSubmit)="onSubmit($event)" />

      @let message = submitMessage(); @if (message) {
      <div class="success-message">
        {{ message }}
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionalLogicShowcaseComponent {
  config = certificationConfig;

  formValue = signal<CertificationFormValue>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    certificationType: '',
    country: '',
    educationLevel: '',
    graduationYear: '',
    yearsExperience: '',
    employmentStatus: 'employed',
    reference1Name: '',
    reference1Email: '',
    reference1Relationship: '',
    backgroundCheck: false,
    ethicsAgreement: false,
    hasPortfolio: false,
    acknowledgement: false,
    marketingConsent: false,
    professionalMemberships: [],
  });

  submitMessage = signal<string>('');

  onSubmit(value: CertificationFormValue) {
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
```

## Key Conditional Logic Patterns

### 1. Cross-Page Conditional Required

```typescript
{
  key: 'specialization',
  type: 'input',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'certificationType', // From Page 1
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
    },
  ],
}
```

Field on Page 2 depends on selection from Page 1.

### 2. Complex OR Conditions

```typescript
{
  key: 'currentCompany',
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
  ],
}
```

Hide company field if unemployed OR student.

### 3. Complex AND Conditions

```typescript
{
  key: 'portfolioUrl',
  logic: [
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
    },
  ],
}
```

Required if portfolio selected AND not Associate level.

### 4. JavaScript Expression for Array Checking

```typescript
{
  key: 'otherMembership',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'javascript',
        expression: '!formValue.professionalMemberships || !formValue.professionalMemberships.includes("other")',
      },
    },
  ],
}
```

Show field only if "other" is in the multi-checkbox array.

### 5. Conditional Validation

```typescript
{
  key: 'yearsExperience',
  validators: [
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
}
```

Validator only applies when certification type is "expert".

### 6. Cascading Conditionals

```typescript
// Reference 2 fields cascade from certificationType
{
  key: 'reference2Name',
  logic: [
    {
      type: 'hidden',
      condition: {
        /* hide for Associate */
      },
    },
    {
      type: 'required',
      condition: {
        /* required for others */
      },
    },
  ],
}
```

Multiple fields (name, email, relationship) all use the same conditional logic.

## What You Can Learn

This example demonstrates:

1. **All Logic Types**: Hidden, disabled, readonly, and required
2. **Cross-Page Logic**: Fields on later pages depend on earlier selections
3. **Complex Conditions**: Nested AND/OR conditions
4. **JavaScript Expressions**: Safe evaluation for complex logic
5. **Dynamic Validation**: Validators that apply conditionally
6. **Array Operations**: Checking multi-checkbox selections
7. **Cascading Logic**: Multiple fields affected by one condition
8. **Real-World UX**: Professional form with realistic requirements

## Variations & Extensions

### Add Progress Indicator

Track completion and display progress:

{% raw %}

```typescript
template: `
  <div class="progress">
    Step {{ currentPage() + 1 }} of 4
  </div>
  <df-dynamic-form [config]="config" [(value)]="formValue" />
`;
```

{% endraw %}

### Save Draft Functionality

Allow users to save and resume:

```typescript
// Define a custom event
export class SaveDraftEvent implements FormEvent {
  readonly type = 'save-draft';
}

// In your form config
{
  type: 'button',
  key: 'saveDraft',
  label: 'Save Draft',
  event: SaveDraftEvent,
}

// In your component
template: `
  <df-dynamic-form
    [config]="config"
    [(value)]="formValue"
    (events)="onEvent($event)"
  />
`

onEvent(event: FormEvent) {
  if (event.type instanceof SaveDraftEvent) {
    this.saveDraft();
  }
}
```

### Dynamic Fee Calculation

Calculate fees based on selections:

```typescript
computed(() => {
  const fees = {
    associate: 100,
    professional: 250,
    expert: 500,
    specialist: 350,
  };
  return fees[formValue().certificationType] || 0;
});
```

## Related Documentation

- [Conditional Logic Basics](../../core/conditional-logic) - Core concepts
- [Conditional Expressions](../../core/conditional-logic/expressions) - All operators
- [Validation](../../core/validation/basics) - Validation guide
- [Multi-Page Forms](../paginated-form) - Page navigation
- [Type Safety](../../core/type-safety/basics) - TypeScript integration

## Try It Yourself

Experiment with the live demo above:

1. **Select different certification types** to see how the form adapts
2. **Try different employment statuses** to see conditional fields
3. **Toggle the portfolio option** to see complex AND conditions
4. **Change country** to see dependent state dropdown
5. **Progress through all pages** to see cross-page conditionals

This example showcases the full power of ng-forge's declarative conditional logic system!

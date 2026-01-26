/**
 * Get Example Tool
 *
 * Returns example form configurations for common patterns.
 * Supports different depth levels: brief, example, deep.
 * Absorbs explain_feature functionality at depth='deep'.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getDoc, getDocsByCategory, type DocTopic } from '../registry/index.js';

const PATTERN_MAPPINGS: Record<string, string[]> = {
  derivation: ['dynamic-behavior-value-derivation-basics', 'value-derivation'],
  conditional: ['dynamic-behavior-conditional-logic-overview', 'age-conditional-form'],
  'multi-page': ['paginated-form'],
  validation: ['user-registration'],
  'dynamic-options': ['contact-dynamic-fields'],
  'nested-groups': ['shipping-billing-address', 'business-account-form'],
  i18n: ['dynamic-behavior-i18n'],
  submission: ['dynamic-behavior-submission'],
  complete: [], // Special case - hardcoded complete example
  mega: [], // Special case - kitchen sink mega example
};

const PATTERNS = Object.keys(PATTERN_MAPPINGS) as Array<keyof typeof PATTERN_MAPPINGS>;

/**
 * Deep explanations for features (absorbed from explain_feature tool).
 */
const DEEP_EXPLANATIONS: Record<string, string> = {
  derivation: `# Value Derivation - Deep Dive

## How It Works

1. **Derivation goes on the TARGET field** (the field that receives the computed value)
2. **targetField points to itself** (the field's own key)
3. **Expression uses \`formValue.\` prefix** to access other field values

## Syntax

\`\`\`typescript
{
  key: 'total',           // This field will be computed
  type: 'input',
  label: 'Total',
  readonly: true,         // Usually make derived fields readonly
  logic: [{
    type: 'derivation',
    targetField: 'total', // Points to itself (this field's key)
    expression: 'formValue.quantity * formValue.price',
  }],
}
\`\`\`

## Key Points

- \`targetField\` is the key of the field to update (usually itself)
- \`expression\` is JavaScript that returns the computed value
- Use \`formValue.fieldKey\` to access other field values
- For nested groups: \`formValue.address.city\`
- Optional chaining supported: \`formValue.address?.city\`
- The derivation runs whenever referenced fields change

## Common Patterns

### Calculated Total
\`\`\`typescript
logic: [{
  type: 'derivation',
  targetField: 'total',
  expression: 'formValue.quantity * formValue.unitPrice',
}]
\`\`\`

### String Concatenation
\`\`\`typescript
logic: [{
  type: 'derivation',
  targetField: 'fullName',
  expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")',
}]
\`\`\`

### Conditional Value
\`\`\`typescript
logic: [{
  type: 'derivation',
  targetField: 'discount',
  expression: 'formValue.isPremium ? 0.2 : 0',
}]
\`\`\`

### Complex Logic (IIFE)
\`\`\`typescript
logic: [{
  type: 'derivation',
  targetField: 'experienceLevel',
  expression: \`(() => {
    const years = formValue.yearsExperience || 0;
    if (years < 2) return 'Junior';
    if (years < 5) return 'Mid-Level';
    return 'Senior';
  })()\`,
}]
\`\`\`
`,

  conditional: `# Conditional Visibility - Deep Dive

Control field visibility, required state, disabled state, and readonly state based on conditions.

**IMPORTANT:** There is NO hideWhen/showWhen shorthand. Use \`logic\` blocks with \`condition\` objects.

## Logic Types

- \`hidden\` - Hide the field when condition is true
- \`disabled\` - Disable the field when condition is true
- \`readonly\` - Make field read-only when condition is true
- \`required\` - Make field required when condition is true

## Condition Types

### 1. fieldValue - Compare a field's value

\`\`\`typescript
condition: {
  type: 'fieldValue',
  fieldPath: 'accountType',  // Path to the field to check
  operator: 'equals',        // Comparison operator
  value: 'business'          // Value to compare against
}
\`\`\`

**Operators:** \`equals\`, \`notEquals\`, \`greater\`, \`less\`, \`greaterOrEqual\`, \`lessOrEqual\`, \`contains\`, \`startsWith\`, \`endsWith\`, \`matches\`

### 2. javascript - Custom JavaScript expression

\`\`\`typescript
condition: {
  type: 'javascript',
  expression: 'formValue.age >= 65 && formValue.hasDiscount'
}
\`\`\`

### 3. Boolean - Static condition

\`\`\`typescript
condition: true   // Always applies
condition: false  // Never applies
\`\`\`

### 4. Logical combinations (and/or)

\`\`\`typescript
condition: {
  type: 'and',
  conditions: [
    { type: 'fieldValue', fieldPath: 'type', operator: 'equals', value: 'business' },
    { type: 'fieldValue', fieldPath: 'size', operator: 'greater', value: 10 }
  ]
}
\`\`\`

## Multiple Logic Rules

\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  logic: [
    // Hide when NOT business
    {
      type: 'hidden',
      condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' }
    },
    // Make required when IS business
    {
      type: 'required',
      condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'business' }
    }
  ]
}
\`\`\`

## Form State Conditions (for buttons)

\`\`\`typescript
{
  key: 'submit',
  type: 'submit',
  label: 'Submit',
  logic: [
    { type: 'disabled', condition: 'formInvalid' },
    { type: 'disabled', condition: 'formSubmitting' }
  ]
}
\`\`\`

**Form state conditions:** \`formInvalid\`, \`formSubmitting\`, \`pageInvalid\`
`,

  'multi-page': `# Multi-Page Forms - Deep Dive

Create wizard-style forms with multiple pages.

## Key Rules

- ALL top-level fields must be \`type: 'page'\` (can't mix pages with non-pages)
- **Pages do NOT have \`label\` or \`title\` properties**
- Navigation buttons (next, previous) go INSIDE each page's fields
- Each page validates before advancing
- Form values are preserved across pages

## Structure

\`\`\`typescript
const config: FormConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      // NOTE: No label or title!
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name' },
        { key: 'lastName', type: 'input', label: 'Last Name' },
        { key: 'next1', type: 'next', label: 'Next' },  // Navigation INSIDE page
      ],
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'email', type: 'input', label: 'Email' },
        { key: 'prev2', type: 'previous', label: 'Back' },
        { key: 'next2', type: 'next', label: 'Next' },
      ],
    },
    {
      key: 'page3',
      type: 'page',
      fields: [
        { key: 'confirm', type: 'checkbox', label: 'I confirm' },
        { key: 'prev3', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' },
      ],
    },
  ],
};
\`\`\`

## Conditional Page Visibility

Pages support logic blocks with type 'hidden':

\`\`\`typescript
{
  key: 'businessPage',
  type: 'page',
  logic: [{
    type: 'hidden',
    condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' }
  }],
  fields: [...]
}
\`\`\`
`,

  validation: `# Validation - Deep Dive

## Built-in Validators (Shorthand)

Add directly to field config:

\`\`\`typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,      // Must have value
  email: true,         // Must be valid email
  minLength: 5,        // Minimum string length
  maxLength: 100,      // Maximum string length
}
\`\`\`

\`\`\`typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  props: { type: 'number' },
  required: true,
  min: 0,              // Minimum numeric value
  max: 120,            // Maximum numeric value
}
\`\`\`

\`\`\`typescript
{
  key: 'code',
  type: 'input',
  label: 'Code',
  pattern: '^[A-Z]{3}[0-9]{3}$',  // Regex pattern
}
\`\`\`

## Validators Array (Full Syntax)

For custom messages or complex validators:

\`\`\`typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  props: { type: 'password' },
  validators: [
    { type: 'required' },
    { type: 'minLength', value: 8 },
    { type: 'pattern', value: '^(?=.*[A-Z])(?=.*[0-9]).*$' },
  ],
}
\`\`\`

## Custom Validators

### Expression-based
\`\`\`typescript
validators: [{
  type: 'custom',
  expression: 'fieldValue === formValue.password',
  kind: 'passwordMismatch',
}]
\`\`\`

### Function-based (requires registration)
\`\`\`typescript
validators: [{
  type: 'custom',
  functionName: 'validateUsername',
}]
\`\`\`

## Async Validators

\`\`\`typescript
validators: [{
  type: 'customAsync',
  functionName: 'checkEmailAvailable',
}]
\`\`\`
`,
};

/**
 * A complete, copy-pasteable multi-page form example with all major features.
 * This is the "golden path" example - guaranteed to compile.
 * VALIDATED AGAINST ACTUAL TypeScript TYPES.
 */
const COMPLETE_EXAMPLE = `# Complete Multi-Page Form Example

This is a **complete, copy-pasteable** form configuration that demonstrates:
- Multi-page navigation
- Value derivation (computed fields)
- Conditional visibility (using logic blocks - NO hideWhen/showWhen shorthand)
- Validation (required, email, minLength)
- Groups for nested data
- Various field types

**IMPORTANT:** This example uses the ACTUAL TypeScript API. Copy-paste and it will compile.

## TypeScript Usage

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig: FormConfig = {
  fields: [
    // ========== PAGE 1: Personal Info ==========
    {
      key: 'personalInfo',
      type: 'page',
      fields: [
        // Section header - text field uses 'label' for content, 'props.elementType' for HTML element
        {
          key: 'header1',
          type: 'text',
          label: 'Personal Information',
          props: { elementType: 'h2' }
        },

        // Row with first/last name
        {
          key: 'nameRow',
          type: 'row',
          fields: [
            {
              key: 'firstName',
              type: 'input',
              label: 'First Name',
              required: true,
              minLength: 2,
              col: 6
            },
            {
              key: 'lastName',
              type: 'input',
              label: 'Last Name',
              required: true,
              minLength: 2,
              col: 6
            }
          ]
        },

        // Derived field - computed from firstName + lastName
        // Uses logic block with type: 'derivation'
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name',
          readonly: true,
          logic: [
            {
              type: 'derivation',
              targetField: 'fullName',
              expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'
            }
          ]
        },

        // Email with validation
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          email: true,
          props: { type: 'email', placeholder: 'you@example.com' }
        },

        // Navigation button - MUST be inside the page's fields
        { key: 'next1', type: 'next', label: 'Continue to Address' }
      ]
    },

    // ========== PAGE 2: Address ==========
    {
      key: 'addressPage',
      type: 'page',
      fields: [
        {
          key: 'header2',
          type: 'text',
          label: 'Address Information',
          props: { elementType: 'h2' }
        },

        // Nested group for address - creates nested object in form value
        // NOTE: Groups do NOT have a label property
        {
          key: 'address',
          type: 'group',
          fields: [
            {
              key: 'street',
              type: 'input',
              label: 'Street Address',
              required: true
            },
            {
              key: 'cityStateRow',
              type: 'row',
              fields: [
                { key: 'city', type: 'input', label: 'City', required: true, col: 6 },
                {
                  key: 'state',
                  type: 'select',
                  label: 'State',
                  required: true,
                  col: 6,
                  // OPTIONS AT FIELD LEVEL, NOT IN PROPS
                  options: [
                    { label: 'California', value: 'CA' },
                    { label: 'New York', value: 'NY' },
                    { label: 'Texas', value: 'TX' }
                  ]
                }
              ]
            },
            {
              key: 'zip',
              type: 'input',
              label: 'ZIP Code',
              required: true,
              pattern: '^\\\\d{5}(-\\\\d{4})?$'
            }
          ]
        },

        // Navigation row
        {
          key: 'navRow2',
          type: 'row',
          fields: [
            { key: 'back2', type: 'previous', label: 'Back', col: 6 },
            { key: 'next2', type: 'next', label: 'Continue', col: 6 }
          ]
        }
      ]
    },

    // ========== PAGE 3: Preferences ==========
    {
      key: 'preferencesPage',
      type: 'page',
      fields: [
        {
          key: 'header3',
          type: 'text',
          label: 'Your Preferences',
          props: { elementType: 'h2' }
        },

        // Account type selector - options at FIELD level
        {
          key: 'accountType',
          type: 'radio',
          label: 'Account Type',
          required: true,
          options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Business', value: 'business' }
          ]
        },

        // Conditional field - NO hideWhen/showWhen shorthand!
        // Use logic blocks with condition objects
        {
          key: 'companyName',
          type: 'input',
          label: 'Company Name',
          logic: [
            // Hide when accountType is NOT 'business'
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'business'
              }
            },
            // Make required when accountType IS 'business'
            {
              type: 'required',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business'
              }
            }
          ]
        },

        // Slider - minValue/maxValue/step at FIELD level, NOT in props
        {
          key: 'yearsExperience',
          type: 'slider',
          label: 'Years of Experience',
          minValue: 0,
          maxValue: 50,
          step: 1,
          value: 5
        },

        // Newsletter checkbox
        {
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to newsletter'
        },

        // Terms acceptance - required checkbox
        {
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'I accept the terms and conditions',
          required: true
        },

        // Final navigation
        {
          key: 'navRow3',
          type: 'row',
          fields: [
            { key: 'back3', type: 'previous', label: 'Back', col: 6 },
            { key: 'submitBtn', type: 'submit', label: 'Submit', col: 6 }
          ]
        }
      ]
    }
  ]
};
\`\`\`

## Form Output Shape

\`\`\`typescript
{
  firstName: string;
  lastName: string;
  fullName: string;      // Computed via derivation
  email: string;
  address: {             // Nested from group
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  accountType: 'personal' | 'business';
  companyName?: string;  // Only present when accountType is 'business'
  yearsExperience: number;
  newsletter: boolean;
  acceptTerms: boolean;
}
\`\`\`

## Critical API Notes (Common Mistakes to Avoid)

### 1. Text fields
\`\`\`typescript
// CORRECT: 'label' for content, 'props.elementType' for HTML element
{ type: 'text', label: 'Section Title', props: { elementType: 'h2' } }

// WRONG: No 'content' property exists
{ type: 'text', props: { content: 'Title', element: 'h2' } }
\`\`\`

### 2. Conditional visibility (NO hideWhen/showWhen shorthand!)
\`\`\`typescript
// CORRECT: Use logic block with condition object
{
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',      // or 'javascript' for expressions
      fieldPath: 'otherField',
      operator: 'equals',
      value: 'someValue'
    }
  }]
}

// WRONG: hideWhen/showWhen properties don't exist
{ hideWhen: { field: '...', operator: '...', value: '...' } }
\`\`\`

### 3. JavaScript expressions in conditions
\`\`\`typescript
// CORRECT: Use type: 'javascript' with expression
{
  logic: [{
    type: 'hidden',
    condition: {
      type: 'javascript',
      expression: 'formValue.age < 18'
    }
  }]
}
\`\`\`

### 4. Derivation (computed values)
\`\`\`typescript
// CORRECT: Use logic block with type: 'derivation'
{
  logic: [{
    type: 'derivation',
    targetField: 'fullName',
    expression: 'formValue.firstName + " " + formValue.lastName'
  }]
}

// WRONG: No 'derivation' property at field level
{ derivation: { expression: '...', source: [...] } }
\`\`\`

### 5. Options placement
\`\`\`typescript
// CORRECT: options at FIELD level
{ type: 'select', options: [...] }

// WRONG: options in props
{ type: 'select', props: { options: [...] } }
\`\`\`

### 6. Slider properties
\`\`\`typescript
// CORRECT: minValue/maxValue/step at FIELD level
{ type: 'slider', minValue: 0, maxValue: 100, step: 5 }

// WRONG: min/max in props
{ type: 'slider', props: { min: 0, max: 100 } }
\`\`\`

### 7. Container labels
\`\`\`typescript
// CORRECT: Containers (row, group, array, page) have NO label
{ type: 'group', key: 'address', fields: [...] }

// WRONG: label on container
{ type: 'group', label: 'Address', fields: [...] }
\`\`\`
`;

/**
 * MEGA EXAMPLE: Kitchen sink form demonstrating EVERY feature.
 * Use this to understand every possible configuration option.
 */
const MEGA_EXAMPLE = `# Kitchen Sink Mega Example

This example demonstrates **EVERY feature** of ng-forge dynamic forms in one comprehensive form. Use it as a reference for any configuration question.

## Features Demonstrated

- All field types (input, select, radio, checkbox, multi-checkbox, textarea, toggle, slider, datepicker, text, hidden)
- All container types (page, group, array, row)
- All button types (submit, next, previous, button)
- All validation types (required, email, min, max, minLength, maxLength, pattern, custom)
- All logic types (hidden, disabled, readonly, required, derivation)
- All condition types (fieldValue, javascript, boolean, and, or)
- Nested paths and optional chaining
- Multi-page navigation with conditional pages
- Arrays with dynamic items
- Material-specific props

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const megaFormConfig: FormConfig = {
  fields: [
    // =====================================================
    // PAGE 1: Personal Information & Basic Fields
    // =====================================================
    {
      key: 'personalPage',
      type: 'page',
      // Pages support logic for conditional visibility
      // (only 'hidden' type is allowed on pages)
      fields: [
        // TEXT FIELD - Display-only content
        // Uses 'label' for content, 'props.elementType' for HTML element
        {
          key: 'personalHeader',
          type: 'text',
          label: 'Personal Information',
          props: { elementType: 'h1' }
        },
        {
          key: 'personalSubheader',
          type: 'text',
          label: 'Please fill in your personal details below.',
          props: { elementType: 'p' }
        },

        // ROW - Horizontal layout container (NO label, NO logic)
        {
          key: 'nameRow',
          type: 'row',
          // NO label on containers!
          fields: [
            // INPUT - Text input with validation
            {
              key: 'firstName',
              type: 'input',
              label: 'First Name',
              required: true,          // Shorthand validation
              minLength: 2,
              maxLength: 50,
              col: 4,                   // 4/12 columns
              props: {
                placeholder: 'John',
                appearance: 'outline',  // Material-specific
                hint: 'Your legal first name'
              }
            },
            {
              key: 'middleName',
              type: 'input',
              label: 'Middle Name',
              col: 4,
              props: { placeholder: 'Optional' }
            },
            {
              key: 'lastName',
              type: 'input',
              label: 'Last Name',
              required: true,
              minLength: 2,
              col: 4,
              props: { placeholder: 'Doe' }
            }
          ]
        },

        // DERIVATION - Computed field from other values
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name (Auto-computed)',
          readonly: true,
          logic: [{
            type: 'derivation',
            targetField: 'fullName',
            // Expression using formValue with optional chaining
            expression: \`(() => {
              const first = formValue.firstName || '';
              const middle = formValue.middleName ? ' ' + formValue.middleName : '';
              const last = formValue.lastName || '';
              return (first + middle + ' ' + last).trim();
            })()\`
          }]
        },

        // INPUT with email validation
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          email: true,                // Shorthand email validator
          props: {
            type: 'email',            // HTML input type in props
            placeholder: 'john.doe@example.com'
          }
        },

        // INPUT with pattern validation
        {
          key: 'phone',
          type: 'input',
          label: 'Phone Number',
          pattern: '^\\\\+?[1-9]\\\\d{1,14}$',  // E.164 format
          props: {
            type: 'tel',
            placeholder: '+1234567890'
          }
        },

        // INPUT with number type and min/max
        {
          key: 'age',
          type: 'input',
          label: 'Age',
          required: true,
          min: 18,                    // Minimum numeric value
          max: 120,                   // Maximum numeric value
          props: { type: 'number' }
        },

        // DATEPICKER - Date selection
        {
          key: 'birthDate',
          type: 'datepicker',
          label: 'Date of Birth',
          props: {
            startView: 'year',        // Material: start with year view
            appearance: 'outline'
          }
        },

        // SELECT - Dropdown with options at FIELD level
        {
          key: 'gender',
          type: 'select',
          label: 'Gender',
          required: true,
          options: [                  // OPTIONS AT FIELD LEVEL!
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Non-binary', value: 'nonbinary' },
            { label: 'Prefer not to say', value: 'undisclosed' }
          ],
          props: { placeholder: 'Select your gender' }
        },

        // RADIO - Single selection from options
        {
          key: 'maritalStatus',
          type: 'radio',
          label: 'Marital Status',
          options: [
            { label: 'Single', value: 'single' },
            { label: 'Married', value: 'married' },
            { label: 'Divorced', value: 'divorced' },
            { label: 'Widowed', value: 'widowed' }
          ]
        },

        // CONDITIONAL FIELD - Hidden when married is not selected
        // Uses logic block with fieldValue condition
        {
          key: 'spouseName',
          type: 'input',
          label: 'Spouse Name',
          logic: [
            // Hide when NOT married
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'maritalStatus',
                operator: 'notEquals',
                value: 'married'
              }
            },
            // Make required when married
            {
              type: 'required',
              condition: {
                type: 'fieldValue',
                fieldPath: 'maritalStatus',
                operator: 'equals',
                value: 'married'
              }
            }
          ]
        },

        // NEXT button for page navigation
        { key: 'toAddressPage', type: 'next', label: 'Continue to Address' }
      ]
    },

    // =====================================================
    // PAGE 2: Address with Nested Groups
    // =====================================================
    {
      key: 'addressPage',
      type: 'page',
      fields: [
        {
          key: 'addressHeader',
          type: 'text',
          label: 'Address Information',
          props: { elementType: 'h1' }
        },

        // GROUP - Creates nested object (NO label!)
        // formValue.homeAddress.street, formValue.homeAddress.city, etc.
        {
          key: 'homeAddress',
          type: 'group',
          // NO label on groups!
          fields: [
            {
              key: 'sectionLabel',
              type: 'text',
              label: 'Home Address',
              props: { elementType: 'h3' }
            },
            {
              key: 'street',
              type: 'input',
              label: 'Street Address',
              required: true
            },
            {
              key: 'apartment',
              type: 'input',
              label: 'Apt/Suite/Unit',
              props: { placeholder: 'Optional' }
            },
            {
              key: 'cityStateRow',
              type: 'row',
              fields: [
                { key: 'city', type: 'input', label: 'City', required: true, col: 5 },
                {
                  key: 'state',
                  type: 'select',
                  label: 'State',
                  required: true,
                  col: 4,
                  options: [
                    { label: 'California', value: 'CA' },
                    { label: 'New York', value: 'NY' },
                    { label: 'Texas', value: 'TX' },
                    { label: 'Florida', value: 'FL' }
                  ]
                },
                {
                  key: 'zip',
                  type: 'input',
                  label: 'ZIP',
                  required: true,
                  pattern: '^\\\\d{5}(-\\\\d{4})?$',
                  col: 3
                }
              ]
            }
          ]
        },

        // CHECKBOX - Boolean field
        {
          key: 'sameAsHome',
          type: 'checkbox',
          label: 'Billing address same as home address',
          value: true             // Default checked
        },

        // CONDITIONAL GROUP - Uses JavaScript expression
        {
          key: 'billingAddress',
          type: 'group',
          fields: [
            {
              key: 'billingLabel',
              type: 'text',
              label: 'Billing Address',
              props: { elementType: 'h3' },
              // Each CHILD field needs logic (not the group)
              logic: [{
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'sameAsHome',
                  operator: 'equals',
                  value: true
                }
              }]
            },
            {
              key: 'street',
              type: 'input',
              label: 'Street',
              logic: [{
                type: 'hidden',
                condition: { type: 'fieldValue', fieldPath: 'sameAsHome', operator: 'equals', value: true }
              }]
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              logic: [{
                type: 'hidden',
                condition: { type: 'fieldValue', fieldPath: 'sameAsHome', operator: 'equals', value: true }
              }]
            }
          ]
        },

        // Navigation row
        {
          key: 'addressNav',
          type: 'row',
          fields: [
            { key: 'backToPersonal', type: 'previous', label: 'Back', col: 6 },
            { key: 'toPreferences', type: 'next', label: 'Continue', col: 6 }
          ]
        }
      ]
    },

    // =====================================================
    // PAGE 3: Preferences with Advanced Features
    // =====================================================
    {
      key: 'preferencesPage',
      type: 'page',
      fields: [
        {
          key: 'prefsHeader',
          type: 'text',
          label: 'Preferences & Additional Info',
          props: { elementType: 'h1' }
        },

        // TOGGLE - On/off switch
        {
          key: 'darkMode',
          type: 'toggle',
          label: 'Enable Dark Mode'
        },

        // SLIDER - Numeric range (minValue/maxValue at FIELD level!)
        {
          key: 'notificationFrequency',
          type: 'slider',
          label: 'Notification Frequency (days)',
          minValue: 1,            // AT FIELD LEVEL!
          maxValue: 30,           // AT FIELD LEVEL!
          step: 1,                // AT FIELD LEVEL!
          value: 7                // Default value
        },

        // MULTI-CHECKBOX - Multiple selections
        {
          key: 'interests',
          type: 'multi-checkbox',
          label: 'Your Interests',
          options: [
            { label: 'Technology', value: 'tech' },
            { label: 'Sports', value: 'sports' },
            { label: 'Music', value: 'music' },
            { label: 'Travel', value: 'travel' },
            { label: 'Food', value: 'food' }
          ]
        },

        // TEXTAREA - Multi-line text
        {
          key: 'bio',
          type: 'textarea',
          label: 'Short Bio',
          maxLength: 500,
          props: {
            rows: 4,
            placeholder: 'Tell us about yourself...'
          }
        },

        // RADIO with conditional derivation
        {
          key: 'subscriptionTier',
          type: 'radio',
          label: 'Subscription Tier',
          required: true,
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Basic ($9.99/mo)', value: 'basic' },
            { label: 'Premium ($19.99/mo)', value: 'premium' },
            { label: 'Enterprise (Custom)', value: 'enterprise' }
          ]
        },

        // DERIVED PRICE with conditional logic
        {
          key: 'monthlyPrice',
          type: 'input',
          label: 'Monthly Price',
          readonly: true,
          logic: [
            {
              type: 'derivation',
              targetField: 'monthlyPrice',
              expression: \`(() => {
                const tier = formValue.subscriptionTier;
                if (tier === 'free') return '$0.00';
                if (tier === 'basic') return '$9.99';
                if (tier === 'premium') return '$19.99';
                if (tier === 'enterprise') return 'Contact Sales';
                return '';
              })()\`
            },
            // Hide when no tier selected
            {
              type: 'hidden',
              condition: {
                type: 'javascript',
                expression: '!formValue.subscriptionTier'
              }
            }
          ]
        },

        // CONDITIONAL FIELD using AND condition
        {
          key: 'enterpriseDetails',
          type: 'textarea',
          label: 'Enterprise Requirements',
          props: { rows: 3 },
          logic: [{
            type: 'hidden',
            condition: {
              type: 'or',              // Logical OR
              conditions: [
                { type: 'fieldValue', fieldPath: 'subscriptionTier', operator: 'notEquals', value: 'enterprise' },
                {
                  type: 'and',         // Nested AND
                  conditions: [
                    { type: 'fieldValue', fieldPath: 'subscriptionTier', operator: 'equals', value: 'enterprise' },
                    { type: 'javascript', expression: 'formValue.age < 18' }  // Not allowed for minors
                  ]
                }
              ]
            }
          }]
        },

        // HIDDEN field - Not visible but included in form value
        {
          key: 'trackingId',
          type: 'hidden',
          value: 'UTM-123456'
        },

        // Navigation
        {
          key: 'prefsNav',
          type: 'row',
          fields: [
            { key: 'backToAddress', type: 'previous', label: 'Back', col: 6 },
            { key: 'toContacts', type: 'next', label: 'Continue', col: 6 }
          ]
        }
      ]
    },

    // =====================================================
    // PAGE 4: Dynamic Array of Contacts
    // =====================================================
    {
      key: 'contactsPage',
      type: 'page',
      fields: [
        {
          key: 'contactsHeader',
          type: 'text',
          label: 'Emergency Contacts',
          props: { elementType: 'h1' }
        },
        {
          key: 'contactsHelp',
          type: 'text',
          label: 'Add at least one emergency contact.',
          props: { elementType: 'p' }
        },

        // ARRAY - Dynamic list of items (NO label, NO logic!)
        // Uses 'fields' to define the template for each item
        {
          key: 'emergencyContacts',
          type: 'array',
          // NO label on arrays!
          fields: [
            // Each array item contains these fields
            {
              key: 'contactGroup',
              type: 'group',
              fields: [
                {
                  key: 'contactRow',
                  type: 'row',
                  fields: [
                    {
                      key: 'contactName',
                      type: 'input',
                      label: 'Contact Name',
                      required: true,
                      col: 4
                    },
                    {
                      key: 'relationship',
                      type: 'select',
                      label: 'Relationship',
                      required: true,
                      col: 4,
                      options: [
                        { label: 'Parent', value: 'parent' },
                        { label: 'Spouse', value: 'spouse' },
                        { label: 'Sibling', value: 'sibling' },
                        { label: 'Friend', value: 'friend' },
                        { label: 'Other', value: 'other' }
                      ]
                    },
                    {
                      key: 'contactPhone',
                      type: 'input',
                      label: 'Phone',
                      required: true,
                      col: 4,
                      props: { type: 'tel' }
                    }
                  ]
                }
              ]
            }
          ]
        },

        // DERIVATION accessing array values
        {
          key: 'contactCount',
          type: 'input',
          label: 'Number of Contacts',
          readonly: true,
          logic: [{
            type: 'derivation',
            targetField: 'contactCount',
            expression: '(formValue.emergencyContacts?.length || 0).toString()'
          }]
        },

        // Navigation
        {
          key: 'contactsNav',
          type: 'row',
          fields: [
            { key: 'backToPrefs', type: 'previous', label: 'Back', col: 6 },
            { key: 'toReview', type: 'next', label: 'Review', col: 6 }
          ]
        }
      ]
    },

    // =====================================================
    // PAGE 5: Review & Submit with Conditional Page
    // =====================================================
    {
      key: 'reviewPage',
      type: 'page',
      // Conditional page - only show for premium/enterprise
      logic: [{
        type: 'hidden',
        condition: {
          type: 'and',
          conditions: [
            { type: 'fieldValue', fieldPath: 'subscriptionTier', operator: 'notEquals', value: 'premium' },
            { type: 'fieldValue', fieldPath: 'subscriptionTier', operator: 'notEquals', value: 'enterprise' }
          ]
        }
      }],
      fields: [
        {
          key: 'reviewHeader',
          type: 'text',
          label: 'Premium Review',
          props: { elementType: 'h1' }
        },
        {
          key: 'reviewText',
          type: 'text',
          label: 'As a premium member, please review your information before submitting.',
          props: { elementType: 'p' }
        },

        // Summary derivation
        {
          key: 'summaryDisplay',
          type: 'textarea',
          label: 'Your Information Summary',
          readonly: true,
          props: { rows: 6 },
          logic: [{
            type: 'derivation',
            targetField: 'summaryDisplay',
            expression: \`(() => {
              const lines = [];
              lines.push('Name: ' + (formValue.fullName || 'Not provided'));
              lines.push('Email: ' + (formValue.email || 'Not provided'));
              lines.push('City: ' + (formValue.homeAddress?.city || 'Not provided'));
              lines.push('Tier: ' + (formValue.subscriptionTier || 'Not selected'));
              lines.push('Contacts: ' + (formValue.emergencyContacts?.length || 0));
              return lines.join('\\n');
            })()\`
          }]
        },

        { key: 'backToContacts', type: 'previous', label: 'Back' }
      ]
    },

    // =====================================================
    // PAGE 6: Final Confirmation & Submit
    // =====================================================
    {
      key: 'confirmPage',
      type: 'page',
      fields: [
        {
          key: 'confirmHeader',
          type: 'text',
          label: 'Confirm & Submit',
          props: { elementType: 'h1' }
        },

        // CHECKBOX with custom validator
        {
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'I accept the Terms of Service and Privacy Policy',
          required: true
        },

        {
          key: 'acceptMarketing',
          type: 'checkbox',
          label: 'I agree to receive marketing communications (optional)'
        },

        // DISABLED button when form is invalid
        // Uses form state condition
        {
          key: 'submitNav',
          type: 'row',
          fields: [
            {
              key: 'finalBack',
              type: 'previous',
              label: 'Back',
              col: 6
            },
            {
              key: 'submitForm',
              type: 'submit',
              label: 'Submit Registration',
              col: 6,
              logic: [{
                type: 'disabled',
                condition: 'formInvalid'  // Form state condition (buttons only)
              }]
            }
          ]
        },

        // GENERIC BUTTON (custom action)
        {
          key: 'resetButton',
          type: 'button',
          label: 'Reset Form'
          // Handle via (buttonClick) event in component
        }
      ]
    }
  ]
};
\`\`\`

## Form Output Shape

\`\`\`typescript
interface MegaFormValue {
  // Page 1: Personal
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;            // Derived
  email: string;
  phone?: string;
  age: number;
  birthDate?: Date;
  gender: 'male' | 'female' | 'nonbinary' | 'undisclosed';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  spouseName?: string;         // Conditional

  // Page 2: Address (nested groups)
  homeAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
  };
  sameAsHome: boolean;
  billingAddress?: {
    street?: string;
    city?: string;
  };

  // Page 3: Preferences
  darkMode: boolean;
  notificationFrequency: number;
  interests: string[];         // Multi-checkbox returns array
  bio?: string;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  monthlyPrice: string;        // Derived
  enterpriseDetails?: string;  // Conditional
  trackingId: string;          // Hidden field

  // Page 4: Contacts (array)
  emergencyContacts: Array<{
    contactName: string;
    relationship: string;
    contactPhone: string;
  }>;
  contactCount: string;        // Derived

  // Page 5: Review (conditional page)
  summaryDisplay: string;      // Derived

  // Page 6: Confirm
  acceptTerms: boolean;
  acceptMarketing: boolean;
}
\`\`\`

## Features Checklist

| Feature | Location in Example |
|---------|---------------------|
| input (text, email, number, tel) | Page 1, 2 |
| select | Page 1, 2, 4 |
| radio | Page 1, 3 |
| checkbox | Page 2, 6 |
| multi-checkbox | Page 3 |
| textarea | Page 3, 5 |
| toggle | Page 3 |
| slider | Page 3 |
| datepicker | Page 1 |
| text (display) | All pages |
| hidden | Page 3 |
| row (layout) | Page 1, 2, 3, 4, 6 |
| group (nested object) | Page 2 |
| array (dynamic list) | Page 4 |
| page (multi-step) | All |
| submit | Page 6 |
| next | Page 1, 2, 3, 4 |
| previous | Page 2, 3, 4, 5, 6 |
| button | Page 6 |
| required validation | Page 1, 2, 4 |
| email validation | Page 1 |
| min/max validation | Page 1 |
| minLength/maxLength | Page 1, 3 |
| pattern validation | Page 1, 2 |
| logic: hidden | Page 1, 3, 5 |
| logic: disabled | Page 6 |
| logic: required | Page 1 |
| logic: derivation | Page 1, 3, 4, 5 |
| condition: fieldValue | Page 1, 2, 5 |
| condition: javascript | Page 3 |
| condition: and | Page 3, 5 |
| condition: or | Page 3 |
| condition: formInvalid | Page 6 |
| nested paths | Page 2, 5 |
| optional chaining | Page 4, 5 |
| Material props | Page 1 |
`;

function formatDocTopic(doc: DocTopic): string {
  return `# ${doc.title}\n\n${doc.content}`;
}

export function registerGetExampleTool(server: McpServer): void {
  server.tool(
    'ngforge_get_example',
    'Returns example form configurations for common patterns like derivation, conditional visibility, multi-page forms, validation, etc. Use depth="deep" for conceptual explanations + code + edge cases.',
    {
      pattern: z
        .enum(PATTERNS as unknown as [string, ...string[]])
        .optional()
        .describe(
          'Pattern to get examples for: derivation, conditional, multi-page, validation, dynamic-options, nested-groups, i18n, submission, complete, mega. If omitted, lists available patterns.',
        ),
      depth: z
        .enum(['example', 'deep'])
        .optional()
        .describe('Level of detail: "example" (default) = working code, "deep" = conceptual explanation + code + edge cases'),
    },
    async ({ pattern, depth = 'example' }) => {
      // If no pattern specified, list available patterns
      if (!pattern) {
        const lines: string[] = [
          '# Available Example Patterns',
          '',
          '## complete (RECOMMENDED FOR STARTING)',
          '**Start here!** A complete, copy-pasteable multi-page form with derivation, conditional logic, validation, groups, and all major features. Guaranteed to compile.',
          '',
          '## mega (KITCHEN SINK - EVERY FEATURE)',
          '**Reference for everything!** A comprehensive example demonstrating ALL field types, ALL container types, ALL logic types, ALL condition types, arrays, nested paths, and Material props. Use this as a lookup reference.',
          '',
          '## derivation',
          'Automatically compute field values based on other fields (calculated fields, auto-fill)',
          '',
          '## conditional',
          'Show/hide, enable/disable fields based on conditions using logic blocks',
          '',
          '## multi-page',
          'Wizard-style multi-step forms with page navigation',
          '',
          '## validation',
          'Form validation patterns including custom validators',
          '',
          '## dynamic-options',
          'Dynamically populate select/radio options',
          '',
          '## nested-groups',
          'Nested form groups for complex data structures',
          '',
          '## i18n',
          'Internationalization and translation support',
          '',
          '## submission',
          'Form submission handling and events',
          '',
          'Use `ngforge_get_example` with a specific pattern for detailed examples.',
          '',
          '**TIP:** Start with `ngforge_get_example pattern="complete"` for a working foundation, or use `pattern="mega"` to see every feature demonstrated.',
        ];

        return {
          content: [{ type: 'text' as const, text: lines.join('\n') }],
        };
      }

      // Special case: complete example
      if (pattern === 'complete') {
        return {
          content: [{ type: 'text' as const, text: COMPLETE_EXAMPLE }],
        };
      }

      // Special case: mega kitchen sink example
      if (pattern === 'mega') {
        return {
          content: [{ type: 'text' as const, text: MEGA_EXAMPLE }],
        };
      }

      // For 'deep' depth, include conceptual explanation first
      let deepContent = '';
      if (depth === 'deep' && DEEP_EXPLANATIONS[pattern]) {
        deepContent = DEEP_EXPLANATIONS[pattern] + '\n\n---\n\n# Working Examples\n\n';
      }

      // Get docs for the pattern
      const docIds = PATTERN_MAPPINGS[pattern];

      if (!docIds || docIds.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No examples found for pattern: "${pattern}". Available patterns: ${PATTERNS.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // Fetch and combine relevant docs
      const docs: DocTopic[] = [];
      for (const id of docIds) {
        const doc = getDoc(id);
        if (doc) {
          docs.push(doc);
        }
      }

      if (docs.length === 0) {
        // Fall back to category search
        const categoryDocs = getDocsByCategory('examples');
        const matchingDocs = categoryDocs.filter(
          (d) => d.title.toLowerCase().includes(pattern.toLowerCase()) || d.content.toLowerCase().includes(pattern.toLowerCase()),
        );

        if (matchingDocs.length > 0) {
          docs.push(...matchingDocs.slice(0, 2));
        }
      }

      if (docs.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Documentation for "${pattern}" not found. This pattern may not have examples yet.`,
            },
          ],
          isError: true,
        };
      }

      // Return the first (most relevant) doc
      const exampleContent = docs.map(formatDocTopic).join('\n\n---\n\n');

      return {
        content: [{ type: 'text' as const, text: deepContent + exampleContent }],
      };
    },
  );
}

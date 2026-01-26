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
          'Pattern to get examples for: derivation, conditional, multi-page, validation, dynamic-options, nested-groups, i18n, submission, complete. If omitted, lists available patterns.',
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
          '## complete (RECOMMENDED)',
          '**Start here!** A complete, copy-pasteable multi-page form with derivation, conditional logic, validation, groups, and all major features. Guaranteed to compile.',
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
          '**TIP:** Start with `ngforge_get_example pattern="complete"` for a working foundation.',
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

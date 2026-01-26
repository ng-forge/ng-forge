/**
 * Explain Feature Tool
 *
 * Returns detailed explanations of how specific features work.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getDoc, getValidators, type ValidatorInfo } from '../registry/index.js';

const FEATURE_DOCS: Record<string, { docId?: string; inline?: string }> = {
  derivation: {
    inline: `# Value Derivation

Derivations automatically compute and set field values based on other form values.

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
  expression: '\`\${formValue.firstName} \${formValue.lastName}\`',
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
`,
  },
  conditional: {
    inline: `# Conditional Visibility (logic blocks)

Control field visibility, required state, disabled state, and readonly state based on conditions.

**IMPORTANT:** There is NO hideWhen/showWhen shorthand. Use \`logic\` blocks with \`condition\` objects.

## Basic Syntax - Hide a field conditionally

\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business'
    }
  }]
}
\`\`\`

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

The expression has access to \`formValue\` object containing all form values.

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

Combine multiple rules in the logic array:

\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  logic: [
    // Hide when NOT business
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'notEquals',
        value: 'business'
      }
    },
    // Make required when IS business
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
}
\`\`\`

## Form State Conditions (for buttons)

For buttons, you can use special form state conditions:

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
  },
  // Aliases for common search terms
  hideWhen: { inline: 'See "conditional" feature. Note: hideWhen/showWhen shorthand does NOT exist. Use logic blocks instead.' },
  showWhen: { inline: 'See "conditional" feature. Note: hideWhen/showWhen shorthand does NOT exist. Use logic blocks instead.' },
  visibility: { inline: 'See "conditional" feature for controlling field visibility with logic blocks.' },
  validation: {
    inline: `# Validation

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

## HTTP Validators

\`\`\`typescript
validators: [{
  type: 'customHttp',
  functionName: 'validatePostalCode',
}]
\`\`\`
`,
  },
  logic: {
    inline: `# Logic Blocks

The \`logic\` property allows defining dynamic behaviors on fields.

## Structure

\`\`\`typescript
{
  key: 'fieldKey',
  type: 'input',
  label: 'Field',
  logic: [
    { type: 'derivation', ... },
    { type: 'hidden', ... },
    { type: 'disabled', ... },
  ],
}
\`\`\`

## Logic Types

### derivation
Compute field value from other fields:
\`\`\`typescript
{
  type: 'derivation',
  targetField: 'total',
  expression: 'formValue.qty * formValue.price',
}
\`\`\`

### hidden
Hide field based on condition:
\`\`\`typescript
{
  type: 'hidden',
  expression: 'formValue.showAdvanced === false',
}
\`\`\`

### disabled
Disable field based on condition:
\`\`\`typescript
{
  type: 'disabled',
  expression: 'formValue.isLocked',
}
\`\`\`

## Expression Context

In expressions, you have access to:
- \`formValue\` - The entire form's current values
- \`fieldValue\` - The current field's value (in validators)
- Standard JavaScript operators and functions
`,
  },
  pages: {
    docId: 'paginated-form',
    inline: `# Multi-Page Forms

Create wizard-style forms with multiple pages.

## Structure

\`\`\`typescript
const config: FormConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      // NOTE: Pages do NOT have label or title properties
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name' },
        { key: 'lastName', type: 'input', label: 'Last Name' },
        { key: 'next1', type: 'next', label: 'Next' },
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
        { key: 'prev3', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' },
      ],
    },
  ],
};
\`\`\`

## Key Points

- ALL top-level fields must be \`type: 'page'\` (can't mix pages with non-pages)
- **Pages do NOT have \`label\` or \`title\` properties**
- Use \`next\` button to advance pages
- Use \`previous\` button to go back
- Each page validates before advancing
- Form values are preserved across pages

## Container Field Rules

Container fields (page, group, array, row) do NOT have \`label\`:
- \`page\`: No label, no title
- \`group\`: No label (logical container only)
- \`array\`: No label, no minItems/maxItems, uses \`fields\` not \`template\`
- \`row\`: No label (horizontal layout only)
`,
  },
};

const FEATURES = Object.keys(FEATURE_DOCS) as Array<keyof typeof FEATURE_DOCS>;

export function registerExplainFeatureTool(server: McpServer): void {
  server.tool(
    'ngforge_explain_feature',
    'Returns detailed explanations of how specific features work including syntax, key concepts, and common patterns. Use this when you need to understand HOW a feature works, not just what properties are valid.',
    {
      feature: z
        .enum(FEATURES as unknown as [string, ...string[]])
        .optional()
        .describe('Feature to explain: derivation, conditional, validation, logic, pages. If omitted, lists available features.'),
    },
    async ({ feature }) => {
      // If no feature specified, list available features
      if (!feature) {
        const validators = getValidators();
        const validatorList = validators.map((v: ValidatorInfo) => `  - ${v.type}: ${v.description}`).join('\n');

        const lines: string[] = [
          '# Available Feature Explanations',
          '',
          '## derivation',
          'How to compute field values based on other fields (calculated fields, auto-fill)',
          '',
          '## conditional',
          'How to conditionally show/hide, enable/disable, or require fields using logic blocks',
          '**Note:** There is NO hideWhen/showWhen shorthand - use logic blocks with condition objects',
          '',
          '## validation',
          'How to add validation rules to fields (built-in and custom validators)',
          '',
          '## logic',
          'How to use logic blocks for dynamic behaviors (derivation, hidden, disabled, required)',
          '',
          '## pages',
          'How to create multi-page wizard forms',
          '',
          '---',
          '',
          '## Available Validators',
          validatorList,
          '',
          'Use `ngforge_explain_feature` with a specific feature for detailed documentation.',
        ];

        return {
          content: [{ type: 'text' as const, text: lines.join('\n') }],
        };
      }

      const featureConfig = FEATURE_DOCS[feature];

      if (!featureConfig) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Unknown feature: "${feature}". Available features: ${FEATURES.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // Return inline documentation (primary) or fetch from docs
      let content = featureConfig.inline || '';

      if (featureConfig.docId) {
        const doc = getDoc(featureConfig.docId);
        if (doc) {
          content += `\n\n---\n\n# Additional Documentation\n\n${doc.content}`;
        }
      }

      return {
        content: [{ type: 'text' as const, text: content }],
      };
    },
  );
}

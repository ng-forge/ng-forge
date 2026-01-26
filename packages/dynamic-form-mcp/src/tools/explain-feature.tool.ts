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
  hideWhen: {
    inline: `# Conditional Visibility (hideWhen/showWhen)

Control field visibility based on other field values.

## hideWhen - Hide field when condition is true

\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  hideWhen: {
    field: 'accountType',
    operator: 'eq',
    value: 'personal',
  },
}
\`\`\`

## showWhen - Show field only when condition is true

\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  showWhen: {
    field: 'accountType',
    operator: 'eq',
    value: 'business',
  },
}
\`\`\`

## Operators

- \`eq\` - equals
- \`neq\` - not equals
- \`gt\` - greater than
- \`gte\` - greater than or equal
- \`lt\` - less than
- \`lte\` - less than or equal
- \`contains\` - string/array contains
- \`in\` - value is in array

## Expression Syntax (advanced)

For complex conditions, use expression syntax:

\`\`\`typescript
{
  key: 'seniorDiscount',
  type: 'checkbox',
  label: 'Apply senior discount',
  hideWhen: {
    expression: 'formValue.age < 65',
  },
}
\`\`\`

## Multiple Conditions

Use \`logic\` array for multiple conditions:

\`\`\`typescript
{
  key: 'specialField',
  type: 'input',
  label: 'Special Field',
  logic: [{
    type: 'hidden',
    expression: 'formValue.type !== "special" || formValue.level < 5',
  }],
}
\`\`\`
`,
  },
  showWhen: { inline: 'See hideWhen - showWhen is the inverse (show when condition is true).' },
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
        .describe('Feature to explain: derivation, hideWhen, showWhen, validation, logic, pages. If omitted, lists available features.'),
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
          '## hideWhen / showWhen',
          'How to conditionally show/hide fields based on form values',
          '',
          '## validation',
          'How to add validation rules to fields (built-in and custom validators)',
          '',
          '## logic',
          'How to use logic blocks for dynamic behaviors (derivation, hidden, disabled)',
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

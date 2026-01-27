/**
 * Unified Examples Tool
 *
 * Consolidated working code patterns tool that absorbs:
 * - get-example.tool.ts (complete and mega examples)
 * - explain-feature.tool.ts (conceptual explanations)
 *
 * Single tool for "Show me how to do X"
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getDoc, type DocTopic } from '../registry/index.js';

/**
 * Pattern definitions with minimal, brief, full, and explained content.
 */
const PATTERNS: Record<
  string,
  {
    description: string;
    minimal: string;
    brief: string;
    full: string;
    explained: string;
  }
> = {
  // ========== MINIMAL PATTERNS (NEW) ==========
  'minimal-multipage': {
    description: 'Simplest 2-page wizard form (~50 lines)',
    minimal: `import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'name', type: 'input', label: 'Your Name', required: true },
        { key: 'email', type: 'input', label: 'Email', email: true },
        { key: 'next1', type: 'next', label: 'Next' }
      ]
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'message', type: 'textarea', label: 'Message' },
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;`,

    brief: `// 2-page wizard form
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'name', type: 'input', label: 'Your Name', required: true },
        { key: 'email', type: 'input', label: 'Email', email: true },
        { key: 'next1', type: 'next', label: 'Next' }  // Nav button INSIDE page
      ]
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'message', type: 'textarea', label: 'Message' },
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;

// Key points:
// - ALL root fields must be 'page' type
// - Nav buttons (next/previous) go INSIDE each page
// - Pages have NO label/title property`,

    full: `# Minimal Multi-Page Form

A simple 2-page wizard form demonstrating the essentials.

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    // ========== PAGE 1 ==========
    {
      key: 'page1',
      type: 'page',
      // ⚠️ Pages have NO label or title property
      fields: [
        { key: 'name', type: 'input', label: 'Your Name', required: true },
        { key: 'email', type: 'input', label: 'Email', email: true },
        // ⚠️ Nav button goes INSIDE the page
        { key: 'next1', type: 'next', label: 'Next' }
      ]
    },
    // ========== PAGE 2 ==========
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'message', type: 'textarea', label: 'Message' },
        // ⚠️ Both back and submit in final page
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\`

## Key Rules

1. **ALL root fields must be pages** - Can't mix page and non-page at root
2. **Nav buttons INSIDE pages** - next/previous go in the page's fields array
3. **Pages have NO label** - Use a text field inside for titles
4. **Hidden fields in pages** - If you need hidden fields, put them inside the first page`,

    explained: `# Multi-Page Forms - Complete Explanation

## How Multi-Page Works

When you use \`type: 'page'\` fields, the form becomes a wizard with several behaviors:

1. **Only one page visible at a time** - Form renders only the current page
2. **Validation per page** - The 'next' button validates the current page before advancing
3. **Form value is cumulative** - Values from all pages are combined
4. **Pages are transparent to output** - The final form value doesn't show page structure

## Structure

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      // ⚠️ NO LABEL! NO TITLE!
      fields: [
        { key: 'name', type: 'input', label: 'Your Name', required: true },
        { key: 'email', type: 'input', label: 'Email', email: true },
        // Nav buttons MUST be inside the page
        { key: 'next1', type: 'next', label: 'Next' }
      ]
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'message', type: 'textarea', label: 'Message' },
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\`

## Output Shape (Pages are transparent)

\`\`\`typescript
// The form value is flat - no page structure:
{
  name: string;
  email: string;
  message: string;
}
// NOT { page1: { name, email }, page2: { message } }
\`\`\`

## Common Gotchas

### ❌ Hidden fields at root level
\`\`\`typescript
// WRONG - Can't mix pages with non-pages
{
  fields: [
    { key: 'userId', type: 'hidden', value: 'abc' },  // ❌ Error!
    { key: 'page1', type: 'page', fields: [...] }
  ]
}

// CORRECT - Put hidden fields inside first page
{
  fields: [
    {
      key: 'page1', type: 'page',
      fields: [
        { key: 'userId', type: 'hidden', value: 'abc' },  // ✅
        ...otherFields,
        { key: 'next', type: 'next', label: 'Next' }
      ]
    }
  ]
}
\`\`\`

### ❌ Adding label/title to pages
\`\`\`typescript
// WRONG
{ key: 'step1', type: 'page', label: 'Step 1' }  // ❌ label not allowed

// CORRECT - Use text field inside
{
  key: 'step1', type: 'page',
  fields: [
    { key: 'header', type: 'text', label: 'Step 1', props: { elementType: 'h2' } },
    ...otherFields
  ]
}
\`\`\`

### ❌ Nav buttons outside pages
\`\`\`typescript
// WRONG
{
  fields: [
    { key: 'page1', type: 'page', fields: [...] },
    { key: 'next', type: 'next', label: 'Next' }  // ❌ Outside!
  ]
}
\`\`\`

## Conditional Pages

Show/hide pages based on conditions:

\`\`\`typescript
{
  key: 'businessPage',
  type: 'page',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business'
    }
  }],
  fields: [...]
}
\`\`\``,
  },

  'minimal-array': {
    description: 'Dynamic array with add/remove (~30 lines)',
    minimal: `import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [
        {
          key: 'item',
          type: 'group',
          fields: [
            { key: 'name', type: 'input', label: 'Name', required: true },
            { key: 'phone', type: 'input', label: 'Phone' }
          ]
        }
      ]
    },
    { key: 'addContact', type: 'addArrayItem', label: 'Add Contact', arrayKey: 'contacts' },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;`,

    brief: `// Dynamic array form
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      // ⚠️ NO LABEL! Uses 'fields', NOT 'template'
      fields: [
        {
          key: 'item',
          type: 'group',
          fields: [
            { key: 'name', type: 'input', label: 'Name', required: true },
            { key: 'phone', type: 'input', label: 'Phone' }
          ]
        }
      ]
    },
    // ⚠️ arrayKey at FIELD level, NOT in props!
    { key: 'addContact', type: 'addArrayItem', label: 'Add Contact', arrayKey: 'contacts' },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;

// Output: { contacts: [{ name: '...', phone: '...' }, ...] }`,

    full: `# Minimal Array Form

A dynamic list with add/remove functionality.

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    // ========== ARRAY CONTAINER ==========
    {
      key: 'contacts',
      type: 'array',
      // ⚠️ Arrays have NO LABEL, NO LOGIC!
      // ⚠️ Use 'fields' property, NOT 'template'!
      fields: [
        {
          key: 'item',
          type: 'group',  // Wrapping group creates objects in the array
          fields: [
            { key: 'name', type: 'input', label: 'Name', required: true },
            { key: 'phone', type: 'input', label: 'Phone' },
            // Optional: remove button inside each item
            // { key: 'remove', type: 'removeArrayItem', label: 'Remove' }
          ]
        }
      ]
    },
    // ========== ADD BUTTON (outside array) ==========
    // ⚠️ arrayKey goes at FIELD level, NOT in props!
    { key: 'addContact', type: 'addArrayItem', label: 'Add Contact', arrayKey: 'contacts' },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
\`\`\`

## Output Shape

\`\`\`typescript
{
  contacts: [
    { name: 'Alice', phone: '555-1234' },
    { name: 'Bob', phone: '555-5678' }
  ]
}
\`\`\`

## Key Rules

- Arrays use \`fields\` property (NOT \`template\`)
- \`arrayKey\` goes at field level (NOT in props)
- Arrays have NO label or logic support`,

    explained: `# Array Fields - Complete Explanation

Arrays create dynamic, repeatable lists of items.

## Structure

\`\`\`typescript
{
  key: 'contacts',
  type: 'array',
  // ⚠️ Arrays DO NOT support:
  // - label (no visual label)
  // - logic (apply logic to children instead)
  // - minItems/maxItems (not implemented)
  // - template (use 'fields' instead)
  fields: [
    // Template for each array item
    {
      key: 'item',
      type: 'group',  // Creates objects in the array
      fields: [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'phone', type: 'input', label: 'Phone' }
      ]
    }
  ]
}
\`\`\`

## Add/Remove Buttons

\`\`\`typescript
// ADD button - place OUTSIDE the array
{
  key: 'addContact',
  type: 'addArrayItem',
  label: 'Add Contact',
  arrayKey: 'contacts',  // ⚠️ AT FIELD LEVEL!
}

// REMOVE button - place INSIDE the array template
{
  key: 'contacts',
  type: 'array',
  fields: [{
    key: 'item',
    type: 'group',
    fields: [
      { key: 'name', type: 'input', label: 'Name' },
      { key: 'remove', type: 'removeArrayItem', label: 'Remove' }  // No arrayKey needed
    ]
  }]
}
\`\`\`

## Accessing Array Values in Expressions

\`\`\`typescript
// Count items
expression: '(formValue.contacts?.length || 0)'

// Access specific index
expression: 'formValue.contacts?.[0]?.name'

// Sum values
expression: '(formValue.items || []).reduce((sum, item) => sum + (item.price || 0), 0)'
\`\`\`

## Common Mistakes

❌ Using \`template\` instead of \`fields\`:
\`\`\`typescript
{ type: 'array', template: [...] }  // WRONG - template doesn't exist
{ type: 'array', fields: [...] }    // CORRECT
\`\`\`

❌ Putting \`arrayKey\` in props:
\`\`\`typescript
{ type: 'addArrayItem', props: { arrayKey: 'x' } }  // WRONG
{ type: 'addArrayItem', arrayKey: 'x' }             // CORRECT
\`\`\``,
  },

  'minimal-conditional': {
    description: 'Show/hide field based on condition (~25 lines)',
    minimal: `import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      label: 'Account Type',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' }
      ]
    },
    {
      key: 'companyName',
      type: 'input',
      label: 'Company Name',
      logic: [{
        type: 'hidden',
        condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' }
      }]
    },
    { key: 'submit', type: 'submit', label: 'Continue' }
  ]
} as const satisfies FormConfig;`,

    brief: `// Show/hide field based on another field's value
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      label: 'Account Type',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' }
      ]
    },
    {
      key: 'companyName',
      type: 'input',
      label: 'Company Name',
      // ⚠️ NO hideWhen/showWhen shorthand exists!
      logic: [{
        type: 'hidden',  // 'hidden', 'disabled', 'required', 'readonly'
        condition: {
          type: 'fieldValue',
          fieldPath: 'accountType',  // Field to check
          operator: 'notEquals',      // Comparison operator
          value: 'business'           // Value to compare
        }
      }]
    },
    { key: 'submit', type: 'submit', label: 'Continue' }
  ]
} as const satisfies FormConfig;`,

    full: `# Minimal Conditional Visibility

Show or hide a field based on another field's value.

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    // The CONTROLLING field
    {
      key: 'accountType',
      type: 'radio',
      label: 'Account Type',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' }
      ]
    },
    // The CONTROLLED field (shown/hidden based on accountType)
    {
      key: 'companyName',
      type: 'input',
      label: 'Company Name',
      // ⚠️ There is NO hideWhen/showWhen shorthand!
      // ⚠️ Use logic blocks with condition objects
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'accountType',   // Path to field to check
          operator: 'notEquals',       // See operators below
          value: 'business'            // Compare against this
        }
      }]
    },
    { key: 'submit', type: 'submit', label: 'Continue' }
  ]
} as const satisfies FormConfig;
\`\`\`

## Logic Types
- \`hidden\` - Hide the field
- \`disabled\` - Disable (greyed out)
- \`required\` - Make required
- \`readonly\` - Make read-only

## Operators
\`equals\`, \`notEquals\`, \`greater\`, \`less\`, \`greaterOrEqual\`, \`lessOrEqual\`, \`contains\`, \`startsWith\`, \`endsWith\`, \`matches\``,

    explained: `# Conditional Visibility - Complete Explanation

## The Logic System

The \`logic\` property accepts an array of rules that control field behavior dynamically.

**⚠️ CRITICAL: There is NO \`hideWhen\` or \`showWhen\` shorthand property!**

\`\`\`typescript
// ❌ WRONG - these don't exist!
{ hideWhen: {...}, showWhen: {...} }

// ✅ CORRECT - use logic blocks
{
  logic: [{
    type: 'hidden',
    condition: {...}
  }]
}
\`\`\`

## Logic Types

| Type | Description | Supported On |
|------|-------------|--------------|
| \`hidden\` | Hide field when condition is true | All except containers |
| \`disabled\` | Disable field | All value fields, buttons |
| \`required\` | Make required | Value fields only |
| \`readonly\` | Make read-only | Value fields only |
| \`derivation\` | Compute value | Value fields only |

## Condition Types

### 1. fieldValue - Compare a field's value
\`\`\`typescript
condition: {
  type: 'fieldValue',
  fieldPath: 'accountType',  // Path to field
  operator: 'equals',        // Comparison
  value: 'business'          // Target value
}
\`\`\`

### 2. javascript - Custom expression
\`\`\`typescript
condition: {
  type: 'javascript',
  expression: 'formValue.age >= 18 && formValue.hasLicense'
}
\`\`\`

### 3. Logical combinations
\`\`\`typescript
// AND - all must be true
condition: {
  type: 'and',
  conditions: [
    { type: 'fieldValue', fieldPath: 'age', operator: 'greaterOrEqual', value: 21 },
    { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' }
  ]
}

// OR - any must be true
condition: {
  type: 'or',
  conditions: [...]
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
    // Also make required WHEN business
    {
      type: 'required',
      condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'business' }
    }
  ]
}
\`\`\`

## Button-Only Conditions

For buttons (submit, next), special form state conditions:
\`\`\`typescript
logic: [{ type: 'disabled', condition: 'formInvalid' }]
logic: [{ type: 'disabled', condition: 'pageInvalid' }]
logic: [{ type: 'disabled', condition: 'formSubmitting' }]
\`\`\``,
  },

  'minimal-validation': {
    description: 'Password confirmation validation (~20 lines)',
    minimal: `import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    { key: 'password', type: 'input', label: 'Password', required: true, minLength: 8, props: { type: 'password' } },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: { type: 'password' },
      validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'mismatch' }],
      validationMessages: { mismatch: 'Passwords do not match' }
    },
    { key: 'submit', type: 'submit', label: 'Register' }
  ]
} as const satisfies FormConfig;`,

    brief: `// Password confirmation with validation
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,      // Shorthand validators
      minLength: 8,
      props: { type: 'password' }
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: { type: 'password' },
      // Custom validator with expression
      validators: [{
        type: 'custom',
        expression: 'fieldValue === formValue.password',  // Compare fields
        kind: 'mismatch'  // Error identifier (not the message!)
      }],
      // ⚠️ Messages go in validationMessages, NOT in validator!
      validationMessages: { mismatch: 'Passwords do not match' }
    },
    { key: 'submit', type: 'submit', label: 'Register' }
  ]
} as const satisfies FormConfig;`,

    full: `# Minimal Validation Example

Password confirmation demonstrating shorthand and custom validators.

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    // Password with shorthand validators
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,        // Shorthand validator
      minLength: 8,          // Shorthand validator
      props: { type: 'password' }
    },
    // Confirm password with custom cross-field validation
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: { type: 'password' },
      validators: [{
        type: 'custom',
        expression: 'fieldValue === formValue.password',
        kind: 'mismatch'      // ⚠️ This is the error KIND, not message!
      }],
      // ⚠️ Messages defined separately at FIELD level!
      validationMessages: {
        mismatch: 'Passwords do not match'
      }
    },
    { key: 'submit', type: 'submit', label: 'Register' }
  ]
} as const satisfies FormConfig;
\`\`\`

## Key Points

- **Shorthand validators**: \`required\`, \`email\`, \`min\`, \`max\`, \`minLength\`, \`maxLength\`, \`pattern\`
- **Custom validators** use \`kind\` as error identifier
- **Messages** go in \`validationMessages\` at field level, NOT in the validator`,

    explained: `# Validation - Complete Explanation

## Shorthand vs Full Syntax

### Shorthand (simple cases)
\`\`\`typescript
{
  key: 'email',
  type: 'input',
  required: true,       // Built-in validators
  email: true,          // as field-level properties
  minLength: 5,
  maxLength: 100,
}
\`\`\`

### Full Syntax (for custom logic)
\`\`\`typescript
{
  key: 'password',
  type: 'input',
  validators: [
    { type: 'required' },
    { type: 'minLength', value: 8 },
    { type: 'pattern', value: '^(?=.*[A-Z])' }
  ]
}
\`\`\`

## Custom Expression Validators

\`\`\`typescript
validators: [{
  type: 'custom',
  expression: 'fieldValue === formValue.password',  // JavaScript expression
  kind: 'mismatch'  // Error identifier
}]
\`\`\`

**Variables in expressions:**
- \`fieldValue\` - Current field's value
- \`formValue\` - Entire form value object

## Custom Function Validators

For complex logic, register a validator function:

\`\`\`typescript
// 1. Define validator
const checkUsername: CustomValidator<string> = (ctx) => {
  const value = ctx.value();  // ⚠️ Different API than expressions!
  if (value?.includes(' ')) {
    return { kind: 'noSpaces' };
  }
  return null;
};

// 2. Register
provideDynamicForm({
  customFnConfig: { validators: { checkUsername } }
})

// 3. Use
validators: [{ type: 'custom', functionName: 'checkUsername' }]
\`\`\`

## Async Validators

For API calls (email availability, username uniqueness):

\`\`\`typescript
// 1. Define
const checkEmailAvailable: CustomAsyncValidator<string> = (ctx) => {
  const http = inject(HttpClient);
  const email = ctx.value();
  return http.get(\`/api/check-email?email=\${email}\`).pipe(
    map(res => res.available ? null : { kind: 'emailTaken' })
  );
};

// 2. Register
provideDynamicForm({
  customFnConfig: { asyncValidators: { checkEmailAvailable } }
})

// 3. Use
validators: [{ type: 'customAsync', functionName: 'checkEmailAvailable' }]
\`\`\`

## Error Messages

Messages are defined in \`validationMessages\` at FIELD level:

\`\`\`typescript
{
  key: 'email',
  type: 'input',
  validators: [
    { type: 'custom', expression: '...', kind: 'alreadyUsed' }
  ],
  validationMessages: {
    required: 'Email is required',        // Override built-in
    alreadyUsed: 'This email is taken'    // Custom validator message
  }
}
\`\`\`

**⚠️ Common mistake:** Putting message in validator - it must be in \`validationMessages\`!`,
  },

  'minimal-hidden': {
    description: 'Hidden fields in multi-page form (~15 lines)',
    minimal: `import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'userId', type: 'hidden', value: 'user-12345' },
        { key: 'source', type: 'hidden', value: 'web-form' },
        { key: 'name', type: 'input', label: 'Name', required: true },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;`,

    brief: `// Hidden fields in multi-page form
// ⚠️ Hidden fields MUST go INSIDE pages (not at root!)
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        // ⚠️ Hidden fields INSIDE the page, with REQUIRED value
        { key: 'userId', type: 'hidden', value: 'user-12345' },
        { key: 'source', type: 'hidden', value: 'web-form' },
        { key: 'name', type: 'input', label: 'Name', required: true },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;

// Hidden fields: key, type, value ONLY
// NO: label, logic, validators, required, props`,

    full: `# Hidden Fields

Include values in form submission without rendering them.

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        // ⚠️ Hidden fields go INSIDE pages (not at root level!)
        { key: 'userId', type: 'hidden', value: 'user-12345' },    // string
        { key: 'roleId', type: 'hidden', value: 42 },              // number
        { key: 'tags', type: 'hidden', value: ['a', 'b', 'c'] },   // array

        { key: 'name', type: 'input', label: 'Name', required: true },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\`

## Rules

**✅ REQUIRED:** \`value\` property (string, number, boolean, or array)

**❌ FORBIDDEN:** label, logic, validators, required, props, disabled, readonly, hidden, col

**In multi-page forms:** Hidden fields must go INSIDE a page, not at root level`,

    explained: `# Hidden Fields - Complete Explanation

Hidden fields store values that should be submitted but not displayed to the user.

## Allowed Properties

| Property | Required | Type |
|----------|----------|------|
| \`key\` | Yes | string |
| \`type\` | Yes | \`'hidden'\` |
| \`value\` | **Yes** | string, number, boolean, or array |
| \`className\` | No | string |

## Forbidden Properties

These will cause validation errors:
- \`label\` - Hidden fields don't render
- \`logic\` - No conditional behavior
- \`validators\` / \`required\` - No validation
- \`props\` - No UI configuration
- \`disabled\` / \`readonly\` / \`hidden\` - No state
- \`col\` / \`tabIndex\` / \`meta\` - No layout

## Multi-Page Gotcha

**Hidden fields MUST go INSIDE pages, not at root level:**

\`\`\`typescript
// ❌ WRONG - Can't mix pages with non-pages
{
  fields: [
    { key: 'userId', type: 'hidden', value: 'abc' },  // ❌ Error!
    { key: 'page1', type: 'page', fields: [...] }
  ]
}

// ✅ CORRECT - Hidden inside first page
{
  fields: [
    {
      key: 'page1', type: 'page',
      fields: [
        { key: 'userId', type: 'hidden', value: 'abc' },  // ✅
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'next', type: 'next', label: 'Next' }
      ]
    },
    { key: 'page2', type: 'page', fields: [...] }
  ]
}
\`\`\`

## Value Types

\`\`\`typescript
{ key: 'userId', type: 'hidden', value: 'abc123' }          // string
{ key: 'roleId', type: 'hidden', value: 42 }                // number
{ key: 'isActive', type: 'hidden', value: true }            // boolean
{ key: 'tagIds', type: 'hidden', value: [1, 2, 3] }         // array
\`\`\``,
  },

  // ========== STANDARD PATTERNS ==========
  derivation: {
    description: 'Computed field values from other fields',
    minimal: `{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'fullName',
    expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'
  }]
}`,

    brief: `// Computed field
{
  key: 'total',
  type: 'input',
  label: 'Total',
  readonly: true,  // Usually readonly
  logic: [{
    type: 'derivation',
    targetField: 'total',  // Points to THIS field
    expression: 'formValue.quantity * formValue.price'
  }]
}

// Available: formValue.path, formValue.nested?.path, optional chaining supported`,

    full: `# Value Derivation (Computed Fields)

\`\`\`typescript
// Derivation goes on the TARGET field (the one being computed)
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'fullName',   // Points to this field's own key
    expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'
  }]
}
\`\`\`

## Expression Patterns

\`\`\`typescript
// String concatenation
'(formValue.firstName || "") + " " + (formValue.lastName || "")'

// Math
'(formValue.quantity || 0) * (formValue.unitPrice || 0)'

// Conditional
'formValue.isPremium ? "Premium" : "Standard"'

// Array operations
'(formValue.items || []).reduce((sum, i) => sum + i.price, 0)'

// Nested access (use optional chaining!)
'formValue.address?.city'
'formValue.contacts?.[0]?.email'

// Complex logic (IIFE)
\`(() => {
  const years = formValue.yearsExperience || 0;
  if (years < 2) return 'Junior';
  if (years < 5) return 'Mid';
  return 'Senior';
})()\`
\`\`\``,

    explained: '', // Will be set below
  },

  // Alias patterns - will be populated after object is defined
  'multi-page': {
    description: 'Multi-step wizard forms',
    minimal: '',
    brief: '',
    full: '',
    explained: '',
  },

  conditional: {
    description: 'Show/hide fields based on conditions',
    minimal: '',
    brief: '',
    full: '',
    explained: '',
  },

  validation: {
    description: 'Form validation patterns',
    minimal: '',
    brief: '',
    full: '',
    explained: '',
  },

  complete: {
    description: 'Complete multi-page form with all major features',
    minimal: '', // Handled specially
    brief: '',
    full: '',
    explained: '',
  },

  mega: {
    description: 'Kitchen sink demonstrating EVERY feature',
    minimal: '',
    brief: '',
    full: '',
    explained: '',
  },
};

// Fill in cross-references and aliases
// Alias: multi-page -> minimal-multipage
PATTERNS['multi-page'].minimal = PATTERNS['minimal-multipage']?.minimal || '';
PATTERNS['multi-page'].brief = PATTERNS['minimal-multipage']?.brief || '';
PATTERNS['multi-page'].full = PATTERNS['minimal-multipage']?.full || '';
PATTERNS['multi-page'].explained = PATTERNS['minimal-multipage']?.explained || '';

// Alias: conditional -> minimal-conditional
PATTERNS['conditional'].minimal = PATTERNS['minimal-conditional']?.minimal || '';
PATTERNS['conditional'].brief = PATTERNS['minimal-conditional']?.brief || '';
PATTERNS['conditional'].full = PATTERNS['minimal-conditional']?.full || '';
PATTERNS['conditional'].explained = PATTERNS['minimal-conditional']?.explained || '';

// Alias: validation -> minimal-validation
PATTERNS['validation'].minimal = PATTERNS['minimal-validation']?.minimal || '';
PATTERNS['validation'].brief = PATTERNS['minimal-validation']?.brief || '';
PATTERNS['validation'].full = PATTERNS['minimal-validation']?.full || '';
PATTERNS['validation'].explained = PATTERNS['minimal-validation']?.explained || '';

// Fill in derivation explained
PATTERNS.derivation.explained = `# Value Derivation - Complete Explanation

Derivations automatically compute field values based on other form values.

## How It Works

1. **Derivation goes on the TARGET field** (the field that receives the computed value)
2. **targetField points to itself** (the field's own key)
3. **Expression uses \`formValue.\` prefix** to access other field values

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

## Expression Variables

| Variable | Scope | Example |
|----------|-------|---------|
| \`formValue\` | Entire form | \`formValue.email\`, \`formValue.address?.city\` |
| \`fieldValue\` | Current field | Used in custom validators |

## Expression Patterns

### Simple Math
\`\`\`typescript
expression: 'formValue.quantity * formValue.unitPrice'
\`\`\`

### String Concatenation
\`\`\`typescript
expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'
\`\`\`

### Conditional Value
\`\`\`typescript
expression: 'formValue.isPremium ? 0.2 : 0'
\`\`\`

### Array Operations
\`\`\`typescript
expression: '(formValue.items || []).reduce((sum, i) => sum + i.price, 0)'
expression: '(formValue.contacts?.length || 0) + " contacts"'
\`\`\`

### Nested Access (Optional Chaining!)
\`\`\`typescript
expression: 'formValue.address?.city'
expression: 'formValue.contacts?.[0]?.email'
expression: 'formValue.billing?.address?.street ?? "No address"'
\`\`\`

### Complex Logic (IIFE)
\`\`\`typescript
expression: \`(() => {
  const years = formValue.yearsExperience || 0;
  if (years < 2) return 'Junior';
  if (years < 5) return 'Mid-Level';
  if (years < 10) return 'Senior';
  return 'Principal';
})()\`
\`\`\`

## Common Mistakes

❌ Missing targetField:
\`\`\`typescript
logic: [{ type: 'derivation', expression: '...' }]  // Missing targetField!
\`\`\`

❌ Wrong field in targetField:
\`\`\`typescript
// Derivation on 'total' field
{ key: 'total', logic: [{ type: 'derivation', targetField: 'price', expression: '...' }] }
// Should be targetField: 'total' (itself)
\`\`\`

❌ Not handling undefined:
\`\`\`typescript
expression: 'formValue.firstName + formValue.lastName'  // Can produce "undefinedundefined"
expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'  // ✅
\`\`\``;

PATTERNS['multi-page'].minimal = PATTERNS['minimal-multipage'].minimal;
PATTERNS['multi-page'].brief = PATTERNS['minimal-multipage'].brief;
PATTERNS['multi-page'].full = PATTERNS['minimal-multipage'].full;
PATTERNS['multi-page'].explained = PATTERNS['minimal-multipage'].explained;
PATTERNS.conditional.minimal = PATTERNS['minimal-conditional'].minimal;
PATTERNS.conditional.brief = PATTERNS['minimal-conditional'].brief;
PATTERNS.conditional.full = PATTERNS['minimal-conditional'].full;
PATTERNS.conditional.explained = PATTERNS['minimal-conditional'].explained;
PATTERNS.validation.minimal = PATTERNS['minimal-validation'].minimal;
PATTERNS.validation.brief = PATTERNS['minimal-validation'].brief;
PATTERNS.validation.full = PATTERNS['minimal-validation'].full;
PATTERNS.validation.explained = PATTERNS['minimal-validation'].explained;

/**
 * Complete multi-page form example.
 */
const COMPLETE_EXAMPLE = `# Complete Multi-Page Form Example

This is a **complete, copy-pasteable** form configuration that demonstrates:
- Multi-page navigation
- Value derivation (computed fields)
- Conditional visibility (using logic blocks - NO hideWhen/showWhen shorthand)
- Validation (required, email, minLength)
- Groups for nested data
- Various field types

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig = {
  fields: [
    // ========== PAGE 1: Personal Info ==========
    {
      key: 'personalInfo',
      type: 'page',
      fields: [
        { key: 'header1', type: 'text', label: 'Personal Information', props: { elementType: 'h2' } },
        {
          key: 'nameRow',
          type: 'row',
          fields: [
            { key: 'firstName', type: 'input', label: 'First Name', required: true, minLength: 2, col: 6 },
            { key: 'lastName', type: 'input', label: 'Last Name', required: true, minLength: 2, col: 6 }
          ]
        },
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name',
          readonly: true,
          logic: [{
            type: 'derivation',
            targetField: 'fullName',
            expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'
          }]
        },
        { key: 'email', type: 'input', label: 'Email', required: true, email: true, props: { type: 'email' } },
        { key: 'next1', type: 'next', label: 'Continue' }
      ]
    },
    // ========== PAGE 2: Address ==========
    {
      key: 'addressPage',
      type: 'page',
      fields: [
        { key: 'header2', type: 'text', label: 'Address', props: { elementType: 'h2' } },
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input', label: 'Street', required: true },
            {
              key: 'cityRow',
              type: 'row',
              fields: [
                { key: 'city', type: 'input', label: 'City', required: true, col: 6 },
                {
                  key: 'state',
                  type: 'select',
                  label: 'State',
                  required: true,
                  col: 6,
                  options: [
                    { label: 'California', value: 'CA' },
                    { label: 'New York', value: 'NY' },
                    { label: 'Texas', value: 'TX' }
                  ]
                }
              ]
            }
          ]
        },
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
      key: 'prefsPage',
      type: 'page',
      fields: [
        { key: 'header3', type: 'text', label: 'Preferences', props: { elementType: 'h2' } },
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
        {
          key: 'companyName',
          type: 'input',
          label: 'Company Name',
          logic: [
            { type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' } },
            { type: 'required', condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'business' } }
          ]
        },
        { key: 'acceptTerms', type: 'checkbox', label: 'I accept the terms', required: true },
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
} as const satisfies FormConfig;
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
  };
  accountType: 'personal' | 'business';
  companyName?: string;  // Only present when accountType is 'business'
  acceptTerms: boolean;
}
\`\`\``;

/**
 * Mega kitchen sink example (abbreviated - full version exists in get-example.tool.ts).
 */
const MEGA_EXAMPLE = `# Kitchen Sink Mega Example

This example demonstrates **EVERY feature** of ng-forge dynamic forms.

**NOTE:** This is a comprehensive reference. For getting started, use the \`complete\` pattern instead.

\`\`\`typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const megaFormConfig = {
  fields: [
    // ========== PAGE 1: All Field Types ==========
    {
      key: 'fieldTypesPage',
      type: 'page',
      fields: [
        { key: 'pageHeader', type: 'text', label: 'All Field Types Demo', props: { elementType: 'h1' } },

        // TEXT INPUTS
        { key: 'textInput', type: 'input', label: 'Text Input', props: { placeholder: 'Type here' } },
        { key: 'emailInput', type: 'input', label: 'Email', email: true, props: { type: 'email' } },
        { key: 'passwordInput', type: 'input', label: 'Password', minLength: 8, props: { type: 'password' } },
        { key: 'numberInput', type: 'input', label: 'Number', min: 0, max: 100, props: { type: 'number' } },

        // SELECT & OPTIONS
        {
          key: 'selectField',
          type: 'select',
          label: 'Select (single)',
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' }
          ]
        },
        {
          key: 'radioField',
          type: 'radio',
          label: 'Radio Group',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        {
          key: 'multiCheckbox',
          type: 'multi-checkbox',
          label: 'Multi-Checkbox',
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' }
          ]
        },

        // BOOLEAN FIELDS
        { key: 'checkboxField', type: 'checkbox', label: 'Single Checkbox' },
        { key: 'toggleField', type: 'toggle', label: 'Toggle Switch' },

        // NUMERIC FIELDS
        { key: 'sliderField', type: 'slider', label: 'Slider', minValue: 0, maxValue: 100, step: 5, value: 50 },

        // DATE FIELDS
        { key: 'datepickerField', type: 'datepicker', label: 'Date Picker' },

        // TEXT AREA
        { key: 'textareaField', type: 'textarea', label: 'Textarea', props: { rows: 4 } },

        // HIDDEN
        { key: 'hiddenField', type: 'hidden', value: 'secret-value' },

        { key: 'toLogicPage', type: 'next', label: 'Next: Logic Demo' }
      ]
    },

    // ========== PAGE 2: Logic Types ==========
    {
      key: 'logicPage',
      type: 'page',
      fields: [
        { key: 'logicHeader', type: 'text', label: 'Logic Types Demo', props: { elementType: 'h1' } },

        // DERIVATION
        {
          key: 'sourceA',
          type: 'input',
          label: 'Source A',
          value: '10'
        },
        {
          key: 'sourceB',
          type: 'input',
          label: 'Source B',
          value: '20'
        },
        {
          key: 'derived',
          type: 'input',
          label: 'Derived (A + B)',
          readonly: true,
          logic: [{
            type: 'derivation',
            targetField: 'derived',
            expression: 'parseInt(formValue.sourceA || 0) + parseInt(formValue.sourceB || 0)'
          }]
        },

        // CONDITIONAL VISIBILITY
        {
          key: 'showExtra',
          type: 'checkbox',
          label: 'Show extra field'
        },
        {
          key: 'extraField',
          type: 'input',
          label: 'Extra Field',
          logic: [{
            type: 'hidden',
            condition: { type: 'fieldValue', fieldPath: 'showExtra', operator: 'notEquals', value: true }
          }]
        },

        // CONDITIONAL REQUIRED
        {
          key: 'makeRequired',
          type: 'checkbox',
          label: 'Make field required'
        },
        {
          key: 'conditionalRequired',
          type: 'input',
          label: 'Conditionally Required',
          logic: [{
            type: 'required',
            condition: { type: 'fieldValue', fieldPath: 'makeRequired', operator: 'equals', value: true }
          }]
        },

        {
          key: 'logicNav',
          type: 'row',
          fields: [
            { key: 'backToFields', type: 'previous', label: 'Back', col: 6 },
            { key: 'toContainers', type: 'next', label: 'Next: Containers', col: 6 }
          ]
        }
      ]
    },

    // ========== PAGE 3: Containers ==========
    {
      key: 'containersPage',
      type: 'page',
      fields: [
        { key: 'containersHeader', type: 'text', label: 'Containers Demo', props: { elementType: 'h1' } },

        // ROW
        {
          key: 'demoRow',
          type: 'row',
          fields: [
            { key: 'col4', type: 'input', label: 'Col 4', col: 4 },
            { key: 'col4b', type: 'input', label: 'Col 4', col: 4 },
            { key: 'col4c', type: 'input', label: 'Col 4', col: 4 }
          ]
        },

        // GROUP
        {
          key: 'demoGroup',
          type: 'group',
          fields: [
            { key: 'groupText', type: 'text', label: 'Nested Group:', props: { elementType: 'h3' } },
            { key: 'nestedField1', type: 'input', label: 'Nested Field 1' },
            { key: 'nestedField2', type: 'input', label: 'Nested Field 2' }
          ]
        },

        // ARRAY
        {
          key: 'itemsHeader', type: 'text', label: 'Dynamic Array:', props: { elementType: 'h3' }
        },
        {
          key: 'demoArray',
          type: 'array',
          fields: [{
            key: 'arrayItem',
            type: 'group',
            fields: [
              { key: 'itemName', type: 'input', label: 'Item Name' },
              { key: 'itemQty', type: 'input', label: 'Qty', props: { type: 'number' } }
            ]
          }]
        },
        { key: 'addItem', type: 'addArrayItem', label: 'Add Item', arrayKey: 'demoArray' },

        {
          key: 'containersNav',
          type: 'row',
          fields: [
            { key: 'backToLogic', type: 'previous', label: 'Back', col: 6 },
            { key: 'submitFinal', type: 'submit', label: 'Submit', col: 6 }
          ]
        }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\`

## Features Demonstrated

- **All field types:** input, select, radio, checkbox, multi-checkbox, textarea, toggle, slider, datepicker, text, hidden
- **All container types:** page, row, group, array
- **All button types:** submit, next, previous, addArrayItem
- **Logic types:** hidden, required, derivation
- **Condition types:** fieldValue with operators
- **Layout:** col property for grid widths`;

const PATTERN_NAMES = Object.keys(PATTERNS);

function getPatternList(): string {
  const lines = ['# Available Patterns', ''];

  const categories = {
    'Getting Started (Recommended)': ['complete', 'mega'],
    'Minimal Patterns (~20-50 lines)': [
      'minimal-multipage',
      'minimal-array',
      'minimal-conditional',
      'minimal-validation',
      'minimal-hidden',
    ],
    'Standard Patterns': ['derivation', 'multi-page', 'conditional', 'validation'],
  };

  for (const [category, patterns] of Object.entries(categories)) {
    lines.push(`## ${category}`);
    for (const p of patterns) {
      const pattern = PATTERNS[p];
      if (pattern) {
        lines.push(`- **${p}**: ${pattern.description}`);
      }
    }
    lines.push('');
  }

  lines.push('**Usage:** `ngforge_examples pattern="<pattern>" depth="minimal|brief|full|explained"`');

  return lines.join('\n');
}

export function registerExamplesTool(server: McpServer): void {
  server.tool(
    'ngforge_examples',
    `EXAMPLES: Get working, copy-paste-ready form configurations - "Show me how to do X"

Recommended starting points:
- complete: Multi-page form with all major features (START HERE)
- mega: Kitchen sink with EVERY feature demonstrated

Minimal patterns (~20-50 lines):
- minimal-multipage: 2-page wizard
- minimal-array: Dynamic list with add/remove
- minimal-conditional: Show/hide field
- minimal-validation: Password confirmation
- minimal-hidden: Hidden fields in multi-page

Standard patterns: derivation, multi-page, conditional, validation

Use pattern="list" to see all available patterns.
Use depth="minimal" for code-only output (no markdown).`,
    {
      pattern: z
        .string()
        .optional()
        .describe(
          'Pattern to get: minimal-multipage, minimal-array, minimal-conditional, minimal-validation, minimal-hidden, derivation, multi-page, conditional, validation, complete, mega. Use "list" to see all.',
        ),
      depth: z
        .enum(['minimal', 'brief', 'full', 'explained'])
        .default('full')
        .describe(
          'minimal=code only (~20-50 lines), brief=code+summary, full=code+comments (default), explained=code+detailed explanation',
        ),
    },
    async ({ pattern, depth }) => {
      // No pattern - list all
      if (!pattern) {
        return {
          content: [{ type: 'text' as const, text: getPatternList() }],
        };
      }

      const normalizedPattern = pattern.toLowerCase().trim();

      // List command
      if (normalizedPattern === 'list') {
        return {
          content: [{ type: 'text' as const, text: getPatternList() }],
        };
      }

      // Special case: complete example
      if (normalizedPattern === 'complete') {
        const content = depth === 'minimal' ? extractCode(COMPLETE_EXAMPLE) : COMPLETE_EXAMPLE;
        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Special case: mega example
      if (normalizedPattern === 'mega') {
        const content = depth === 'minimal' ? extractCode(MEGA_EXAMPLE) : MEGA_EXAMPLE;
        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Check if it's a known pattern
      const patternData = PATTERNS[normalizedPattern];

      if (patternData) {
        let content: string;

        switch (depth) {
          case 'minimal':
            content = patternData.minimal;
            break;
          case 'brief':
            content = patternData.brief;
            break;
          case 'explained':
            content = patternData.explained || patternData.full;
            break;
          case 'full':
          default:
            content = patternData.full;
            break;
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Pattern not found - check docs registry as fallback
      const docPatterns: Record<string, string[]> = {
        'dynamic-options': ['contact-dynamic-fields'],
        'nested-groups': ['shipping-billing-address'],
        i18n: ['dynamic-behavior-i18n'],
        submission: ['dynamic-behavior-submission'],
      };

      const docIds = docPatterns[normalizedPattern];
      if (docIds) {
        const docs: DocTopic[] = [];
        for (const id of docIds) {
          const doc = getDoc(id);
          if (doc) docs.push(doc);
        }

        if (docs.length > 0) {
          const content = docs.map((d) => `# ${d.title}\n\n${d.content}`).join('\n\n---\n\n');
          return {
            content: [{ type: 'text' as const, text: content }],
          };
        }
      }

      // Not found
      return {
        content: [
          {
            type: 'text' as const,
            text: `Pattern "${pattern}" not found.

**Available patterns:** ${PATTERN_NAMES.join(', ')}

**Tip:** Use "list" to see all patterns with descriptions.`,
          },
        ],
        isError: true,
      };
    },
  );
}

/**
 * Extract just the code from markdown content.
 */
function extractCode(markdown: string): string {
  const codeBlocks: string[] = [];
  const regex = /```typescript\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    codeBlocks.push(match[1].trim());
  }

  return codeBlocks.join('\n\n');
}

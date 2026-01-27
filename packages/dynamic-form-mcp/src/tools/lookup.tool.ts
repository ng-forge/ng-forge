/**
 * Unified Lookup Tool
 *
 * Consolidated documentation tool that absorbs:
 * - quick-lookup.tool.ts (primary content source)
 * - get-field-info.tool.ts (field documentation + placement rules)
 * - get-api-reference.tool.ts (logic-matrix, context-api content)
 * - get-cheatsheet.tool.ts (comprehensive reference)
 * - get-field-schema.tool.ts (JSON schema for depth=schema)
 *
 * Single tool for "Tell me about X"
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFieldType, getFieldTypes, getUIAdapter, type FieldTypeInfo, type UIAdapterFieldType } from '../registry/index.js';
import { getFieldTypeJsonSchema, type UiIntegration, type FieldType } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

// Field types that support JSON Schema generation
const SCHEMA_SUPPORTED_FIELD_TYPES = [
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'multi-checkbox',
  'toggle',
  'slider',
  'datepicker',
  'button',
  'submit',
  'next',
  'previous',
] as const;

/**
 * Topic-specific documentation content.
 */
const TOPICS: Record<string, { brief: string; full: string }> = {
  // ========== FIELD TYPES ==========
  input: {
    brief: `\`\`\`typescript
{ key: 'email', type: 'input', label: 'Email', required: true, email: true, props: { type: 'email', placeholder: 'you@example.com' } }
\`\`\`
**Shorthand:** required, email, min, max, minLength, maxLength, pattern
**Props:** type (text|email|password|number|tel|url), placeholder, appearance (Material)`,

    full: `# Input Field

\`\`\`typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  email: true,
  props: {
    type: 'email',           // 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    placeholder: 'you@example.com',
    appearance: 'outline'    // Material: 'outline' | 'fill'
  }
}
\`\`\`

**Validation shorthand:** \`required\`, \`email\`, \`min\`, \`max\`, \`minLength\`, \`maxLength\`, \`pattern\`

**Props:** \`type\`, \`placeholder\`, \`appearance\` (Material), \`hint\` (Material)

**Value Type:** \`string | number\`

**Placement:** Allowed anywhere except inside nested groups`,
  },

  select: {
    brief: `\`\`\`typescript
{ key: 'country', type: 'select', label: 'Country', options: [{ label: 'USA', value: 'us' }], props: { placeholder: 'Choose...' } }
\`\`\`
⚠️ **options at FIELD level, NOT in props!**`,

    full: `# Select Field

\`\`\`typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [                    // ⚠️ AT FIELD LEVEL, NOT IN PROPS!
    { label: 'USA', value: 'us' },
    { label: 'Canada', value: 'ca' }
  ],
  props: {
    placeholder: 'Choose...',
    multiple: false             // Allow multiple selection
  }
}
\`\`\`

**⚠️ Common mistake:** Putting \`options\` inside \`props\` - it must be at field level!

**Value Type:** \`T\` (single) or \`T[]\` (multiple: true)`,
  },

  slider: {
    brief: `\`\`\`typescript
{ key: 'rating', type: 'slider', label: 'Rating', minValue: 1, maxValue: 10, step: 1, value: 5 }
\`\`\`
⚠️ **minValue/maxValue/step at FIELD level, NOT in props!**`,

    full: `# Slider Field

\`\`\`typescript
{
  key: 'rating',
  type: 'slider',
  label: 'Rating',
  minValue: 1,     // ⚠️ AT FIELD LEVEL, NOT IN PROPS!
  maxValue: 10,    // ⚠️ AT FIELD LEVEL, NOT IN PROPS!
  step: 1,         // ⚠️ AT FIELD LEVEL, NOT IN PROPS!
  value: 5         // Default value
}
\`\`\`

**⚠️ Common mistake:** Using \`min\`/\`max\` in props - use \`minValue\`/\`maxValue\` at field level!

**Material props:** \`thumbLabel\` (boolean), \`tickInterval\` (number), \`color\`

**Value Type:** \`number\``,
  },

  radio: {
    brief: `\`\`\`typescript
{ key: 'gender', type: 'radio', label: 'Gender', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] }
\`\`\`
⚠️ **options at FIELD level!**`,

    full: `# Radio Field

\`\`\`typescript
{
  key: 'gender',
  type: 'radio',
  label: 'Gender',
  required: true,
  options: [                    // ⚠️ AT FIELD LEVEL!
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ]
}
\`\`\`

**Value Type:** \`T\` (the value type of the selected option)`,
  },

  checkbox: {
    brief: `\`\`\`typescript
{ key: 'accept', type: 'checkbox', label: 'I accept terms', required: true, value: false }
\`\`\`
For multiple selections, use **multi-checkbox** type.`,

    full: `# Checkbox Field

\`\`\`typescript
{
  key: 'acceptTerms',
  type: 'checkbox',
  label: 'I accept the terms',
  required: true,
  value: false                  // Default unchecked
}
\`\`\`

**For multiple selections, use \`multi-checkbox\`:**
\`\`\`typescript
{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  options: [
    { label: 'Sports', value: 'sports' },
    { label: 'Music', value: 'music' }
  ]
}
// Output: string[] (array of selected values)
\`\`\`

**Value Type:** \`boolean\` (checkbox) or \`T[]\` (multi-checkbox)`,
  },

  textarea: {
    brief: `\`\`\`typescript
{ key: 'bio', type: 'textarea', label: 'Bio', maxLength: 500, props: { rows: 4, placeholder: 'Tell us about yourself...' } }
\`\`\``,

    full: `# Textarea Field

\`\`\`typescript
{
  key: 'bio',
  type: 'textarea',
  label: 'Biography',
  maxLength: 500,
  props: {
    rows: 4,
    placeholder: 'Tell us about yourself...'
  }
}
\`\`\`

**Value Type:** \`string\``,
  },

  datepicker: {
    brief: `\`\`\`typescript
{ key: 'birthDate', type: 'datepicker', label: 'Date of Birth', props: { startView: 'year', appearance: 'outline' } }
\`\`\``,

    full: `# Datepicker Field

\`\`\`typescript
{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Date of Birth',
  required: true,
  props: {
    startView: 'year',          // 'month' | 'year' | 'multi-year'
    appearance: 'outline'
  }
}
\`\`\`

**Value Type:** \`Date | string\``,
  },

  toggle: {
    brief: `\`\`\`typescript
{ key: 'darkMode', type: 'toggle', label: 'Enable Dark Mode', value: false }
\`\`\``,

    full: `# Toggle Field

\`\`\`typescript
{
  key: 'darkMode',
  type: 'toggle',
  label: 'Enable Dark Mode',
  value: false
}
\`\`\`

**Value Type:** \`boolean\``,
  },

  text: {
    brief: `\`\`\`typescript
{ key: 'header', type: 'text', label: 'Section Title', props: { elementType: 'h2' } }
\`\`\`
⚠️ Content in **label**, HTML element in **props.elementType**`,

    full: `# Text Field (Display Only)

\`\`\`typescript
{
  key: 'sectionHeader',
  type: 'text',
  label: 'Section Title',       // ⚠️ Content goes in LABEL, not props.content!
  props: {
    elementType: 'h2'           // 'h1'-'h6', 'p', 'span'
  }
}
\`\`\`

**⚠️ Common mistakes:**
- Using \`props.content\` (doesn't exist) - use \`label\`
- Using \`props.element\` - use \`props.elementType\`

**Value Type:** None (display only)`,
  },

  hidden: {
    brief: `\`\`\`typescript
{ key: 'userId', type: 'hidden', value: 'abc123' }  // value is REQUIRED!
\`\`\`
⚠️ **REQUIRED:** value property. **FORBIDDEN:** label, logic, validators, props`,

    full: `# Hidden Field

\`\`\`typescript
{
  key: 'trackingId',
  type: 'hidden',
  value: 'UTM-12345'    // ⚠️ REQUIRED! Hidden fields MUST have a value
}
\`\`\`

Included in form value but not rendered.

**✅ REQUIRED properties:**
- \`key\` - Field identifier
- \`type\` - Must be 'hidden'
- \`value\` - **REQUIRED!** String, number, boolean, or array of these

**✅ OPTIONAL properties:**
- \`className\` - CSS class names

**❌ FORBIDDEN properties (will cause validation error):**
- \`label\` - Hidden fields don't render
- \`logic\` - No conditional visibility/disabled
- \`validators\` - No validation
- \`required\` - No validation shorthand
- \`props\` - No UI configuration
- \`disabled\`, \`readonly\`, \`hidden\`, \`col\`, \`tabIndex\`, \`meta\`

**Value types:**
\`\`\`typescript
{ key: 'userId', type: 'hidden', value: 'abc123' }          // string
{ key: 'roleId', type: 'hidden', value: 42 }                // number
{ key: 'isActive', type: 'hidden', value: true }            // boolean
{ key: 'tagIds', type: 'hidden', value: [1, 2, 3] }         // array
\`\`\`

**Placement in multi-page forms:**
⚠️ Hidden fields must go INSIDE a page, not at root level when using pages.`,
  },

  // ========== CONTAINERS ==========
  group: {
    brief: `\`\`\`typescript
{ key: 'address', type: 'group', fields: [{ key: 'city', type: 'input', label: 'City' }] }
\`\`\`
⚠️ **NO label, NO logic** - creates nested object { address: { city: '...' } }`,

    full: `# Group Container (Nested Object)

\`\`\`typescript
{
  key: 'address',
  type: 'group',
  // ⚠️ NO LABEL! NO LOGIC!
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' }
  ]
}
// Output: { address: { street: '...', city: '...' } }
\`\`\`

**⚠️ Common mistakes:**
- Adding \`label\` to group (not allowed)
- Adding \`logic\` to group (apply to child fields instead)

**Can contain:** rows, leaf fields (NOT pages, NOT nested groups)`,
  },

  row: {
    brief: `\`\`\`typescript
{ key: 'nameRow', type: 'row', fields: [{ key: 'first', type: 'input', label: 'First', col: 6 }, { key: 'last', type: 'input', label: 'Last', col: 6 }] }
\`\`\`
⚠️ **NO label, NO logic, NO hidden fields inside**`,

    full: `# Row Container (Horizontal Layout)

\`\`\`typescript
{
  key: 'nameRow',
  type: 'row',
  // ⚠️ NO LABEL! NO LOGIC!
  fields: [
    { key: 'firstName', type: 'input', label: 'First', col: 6 },
    { key: 'lastName', type: 'input', label: 'Last', col: 6 }
  ]
}
\`\`\`

Use \`col\` (1-12) on child fields for grid width. Row is purely for layout.

**Allowed children:** groups, arrays, value fields (input, select, checkbox, etc.)
**NOT allowed:** \`hidden\` fields, \`page\` containers, nested \`row\` containers

⚠️ **Common mistake:** Putting hidden fields inside rows - hidden fields should be at page or form level, not in rows.`,
  },

  array: {
    brief: `\`\`\`typescript
{ key: 'contacts', type: 'array', fields: [{ key: 'item', type: 'group', fields: [{ key: 'name', type: 'input', label: 'Name' }] }] }
\`\`\`
⚠️ Uses **fields** NOT template, **NO label, NO logic**`,

    full: `# Array Container (Dynamic List)

\`\`\`typescript
{
  key: 'contacts',
  type: 'array',
  // ⚠️ NO LABEL! NO LOGIC! Uses 'fields', NOT 'template'!
  fields: [
    {
      key: 'contactItem',
      type: 'group',
      fields: [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'phone', type: 'input', label: 'Phone' }
      ]
    }
  ]
}
// Output: { contacts: [{ name: '...', phone: '...' }, ...] }
\`\`\`

**⚠️ Common mistakes:**
- Using \`template\` (doesn't exist) - use \`fields\`
- Adding \`label\` or \`logic\` to array container

**Can contain:** rows, groups, leaf fields (NOT pages, NOT nested arrays)`,
  },

  page: {
    brief: `\`\`\`typescript
{ key: 'page1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name' }, { key: 'next1', type: 'next', label: 'Next' }] }
\`\`\`
⚠️ **NO label/title**, nav buttons go INSIDE, supports hidden logic only`,

    full: `# Page Container (Multi-Step Form)

\`\`\`typescript
{
  fields: [
    {
      key: 'page1',
      type: 'page',
      // ⚠️ NO LABEL! NO TITLE!
      // Pages support logic (hidden only) for conditional pages
      fields: [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'next1', type: 'next', label: 'Next' }  // Nav INSIDE page
      ]
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'email', type: 'input', label: 'Email' },
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
}
\`\`\`

**Rules:**
- ALL top-level fields must be pages (can't mix)
- Nav buttons (next, previous) go INSIDE each page
- Pages support \`logic: [{ type: 'hidden', condition }]\` for conditional pages`,
  },

  // ========== CONCEPTS ==========
  validation: {
    brief: `**Shorthand:** \`required: true, email: true, minLength: 5, maxLength: 100, pattern: '^[a-z]+$'\`
**Full:** \`validators: [{ type: 'required' }, { type: 'custom', expression: '...', kind: 'errorKind' }]\`
**Messages:** \`validationMessages: { errorKind: 'Error message' }\` at FIELD level`,

    full: `# Validation

**Shorthand (at field level):**
\`\`\`typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  email: true,
  minLength: 5,
  maxLength: 100,
  pattern: '^[a-z]+$'
}
\`\`\`

**Full syntax (for custom validators):**
\`\`\`typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  validators: [
    { type: 'required' },
    { type: 'minLength', value: 8 },
    { type: 'custom', expression: 'fieldValue !== formValue.email', kind: 'notSameAsEmail' }
  ]
}
\`\`\`

**Async validators:**
\`\`\`typescript
validators: [{ type: 'customAsync', functionName: 'checkEmailAvailable' }]
\`\`\`

**Custom error messages (validationMessages at FIELD level):**
\`\`\`typescript
{
  key: 'confirmPassword',
  type: 'input',
  label: 'Confirm Password',
  validators: [
    { type: 'custom', expression: 'fieldValue === formValue.password', kind: 'mismatch' }
  ],
  validationMessages: {
    mismatch: 'Passwords do not match',  // Maps to validator's 'kind'
    required: 'This field is required'   // Override built-in messages
  }
}
\`\`\`

**⚠️ Common mistake:** Putting message in validator config - it goes in \`validationMessages\` at field level!`,
  },

  conditional: {
    brief: `\`\`\`typescript
logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' } }]
\`\`\`
⚠️ **NO hideWhen/showWhen shorthand!** Use logic blocks.
**Types:** hidden, disabled, readonly, required`,

    full: `# Conditional Visibility

**⚠️ NO hideWhen/showWhen shorthand exists! Use logic blocks:**

\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company',
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

**Condition types:**
- \`fieldValue\`: Compare field value (\`equals\`, \`notEquals\`, \`greater\`, \`less\`, etc.)
- \`javascript\`: Custom expression (\`{ type: 'javascript', expression: 'formValue.age >= 18' }\`)
- \`and\`/\`or\`: Combine conditions
- \`true\`/\`false\`: Static boolean

**Logic types:** \`hidden\`, \`disabled\`, \`readonly\`, \`required\``,
  },

  derivation: {
    brief: `\`\`\`typescript
logic: [{ type: 'derivation', targetField: 'fullName', expression: 'formValue.firstName + " " + formValue.lastName' }]
\`\`\`
Put derivation on the TARGET field, \`targetField\` points to itself.`,

    full: `# Value Derivation (Computed Fields)

\`\`\`typescript
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'fullName',     // Points to THIS field's key
    expression: 'formValue.firstName + " " + formValue.lastName'
  }]
}
\`\`\`

**Variables in expressions:**
- \`formValue\`: Complete form value object
- \`fieldValue\`: This field's current value

**Nested access:**
\`\`\`typescript
expression: 'formValue.address?.city'                    // Optional chaining
expression: 'formValue.items?.[0]?.name'                // Array access
expression: 'formValue.discount ?? 0'                   // Nullish coalescing
\`\`\`

**Complex logic (IIFE):**
\`\`\`typescript
expression: \`(() => {
  const qty = formValue.quantity || 0;
  const price = formValue.unitPrice || 0;
  return qty * price;
})()\`
\`\`\``,
  },

  'options-format': {
    brief: `\`\`\`typescript
options: [{ label: 'Display Text', value: 'actual-value' }]  // AT FIELD LEVEL!
\`\`\`
⚠️ **NOT in props**, NOT just strings, MUST have label+value`,

    full: `# Options Format (select, radio, multi-checkbox)

**Required Format:**
Options MUST be an array of objects with \`label\` and \`value\` at **FIELD level**:

\`\`\`typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  options: [                              // ✅ AT FIELD LEVEL!
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' }
  ]
}
\`\`\`

**❌ Common Mistakes:**

Wrong: Options inside props
\`\`\`typescript
{ type: 'select', props: { options: [...] } }  // ❌ WRONG!
\`\`\`

Wrong: Just values (no labels)
\`\`\`typescript
{ type: 'select', options: ['us', 'ca'] }  // ❌ Must be objects!
\`\`\`

Wrong: Wrong property names
\`\`\`typescript
{ type: 'select', options: [{ text: 'USA', val: 'us' }] }  // ❌ Must be 'label' and 'value'!
\`\`\``,
  },

  'expression-variables': {
    brief: `**formValue** - complete form object: \`formValue.fieldName\`, \`formValue.address?.city\`
**fieldValue** - current field's value (in custom validators)`,

    full: `# Variables in Expressions

## Available Variables

| Variable | Type | Available In | Description |
|----------|------|--------------|-------------|
| \`formValue\` | object | Derivations, conditions, custom validators | Complete form values as nested object |
| \`fieldValue\` | any | Custom validator expressions only | Current field's value |

## Accessing Values

### Simple Field Access
\`\`\`typescript
expression: 'formValue.email'
expression: 'formValue.name ? "Has name" : "No name"'
\`\`\`

### Nested Group Access
\`\`\`typescript
expression: 'formValue.address?.city'
expression: 'formValue.billing?.address?.zip'
\`\`\`

### Array Access
\`\`\`typescript
expression: 'formValue.contacts?.[0]?.name'
expression: '(formValue.items?.length || 0) + " items"'
\`\`\`

## Safety Tips

1. **Always use optional chaining** (\`?.\`) for nested paths
2. **Provide defaults** for potentially undefined values: \`formValue.count || 0\`
3. **Use nullish coalescing** (\`??\`) when 0 or empty string are valid: \`formValue.score ?? 'N/A'\``,
  },

  'async-validators': {
    brief: `\`\`\`typescript
validators: [{ type: 'customAsync', functionName: 'checkEmailAvailable' }]
\`\`\`
Define function, register in provideDynamicForm, use in config.`,

    full: `# Async Validators (Complete Example)

## 1. Define the Validator
\`\`\`typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomAsyncValidator } from '@ng-forge/dynamic-forms';
import { map, catchError, of } from 'rxjs';

export const checkEmailAvailable: CustomAsyncValidator<string> = (ctx) => {
  const http = inject(HttpClient);
  const email = ctx.value();
  if (!email) return of(null);

  return http.get<{ available: boolean }>(\`/api/check-email?email=\${email}\`).pipe(
    map(res => res.available ? null : { kind: 'emailTaken' }),
    catchError(() => of(null))
  );
};
\`\`\`

## 2. Register
\`\`\`typescript
provideDynamicForm({
  customFnConfig: {
    asyncValidators: { checkEmailAvailable }
  }
})
\`\`\`

## 3. Use
\`\`\`typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  validators: [
    { type: 'customAsync', functionName: 'checkEmailAvailable' }
  ],
  validationMessages: { emailTaken: 'This email is already registered' }
}
\`\`\``,
  },

  'validation-messages': {
    brief: `\`\`\`typescript
validationMessages: { errorKind: 'Error message', required: 'Custom required message' }
\`\`\`
⚠️ At FIELD level, NOT in validator. Maps validator \`kind\` to message.`,

    full: `# Validation Error Messages

**Key Concept:** Validators return an error **KIND** (identifier), not the message itself.
Messages are defined separately in \`validationMessages\` at the **FIELD level**.

\`\`\`typescript
{
  key: 'confirmPassword',
  type: 'input',
  label: 'Confirm Password',
  validators: [
    {
      type: 'custom',
      expression: 'fieldValue === formValue.password',
      kind: 'mismatch'  // ← This is the error KIND, not a message!
    }
  ],
  validationMessages: {
    mismatch: 'Passwords do not match',  // Maps to 'mismatch' kind
    required: 'This field is required'   // Override built-in message
  }
}
\`\`\`

**❌ Common Mistakes:**

Wrong: Message in validator config
\`\`\`typescript
validators: [{
  type: 'custom',
  expression: '...',
  message: 'Error'  // ❌ This doesn't exist!
}]
\`\`\`

**Built-in Kinds:** required, email, min, max, minlength, maxlength, pattern`,
  },

  buttons: {
    brief: `**submit:** \`{ type: 'submit', key: 'submit', label: 'Submit' }\`
**next/previous:** \`{ type: 'next', key: 'next', label: 'Next' }\` (inside pages)
**button:** REQUIRES \`event\` property - prefer submit/next/previous`,

    full: `# Buttons

**RECOMMENDED: Pre-defined button types (no setup required):**
\`\`\`typescript
// Submit button
{ key: 'submit', type: 'submit', label: 'Submit' }

// Navigation (multi-page)
{ key: 'next', type: 'next', label: 'Next' }
{ key: 'back', type: 'previous', label: 'Back' }
\`\`\`

**ADVANCED: Generic button (requires event setup):**
\`\`\`typescript
// ⚠️ Generic 'button' type REQUIRES the 'event' property!
// 1. Create event class: class ResetEvent extends FormEvent {}
// 2. Register: provideFormEvents([ResetEvent])
// 3. Use in config:
{
  key: 'reset',
  type: 'button',
  label: 'Reset',
  event: ResetEvent  // REQUIRED - class reference
}
\`\`\`

**⚠️ Common mistake:** Using \`type: 'button'\` without \`event\` property - this will fail!

**Disable when form invalid:**
\`\`\`typescript
{
  key: 'submit',
  type: 'submit',
  label: 'Submit',
  logic: [{ type: 'disabled', condition: 'formInvalid' }]
}
\`\`\`

**Form state conditions (buttons only):** \`'formInvalid'\`, \`'formSubmitting'\`, \`'pageInvalid'\``,
  },

  // ========== PATTERNS & RULES ==========
  'logic-matrix': {
    brief: `**Containers:** group/row/array have NO logic (apply to children)
**Page:** hidden only | **Value fields:** all logic types | **Buttons:** hidden, disabled`,

    full: `# Logic Support Matrix

| Field Type     | hidden | disabled | required | readonly | derivation |
|----------------|--------|----------|----------|----------|------------|
| page           |   Y    |    N     |    N     |    N     |     N      |
| group          |   N    |    N     |    N     |    N     |     N      |
| row            |   N    |    N     |    N     |    N     |     N      |
| array          |   N    |    N     |    N     |    N     |     N      |
| input          |   Y    |    Y     |    Y     |    Y     |     Y      |
| select         |   Y    |    Y     |    Y     |    Y     |     Y      |
| checkbox       |   Y    |    Y     |    Y     |    Y     |     Y      |
| radio          |   Y    |    Y     |    Y     |    Y     |     Y      |
| multi-checkbox |   Y    |    Y     |    Y     |    Y     |     Y      |
| textarea       |   Y    |    Y     |    Y     |    Y     |     Y      |
| datepicker     |   Y    |    Y     |    Y     |    Y     |     Y      |
| toggle         |   Y    |    Y     |    Y     |    Y     |     Y      |
| slider         |   Y    |    Y     |    Y     |    Y     |     Y      |
| hidden         |   N    |    N     |    N     |    N     |     N      |
| text           |   Y    |    N     |    N     |    N     |     N      |
| button/submit  |   Y    |    Y     |    N     |    N     |     N      |
| next/previous  |   Y    |    Y     |    N     |    N     |     N      |

**Key takeaways:**
- Containers (group, row, array) do NOT support logic - apply to children instead
- Page only supports \`hidden\` logic (for conditional pages)
- Hidden fields have NO logic support at all
- Value fields (input, select, etc.) support ALL logic types`,
  },

  'context-api': {
    brief: `**Expressions:** \`formValue.field\`, \`fieldValue\`
**Validators:** \`ctx.value()\`, \`ctx.valueOf('path' as never)\` - DIFFERENT API!`,

    full: `# Context API (Validators vs Derivations)

**⚠️ CRITICAL: Different APIs for validators vs derivations/expressions!**

## Derivations & Expressions (formValue/fieldValue)
Used in: \`logic[].expression\`, \`derivation.expression\`, \`javascript\` conditions

\`\`\`typescript
// Direct object access
expression: 'formValue.password'
expression: 'fieldValue === formValue.confirmPassword'
expression: 'formValue.address?.city'
\`\`\`

## Custom Validator Functions (FieldContext API)
Used in: \`customFnConfig.validators\`, registered via \`provideDynamicForm()\`

\`\`\`typescript
// ⚠️ Validators use Angular's FieldContext - DIFFERENT API!
const confirmPassword: CustomValidator<string> = (ctx) => {
  const value = ctx.value();                           // Current field value
  const password = ctx.valueOf('password' as never);   // Other field value

  if (value !== password) {
    return { kind: 'mismatch' };  // Just the kind, message goes in validationMessages
  }
  return null;
};

// Register in customFnConfig
provideDynamicForm({
  customFnConfig: {
    validators: { confirmPassword }
  }
})
\`\`\`

## API Comparison

| Context | Get current value | Get other field | Used in |
|---------|-------------------|-----------------|---------|
| Expression | \`fieldValue\` | \`formValue.path\` | derivations, conditions |
| FieldContext | \`ctx.value()\` | \`ctx.valueOf('path' as never)\` | custom validators |`,
  },

  containers: {
    brief: `| Container | Label? | Logic? | Notes |
|-----------|--------|--------|-------|
| page | NO | hidden only | Nav buttons INSIDE |
| group | NO | NO | Creates nested object |
| array | NO | NO | Uses \`fields\` not \`template\` |
| row | NO | NO | Layout only, no hidden fields |`,

    full: `# Container Rules

| Container | Label? | Logic? | Allowed Children | Notes |
|-----------|--------|--------|------------------|-------|
| page | NO | YES (hidden only) | rows, groups, arrays, leaf fields, buttons | Nav buttons go INSIDE |
| group | NO | NO | rows, leaf fields (NOT pages, groups) | Creates nested object |
| array | NO | NO | rows, groups, leaf fields (NOT pages, arrays) | Uses \`fields\`, not \`template\` |
| row | NO | NO | groups, arrays, leaf fields (NOT hidden, pages, rows) | Layout only |

**CRITICAL:**
- If you need conditional visibility for a container, apply logic to each CHILD field instead.
- Hidden fields cannot be inside rows - place them at page/form level.
- Pages cannot be nested - ALL top-level fields must be pages if using multi-page mode.`,
  },

  'field-placement': {
    brief: `**Multi-page:** ALL root fields must be pages. Hidden fields go INSIDE first page.
**Rows:** NO hidden fields, NO nested rows, NO pages
**Groups:** NO nested groups, NO pages`,

    full: `# Field Placement Rules

## ⚠️ CRITICAL: Multi-Page Mode Changes Everything

When using pages, "top-level" means something different!

| Form Type | "Top-level" Means |
|-----------|-------------------|
| Single-page | Root \`fields\` array can have any field |
| **Multi-page** | Root \`fields\` array can ONLY have page fields |

**If you see "Cannot mix page and non-page fields"** → Move hidden/other fields INSIDE the first page.

## Quick Reference Table

| Field Type | Single-page root | Multi-page root | Inside page | Row | Group | Array |
|------------|------------------|-----------------|-------------|-----|-------|-------|
| page       | ✅               | ✅ ONLY these   | ❌          | ❌  | ❌    | ❌    |
| row        | ✅               | ❌              | ✅          | ❌  | ✅    | ✅    |
| group      | ✅               | ❌              | ✅          | ✅  | ❌    | ✅    |
| array      | ✅               | ❌              | ✅          | ✅  | ✅    | ❌    |
| hidden     | ✅               | ❌ (put in page) | ✅         | ❌  | ✅    | ✅    |
| value fields | ✅             | ❌              | ✅          | ✅  | ✅    | ✅    |`,
  },

  'golden-path': {
    brief: `**Simple:** \`{ fields: [{ key, type, label }, { type: 'submit' }] }\`
**With row:** Add \`type: 'row'\` container, use \`col\` on children
**With group:** \`{ key: 'address', type: 'group', fields: [...] }\`
**Multi-page:** ALL root fields are pages, nav buttons inside`,

    full: `# Recommended Form Structures (Golden Path)

## 1. Simple Form
\`\`\`typescript
const formConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name', required: true },
    { key: 'email', type: 'input', label: 'Email', email: true },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
\`\`\`

## 2. Form with Layout (Rows)
\`\`\`typescript
const formConfig = {
  fields: [
    {
      key: 'nameRow',
      type: 'row',
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name', col: 6 },
        { key: 'lastName', type: 'input', label: 'Last Name', col: 6 }
      ]
    },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
\`\`\`

## 3. Form with Nested Data (Groups)
\`\`\`typescript
const formConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    {
      key: 'address',
      type: 'group',
      fields: [
        { key: 'street', type: 'input', label: 'Street' },
        { key: 'city', type: 'input', label: 'City' }
      ]
    },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
// Output: { name: '...', address: { street: '...', city: '...' } }
\`\`\`

## 4. Multi-Page Wizard
\`\`\`typescript
const formConfig = {
  fields: [
    {
      key: 'step1',
      type: 'page',
      fields: [
        { key: 'userId', type: 'hidden', value: currentUserId }, // Hidden fields INSIDE page!
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'next1', type: 'next', label: 'Next' }
      ]
    },
    {
      key: 'step2',
      type: 'page',
      fields: [
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\`

**Key patterns:**
- Always use \`as const satisfies FormConfig\` for type inference
- Put nav buttons (next, previous) INSIDE pages
- Hidden fields go at form/page level, NOT inside rows`,
  },

  'multi-page-gotchas': {
    brief: `1. Hidden fields MUST go INSIDE first page (not at root)
2. Pages have NO label/title property
3. Nav buttons (next/previous) go INSIDE each page`,

    full: `# Multi-Page Form Gotchas

## #1 Gotcha: Hidden Fields at Root Level (Most Common!)

❌ **WRONG** - Hidden fields alongside pages:
\`\`\`typescript
{
  fields: [
    { key: 'userId', type: 'hidden', value: 'abc' },     // ❌ ERROR!
    { key: 'page1', type: 'page', fields: [...] }
  ]
}
// Error: "Cannot mix page and non-page fields at top level"
\`\`\`

✅ **CORRECT** - Hidden fields INSIDE the first page:
\`\`\`typescript
{
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'userId', type: 'hidden', value: 'abc' },  // ✅ Inside page
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'next', type: 'next', label: 'Next' }
      ]
    },
    { key: 'page2', type: 'page', fields: [...] }
  ]
}
\`\`\`

## #2 Gotcha: Pages Don't Have Labels/Titles

❌ **WRONG:**
\`\`\`typescript
{ key: 'step1', type: 'page', label: 'Personal Info', fields: [...] }  // ❌
\`\`\`

✅ **CORRECT** - Use a text field inside:
\`\`\`typescript
{
  key: 'step1',
  type: 'page',
  fields: [
    { key: 'header', type: 'text', label: 'Personal Info', props: { elementType: 'h2' } },
    // ... other fields ...
  ]
}
\`\`\`

## #3 Gotcha: Navigation Buttons Go INSIDE Pages

❌ **WRONG:**
\`\`\`typescript
{
  fields: [
    { key: 'page1', type: 'page', fields: [...] },
    { key: 'next', type: 'next', label: 'Next' }  // ❌ Outside page!
  ]
}
\`\`\`

✅ **CORRECT:**
\`\`\`typescript
{
  key: 'page1',
  type: 'page',
  fields: [
    // ... form fields ...
    { key: 'next1', type: 'next', label: 'Next' }  // ✅ Inside page
  ]
}
\`\`\``,
  },

  pitfalls: {
    brief: `1. Hidden field missing \`value\` - REQUIRED!
2. Hidden field with label/logic/validators - FORBIDDEN!
3. Container (group/row/array) with logic - apply to children!
4. options/minValue/maxValue in props - must be at FIELD level!
5. Generic button without \`event\` - use submit/next/previous!`,

    full: `# Common Pitfalls & Solutions

## 1. Hidden field missing value property
\`\`\`typescript
// WRONG - value is REQUIRED for hidden fields!
{ key: 'userId', type: 'hidden' }  // ❌ Missing value!

// CORRECT - always provide a value
{ key: 'userId', type: 'hidden', value: 'abc123' }  // ✅
\`\`\`

## 2. Hidden field with forbidden properties
\`\`\`typescript
// WRONG - hidden fields don't support these
{
  key: 'userId',
  type: 'hidden',
  value: '123',
  label: 'User ID',     // ❌ FORBIDDEN
  validators: [...],    // ❌ FORBIDDEN
  logic: [...]          // ❌ FORBIDDEN
}

// CORRECT - only key, type, value, className allowed
{ key: 'userId', type: 'hidden', value: '123' }  // ✅
\`\`\`

## 3. Container fields don't support logic
\`\`\`typescript
// WRONG - logic on group/row/array
{ type: 'group', logic: [...] }  // ❌ TypeScript error!

// CORRECT - apply logic to child fields
{
  type: 'group',
  fields: [
    { key: 'city', type: 'input', label: 'City', logic: [...] }  // ✅
  ]
}
\`\`\`

## 4. options/minValue/maxValue at wrong level
\`\`\`typescript
// WRONG - these go in props
{ type: 'select', props: { options: [...] } }     // ❌
{ type: 'slider', props: { min: 0, max: 100 } }   // ❌

// CORRECT - at field level
{ type: 'select', options: [...] }                // ✅
{ type: 'slider', minValue: 0, maxValue: 100 }    // ✅
\`\`\`

## 5. Button without event property
\`\`\`typescript
// WRONG - generic button requires event
{ type: 'button', label: 'Click' }  // ❌ Missing 'event'

// CORRECT - use specific button type or provide event
{ type: 'submit', label: 'Submit' }  // ✅
{ type: 'button', label: 'Click', event: MyEvent }  // ✅
\`\`\`

## 6. Array using 'template' instead of 'fields'
\`\`\`typescript
// WRONG
{ type: 'array', template: [...] }  // ❌ 'template' doesn't exist

// CORRECT
{ type: 'array', fields: [...] }    // ✅
\`\`\`

## 7. Type annotation loses inference
\`\`\`typescript
// WRONG - loses type inference
const config: FormConfig = { fields: [...] };

// CORRECT - preserves inference
const config = { fields: [...] } as const satisfies FormConfig;
\`\`\``,
  },

  conditions: {
    brief: `**Operators:** equals, notEquals, greater, less, greaterOrEqual, lessOrEqual, contains, startsWith, endsWith, matches
**Combine:** \`{ type: 'and', conditions: [...] }\` or \`{ type: 'or', conditions: [...] }\`
**JavaScript:** \`{ type: 'javascript', expression: 'formValue.age >= 18' }\``,

    full: `# Condition Operators & Patterns

## Available Operators

| Operator | Description | Example |
|----------|-------------|---------|
| \`equals\` | Exact match | \`value === 'active'\` |
| \`notEquals\` | Not equal | \`value !== 'inactive'\` |
| \`greater\` | Greater than | \`value > 18\` |
| \`less\` | Less than | \`value < 100\` |
| \`greaterOrEqual\` | >= | \`value >= 0\` |
| \`lessOrEqual\` | <= | \`value <= 10\` |
| \`contains\` | String contains | \`'hello world'.includes('world')\` |
| \`startsWith\` | String starts with | \`'hello'.startsWith('he')\` |
| \`endsWith\` | String ends with | \`'hello'.endsWith('lo')\` |
| \`matches\` | Regex match | \`/^[0-9]+$/.test(value)\` |

## Combining Conditions

**AND (all must be true):**
\`\`\`typescript
condition: {
  type: 'and',
  conditions: [
    { type: 'fieldValue', fieldPath: 'age', operator: 'greaterOrEqual', value: 18 },
    { type: 'fieldValue', fieldPath: 'hasLicense', operator: 'equals', value: true }
  ]
}
\`\`\`

**OR (any must be true):**
\`\`\`typescript
condition: {
  type: 'or',
  conditions: [
    { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'admin' },
    { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'moderator' }
  ]
}
\`\`\`

## JavaScript Expressions (Most Flexible)
\`\`\`typescript
condition: {
  type: 'javascript',
  expression: 'formValue.age >= 21 && formValue.country === "US"'
}

// Array includes check
condition: {
  type: 'javascript',
  expression: '(formValue.selectedRoles || []).includes("admin")'
}
\`\`\`

## Button-Only Conditions

Buttons support special form state conditions:
\`\`\`typescript
logic: [{ type: 'disabled', condition: 'formInvalid' }]
logic: [{ type: 'disabled', condition: 'pageInvalid' }]
logic: [{ type: 'disabled', condition: 'formSubmitting' }]
\`\`\``,
  },

  'common-expressions': {
    brief: `**Full name:** \`'(formValue.firstName || "") + " " + (formValue.lastName || "")'\`
**Total:** \`'(formValue.quantity || 0) * (formValue.unitPrice || 0)'\`
**Array count:** \`'(formValue.items?.length || 0)'\`
**Conditional:** \`'formValue.isPremium ? "Premium" : "Standard"'\``,

    full: `# Common Expression Patterns

Copy-paste ready expressions for derivations and conditions.

## Age from Birthdate
\`\`\`typescript
expression: \`(() => {
  if (!formValue.birthDate) return '';
  const birth = new Date(formValue.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
})()\`
\`\`\`

## Array Count / Length
\`\`\`typescript
// Simple count
expression: '(formValue.items?.length || 0)'

// With label
expression: '(formValue.contacts?.length || 0) + " contacts"'
\`\`\`

## String Concatenation
\`\`\`typescript
// Full name
expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'

// Address formatting
expression: \`[formValue.street, formValue.city, formValue.state, formValue.zip].filter(Boolean).join(", ")\`
\`\`\`

## Math Calculations
\`\`\`typescript
// Total price
expression: '(formValue.quantity || 0) * (formValue.unitPrice || 0)'

// Percentage
expression: 'Math.round((formValue.completed / formValue.total) * 100) + "%"'

// Sum of array
expression: '(formValue.items || []).reduce((sum, item) => sum + (item.price || 0), 0)'
\`\`\`

## Conditional Text
\`\`\`typescript
// Ternary
expression: 'formValue.isPremium ? "Premium Member" : "Standard Member"'

// Multiple conditions
expression: \`(() => {
  if (formValue.score >= 90) return 'A';
  if (formValue.score >= 80) return 'B';
  if (formValue.score >= 70) return 'C';
  return 'D';
})()\`
\`\`\``,
  },

  'type-narrowing': {
    brief: `\`\`\`typescript
const config = { fields: [...] } as const satisfies FormConfig;
type FormValue = InferFormValue<typeof config>;  // Exact shape!
\`\`\`
⚠️ Must use \`as const satisfies\`, NOT \`: FormConfig\` annotation`,

    full: `# Type Narrowing (satisfies Pattern)

**RECOMMENDED Pattern:**
\`\`\`typescript
const formConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    { key: 'email', type: 'input', label: 'Email', email: true }
  ]
} as const satisfies FormConfig;

type FormValue = InferFormValue<typeof formConfig>;
// Result: { name: string; email: string }  ← Exact shape!
\`\`\`

**Pitfall 1: Using type annotation loses inference**
\`\`\`typescript
// BAD - loses literal types
const config: FormConfig = { fields: [...] };
type Value = InferFormValue<typeof config>;
// Result: Record<string, unknown>  ← Not useful!

// GOOD - preserves literal types
const config = { fields: [...] } as const satisfies FormConfig;
type Value = InferFormValue<typeof config>;
// Result: { name: string; ... }  ← Exact shape!
\`\`\`

**Pitfall 2: Missing 'as const'**
\`\`\`typescript
// BAD - arrays are mutable, inference breaks
const config = { fields: [...] } satisfies FormConfig;

// GOOD - arrays are readonly, inference works
const config = { fields: [...] } as const satisfies FormConfig;
\`\`\`

**Why it matters:**
- \`as const\` makes arrays/objects readonly and preserves literal types
- \`satisfies\` validates the config against FormConfig without widening types
- Together they give you: type safety + exact type inference`,
  },

  'array-buttons': {
    brief: `**Add:** \`{ type: 'addArrayItem', key: 'add', label: 'Add', arrayKey: 'contacts' }\`
**Remove:** \`{ type: 'removeArrayItem', key: 'remove', label: 'Remove' }\` (inside array template)
⚠️ arrayKey at FIELD level, NOT in props!`,

    full: `# Array Buttons (Add/Remove Items)

**UI libraries provide \`addArrayItem\` and \`removeArrayItem\` button types.**

## Add Item Button

\`\`\`typescript
{
  key: 'addPhone',
  type: 'addArrayItem',
  label: 'Add Phone',
  arrayKey: 'phones',          // ⚠️ AT FIELD LEVEL, NOT IN PROPS!
  props: {
    color: 'accent'            // UI-specific props go here
  }
}
\`\`\`

## Remove Item Button (inside array template)

\`\`\`typescript
{
  key: 'phones',
  type: 'array',
  fields: [{
    type: 'group',
    key: 'phone',
    fields: [
      { key: 'number', type: 'input', label: 'Phone Number' },
      {
        key: 'removePhone',
        type: 'removeArrayItem',
        label: 'Remove',
        // arrayKey not needed - inferred from parent array
        props: { color: 'warn' }
      }
    ]
  }]
}
\`\`\`

## Common Mistakes

\`\`\`typescript
// WRONG - arrayKey in props
{
  type: 'addArrayItem',
  props: { arrayKey: 'phones' }  // ❌ WRONG LOCATION
}

// CORRECT - arrayKey at field level
{
  type: 'addArrayItem',
  arrayKey: 'phones',            // ✅ CORRECT
  props: { color: 'primary' }
}
\`\`\`

**Note:** These button types are provided by UI adapter packages (Material, Bootstrap, etc.), not the core library.`,
  },

  'custom-validators': {
    brief: `1. Define: \`const fn: CustomValidator<T> = (ctx) => ctx.value() === x ? null : { kind: 'error' }\`
2. Register: \`provideDynamicForm({ customFnConfig: { validators: { fn } } })\`
3. Use: \`validators: [{ type: 'custom', functionName: 'fn' }]\``,

    full: `# Custom Validators (Function-Based)

**For complex validation, register functions via \`customFnConfig\`.**

## 1. Define the Validator

\`\`\`typescript
import { CustomValidator } from '@ng-forge/dynamic-forms';

// Simple single-field validation
const noSpaces: CustomValidator<string> = (ctx) => {
  const value = ctx.value();
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' };
  }
  return null;
};

// Cross-field validation (compare two fields)
const confirmPassword: CustomValidator<string> = (ctx) => {
  const value = ctx.value();
  const password = ctx.valueOf('password' as never);  // ⚠️ Use valueOf, not formValue!

  if (value !== password) {
    return { kind: 'mismatch' };
  }
  return null;
};
\`\`\`

## 2. Register in Provider

\`\`\`typescript
provideDynamicForm({
  customFnConfig: {
    validators: {
      noSpaces,
      confirmPassword
    }
  }
})
\`\`\`

## 3. Use in Field Config

\`\`\`typescript
{
  key: 'confirmPassword',
  type: 'input',
  label: 'Confirm Password',
  props: { type: 'password' },
  validators: [
    { type: 'custom', functionName: 'confirmPassword' }
  ],
  validationMessages: {
    mismatch: 'Passwords do not match'  // ⚠️ Message goes HERE, not in validator!
  }
}
\`\`\`

## FieldContext API (for validators)

| Method | Returns | Description |
|--------|---------|-------------|
| \`ctx.value()\` | Field value | Current field's value |
| \`ctx.valueOf('path' as never)\` | Any | Value at path (requires cast) |
| \`ctx.state\` | FieldState | errors, touched, dirty, etc. |
| \`ctx.stateOf('path' as never)\` | FieldState | State at path |

**⚠️ Important:** Validators return error KIND only. Messages are configured via \`validationMessages\` at field level!`,
  },

  workflow: {
    brief: `1. \`ngforge_lookup topic="golden-path"\` - Get form structure templates
2. \`ngforge_lookup topic="<field-type>"\` - Get syntax for specific fields
3. \`ngforge_validate\` - Validate your config (catches all errors)`,

    full: `# Recommended MCP Workflow

## Creating a New Form

### Step 1: Understand the Pattern
\`\`\`
ngforge_lookup topic="golden-path"
\`\`\`
See recommended form structures for your use case.

### Step 2: Look Up Specific Field Types
\`\`\`
ngforge_lookup topic="select"
ngforge_lookup topic="group"
ngforge_lookup topic="validation"
\`\`\`
Get syntax for the specific fields you need.

### Step 3: Check Placement Rules (if using containers)
\`\`\`
ngforge_lookup topic="field-placement"
\`\`\`
Verify fields can go where you're putting them.

### Step 4: Validate Your Config
\`\`\`
ngforge_validate config="/path/to/your/file.ts" uiIntegration="material"
\`\`\`
Catches errors with specific fix suggestions.

## Quick Reference by Task

| Task | Command |
|------|---------|
| "How do I make a form?" | \`ngforge_lookup topic="golden-path"\` |
| "What's the syntax for X?" | \`ngforge_lookup topic="<field-type>"\` |
| "Is my config valid?" | \`ngforge_validate\` |
| "Where can X go?" | \`ngforge_lookup topic="field-placement"\` |
| "What are common mistakes?" | \`ngforge_lookup topic="pitfalls"\` |
| "Working code examples" | \`ngforge_examples\` |

## Pro Tips

1. **Start with golden-path** - Don't reinvent form structure
2. **Validate early and often** - Catch issues before they compound
3. **Check placement rules for containers** - Most nesting errors come from this
4. **Options at field level, appearance in props** - This is the #1 gotcha`,
  },
};

/**
 * Topic aliases for flexible lookup.
 */
const TOPIC_ALIASES: Record<string, string> = {
  // Field type aliases
  textfield: 'input',
  textbox: 'input',
  number: 'input',
  email: 'input',
  password: 'input',
  dropdown: 'select',
  range: 'slider',
  switch: 'toggle',
  heading: 'text',
  label: 'text',
  paragraph: 'text',
  'form-group': 'group',
  nested: 'group',
  list: 'array',
  dynamic: 'array',
  repeater: 'array',
  layout: 'row',
  columns: 'row',
  grid: 'row',
  multipage: 'page',
  'multi-page': 'page',
  wizard: 'page',
  pages: 'page',
  // Concept aliases
  hide: 'conditional',
  show: 'conditional',
  visibility: 'conditional',
  condition: 'conditional',
  logic: 'conditional',
  derived: 'derivation',
  computed: 'derivation',
  calculate: 'derivation',
  expression: 'derivation',
  // Validation aliases
  validators: 'validation',
  required: 'validation',
  pattern: 'validation',
  validationmessages: 'validation-messages',
  'error-messages': 'validation-messages',
  messages: 'validation-messages',
  // Button aliases
  submit: 'buttons',
  button: 'buttons',
  next: 'buttons',
  previous: 'buttons',
  nav: 'buttons',
  navigation: 'buttons',
  // Pattern aliases
  operators: 'conditions',
  operator: 'conditions',
  and: 'conditions',
  or: 'conditions',
  expressions: 'common-expressions',
  age: 'common-expressions',
  calculation: 'common-expressions',
  math: 'common-expressions',
  satisfies: 'type-narrowing',
  inference: 'type-narrowing',
  'as-const': 'type-narrowing',
  matrix: 'logic-matrix',
  support: 'logic-matrix',
  context: 'context-api',
  fieldcontext: 'context-api',
  valueof: 'context-api',
  'add-array': 'array-buttons',
  'remove-array': 'array-buttons',
  addarrayitem: 'array-buttons',
  removearrayitem: 'array-buttons',
  'custom-validator': 'custom-validators',
  customvalidator: 'custom-validators',
  mistakes: 'pitfalls',
  errors: 'pitfalls',
  gotchas: 'pitfalls',
  footguns: 'pitfalls',
  // Options aliases
  'options-syntax': 'options-format',
  'select-options': 'options-format',
  options: 'options-format',
  'label-value': 'options-format',
  // Expression variables aliases
  formvalue: 'expression-variables',
  fieldvalue: 'expression-variables',
  variables: 'expression-variables',
  // Multi-page aliases
  'multipage-gotchas': 'multi-page-gotchas',
  'page-gotchas': 'multi-page-gotchas',
  'hidden-in-pages': 'multi-page-gotchas',
  // Golden path aliases
  recommended: 'golden-path',
  'best-practice': 'golden-path',
  templates: 'golden-path',
  starter: 'golden-path',
  // Async validators
  async: 'async-validators',
  'async-validator': 'async-validators',
  // Workflow aliases
  'how-to': 'workflow',
  guide: 'workflow',
  'getting-started': 'workflow',
};

/**
 * Get all available topics grouped by category.
 */
function getTopicList(): string {
  const fieldTypes = ['input', 'select', 'slider', 'radio', 'checkbox', 'textarea', 'datepicker', 'toggle', 'text', 'hidden'];
  const containers = ['group', 'row', 'array', 'page'];
  const concepts = [
    'validation',
    'validation-messages',
    'conditional',
    'derivation',
    'options-format',
    'expression-variables',
    'async-validators',
    'buttons',
  ];
  const patterns = [
    'golden-path',
    'multi-page-gotchas',
    'pitfalls',
    'field-placement',
    'logic-matrix',
    'context-api',
    'containers',
    'array-buttons',
    'custom-validators',
    'conditions',
    'common-expressions',
    'type-narrowing',
    'workflow',
  ];

  return `# Available Topics

## Field Types
${fieldTypes.join(', ')}

## Containers
${containers.join(', ')}

## Concepts
${concepts.join(', ')}

## Patterns & Rules
${patterns.join(', ')}

**Usage:** \`ngforge_lookup topic="<topic>" depth="brief|full|schema"\``;
}

/**
 * Format field info with placement rules (from get-field-info.tool.ts).
 */
function formatFieldInfoFull(field: FieldTypeInfo, uiFieldType?: UIAdapterFieldType): string {
  const lines: string[] = [];
  const isContainer = ['row', 'group', 'array', 'page'].includes(field.type);
  const isHidden = field.type === 'hidden';

  lines.push(`## ${field.type} field`);
  lines.push('');
  lines.push(`**Category:** ${field.category}`);
  lines.push(`**Description:** ${field.description}`);
  if (field.valueType) {
    lines.push(`**Value Type:** ${field.valueType}`);
  }
  lines.push(`**Validation Supported:** ${field.validationSupported ? 'Yes' : 'No'}`);

  // Placement rules
  lines.push('');
  lines.push('### Placement Rules');
  if (field.allowedIn && field.allowedIn.length > 0) {
    lines.push(`**✅ Allowed in:** ${field.allowedIn.join(', ')}`);
  }
  if (field.notAllowedIn && field.notAllowedIn.length > 0) {
    lines.push(`**❌ NOT allowed in:** ${field.notAllowedIn.join(', ')}`);
  }
  if (field.canContain && field.canContain.length > 0) {
    lines.push(`**Can contain:** ${field.canContain.join(', ')}`);
  }
  if (field.cannotContain && field.cannotContain.length > 0) {
    lines.push(`**Cannot contain:** ${field.cannotContain.join(', ')}`);
  }

  // Minimal example
  if (field.minimalExample) {
    lines.push('');
    lines.push('### Minimal Valid Example');
    lines.push('```typescript');
    lines.push(field.minimalExample);
    lines.push('```');
  }

  // Special notes
  if (isContainer) {
    lines.push('');
    lines.push(`**⚠️ Note:** ${field.type} fields do NOT have a \`label\` property.`);
  }
  if (isHidden) {
    lines.push('');
    lines.push('**⚠️ IMPORTANT:** Hidden fields ONLY support: `key`, `type`, `value`, `className`');
  }

  // UI-specific properties
  if (uiFieldType && Object.keys(uiFieldType.additionalProps).length > 0) {
    lines.push('');
    lines.push('### UI-Specific Properties');
    for (const prop of Object.values(uiFieldType.additionalProps)) {
      const defaultVal = prop.default !== undefined ? ` (default: ${JSON.stringify(prop.default)})` : '';
      lines.push(`- \`${prop.name}\`: ${prop.type} - ${prop.description}${defaultVal}`);
    }
  }

  // Example
  lines.push('');
  lines.push('### Full Example');
  lines.push('```typescript');
  lines.push(field.example);
  lines.push('```');

  return lines.join('\n');
}

export function registerLookupTool(server: McpServer): void {
  server.tool(
    'ngforge_lookup',
    `DOCUMENTATION: Look up ng-forge Dynamic Forms topics - "Tell me about X"

Recommended starting topics:
- workflow: Tool usage guide
- golden-path: Recommended form structures
- pitfalls: Common mistakes and solutions

Field types: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden

Containers: group, row, array, page

Concepts: validation, conditional, derivation, options-format, expression-variables, async-validators

Patterns: field-placement, logic-matrix, context-api, containers, multi-page-gotchas

Use topic="list" to see all available topics.`,
    {
      topic: z
        .string()
        .describe(
          'Topic to look up: field types (input, select, hidden, group, row, array, page), concepts (validation, conditional, derivation, options-format), patterns (golden-path, pitfalls, multi-page-gotchas), or "list" to see all topics',
        ),
      depth: z
        .enum(['brief', 'full', 'schema'])
        .default('full')
        .describe('brief=quick syntax (~20 lines), full=complete docs with examples, schema=include JSON schema'),
      uiIntegration: z
        .enum(UI_INTEGRATIONS)
        .optional()
        .describe('Filter UI-specific info (only with depth=schema). material, bootstrap, primeng, ionic'),
    },
    async ({ topic, depth, uiIntegration }) => {
      const normalizedTopic = topic.toLowerCase().trim();

      // Special case: list all topics
      if (normalizedTopic === 'list') {
        return {
          content: [{ type: 'text' as const, text: getTopicList() }],
        };
      }

      // Check for alias
      const resolvedTopic = TOPIC_ALIASES[normalizedTopic] || normalizedTopic;

      // Check if it's a known topic
      const topicContent = TOPICS[resolvedTopic];

      if (topicContent) {
        let content = depth === 'brief' ? topicContent.brief : topicContent.full;

        // For schema depth, try to add JSON schema for field types
        if (depth === 'schema' && uiIntegration) {
          const fieldType = resolvedTopic as FieldType;
          if (SCHEMA_SUPPORTED_FIELD_TYPES.includes(fieldType as (typeof SCHEMA_SUPPORTED_FIELD_TYPES)[number])) {
            const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType);
            content += `\n\n### JSON Schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
          }
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Try to find field type info from registry
      const fieldInfo = getFieldType(resolvedTopic);
      if (fieldInfo) {
        let uiFieldType: UIAdapterFieldType | undefined;
        if (uiIntegration) {
          const adapter = getUIAdapter(uiIntegration);
          uiFieldType = adapter?.fieldTypes.find((ft) => ft.type === resolvedTopic);
        }

        let content = formatFieldInfoFull(fieldInfo, uiFieldType);

        // Add JSON schema for schema depth
        if (depth === 'schema' && uiIntegration) {
          const fieldType = resolvedTopic as FieldType;
          if (SCHEMA_SUPPORTED_FIELD_TYPES.includes(fieldType as (typeof SCHEMA_SUPPORTED_FIELD_TYPES)[number])) {
            const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType);
            content += `\n\n### JSON Schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
          }
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Topic not found
      const availableTopics = Object.keys(TOPICS).sort().join(', ');
      const fieldTypes = getFieldTypes()
        .map((t) => t.type)
        .join(', ');

      return {
        content: [
          {
            type: 'text' as const,
            text: `Topic "${topic}" not found.

**Available topics:** ${availableTopics}

**Field types:** ${fieldTypes}

**Tip:** Try "list" to see all topics grouped by category.`,
          },
        ],
        isError: true,
      };
    },
  );
}

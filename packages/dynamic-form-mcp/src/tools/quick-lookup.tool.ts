/**
 * Quick Lookup Tool
 *
 * Returns focused, concise information about a specific topic.
 * Avoids the "wall of text" problem of the full cheatsheet.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Topic-specific quick reference content.
 */
const TOPICS: Record<string, string> = {
  // Field types
  input: `# Input Field

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

**Props:** \`type\`, \`placeholder\`, \`appearance\` (Material), \`hint\` (Material)`,

  select: `# Select Field

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

**⚠️ Common mistake:** Putting \`options\` inside \`props\` - it must be at field level!`,

  slider: `# Slider Field

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

**Material props:** \`thumbLabel\` (boolean), \`tickInterval\` (number), \`color\``,

  radio: `# Radio Field

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
\`\`\``,

  checkbox: `# Checkbox Field

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
\`\`\``,

  textarea: `# Textarea Field

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
\`\`\``,

  datepicker: `# Datepicker Field

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
\`\`\``,

  toggle: `# Toggle Field

\`\`\`typescript
{
  key: 'darkMode',
  type: 'toggle',
  label: 'Enable Dark Mode',
  value: false
}
\`\`\``,

  text: `# Text Field (Display Only)

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
- Using \`props.element\` - use \`props.elementType\``,

  hidden: `# Hidden Field

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

Hidden fields exist ONLY to pass values through the form - they have no UI and no validation.`,

  // Containers
  group: `# Group Container (Nested Object)

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
- Adding \`logic\` to group (apply to child fields instead)`,

  row: `# Row Container (Horizontal Layout)

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

  array: `# Array Container (Dynamic List)

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
- Adding \`label\` or \`logic\` to array container`,

  page: `# Page Container (Multi-Step Form)

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

  // Logic and conditions
  conditional: `# Conditional Visibility

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

  derivation: `# Value Derivation (Computed Fields)

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

  validation: `# Validation

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

  buttons: `# Buttons

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
For simple actions, prefer \`type: 'submit'\` and handle in form submission instead.

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

  // Common patterns
  'nested-paths': `# Nested Paths (Accessing Nested Values)

**In expressions:**
\`\`\`typescript
// Group access
'formValue.address.city'

// Array access
'formValue.contacts[0].email'

// Safe access (recommended)
'formValue.address?.city'
'formValue.contacts?.[0]?.email ?? ""'
\`\`\`

**In fieldValue conditions:**
\`\`\`typescript
// Use FIELD PATH (no formValue prefix!)
{
  type: 'fieldValue',
  fieldPath: 'address.city',        // NOT 'formValue.address.city'
  operator: 'equals',
  value: 'NYC'
}
\`\`\`

**In javascript conditions:**
\`\`\`typescript
{
  type: 'javascript',
  expression: 'formValue.address?.city === "NYC"'  // USE formValue prefix
}
\`\`\``,

  'form-value': `# Form Value Output Shape

\`\`\`typescript
// Flat fields → flat object
{ name: 'John', email: 'john@example.com' }

// Group → nested object
{ address: { street: '123 Main', city: 'NYC' } }

// Array with group → array of objects
{ contacts: [{ name: 'Alice', phone: '555-1234' }] }

// Pages don't affect structure
{ name: 'John', email: 'john@example.com' }  // Flat, pages transparent
\`\`\``,

  containers: `# Container Rules

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

  'property-placement': `# Property Placement

**At FIELD level:**
- \`key\`, \`type\`, \`label\` (not containers)
- \`required\`, \`email\`, \`min\`, \`max\`, \`minLength\`, \`maxLength\`, \`pattern\`
- \`options\` (select, radio, multi-checkbox)
- \`minValue\`, \`maxValue\`, \`step\` (slider)
- \`value\`, \`disabled\`, \`readonly\`, \`hidden\`, \`col\`, \`logic\`
- \`fields\` (containers)

**In PROPS:**
- \`type\` (input type: 'text', 'email', etc.)
- \`placeholder\`, \`rows\`
- \`elementType\` (text field)
- \`appearance\`, \`hint\` (Material)`,

  'type-narrowing': `# Type Narrowing (satisfies Pattern)

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

  'logic-matrix': `# Logic Support Matrix

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

  'context-api': `# Context API (Validators vs Derivations)

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
| FieldContext | \`ctx.value()\` | \`ctx.valueOf('path' as never)\` | custom validators |

## Common Mistakes

\`\`\`typescript
// WRONG - using expression syntax in validator
const bad: CustomValidator = (ctx) => {
  if (ctx.formValue?.password) // ❌ formValue doesn't exist on ctx
}

// CORRECT - using FieldContext API
const good: CustomValidator = (ctx) => {
  const password = ctx.valueOf('password' as never); // ✅
}
\`\`\`

**Note:** The \`as never\` cast is needed because TypeScript's path typing is strict.`,

  'array-buttons': `# Array Buttons (Add/Remove Items)

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

// WRONG - targetArrayKey (doesn't exist)
{
  type: 'addArrayItem',
  targetArrayKey: 'phones'       // ❌ WRONG PROPERTY NAME
}

// CORRECT - arrayKey at field level
{
  type: 'addArrayItem',
  arrayKey: 'phones',            // ✅ CORRECT
  props: { color: 'primary' }
}
\`\`\`

**Note:** These button types are provided by UI adapter packages (Material, Bootstrap, etc.), not the core library.`,

  'custom-validators': `# Custom Validators (Function-Based)

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

## Return Types

\`\`\`typescript
// Validation passed
return null;

// Single error
return { kind: 'errorKind' };

// Multiple errors (cross-field)
return [{ kind: 'error1' }, { kind: 'error2' }];
\`\`\`

**⚠️ Important:** Validators return error KIND only. Messages are configured via \`validationMessages\` at field level!`,

  pitfalls: `# Common Pitfalls & Solutions

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

## 2. options/minValue/maxValue/arrayKey at wrong level
\`\`\`typescript
// WRONG - these go in props
{ type: 'select', props: { options: [...] } }     // ❌
{ type: 'slider', props: { min: 0, max: 100 } }   // ❌
{ type: 'addArrayItem', props: { arrayKey: 'x' }} // ❌

// CORRECT - at field level
{ type: 'select', options: [...] }                // ✅
{ type: 'slider', minValue: 0, maxValue: 100 }    // ✅
{ type: 'addArrayItem', arrayKey: 'x' }           // ✅
\`\`\`

## 3. Validator context confusion
\`\`\`typescript
// WRONG - using expression syntax in validator function
const bad: CustomValidator = (ctx) => {
  if (ctx.formValue?.password) {}  // ❌ formValue doesn't exist!
}

// CORRECT - using FieldContext API
const good: CustomValidator = (ctx) => {
  const password = ctx.valueOf('password' as never);  // ✅
}
\`\`\`

## 4. Type inference with FormConfig
\`\`\`typescript
// WRONG - loses type inference
const config: FormConfig = { fields: [...] };

// CORRECT - preserves inference
const config = { fields: [...] } as const satisfies FormConfig;
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
\`\`\``,

  'common-expressions': `# Common Expression Patterns

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

// Conditional based on count
condition: {
  type: 'javascript',
  expression: '(formValue.items?.length || 0) >= 3'
}
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
\`\`\`

## String Concatenation
\`\`\`typescript
// Full name
expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")'

// With trimming
expression: '((formValue.firstName || "") + " " + (formValue.lastName || "")).trim()'

// Address formatting
expression: \`[
  formValue.street,
  formValue.city,
  formValue.state,
  formValue.zip
].filter(Boolean).join(", ")\`
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

## Date Formatting
\`\`\`typescript
// ISO to readable (simple)
expression: 'formValue.date ? new Date(formValue.date).toLocaleDateString() : ""'

// Custom format
expression: \`(() => {
  if (!formValue.date) return '';
  const d = new Date(formValue.date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
})()\`
\`\`\`

## Null/Undefined Handling
\`\`\`typescript
// Nullish coalescing
expression: 'formValue.nickname ?? formValue.firstName ?? "Anonymous"'

// Optional chaining
expression: 'formValue.address?.city ?? "No city"'

// Default for empty strings too
expression: 'formValue.name || "Not provided"'
\`\`\``,

  conditions: `# Condition Operators & Patterns

## Available Operators

| Operator | Description | Example |
|----------|-------------|---------|
| \`equals\` | Exact match | \`value === 'active'\` |
| \`notEquals\` | Not equal | \`value !== 'inactive'\` |
| \`greater\` | Greater than (numeric) | \`value > 18\` |
| \`less\` | Less than (numeric) | \`value < 100\` |
| \`greaterOrEqual\` | >= (numeric) | \`value >= 0\` |
| \`lessOrEqual\` | <= (numeric) | \`value <= 10\` |
| \`contains\` | String contains | \`'hello world'.includes('world')\` |
| \`startsWith\` | String starts with | \`'hello'.startsWith('he')\` |
| \`endsWith\` | String ends with | \`'hello'.endsWith('lo')\` |
| \`matches\` | Regex match | \`/^[0-9]+$/.test(value)\` |

## ⚠️ No 'in' Operator - Use Workarounds

**Verbose OR pattern:**
\`\`\`typescript
condition: {
  type: 'or',
  conditions: [
    { type: 'fieldValue', fieldPath: 'status', operator: 'equals', value: 'unemployed' },
    { type: 'fieldValue', fieldPath: 'status', operator: 'equals', value: 'student' },
    { type: 'fieldValue', fieldPath: 'status', operator: 'equals', value: 'retired' }
  ]
}
\`\`\`

**Better: JavaScript expression:**
\`\`\`typescript
condition: {
  type: 'javascript',
  expression: '["unemployed", "student", "retired"].includes(formValue.status)'
}
\`\`\`

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

**Nested AND/OR:**
\`\`\`typescript
condition: {
  type: 'and',
  conditions: [
    { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' },
    {
      type: 'or',
      conditions: [
        { type: 'fieldValue', fieldPath: 'state', operator: 'equals', value: 'CA' },
        { type: 'fieldValue', fieldPath: 'state', operator: 'equals', value: 'NY' }
      ]
    }
  ]
}
\`\`\`

## JavaScript Expressions (Most Flexible)

\`\`\`typescript
// For complex logic, just use JavaScript
condition: {
  type: 'javascript',
  expression: 'formValue.age >= 21 && formValue.country === "US"'
}

// Array includes check
condition: {
  type: 'javascript',
  expression: '(formValue.selectedRoles || []).includes("admin")'
}

// Regex
condition: {
  type: 'javascript',
  expression: '/^[A-Z]{2}[0-9]{4}$/.test(formValue.code || "")'
}
\`\`\`

## Button-Only Conditions

Buttons support special form state conditions:
\`\`\`typescript
// Disable when form is invalid
logic: [{ type: 'disabled', condition: 'formInvalid' }]

// Disable when current page is invalid
logic: [{ type: 'disabled', condition: 'pageInvalid' }]

// Disable during submission
logic: [{ type: 'disabled', condition: 'formSubmitting' }]
\`\`\``,

  // === NEW TOPICS FOR ONE-SHOT OPTIMIZATION ===

  'field-placement': `# Field Placement Rules

## ⚠️ CRITICAL: Multi-Page Mode Changes Everything

When using pages, "top-level" means something different!

| Form Type | "Top-level" Means |
|-----------|-------------------|
| Single-page | Root \`fields\` array can have any field |
| **Multi-page** | Root \`fields\` array can ONLY have page fields |

**If you see "Cannot mix page and non-page fields"** → Move hidden/other fields INSIDE the first page.

## Where Can Each Field Type Go?

### Hidden Fields
✅ **Single-page forms:** top-level, group.fields, array.fields
✅ **Multi-page forms:** page.fields, group.fields, array.fields
❌ **NEVER in:** row.fields, top-level when using pages

⚠️ **In multi-page forms, hidden fields go INSIDE a page (usually the first one).**

### Pages
✅ **Allowed in:** top-level fields ONLY
❌ **NOT allowed in:** any container (page, row, group, array)

**Critical rule:** If using pages, ALL top-level fields MUST be pages. You cannot mix pages with other field types at the root level.

### Rows (horizontal layout)
✅ **Allowed in:** top-level (single-page), page.fields, group.fields, array.fields
❌ **NOT allowed in:** row.fields (no nested rows)
❌ **Cannot contain:** pages, rows, hidden fields

### Groups (nested objects)
✅ **Allowed in:** top-level (single-page), page.fields, row.fields, array.fields
❌ **NOT allowed in:** group.fields (no nested groups)
❌ **Cannot contain:** pages, groups

### Arrays (repeatable items)
✅ **Allowed in:** top-level (single-page), page.fields, row.fields, group.fields
❌ **NOT allowed in:** array.fields (no nested arrays)
❌ **Cannot contain:** pages, arrays

### Value Fields (input, select, checkbox, etc.)
✅ **Allowed in:** almost anywhere
⚠️ **In multi-page forms:** Must be inside a page, not at root level

## Quick Reference Table

| Field Type | Single-page root | Multi-page root | Inside page | Row | Group | Array |
|------------|------------------|-----------------|-------------|-----|-------|-------|
| page       | ✅               | ✅ ONLY these   | ❌          | ❌  | ❌    | ❌    |
| row        | ✅               | ❌              | ✅          | ❌  | ✅    | ✅    |
| group      | ✅               | ❌              | ✅          | ✅  | ❌    | ✅    |
| array      | ✅               | ❌              | ✅          | ✅  | ✅    | ❌    |
| hidden     | ✅               | ❌ (put in page) | ✅         | ❌  | ✅    | ✅    |
| value fields | ✅             | ❌              | ✅          | ✅  | ✅    | ✅    |

## See Also
\`ngforge_quick_lookup topic="multi-page-gotchas"\` - Common multi-page form mistakes`,

  'golden-path': `# Recommended Form Structures (Golden Path)

## 1. Simple Form (No Pages)
Best for: Single-step forms, short forms

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
Best for: Side-by-side fields, responsive layouts

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
    { key: 'email', type: 'input', label: 'Email' },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
\`\`\`

## 3. Form with Nested Data (Groups)
Best for: Address forms, structured data

\`\`\`typescript
const formConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    {
      key: 'address',
      type: 'group',
      fields: [
        { key: 'street', type: 'input', label: 'Street' },
        { key: 'city', type: 'input', label: 'City' },
        { key: 'zip', type: 'input', label: 'ZIP' }
      ]
    },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
// Output: { name: '...', address: { street: '...', city: '...', zip: '...' } }
\`\`\`

## 4. Multi-Page Wizard
Best for: Long forms, step-by-step flows

\`\`\`typescript
const formConfig = {
  fields: [
    {
      key: 'step1',
      type: 'page',
      fields: [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'email', type: 'input', label: 'Email' },
        { key: 'next1', type: 'next', label: 'Next' }
      ]
    },
    {
      key: 'step2',
      type: 'page',
      fields: [
        { key: 'back2', type: 'previous', label: 'Back' },
        { key: 'phone', type: 'input', label: 'Phone' },
        { key: 'submit', type: 'submit', label: 'Submit' }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\`

## 5. Form with Hidden Data
Best for: Tracking IDs, server-provided values

\`\`\`typescript
const formConfig = {
  fields: [
    { key: 'userId', type: 'hidden', value: currentUserId },
    { key: 'trackingId', type: 'hidden', value: 'UTM-12345' },
    { key: 'name', type: 'input', label: 'Name' },
    // Hidden fields inside groups work too
    {
      key: 'address',
      type: 'group',
      fields: [
        { key: 'countryCode', type: 'hidden', value: 'US' },
        { key: 'city', type: 'input', label: 'City' }
      ]
    },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} as const satisfies FormConfig;
\`\`\`

## Key Patterns
- Always use \`as const satisfies FormConfig\` for type inference
- Put navigation buttons (next, previous) INSIDE pages
- Hidden fields go at form/page level, NOT inside rows
- Use \`col\` (1-12) on fields inside rows for grid width`,

  'options-format': `# Options Format (select, radio, multi-checkbox)

## Required Format

Options MUST be an array of objects with \`label\` and \`value\` at **FIELD level**:

\`\`\`typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  options: [                              // ✅ AT FIELD LEVEL!
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'Mexico', value: 'mx' }
  ]
}
\`\`\`

## ❌ Common Mistakes

**Wrong: Options inside props**
\`\`\`typescript
{
  type: 'select',
  props: { options: [...] }  // ❌ WRONG LOCATION!
}
\`\`\`

**Wrong: Just values (no labels)**
\`\`\`typescript
{
  type: 'select',
  options: ['us', 'ca', 'mx']  // ❌ Must be objects!
}
\`\`\`

**Wrong: Wrong property names**
\`\`\`typescript
{
  type: 'select',
  options: [
    { text: 'USA', val: 'us' }  // ❌ Must be 'label' and 'value'!
  ]
}
\`\`\`

## Value Types

Options can have any value type:

\`\`\`typescript
// String values (most common)
options: [
  { label: 'USA', value: 'us' },
  { label: 'Canada', value: 'ca' }
]

// Number values
options: [
  { label: 'Small', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Large', value: 3 }
]

// Boolean values
options: [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

// Object values (with multiple: true)
options: [
  { label: 'Admin', value: { role: 'admin', level: 3 } },
  { label: 'User', value: { role: 'user', level: 1 } }
]
\`\`\`

## Field Types That Use Options

| Field Type | Description | Output Type |
|------------|-------------|-------------|
| select | Dropdown | T (single) or T[] (multiple: true) |
| radio | Radio buttons | T |
| multi-checkbox | Checkbox group | T[] |`,

  'expression-variables': `# Variables in Expressions

## Available Variables

| Variable | Type | Available In | Description |
|----------|------|--------------|-------------|
| \`formValue\` | object | Derivations, conditions, custom validators | Complete form values as nested object |
| \`fieldValue\` | any | Custom validator expressions only | Current field's value |

## Accessing Values in Expressions

### Simple Field Access
\`\`\`typescript
// Top-level field
expression: 'formValue.email'

// Check if filled
expression: 'formValue.name ? "Has name" : "No name"'
\`\`\`

### Nested Group Access
\`\`\`typescript
// Group field (use optional chaining!)
expression: 'formValue.address?.city'
expression: 'formValue.billing?.address?.zip'
\`\`\`

### Array Access
\`\`\`typescript
// First array item
expression: 'formValue.contacts?.[0]?.name'

// Array length
expression: '(formValue.items?.length || 0) + " items"'

// Sum of array values
expression: '(formValue.items || []).reduce((sum, item) => sum + (item.price || 0), 0)'
\`\`\`

## Expression Examples by Use Case

### Derivation (computed fields)
\`\`\`typescript
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
}
\`\`\`

### Condition (visibility/disabled)
\`\`\`typescript
logic: [{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: 'formValue.accountType !== "business"'
  }
}]
\`\`\`

### Custom Validator Expression
\`\`\`typescript
validators: [{
  type: 'custom',
  expression: 'fieldValue === formValue.password',  // fieldValue = this field
  kind: 'mismatch'
}]
\`\`\`

## Safety Tips

1. **Always use optional chaining** (\`?.\`) for nested paths
2. **Provide defaults** for potentially undefined values: \`formValue.count || 0\`
3. **Use nullish coalescing** (\`??\`) when 0 or empty string are valid: \`formValue.score ?? 'N/A'\`

## ⚠️ Important: Validator Functions Are Different!

Custom validator FUNCTIONS (registered via customFnConfig) use a different API:

\`\`\`typescript
// Expression (in config) - uses formValue/fieldValue
expression: 'fieldValue === formValue.password'

// Function (in TypeScript) - uses FieldContext API
const confirmPassword: CustomValidator = (ctx) => {
  const value = ctx.value();                         // NOT fieldValue!
  const password = ctx.valueOf('password' as never); // NOT formValue.password!
  return value === password ? null : { kind: 'mismatch' };
};
\`\`\``,

  'validation-messages': `# Validation Error Messages

## Key Concept

Validators return an error **KIND** (identifier), not the message itself.
Messages are defined separately in \`validationMessages\` at the **FIELD level**.

## How It Works

\`\`\`typescript
{
  key: 'confirmPassword',
  type: 'input',
  label: 'Confirm Password',
  props: { type: 'password' },

  // 1. Validator returns KIND on failure
  validators: [
    {
      type: 'custom',
      expression: 'fieldValue === formValue.password',
      kind: 'mismatch'  // ← This is the error KIND, not a message!
    }
  ],

  // 2. Messages are defined HERE at field level
  validationMessages: {
    mismatch: 'Passwords do not match',  // Maps to 'mismatch' kind
    required: 'This field is required'   // Override built-in message
  }
}
\`\`\`

## ❌ Common Mistakes

**Wrong: Message in validator config**
\`\`\`typescript
validators: [{
  type: 'custom',
  expression: '...',
  message: 'Passwords do not match'  // ❌ NO! This doesn't exist!
}]
\`\`\`

**Wrong: errorMessage property**
\`\`\`typescript
validators: [{
  type: 'custom',
  errorMessage: 'Invalid'  // ❌ This property doesn't exist!
}]
\`\`\`

## Built-in Validator Kinds

| Validator | Kind | Default Message |
|-----------|------|-----------------|
| required | required | "This field is required" |
| email | email | "Invalid email format" |
| min | min | "Value must be at least {value}" |
| max | max | "Value must be at most {value}" |
| minLength | minlength | "Minimum {value} characters" |
| maxLength | maxlength | "Maximum {value} characters" |
| pattern | pattern | "Invalid format" |

## Override Built-in Messages

\`\`\`typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  email: true,
  validationMessages: {
    required: 'We need your email to contact you',  // Custom required message
    email: 'Please enter a valid email address'     // Custom email message
  }
}
\`\`\`

## Multiple Custom Validators

\`\`\`typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  validators: [
    { type: 'required' },
    { type: 'minLength', value: 8 },
    { type: 'custom', expression: '/[A-Z]/.test(fieldValue)', kind: 'uppercase' },
    { type: 'custom', expression: '/[0-9]/.test(fieldValue)', kind: 'number' }
  ],
  validationMessages: {
    uppercase: 'Must contain at least one uppercase letter',
    number: 'Must contain at least one number'
  }
}
\`\`\``,

  'multi-page-gotchas': `# Multi-Page Form Gotchas

## #1 Gotcha: Hidden Fields at Root Level (Most Common!)

❌ **WRONG** - Hidden fields alongside pages:
\`\`\`typescript
{
  fields: [
    { key: 'userId', type: 'hidden', value: 'abc' },     // ❌ ERROR!
    { key: 'page1', type: 'page', fields: [...] },
    { key: 'page2', type: 'page', fields: [...] }
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
        { key: 'trackingId', type: 'hidden', value: 'xyz' },
        // ... visible fields ...
        { key: 'next', type: 'next', label: 'Next' }
      ]
    },
    { key: 'page2', type: 'page', fields: [...] }
  ]
}
\`\`\`

**Rule:** When using pages, ALL root-level fields must be pages. Move everything else inside.

## #2 Gotcha: Pages Don't Have Labels/Titles

❌ **WRONG**:
\`\`\`typescript
{ key: 'step1', type: 'page', label: 'Personal Info', fields: [...] }  // ❌
{ key: 'step1', type: 'page', title: 'Personal Info', fields: [...] }  // ❌
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

❌ **WRONG**:
\`\`\`typescript
{
  fields: [
    { key: 'page1', type: 'page', fields: [...] },
    { key: 'next', type: 'next', label: 'Next' }  // ❌ Outside page!
  ]
}
\`\`\`

✅ **CORRECT**:
\`\`\`typescript
{
  key: 'page1',
  type: 'page',
  fields: [
    // ... form fields ...
    { key: 'next1', type: 'next', label: 'Next' }  // ✅ Inside page
  ]
}
\`\`\`

## Multi-Page Form Skeleton (Copy This)

\`\`\`typescript
const formConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        // Hidden fields go here
        { key: 'userId', type: 'hidden', value: currentUserId },
        { key: 'formVersion', type: 'hidden', value: '1.0' },
        // Section header
        { key: 'header1', type: 'text', label: 'Step 1', props: { elementType: 'h2' } },
        // Form fields
        { key: 'name', type: 'input', label: 'Name', required: true },
        // Navigation
        { key: 'next1', type: 'next', label: 'Continue' }
      ]
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'header2', type: 'text', label: 'Step 2', props: { elementType: 'h2' } },
        { key: 'email', type: 'input', label: 'Email', required: true, email: true },
        {
          key: 'navRow',
          type: 'row',
          fields: [
            { key: 'back2', type: 'previous', label: 'Back', col: 6 },
            { key: 'submit', type: 'submit', label: 'Submit', col: 6 }
          ]
        }
      ]
    }
  ]
} as const satisfies FormConfig;
\`\`\``,

  workflow: `# Recommended MCP Workflow

## Creating a New Form

### Step 1: Understand the Pattern
\`\`\`
ngforge_quick_lookup topic="golden-path"
\`\`\`
See recommended form structures for your use case.

### Step 2: Look Up Specific Field Types
\`\`\`
ngforge_quick_lookup topic="select"
ngforge_quick_lookup topic="group"
ngforge_quick_lookup topic="validation"
\`\`\`
Get syntax for the specific fields you need.

### Step 3: Check Placement Rules (if using containers)
\`\`\`
ngforge_quick_lookup topic="field-placement"
\`\`\`
Verify fields can go where you're putting them.

### Step 4: Validate Your Config
\`\`\`
ngforge_validate_file filePath="/path/to/your/file.ts" uiIntegration="material"
\`\`\`
Catches errors with specific fix suggestions.

## Debugging an Error

### Read the Error Message
The MCP now provides specific errors like:
- "Hidden field missing REQUIRED value property"
- "options MUST be at FIELD level, NOT inside props"
- "hidden fields are NOT allowed inside rows"

### Look Up the Correct Pattern
\`\`\`
ngforge_quick_lookup topic="pitfalls"
\`\`\`
Common mistakes and their solutions.

### Check Specific Field Documentation
\`\`\`
ngforge_get_field_info fieldType="hidden"
ngforge_quick_lookup topic="options-format"
\`\`\`

## Quick Reference by Task

| Task | Best Tool |
|------|-----------|
| "How do I make a form?" | \`ngforge_quick_lookup topic="golden-path"\` |
| "What's the syntax for X?" | \`ngforge_quick_lookup topic="<field-type>"\` |
| "Is my config valid?" | \`ngforge_validate_file\` |
| "Where can X go?" | \`ngforge_quick_lookup topic="field-placement"\` |
| "How do options work?" | \`ngforge_quick_lookup topic="options-format"\` |
| "How do expressions work?" | \`ngforge_quick_lookup topic="expression-variables"\` |
| "How do error messages work?" | \`ngforge_quick_lookup topic="validation-messages"\` |
| "What are common mistakes?" | \`ngforge_quick_lookup topic="pitfalls"\` |
| "Full field documentation" | \`ngforge_get_field_info fieldType="<type>"\` |
| "Working code examples" | \`ngforge_get_example\` |

## Pro Tips

1. **Start with golden-path** - Don't reinvent form structure
2. **Use quick_lookup over cheatsheet** - More focused, less noise
3. **Validate early and often** - Catch issues before they compound
4. **Check placement rules for containers** - Most nesting errors come from this
5. **Options at field level, appearance in props** - This is the #1 gotcha`,
};

const TOPIC_ALIASES: Record<string, string> = {
  hide: 'conditional',
  show: 'conditional',
  visibility: 'conditional',
  condition: 'conditional',
  logic: 'conditional',
  // Condition operators
  operators: 'conditions',
  operator: 'conditions',
  'in-operator': 'conditions',
  'multiple-values': 'conditions',
  and: 'conditions',
  or: 'conditions',
  // Common expressions
  expressions: 'common-expressions',
  age: 'common-expressions',
  'age-from-date': 'common-expressions',
  'array-length': 'common-expressions',
  'string-concat': 'common-expressions',
  calculation: 'common-expressions',
  math: 'common-expressions',
  iife: 'common-expressions',
  satisfies: 'type-narrowing',
  inference: 'type-narrowing',
  'infer-form-value': 'type-narrowing',
  'as-const': 'type-narrowing',
  typing: 'type-narrowing',
  matrix: 'logic-matrix',
  support: 'logic-matrix',
  'logic-support': 'logic-matrix',
  // Context API aliases
  context: 'context-api',
  fieldcontext: 'context-api',
  'field-context': 'context-api',
  'validator-context': 'context-api',
  'ctx.value': 'context-api',
  'ctx.valueof': 'context-api',
  valueof: 'context-api',
  // Array button aliases
  'add-array': 'array-buttons',
  'remove-array': 'array-buttons',
  addarrayitem: 'array-buttons',
  removearrayitem: 'array-buttons',
  'array-key': 'array-buttons',
  arraykey: 'array-buttons',
  // Custom validator aliases
  'custom-validator': 'custom-validators',
  customvalidator: 'custom-validators',
  'validator-function': 'custom-validators',
  customfnconfig: 'custom-validators',
  // Pitfalls aliases
  mistakes: 'pitfalls',
  errors: 'pitfalls',
  'common-mistakes': 'pitfalls',
  gotchas: 'pitfalls',
  footguns: 'pitfalls',
  derived: 'derivation',
  computed: 'derivation',
  calculate: 'derivation',
  expression: 'derivation',
  multipage: 'page',
  'multi-page': 'page',
  wizard: 'page',
  pages: 'page',
  dropdown: 'select',
  options: 'select',
  textfield: 'input',
  textbox: 'input',
  number: 'input',
  email: 'input',
  password: 'input',
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
  submit: 'buttons',
  button: 'buttons',
  next: 'buttons',
  previous: 'buttons',
  nav: 'buttons',
  navigation: 'buttons',
  validators: 'validation',
  required: 'validation',
  pattern: 'validation',
  validationmessages: 'validation',
  'validation-messages': 'validation',
  'error-messages': 'validation',
  errormessages: 'validation',
  messages: 'validation',
  output: 'form-value',
  shape: 'form-value',
  structure: 'form-value',
  placement: 'property-placement',
  props: 'property-placement',
  footgun: 'property-placement',
  // Field placement aliases
  'where-can': 'field-placement',
  'allowed-in': 'field-placement',
  'not-allowed': 'field-placement',
  nesting: 'field-placement',
  'nesting-rules': 'field-placement',
  'can-contain': 'field-placement',
  // Golden path aliases
  'golden-paths': 'golden-path',
  recommended: 'golden-path',
  'best-practice': 'golden-path',
  'best-practices': 'golden-path',
  template: 'golden-path',
  templates: 'golden-path',
  starter: 'golden-path',
  // Options format aliases
  'options-syntax': 'options-format',
  'select-options': 'options-format',
  'radio-options': 'options-format',
  'checkbox-options': 'options-format',
  'label-value': 'options-format',
  // Expression variables aliases
  formvalue: 'expression-variables',
  fieldvalue: 'expression-variables',
  'form-value-access': 'expression-variables',
  variables: 'expression-variables',
  // Validation messages aliases
  'error-message': 'validation-messages',
  kind: 'validation-messages',
  'validator-messages': 'validation-messages',
  'custom-messages': 'validation-messages',
  // Workflow aliases
  'how-to': 'workflow',
  'getting-started': 'workflow',
  'tool-order': 'workflow',
  guide: 'workflow',
  process: 'workflow',
  // Multi-page gotchas aliases
  'multipage-gotchas': 'multi-page-gotchas',
  'page-gotchas': 'multi-page-gotchas',
  'page-pitfalls': 'multi-page-gotchas',
  'multipage-pitfalls': 'multi-page-gotchas',
  'multi-page-pitfalls': 'multi-page-gotchas',
  'hidden-in-pages': 'multi-page-gotchas',
  'mixed-fields': 'multi-page-gotchas',
};

export function registerQuickLookupTool(server: McpServer): void {
  server.tool(
    'ngforge_quick_lookup',
    `RECOMMENDED FIRST TOOL for syntax and patterns. Returns focused, concise information about a specific topic.

START HERE topics (recommended workflow):
- workflow: Tool usage guide and recommended order
- golden-path: Recommended form structures (templates to copy)
- field-placement: Where each field type can/cannot go
- pitfalls: Common mistakes and solutions

Field types: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden, group, row, array, page, buttons

Concepts: validation, validation-messages, options-format, expression-variables, conditional, derivation, nested-paths, form-value, containers, property-placement, type-narrowing, logic-matrix, context-api, array-buttons, custom-validators, common-expressions, conditions`,
    {
      topic: z
        .string()
        .describe(
          'Topic to look up. Recommended start: "workflow", "golden-path", "field-placement". Field types: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden, group, row, array, page, buttons. Concepts: validation, validation-messages, options-format, expression-variables, conditional, derivation, pitfalls, containers, property-placement, type-narrowing, logic-matrix, context-api, array-buttons, custom-validators, common-expressions, conditions',
        ),
    },
    async ({ topic }) => {
      const normalizedTopic = topic.toLowerCase().trim();

      // Check for alias
      const resolvedTopic = TOPIC_ALIASES[normalizedTopic] || normalizedTopic;

      const content = TOPICS[resolvedTopic];

      if (!content) {
        const availableTopics = Object.keys(TOPICS).sort().join(', ');
        return {
          content: [
            {
              type: 'text' as const,
              text: `Topic "${topic}" not found.\n\n**Available topics:** ${availableTopics}\n\n**Tip:** Try common terms like "slider", "conditional", "derivation", "group", "page"`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: content }],
      };
    },
  );
}

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
  value: 'UTM-12345'
}
\`\`\`

Included in form value but not rendered.`,

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

Use \`col\` (1-12) on child fields for grid width. Row is purely for layout.`,

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
\`\`\``,

  buttons: `# Buttons

\`\`\`typescript
// Submit button
{ key: 'submit', type: 'submit', label: 'Submit' }

// Navigation (multi-page)
{ key: 'next', type: 'next', label: 'Next' }
{ key: 'back', type: 'previous', label: 'Back' }

// Generic button (handle via buttonClick event)
{ key: 'reset', type: 'button', label: 'Reset' }
\`\`\`

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

| Container | Label? | Logic? | Notes |
|-----------|--------|--------|-------|
| page | NO | YES (hidden only) | Nav buttons go INSIDE |
| group | NO | NO | Creates nested object |
| array | NO | NO | Uses \`fields\`, not \`template\` |
| row | NO | NO | Layout only |

**CRITICAL:** If you need conditional visibility for a container, apply logic to each CHILD field instead.`,

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
};

const TOPIC_ALIASES: Record<string, string> = {
  hide: 'conditional',
  show: 'conditional',
  visibility: 'conditional',
  condition: 'conditional',
  logic: 'conditional',
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
  output: 'form-value',
  shape: 'form-value',
  structure: 'form-value',
  placement: 'property-placement',
  props: 'property-placement',
  footgun: 'property-placement',
};

export function registerQuickLookupTool(server: McpServer): void {
  server.tool(
    'ngforge_quick_lookup',
    'Returns focused, concise information about a specific topic. Use instead of the full cheatsheet when you need quick reference for one thing. Topics: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden, group, row, array, page, conditional, derivation, validation, buttons, nested-paths, form-value, containers, property-placement',
    {
      topic: z
        .string()
        .describe(
          'Topic to look up: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden, group, row, array, page, conditional, derivation, validation, buttons, nested-paths, form-value, containers, property-placement',
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

/**
 * Lookup Topics Data
 *
 * Documentation content for the ngforge_lookup tool.
 * Extracted from lookup.tool.ts for better maintainability.
 */

/**
 * Topic-specific documentation content.
 */
export const TOPICS: Record<string, { brief: string; full: string }> = {
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
⚠️ **NO label** - supports only \`hidden\` logic - creates nested object { address: { city: '...' } }`,

    full: `# Group Container (Nested Object)

\`\`\`typescript
{
  key: 'address',
  type: 'group',
  // ⚠️ NO LABEL! Supports only 'hidden' logic type.
  logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'showAddress', operator: 'equals', value: false } }],
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' }
  ]
}
// Output: { address: { street: '...', city: '...' } }
\`\`\`

**⚠️ Common mistakes:**
- Adding \`label\` to group (not allowed)
- Using non-hidden logic types on group (only \`hidden\` is supported, apply other logic types to child fields instead)

**Can contain:** rows, leaf fields (NOT pages, NOT nested groups)`,
  },

  row: {
    brief: `\`\`\`typescript
{ key: 'nameRow', type: 'row', fields: [{ key: 'first', type: 'input', label: 'First', col: 6 }, { key: 'last', type: 'input', label: 'Last', col: 6 }] }
\`\`\`
⚠️ **NO label, NO hidden fields inside** - supports only \`hidden\` logic type`,

    full: `# Row Container (Horizontal Layout)

\`\`\`typescript
{
  key: 'nameRow',
  type: 'row',
  // ⚠️ NO LABEL! Supports only 'hidden' logic type.
  logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'showNameRow', operator: 'equals', value: false } }],
  fields: [
    { key: 'firstName', type: 'input', label: 'First', col: 6 },
    { key: 'lastName', type: 'input', label: 'Last', col: 6 }
  ]
}
\`\`\`

Use \`col\` (1-12) on child fields for grid width. Row is purely for layout. Supports only \`hidden\` logic type for conditional visibility.

**Allowed children:** groups, arrays, value fields (input, select, checkbox, etc.)
**NOT allowed:** \`hidden\` fields, \`page\` containers, nested \`row\` containers

⚠️ **Common mistake:** Putting hidden fields inside rows - hidden fields should be at page or form level, not in rows.`,
  },

  array: {
    brief: `**Two APIs available:**
**Simplified (recommended):** \`{ key: 'tags', type: 'array', template: { key: 'value', type: 'input', label: 'Tag' }, value: ['a', 'b'] }\`
**Full:** \`{ key: 'contacts', type: 'array', fields: [[{ key: 'name', type: 'input', value: 'Alice' }]] }\`
⚠️ **NO label** - supports only \`hidden\` logic type. See topic \`simplified-array\` for the simplified API.`,

    full: `# Array Container (Dynamic List)

Arrays support two APIs: **Simplified** (recommended for common cases) and **Full** (for advanced use cases).

## Simplified API (Recommended)

Use \`template\` + \`value\` for common array patterns. Add/remove buttons are auto-generated.

\`\`\`typescript
// Primitive array: ['angular', 'typescript']
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  value: ['angular', 'typescript']
}

// Object array: [{ name: 'Jane', phone: '555' }]
{
  key: 'contacts',
  type: 'array',
  template: [
    { key: 'name', type: 'input', label: 'Name', required: true },
    { key: 'phone', type: 'input', label: 'Phone' }
  ],
  value: [{ name: 'Jane', phone: '555' }]
}

// Custom button config
{
  key: 'items',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Item' },
  addButton: { label: 'Add Item', props: { color: 'primary' } },
  removeButton: false  // Disable remove buttons
}
\`\`\`

See topic \`simplified-array\` for full documentation on the simplified API.

## Full API (Advanced)

Use \`fields\` for explicit item definitions with full control.

\`\`\`typescript
{
  key: 'contacts',
  type: 'array',
  // ⚠️ NO LABEL! Supports only 'hidden' logic type.
  logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'hasContacts', operator: 'equals', value: false } }],
  fields: [
    [
      { key: 'name', type: 'input', label: 'Name', value: 'Alice' },
      { key: 'phone', type: 'input', label: 'Phone', value: '555' }
    ]
  ]
}
// Output: { contacts: [{ name: 'Alice', phone: '555' }] }
\`\`\`

**DOM Structure:**
Each array item is wrapped in a \`<div class="df-array-item">\` with:
- \`role="group"\` + \`aria-label="Item N"\` (1-based) for accessibility
- \`data-array-item-id\` (stable ID) and \`data-array-item-index\` (current position) for testing/CSS
- Use \`--df-array-item-gap\` CSS variable to control spacing between items

**Key rules:**
- \`fields\` and \`template\` are **mutually exclusive** - use one or the other
- NO \`label\` property on arrays
- Only \`hidden\` logic type is supported
- Arrays cannot contain pages or other arrays

**Can contain:** rows, groups, leaf fields (NOT pages, NOT nested arrays)`,
  },

  'simplified-array': {
    brief: `\`\`\`typescript
// Primitive: { key: 'tags', type: 'array', template: { key: 'value', type: 'input', label: 'Tag' }, value: ['a', 'b'] }
// Object: { key: 'contacts', type: 'array', template: [{ key: 'name', type: 'input' }, { key: 'phone', type: 'input' }], value: [{ name: 'Jane', phone: '555' }] }
// Buttons: { addButton: { label: 'Add Tag', props: { color: 'primary' } }, removeButton: false }
\`\`\`
Discriminant: \`template\` presence = simplified API; \`Array.isArray(template)\` = object vs primitive.`,

    full: `# Simplified Array API

The simplified array API provides a concise way to define dynamic arrays using \`template\` + \`value\` instead of verbose \`fields\` definitions. Add/remove buttons are auto-generated.

## When to Use

Use the simplified API when:
- You have a common primitive or object array pattern
- You want auto-generated add/remove buttons
- Initial values are known and simple

Use the full API (\`fields\`) when:
- You need heterogeneous items (different field configs per item)
- You need custom button placement
- You need explicit control over each item's structure

## Primitive Array

Each item is a single value (string, number, etc.):

\`\`\`typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag', required: true },
  value: ['angular', 'typescript']
}
// Output: { tags: ['angular', 'typescript'] }
\`\`\`

**Discriminant:** \`template\` is a single field definition (not an array).

## Object Array

Each item is an object with multiple fields:

\`\`\`typescript
{
  key: 'contacts',
  type: 'array',
  template: [
    { key: 'name', type: 'input', label: 'Contact Name', required: true },
    { key: 'phone', type: 'input', label: 'Phone Number' }
  ],
  value: [
    { name: 'Jane Doe', phone: '555-1234' },
    { name: 'John Smith', phone: '555-5678' }
  ]
}
// Output: { contacts: [{ name: 'Jane Doe', phone: '555-1234' }, ...] }
\`\`\`

**Discriminant:** \`template\` is an array of field definitions.

## Button Configuration

### Custom Add Button
\`\`\`typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  addButton: {
    label: 'Add New Tag',
    props: { color: 'primary' }
  }
}
\`\`\`

### Custom Remove Button
\`\`\`typescript
{
  key: 'items',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Item' },
  removeButton: {
    label: 'Delete',
    props: { color: 'warn' }
  }
}
\`\`\`

### Disable Buttons
\`\`\`typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  addButton: false,     // No add button
  removeButton: false   // No remove button per item
}
\`\`\`

## ArrayButtonConfig Interface

\`\`\`typescript
interface ArrayButtonConfig {
  label?: string;                    // Custom button label
  props?: Record<string, unknown>;   // Additional button component properties
}
\`\`\`

## SimplifiedArrayField Interface

\`\`\`typescript
interface SimplifiedArrayField {
  type: 'array';
  key: string;
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];  // Item structure
  value?: readonly unknown[];         // Initial values
  addButton?: ArrayButtonConfig | false;    // Add button config (default: { label: 'Add' })
  removeButton?: ArrayButtonConfig | false; // Remove button config (default: { label: 'Remove' })
  logic?: ContainerLogicConfig[];     // Only 'hidden' type supported
  // label is NOT supported
  // fields is NOT supported (mutually exclusive with template)
}
\`\`\`

## How It Works Internally

The simplified API is normalized into the full API at runtime:
1. Each \`value\` element creates an item using the \`template\` structure
2. An \`addArrayItem\` button is auto-generated after the array (unless \`addButton: false\`)
3. A \`removeArrayItem\` button is added to each item (unless \`removeButton: false\`)

## Conditional Visibility

\`\`\`typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  logic: [{
    type: 'hidden',
    condition: { type: 'fieldValue', fieldPath: 'hasTags', operator: 'equals', value: false }
  }]
}
\`\`\`

## Common Mistakes

❌ Mixing \`fields\` and \`template\`:
\`\`\`typescript
// WRONG - mutually exclusive
{ type: 'array', fields: [...], template: {...} }

// CORRECT - use one or the other
{ type: 'array', template: { key: 'value', type: 'input', label: 'Tag' }, value: ['a'] }
{ type: 'array', fields: [{ key: 'tag', type: 'input', value: 'a' }] }
\`\`\`

❌ Wrong value shape for object templates:
\`\`\`typescript
// WRONG - value should match template keys
{ template: [{ key: 'name', type: 'input' }], value: ['Jane'] }

// CORRECT - value elements are objects matching template keys
{ template: [{ key: 'name', type: 'input' }], value: [{ name: 'Jane' }] }
\`\`\``,
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
validators: [{ type: 'async', functionName: 'checkEmailAvailable' }]
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
**Types:** hidden, disabled, readonly, required
**External data:** Use \`externalData.userRole\` in javascript conditions (see topic: external-data)`,

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

**Logic types:** \`hidden\`, \`disabled\`, \`readonly\`, \`required\`

## Using External Data in Conditions

Access external application state (user roles, permissions, feature flags) via \`externalData\`:

\`\`\`typescript
// In FormConfig
externalData: {
  userRole: computed(() => this.authService.role()),
  featureFlags: computed(() => this.featureService.flags()),
}

// In field logic
logic: [{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: "externalData.userRole !== 'admin'"
  }
}]
\`\`\`

See topic \`external-data\` for full documentation.`,
  },

  derivation: {
    brief: `\`\`\`typescript
// Shorthand (preferred)
{ key: 'fullName', type: 'input', readonly: true, derivation: 'formValue.firstName + " " + formValue.lastName' }

// Logic block (for conditions, debounce, etc.)
logic: [{ type: 'derivation', expression: 'formValue.firstName + " " + formValue.lastName' }]

// Stop on user edit (with optional re-engagement)
logic: [{ type: 'derivation', expression: '...', stopOnUserOverride: true, reEngageOnDependencyChange: true }]

// HTTP derivation (server-driven values)
logic: [{ type: 'derivation', http: { url: '/api/rate', queryParams: { from: 'formValue.currency' } }, responseExpression: 'response.rate', dependsOn: ['currency'] }]
\`\`\`
Derivation is always defined ON the field that receives the computed value (self-targeting).
**Variables:** \`formValue\`, \`fieldValue\`, \`fieldState\`, \`formFieldState\`, \`externalData\` (see topic: expression-variables)
**For deriving component properties** (minDate, options, label): use \`targetProperty\` (see topic \`property-derivation\`)`,

    full: `# Value Derivation (Computed Fields)

Derivations are always defined ON the field that receives the computed value (self-targeting).

## Shorthand (preferred for simple expressions)

\`\`\`typescript
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  readonly: true,
  derivation: '(formValue.firstName || "") + " " + (formValue.lastName || "")'
}
\`\`\`

## Logic Block (for conditions, debounce, custom functions)

\`\`\`typescript
{
  key: 'total',
  type: 'input',
  label: 'Total',
  readonly: true,
  logic: [{
    type: 'derivation',
    expression: 'formValue.quantity * formValue.unitPrice'
  }]
}
\`\`\`

## Conditional Derivation

\`\`\`typescript
{
  key: 'discount',
  type: 'input',
  readonly: true,
  logic: [{
    type: 'derivation',
    value: 10,
    condition: { type: 'fieldValue', fieldPath: 'memberType', operator: 'equals', value: 'premium' }
  }]
}
\`\`\`

## Custom Function Derivation

\`\`\`typescript
{
  key: 'age',
  type: 'input',
  readonly: true,
  logic: [{
    type: 'derivation',
    functionName: 'calculateAge',
    dependsOn: ['dateOfBirth']
  }]
}
\`\`\`

## HTTP Derivation (Server-Driven Values)

Fetch derived values from an HTTP endpoint. Requires \`dependsOn\` (explicit) and \`responseExpression\`.

\`\`\`typescript
{
  key: 'exchangeRate',
  type: 'input',
  label: 'Exchange Rate',
  readonly: true,
  logic: [{
    type: 'derivation',
    http: {
      url: '/api/exchange-rate',
      method: 'GET',
      queryParams: {
        from: 'formValue.sourceCurrency',
        to: 'formValue.targetCurrency'
      },
      debounceMs: 500  // Optional, defaults to 300
    },
    responseExpression: 'response.rate',  // Extract value from response
    dependsOn: ['sourceCurrency', 'targetCurrency']  // Required for HTTP
  }]
}
\`\`\`

**Key rules:**
- \`http\` is mutually exclusive with \`expression\`, \`value\`, and \`functionName\`
- \`dependsOn\` is **required** (prevents wildcard triggering on every keystroke)
- \`responseExpression\` is **required** (extracts value from HTTP response body)
- \`queryParams\` values are expressions evaluated by ExpressionParser
- Requests are automatically debounced and cancelled (switchMap)
- HTTP errors are caught and logged (stream continues)
- Array fields (\`items.$.rate\`) are NOT supported for HTTP derivations
- Works with \`stopOnUserOverride\` and \`condition\`

## Stop on User Override

When \`stopOnUserOverride: true\`, the derivation stops running after the user manually edits the target field:

\`\`\`typescript
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  logic: [{
    type: 'derivation',
    expression: 'formValue.firstName + " " + formValue.lastName',
    stopOnUserOverride: true  // Derivation stops after user manually edits fullName
  }]
}
\`\`\`

### Re-engagement on Dependency Change

Combine \`reEngageOnDependencyChange: true\` with \`stopOnUserOverride\` to clear user overrides when dependencies change:

\`\`\`typescript
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  logic: [{
    type: 'derivation',
    expression: 'formValue.firstName + " " + formValue.lastName',
    stopOnUserOverride: true,
    reEngageOnDependencyChange: true  // Clears user override when firstName/lastName changes
  }]
}
\`\`\`

**Use cases:**
- Allow users to customize computed values
- Reset customizations when source data changes
- Smart defaults that defer to user input

**Variables in expressions:**
- \`formValue\`: Complete form value object
- \`fieldValue\`: This field's current value
- \`fieldState\`: Current field's state (touched, dirty, valid, etc.)
- \`formFieldState\`: All fields' states keyed by field key
- \`externalData\`: External application state (user roles, feature flags, etc.)

**Nested access:**
\`\`\`typescript
derivation: 'formValue.address?.city'                    // Optional chaining
derivation: 'formValue.items?.[0]?.name'                // Array access
derivation: 'formValue.discount ?? 0'                   // Nullish coalescing
derivation: 'formValue.price * (1 - externalData.discountRate)'  // External data
\`\`\`

**Complex logic (IIFE):**
\`\`\`typescript
derivation: \`(() => {
  const qty = formValue.quantity || 0;
  const price = formValue.unitPrice || 0;
  return qty * price;
})()\`
\`\`\`

**See also:** \`property-derivation\` topic for deriving component properties (minDate, options, label, etc.)`,
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
**fieldValue** - current field's value (in custom validators)
**fieldState** - current field state: \`fieldState.touched\`, \`fieldState.valid\`, \`fieldState.dirty\`
**formFieldState** - all field states: \`formFieldState.email.valid\`, \`formFieldState.password.pristine\`
**externalData** - external signals: \`externalData.userRole\`, \`externalData.featureFlags.enabled\``,

    full: `# Variables in Expressions

## Available Variables

| Variable | Type | Available In | Description |
|----------|------|--------------|-------------|
| \`formValue\` | object | Derivations, conditions, custom validators | Complete form values as nested object |
| \`fieldValue\` | any | Custom validator expressions only | Current field's value |
| \`fieldState\` | object | Derivations, conditions | Current field's state (touched, dirty, valid, etc.) |
| \`formFieldState\` | object | Derivations, conditions | All fields' states keyed by field key |
| \`externalData\` | object | Derivations, conditions | External application state (from \`externalData\` in FormConfig) |

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

### Field State Access

\`fieldState\` provides access to the current field's state properties:

\`\`\`typescript
// Check if current field has been touched
expression: 'fieldState.touched ? "Modified" : "Untouched"'

// Check if current field is valid
expression: 'fieldState.valid && formValue.email'

// Check if current field is dirty
expression: 'fieldState.dirty ? "Changed from initial" : "Unchanged"'
\`\`\`

**Available \`fieldState\` properties:**
- \`touched\`: boolean - Field has been focused and blurred
- \`dirty\`: boolean - Value differs from initial value
- \`pristine\`: boolean - Value matches initial value
- \`valid\`: boolean - No validation errors
- \`invalid\`: boolean - Has validation errors
- \`pending\`: boolean - Async validation in progress
- \`hidden\`: boolean - Field is currently hidden
- \`readonly\`: boolean - Field is currently readonly
- \`disabled\`: boolean - Field is currently disabled

### Form Field State Access

\`formFieldState\` provides access to any field's state by key:

\`\`\`typescript
// Check if email field is valid
expression: 'formFieldState.email?.valid'

// Conditional logic based on multiple field states
expression: 'formFieldState.password?.valid && formFieldState.confirmPassword?.touched'

// Check if any field is invalid
expression: '!formFieldState.email?.valid || !formFieldState.password?.valid'
\`\`\`

**Nested field paths:**
\`\`\`typescript
// Access nested group field state
expression: 'formFieldState["address.city"]?.dirty'

// Access array item field state
expression: 'formFieldState["contacts.0.name"]?.valid'
\`\`\`

### External Data Access
\`\`\`typescript
expression: "externalData.userRole === 'admin'"
expression: 'externalData.featureFlags.advancedMode === true'
expression: 'externalData.permissions.includes("edit")'
\`\`\`

## Common Patterns

### Conditional derivation based on field state
\`\`\`typescript
// Only compute if other field is valid
expression: 'formFieldState.email?.valid ? formValue.email.toLowerCase() : ""'

// Show warning if field is touched but invalid
expression: 'fieldState.touched && fieldState.invalid ? "Please fix errors" : ""'
\`\`\`

### Validation-aware derivations
\`\`\`typescript
// Only use value if source field is valid
expression: 'formFieldState.price?.valid ? formValue.price * 1.2 : null'
\`\`\`

## Safety Tips

1. **Always use optional chaining** (\`?.\`) for nested paths and field state access
2. **Provide defaults** for potentially undefined values: \`formValue.count || 0\`
3. **Use nullish coalescing** (\`??\`) when 0 or empty string are valid: \`formValue.score ?? 'N/A'\`
4. **Check field existence** when using \`formFieldState\`: \`formFieldState.fieldKey?.valid\``,
  },

  'property-derivation': {
    brief: `\`\`\`typescript
// Derive endDate's minDate from startDate value
logic: [{ type: 'derivation', targetProperty: 'minDate', expression: 'formValue.startDate' }]

// Derive select options from another field
logic: [{ type: 'derivation', targetProperty: 'options', functionName: 'getCitiesForCountry', dependsOn: ['country'] }]
\`\`\`
Unlike value derivation (which sets the field's **value**), property derivation sets **component input properties** like minDate, options, label, placeholder, props.appearance.`,

    full: `# Property Derivation (Dynamic Field Properties)

Reactively derive field component properties based on form values. Unlike value derivations (which compute the field's value), property derivations compute **component input properties** like \`minDate\`, \`options\`, \`label\`, \`placeholder\`, \`props.appearance\`, etc.

Property derivations are self-targeting: the logic is placed on the field whose property should be derived.

## Basic Syntax

\`\`\`typescript
{
  key: 'endDate',
  type: 'datepicker',
  label: 'End Date',
  logic: [{
    type: 'derivation',
    targetProperty: 'minDate',
    expression: 'formValue.startDate',
  }]
}
\`\`\`

When \`startDate\` changes, the \`minDate\` property on the \`endDate\` datepicker is automatically updated.

## Derivation Sources

### Expression-Based
\`\`\`typescript
logic: [{
  type: 'derivation',
  targetProperty: 'minDate',
  expression: 'formValue.startDate',
}]
\`\`\`

### Static Value
\`\`\`typescript
logic: [{
  type: 'derivation',
  targetProperty: 'label',
  value: 'Mobile Phone',
  condition: { type: 'fieldValue', fieldPath: 'contactType', operator: 'equals', value: 'mobile' },
}]
\`\`\`

### Custom Function
\`\`\`typescript
// Register in customFnConfig
customFnConfig: {
  derivations: {
    getCitiesForCountry: (ctx) => {
      const cities = { 'US': [{ label: 'NYC', value: 'nyc' }], 'DE': [{ label: 'Berlin', value: 'berlin' }] };
      return cities[ctx.formValue.country as string] ?? [];
    },
  },
}

// Use in field config
{
  key: 'city',
  type: 'select',
  label: 'City',
  logic: [{
    type: 'derivation',
    targetProperty: 'options',
    functionName: 'getCitiesForCountry',
    dependsOn: ['country'],
  }]
}
\`\`\`

## Supported Target Properties

### Simple Properties (1 level)
\`minDate\`, \`maxDate\`, \`options\`, \`label\`, \`placeholder\`, \`hint\`, \`disabled\`, \`readonly\`, \`required\`, \`rows\`, \`cols\`, etc.

### Nested Properties (max 2 levels)
\`props.appearance\`, \`props.color\`, \`props.variant\`, \`meta.autocomplete\`, etc.

⚠️ Deeper nesting (3+ levels) is **not supported**.

## Trigger Timing

| Trigger     | Description                           | Use Case                          |
|-------------|---------------------------------------|-----------------------------------|
| \`onChange\`  | Immediately on change (default)       | Date constraints, dynamic options |
| \`debounced\` | After value stabilizes                | Expensive lookups, API calls      |

\`\`\`typescript
logic: [{
  type: 'derivation',
  targetProperty: 'options',
  functionName: 'searchProducts',
  trigger: 'debounced',
  debounceMs: 300,
  dependsOn: ['searchQuery'],
}]
\`\`\`

## Conditional Property Derivation

\`\`\`typescript
logic: [{
  type: 'derivation',
  targetProperty: 'label',
  value: 'Company Email',
  condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'business' },
}]
\`\`\`

## Array Fields

Inside arrays, \`formValue\` is scoped to the current array item:
\`\`\`typescript
{
  key: 'lineItems',
  type: 'array',
  fields: [{
    key: 'item',
    type: 'group',
    fields: [
      { key: 'startDate', type: 'datepicker', label: 'Start' },
      {
        key: 'endDate',
        type: 'datepicker',
        label: 'End',
        logic: [{
          type: 'derivation',
          targetProperty: 'minDate',
          expression: 'formValue.startDate',  // Scoped to current array item
        }]
      }
    ]
  }]
}
\`\`\`

## Key Differences from Value Derivation

| Aspect | Value Derivation | Property Derivation |
|--------|-----------------|---------------------|
| Sets | Field's form value | Component input property |
| Type | \`type: 'derivation'\` | \`type: 'derivation'\` |
| Target | Implicit (self) | \`targetProperty: 'minDate'\` |
| Shorthand | \`derivation: 'expr'\` | None (must use logic block) |
| Chaining | Topologically sorted | No chaining (single pass) |
| Functions | \`customFnConfig.derivations\` | \`customFnConfig.derivations\` |

## DerivationLogicConfig Interface (with targetProperty)

\`\`\`typescript
interface DerivationLogicConfig {
  type: 'derivation';
  targetProperty: string;               // Property to set (e.g., 'minDate', 'options')
  debugName?: string;                   // For logging/debugging
  condition?: ConditionalExpression | boolean;  // When to apply (default: true)
  value?: unknown;                      // Static value (mutually exclusive)
  expression?: string;                  // JavaScript expression (mutually exclusive)
  functionName?: string;                // Custom function name (mutually exclusive)
  dependsOn?: string[];                 // Explicit field dependencies
  trigger?: 'onChange' | 'debounced';   // Evaluation timing (default: 'onChange')
  debounceMs?: number;                  // Debounce duration (default: 500)
}
\`\`\``,
  },

  'external-data': {
    brief: `\`\`\`typescript
externalData: { userRole: computed(() => authService.role()), flags: computed(() => featureFlags()) }
\`\`\`
Available as \`externalData.userRole\` in conditions and derivations. Reactively updates when signals change.`,

    full: `# External Data (Application State in Forms)

External data allows forms to access application state (user roles, feature flags, permissions) in conditions and derivations.

## Form Configuration

\`\`\`typescript
const config = {
  externalData: {
    userRole: computed(() => this.authService.currentRole()),
    permissions: computed(() => this.authService.permissions()),
    featureFlags: computed(() => ({
      advancedMode: this.featureService.isAdvanced(),
      betaFeatures: this.featureService.isBeta(),
    })),
  },
  fields: [
    // Fields can now use externalData in conditions
  ]
} as const satisfies FormConfig;
\`\`\`

## Using in Conditions (Logic)

\`\`\`typescript
{
  key: 'adminNotes',
  type: 'textarea',
  label: 'Admin Notes',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'javascript',
      expression: "externalData.userRole !== 'admin'"
    }
  }]
}
\`\`\`

## Using in Derivations

\`\`\`typescript
{
  key: 'discountedPrice',
  type: 'input',
  readonly: true,
  derivation: 'formValue.price * (1 - externalData.discountRate)'
}
\`\`\`

## Common Patterns

### Role-Based Field Visibility
\`\`\`typescript
logic: [{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: "externalData.userRole === 'guest'"  // Hide for guests
  }
}]
\`\`\`

### Feature Flag Conditionals
\`\`\`typescript
logic: [{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: 'externalData.featureFlags.betaFeatures !== true'
  }
}]
\`\`\`

### Permission-Based Readonly
\`\`\`typescript
logic: [{
  type: 'readonly',
  condition: {
    type: 'javascript',
    expression: '!externalData.permissions.includes("edit")'
  }
}]
\`\`\`

## Key Points

- **Signals required**: Each property in \`externalData\` must be a Signal (use \`signal()\` or \`computed()\`)
- **Reactive**: Changes to external signals automatically re-evaluate conditions/derivations
- **Available in**: JavaScript expressions, custom functions (via context)
- **Not available in**: \`fieldValue\`/\`formValue\` condition types (use \`javascript\` type)`,
  },

  'async-validators': {
    brief: `\`\`\`typescript
validators: [{ type: 'async', functionName: 'checkEmailAvailable' }]
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
    { type: 'async', functionName: 'checkEmailAvailable' }
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
    brief: `**Containers:** group/row/array support only \`hidden\` logic (same as pages). For other logic types, apply to children.
**Page:** hidden only | **Value fields:** all logic types incl. derivation + targetProperty | **Buttons:** hidden, disabled`,

    full: `# Logic Support Matrix

| Field Type     | hidden | disabled | required | readonly | derivation | derivation+targetProperty |
|----------------|--------|----------|----------|----------|------------|--------------------|
| page           |   Y    |    N     |    N     |    N     |     N      |         N          |
| group          |   Y    |    N     |    N     |    N     |     N      |         N          |
| row            |   Y    |    N     |    N     |    N     |     N      |         N          |
| array          |   Y    |    N     |    N     |    N     |     N      |         N          |
| input          |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| select         |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| checkbox       |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| radio          |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| multi-checkbox |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| textarea       |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| datepicker     |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| toggle         |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| slider         |   Y    |    Y     |    Y     |    Y     |     Y      |         Y          |
| hidden         |   N    |    N     |    N     |    N     |     N      |         N          |
| text           |   Y    |    N     |    N     |    N     |     N      |         Y          |
| button/submit  |   Y    |    Y     |    N     |    N     |     N      |         N          |
| next/previous  |   Y    |    Y     |    N     |    N     |     N      |         N          |

**Key takeaways:**
- Containers (group, row, array) support only \`hidden\` logic type (same as pages) for conditional visibility. For other logic types, apply to child fields instead.
- Page only supports \`hidden\` logic (for conditional pages)
- Hidden fields have NO logic support at all
- Value fields (input, select, etc.) support ALL logic types including \`derivation\` with \`targetProperty\`
- \`derivation\` with \`targetProperty\` sets component input properties (e.g., \`minDate\`, \`options\`), NOT the field's form value
- Text (display) fields support \`derivation\` with \`targetProperty\` for dynamic labels`,
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
| group | NO | hidden only | Creates nested object |
| array | NO | hidden only | Two APIs: \`template\`+\`value\` (simplified) or \`fields\` (full) |
| row | NO | hidden only | Layout only, no hidden fields |`,

    full: `# Container Rules

| Container | Label? | Logic? | Allowed Children | Notes |
|-----------|--------|--------|------------------|-------|
| page | NO | YES (hidden only) | rows, groups, arrays, leaf fields, buttons | Nav buttons go INSIDE |
| group | NO | YES (hidden only) | rows, leaf fields (NOT pages, groups) | Creates nested object |
| array | NO | YES (hidden only) | rows, groups, leaf fields (NOT pages, arrays) | Two APIs: \`template\`+\`value\` (simplified) or \`fields\` (full) |
| row | NO | YES (hidden only) | groups, arrays, leaf fields (NOT hidden, pages, rows) | Layout only |

**CRITICAL:**
- All containers (page, group, row, array) support only the \`hidden\` logic type for conditional visibility.
- For other logic types (disabled, required, readonly, derivation), apply them to child fields instead.
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
3. Container (group/row/array) only supports 'hidden' logic - other types go on children!
4. options/minValue/maxValue in props - must be at FIELD level!
5. Generic button without \`event\` - use submit/next/previous!
6. Array: \`fields\` and \`template\` are mutually exclusive - use one or the other!`,

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

## 3. Containers only support 'hidden' logic
\`\`\`typescript
// WRONG - non-hidden logic on group/row/array
{ type: 'group', logic: [{ type: 'disabled', condition: {...} }] }  // ❌

// CORRECT - containers support 'hidden' logic for conditional visibility
{
  type: 'group',
  logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'showGroup', operator: 'equals', value: false } }],  // ✅
  fields: [
    { key: 'city', type: 'input', label: 'City', logic: [...] }  // ✅ Other logic types on children
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

## 6. Array: 'fields' vs 'template' (two APIs)
\`\`\`typescript
// WRONG - mixing both APIs
{ type: 'array', fields: [...], template: {...} }  // ❌ mutually exclusive

// CORRECT - Simplified API (recommended for common cases)
{ type: 'array', template: { key: 'value', type: 'input', label: 'Tag' }, value: ['a', 'b'] }  // ✅

// CORRECT - Full API (for advanced use cases)
{ type: 'array', fields: [{ key: 'tag', type: 'input', value: 'a' }] }  // ✅
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
export const TOPIC_ALIASES: Record<string, string> = {
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
  // Simplified array aliases
  'simplified-arrays': 'simplified-array',
  'simple-array': 'simplified-array',
  'array-template': 'simplified-array',
  'template-array': 'simplified-array',
  'array-simplified': 'simplified-array',
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
  // Property derivation aliases
  'property-derive': 'property-derivation',
  propertyderivation: 'property-derivation',
  'dynamic-properties': 'property-derivation',
  'derived-properties': 'property-derivation',
  'dynamic-options': 'property-derivation',
  'dynamic-label': 'property-derivation',
  mindate: 'property-derivation',
  maxdate: 'property-derivation',
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
  // External data aliases
  externaldata: 'external-data',
  external: 'external-data',
  'app-state': 'external-data',
  'application-state': 'external-data',
  permissions: 'external-data',
  'feature-flags': 'external-data',
  featureflags: 'external-data',
  roles: 'external-data',
  'user-role': 'external-data',
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

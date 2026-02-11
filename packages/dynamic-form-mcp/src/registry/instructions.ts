/**
 * ng-forge Best Practices
 *
 * This content is served via the ng-forge://instructions resource
 * to guide AI assistants in generating FormConfig objects.
 */

export const INSTRUCTIONS = `# ng-forge Dynamic Forms - Best Practices

You MUST follow these practices when generating FormConfig objects for ng-forge.

## Core Principles

1. **Configuration-driven**: ng-forge wraps Angular Reactive Forms. Define structure declaratively via \`FormConfig\`, not imperatively.
2. **Type-safe**: Use TypeScript interfaces for form values. The library provides full type inference.
3. **Validation-first**: Always include validation and user-friendly error messages.

## FormConfig Structure

\`\`\`typescript
const config: FormConfig = {
  // Optional: Default validation messages for all fields
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  // Required: Array of field definitions
  fields: [
    // ... field definitions
  ],
};
\`\`\`

## Field Definition Rules

### Required Properties

Every field MUST have:

- \`key\`: Unique identifier (except for \`row\` type which is layout-only)
- \`type\`: One of the registered field types
- \`label\`: Human-readable label (for accessibility)

### Value Fields

For fields that collect user input (\`input\`, \`textarea\`, \`select\`, \`checkbox\`, \`radio\`, \`datepicker\`, \`toggle\`, \`slider\`):

\`\`\`typescript
{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  required: true,           // Shorthand validator
  email: true,              // Shorthand validator
  validationMessages: {     // Always provide clear messages
    required: 'Email is required',
    email: 'Please enter a valid email'
  },
  props: {
    type: 'email',          // HTML input type
    placeholder: 'user@example.com',
    hint: 'We will never share your email'  // UI library specific
  }
}
\`\`\`

### Select/Radio Fields

MUST include \`options\` array:

\`\`\`typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ],
  props: { placeholder: 'Select a country' }
}
\`\`\`

### Container Fields

#### Row (Horizontal Layout)

Use for side-by-side fields. Row fields do NOT create nested values - children are flat.

\`\`\`typescript
{
  key: 'nameRow',
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First', col: 6 },
    { key: 'lastName', type: 'input', label: 'Last', col: 6 }
  ]
}
// Result: { firstName: '...', lastName: '...' }
\`\`\`

Use \`col\` property (1-12) to control column widths.

#### Group (Nested Object)

Use when you need nested object structure in form values:

\`\`\`typescript
{
  key: 'address',
  type: 'group',
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' }
  ]
}
// Result: { address: { street: '...', city: '...' } }
\`\`\`

#### Array (Repeatable Items)

Use for dynamic lists. Each item is wrapped in a \`<div class="df-array-item">\` with \`role="group"\` and \`aria-label="Item N"\` for accessibility. Use \`--df-array-item-gap\` CSS variable to control spacing between items.

\`\`\`typescript
{
  key: 'contacts',
  type: 'array',
  // ⚠️ NO label property on arrays!
  fields: [
    {
      key: 'contact',
      type: 'group',
      fields: [
        { key: 'name', type: 'input', label: 'Name', required: true },
        { key: 'phone', type: 'input', label: 'Phone', required: true }
      ]
    }
  ]
}
// Result: { contacts: [{ name: '...', phone: '...' }, ...] }
\`\`\`

#### Page (Multi-step Forms)

Use for wizard-style forms:

\`\`\`typescript
{
  fields: [
    {
      key: 'step1',
      type: 'page',
      fields: [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'next', type: 'next', label: 'Continue' },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      fields: [
        { key: 'prev', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Submit' },
      ],
    },
  ];
}
\`\`\`

## Validation

### Shorthand Validators (Preferred)

Use shorthand properties directly on field definitions:

\`\`\`typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  required: true,
  min: 18,
  max: 120,
  validationMessages: {
    required: 'Age is required',
    min: 'Must be at least {{min}}',
    max: 'Cannot exceed {{max}}'
  }
}
\`\`\`

Available shorthands: \`required\`, \`email\`, \`min\`, \`max\`, \`minLength\`, \`maxLength\`, \`pattern\`

### Validation Messages

ALWAYS provide validation messages. Use template variables:

- \`{{requiredLength}}\` - for minLength/maxLength
- \`{{min}}\`, \`{{max}}\` - for min/max
- \`{{requiredPattern}}\` - for pattern

## Conditional Logic

Use \`logic\` array for conditional behavior:

\`\`\`typescript
{
  key: 'businessName',
  type: 'input',
  label: 'Business Name',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'notEquals',
        value: 'business'
      }
    },
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

### Logic Types

- \`hidden\` - Show/hide field
- \`disabled\` - Enable/disable field
- \`required\` - Conditional requirement

### Condition Operators

- \`equals\`, \`notEquals\`
- \`greaterThan\`, \`lessThan\`, \`greaterThanOrEquals\`, \`lessThanOrEquals\`
- \`contains\`, \`notContains\`
- \`empty\`, \`notEmpty\`

## UI Library Integration

ng-forge supports multiple UI libraries. Configure in \`app.config.ts\`:

\`\`\`typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
\`\`\`

Available adapters:

- \`@ng-forge/dynamic-forms-material\` - Angular Material
- \`@ng-forge/dynamic-forms-bootstrap\` - Bootstrap 5
- \`@ng-forge/dynamic-forms-primeng\` - PrimeNG
- \`@ng-forge/dynamic-forms-ionic\` - Ionic

## Common Patterns

### Always End with Submit Button

\`\`\`typescript
{ type: 'submit', key: 'submit', label: 'Submit', props: { color: 'primary' } }
\`\`\`

### Use Text Fields for Headings

\`\`\`typescript
{ key: 'sectionTitle', type: 'text', label: 'Personal Info', props: { elementType: 'h3' } }
\`\`\`

### Input Types via Props

\`\`\`typescript
// Email input
{ key: 'email', type: 'input', props: { type: 'email' } }

// Password input
{ key: 'password', type: 'input', props: { type: 'password' } }

// Number input
{ key: 'age', type: 'input', props: { type: 'number' } }

// Phone input
{ key: 'phone', type: 'input', props: { type: 'tel' } }
\`\`\`

## Anti-patterns to Avoid

1. **Missing labels** - Always include labels for accessibility
2. **Missing validation messages** - Users need clear feedback
3. **Duplicate keys** - Each key must be unique within its scope
4. **Select without options** - Select/radio fields must have options
5. **Array without fields** - Array fields need a fields template
6. **Group without fields** - Group fields need child fields
7. **min > max** - Ensure min values are less than max values

## CRITICAL: UI Library Differences

Different UI libraries support different properties. Always validate against the correct library using \`ngforge_validate_form_config\` with the appropriate \`uiIntegration\` parameter.

### Property Differences by Library

| Property | Material | Bootstrap | PrimeNG | Ionic |
|----------|----------|-----------|---------|-------|
| \`appearance\` | ✓ (fill, outline) | ✗ | ✗ | ✓ (fill, outline) |
| \`subscriptSizing\` | ✓ | ✗ | ✗ | ✗ |
| \`floatLabel\` | ✓ | ✗ | ✓ | ✗ |
| \`hint\` | ✓ | ✓ (as \`helpText\`) | ✓ | ✓ |

### Container Fields

Container fields (\`page\`, \`group\`, \`row\`) do NOT support these properties:
- \`label\` - Use \`text\` field type for headings instead
- \`required\`, \`email\`, \`min\`, \`max\`, etc. - Validation is for leaf fields only

### Common Mistakes to Avoid

1. **Using \`expressions\` on fields** - This property is NOT supported on standard fields. Use \`derivation\` for computed values or \`logic\` for conditional behavior.

2. **Adding \`label\` to container fields** - Pages, groups, and rows don't have labels:
   \`\`\`typescript
   // ❌ WRONG
   { key: 'address', type: 'group', label: 'Address', fields: [...] }

   // ✅ CORRECT - Use a text field for the heading
   { key: 'addressTitle', type: 'text', label: 'Address', props: { elementType: 'h3' } }
   { key: 'address', type: 'group', fields: [...] }
   \`\`\`

3. **Adding \`id\` to FormConfig** - The root FormConfig does not accept an \`id\` property.

4. **Putting slider min/max in props** - For slider fields, \`min\`, \`max\`, and \`step\` are field-level properties:
   \`\`\`typescript
   // ❌ WRONG
   { key: 'volume', type: 'slider', label: 'Volume', props: { min: 0, max: 100 } }

   // ✅ CORRECT
   { key: 'volume', type: 'slider', label: 'Volume', min: 0, max: 100 }
   \`\`\`

5. **Using unsupported field types** - Each UI library supports specific field types. Use \`ngforge_get_field_schema\` to see available types.

## Validation Before Use

Always validate your FormConfig using the \`ngforge_validate_form_config\` tool before using it. This tool uses the actual TypeScript/Zod schemas, so if validation passes, the config will work correctly at runtime.

\`\`\`typescript
// Always specify the UI integration you're using
ngforge_validate_form_config({
  uiIntegration: 'material',  // or 'bootstrap', 'primeng', 'ionic'
  config: { fields: [...] }
})
\`\`\`

To understand what properties are supported for each field type, use \`ngforge_get_field_schema\`:

\`\`\`typescript
ngforge_get_field_schema({ uiIntegration: 'material' })
\`\`\`
`;

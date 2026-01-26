/**
 * Get Cheatsheet Tool
 *
 * One-shot reference that returns everything needed to build forms.
 * Designed to minimize tool calls by providing complete, condensed info.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Complete cheatsheet content - designed to be self-contained.
 */
const CHEATSHEET = `# ng-forge Dynamic Forms Cheatsheet

## ⚠️ ALWAYS VALIDATE BEFORE DEPLOYING

**Call \`ngforge_validate_form_config\` with your config before using it!**

\`\`\`typescript
// Validate your config - catches errors BEFORE runtime
ngforge_validate_form_config({
  uiIntegration: 'material',
  config: yourFormConfig
})
\`\`\`

This catches:
- Wrong property placement (options in props vs field level)
- Invalid props for field types
- Labels on containers
- Logic on wrong container types
- Unknown field types

**Don't skip this step** - a 900-line config with one mistake fails silently at runtime.

---

## Quick Start (Component Usage)

\`\`\`typescript
// 1. Import in your component
import { DynamicFormComponent, FormConfig } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material'; // or bootstrap/primeng/ionic

// 2. Define your config
const formConfig: FormConfig = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
};

// 3. In your component class
formConfig = signal<FormConfig>(formConfig);
formValue = signal<Record<string, unknown>>({});

onSubmit(value: Record<string, unknown>) {
  console.log('Form submitted:', value);
}
\`\`\`

\`\`\`html
<!-- 4. Template binding (IMPORTANT: use these exact event/input names) -->
<form [dynamic-form]="formConfig()"
      [(value)]="formValue"
      (submitted)="onSubmit($event)">
</form>

<!-- Alternative: one-way binding -->
<form [dynamic-form]="formConfig()"
      [value]="initialValue()"
      (valueChange)="onValueChange($event)"
      (submitted)="onSubmit($event)">
</form>
\`\`\`

**Component API:**
| Input/Output | Type | Description |
|--------------|------|-------------|
| \`[dynamic-form]\` | \`FormConfig\` | The form configuration |
| \`[(value)]\` | \`Record<string, unknown>\` | Two-way bound form value |
| \`[value]\` | \`Record<string, unknown>\` | One-way input value |
| \`(valueChange)\` | \`EventEmitter\` | Emits on any value change |
| \`(submitted)\` | \`EventEmitter\` | Emits on form submit (**NOT** \`formSubmit\`) |
| \`(validityChange)\` | \`EventEmitter<boolean>\` | Emits when validity changes |

## Property Placement (THE #1 FOOTGUN)

| Property | Location | Field Types |
|----------|----------|-------------|
| \`key\` | field | ALL |
| \`type\` | field | ALL |
| \`label\` | field | value fields, buttons, text (NOT containers) |
| \`required\` | field | value fields |
| \`email\` | field | input |
| \`min\`, \`max\` | field | input (number validation) |
| \`minLength\`, \`maxLength\` | field | input, textarea |
| \`pattern\` | field | input, textarea |
| \`options\` | **field** | select, radio, multi-checkbox |
| \`minValue\`, \`maxValue\`, \`step\` | **field** | slider |
| \`value\` | field | ALL value fields |
| \`disabled\`, \`readonly\`, \`hidden\` | field | ALL |
| \`col\` | field | ALL (grid width 1-12) |
| \`logic\` | field | ALL |
| \`fields\` | field | containers (page, group, array, row) |
| \`type\` (input type) | **props** | input (\`text\`, \`email\`, \`password\`, \`number\`) |
| \`placeholder\` | **props** | input, textarea, select |
| \`rows\` | **props** | textarea |
| \`elementType\` | **props** | text (\`h1\`-\`h6\`, \`p\`, \`span\`) |
| \`appearance\` | **props** | Material only (\`fill\`, \`outline\`) |
| \`hint\` | **props** | Material only |

## Container Rules (NO LABEL! NO LOGIC on row/group/array!)

| Container | Label? | Logic? | Notes |
|-----------|--------|--------|-------|
| \`page\` | NO | YES (hidden only) | Nav buttons go INSIDE fields. No title property. |
| \`group\` | NO | **NO** | Creates nested object. Apply logic to CHILD fields. |
| \`array\` | NO | **NO** | Uses \`fields\`, NOT \`template\`. Apply logic to CHILD fields. |
| \`row\` | NO | **NO** | Horizontal layout only. Apply logic to CHILD fields. |

**CRITICAL:** If you need conditional visibility for a group/row/array, apply logic to each child field individually.

## Condition Types Reference

\`\`\`typescript
// 1. Field value comparison (most common)
condition: {
  type: 'fieldValue',
  fieldPath: 'accountType',      // Field to check
  operator: 'equals',            // See operators below
  value: 'business'              // Value to compare
}

// 2. JavaScript expression (complex logic)
condition: {
  type: 'javascript',
  expression: 'formValue.age >= 18 && formValue.hasConsent'
}

// 3. Boolean (static)
condition: true   // Always applies
condition: false  // Never applies

// 4. Logical AND
condition: {
  type: 'and',
  conditions: [
    { type: 'fieldValue', fieldPath: 'a', operator: 'equals', value: 'x' },
    { type: 'fieldValue', fieldPath: 'b', operator: 'greater', value: 10 }
  ]
}

// 5. Logical OR
condition: {
  type: 'or',
  conditions: [/* ... */]
}

// 6. Form state (BUTTONS ONLY)
condition: 'formInvalid'     // Form has validation errors
condition: 'formSubmitting'  // Form is submitting
condition: 'pageInvalid'     // Current page has errors
\`\`\`

**Operators:** \`equals\`, \`notEquals\`, \`greater\`, \`less\`, \`greaterOrEqual\`, \`lessOrEqual\`, \`contains\`, \`startsWith\`, \`endsWith\`, \`matches\`

## Logic Types (with inline examples)

### hidden - Hide field when condition is true
\`\`\`typescript
logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' }}]
\`\`\`

### disabled - Disable field when condition is true
\`\`\`typescript
logic: [{ type: 'disabled', condition: { type: 'fieldValue', fieldPath: 'status', operator: 'equals', value: 'locked' }}]
\`\`\`

### readonly - Make read-only when condition is true
\`\`\`typescript
logic: [{ type: 'readonly', condition: { type: 'fieldValue', fieldPath: 'isVerified', operator: 'equals', value: true }}]
\`\`\`

### required - Make required when condition is true
\`\`\`typescript
logic: [{ type: 'required', condition: { type: 'fieldValue', fieldPath: 'needsDetails', operator: 'equals', value: true }}]
\`\`\`

### derivation - Compute value from expression
\`\`\`typescript
logic: [{ type: 'derivation', targetField: 'fullName', expression: 'formValue.firstName + " " + formValue.lastName' }]
\`\`\`

## Derivation Variables & Expressions

**Available variables in expressions:**
| Variable | Type | Description |
|----------|------|-------------|
| \`formValue\` | object | Complete form value - use for cross-field references |
| \`fieldValue\` | any | Current field's value - use for self-referencing |

**Optional chaining is fully supported:**
\`\`\`typescript
// Safe nested access - returns undefined if path doesn't exist
'formValue.address?.city'
'formValue.contacts?.[0]?.email'
'formValue.settings?.notifications?.email ?? false'
\`\`\`

**Expression patterns:**
\`\`\`typescript
// String concatenation
'formValue.firstName + " " + formValue.lastName'

// Ternary for conditional values
'formValue.age >= 18 ? "Adult" : "Minor"'

// Nullish coalescing for defaults
'formValue.nickname ?? formValue.firstName ?? "Anonymous"'

// Array access
'formValue.items?.[0]?.name'

// IIFE for complex logic
\`(() => {
  const x = formValue.quantity || 0;
  const price = formValue.unitPrice || 0;
  return x * price;
})()\`
\`\`\`

## Copy-Paste Patterns

### Conditional Visibility
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

### Dynamic Required
\`\`\`typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business'
    }
  }]
}
\`\`\`

### Simple Derivation (concat)
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

### Derivation with Optional Chaining
\`\`\`typescript
{
  key: 'displayAddress',
  type: 'input',
  label: 'Address Summary',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'displayAddress',
    expression: '(formValue.address?.city || "") + ", " + (formValue.address?.state || "")'
  }]
}
\`\`\`

### Complex Derivation (IIFE)
\`\`\`typescript
{
  key: 'experienceLevel',
  type: 'input',
  label: 'Experience Level',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'experienceLevel',
    expression: \`(() => {
      const years = formValue.yearsExperience || 0;
      if (years < 2) return 'Junior';
      if (years < 5) return 'Mid-Level';
      if (years < 10) return 'Senior';
      return 'Principal';
    })()\`
  }]
}
\`\`\`

### Conditional Derivation
\`\`\`typescript
{
  key: 'discount',
  type: 'input',
  label: 'Discount',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'discount',
    expression: 'formValue.isPremium ? 0.2 : 0',
    condition: {
      type: 'fieldValue',
      fieldPath: 'applyDiscount',
      operator: 'equals',
      value: true
    }
  }]
}
\`\`\`

### Multi-Page Navigation
\`\`\`typescript
{
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'next1', type: 'next', label: 'Next' }
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

### Select with Options
\`\`\`typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [  // AT FIELD LEVEL!
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' }
  ],
  props: { placeholder: 'Select a country' }  // placeholder in props
}
\`\`\`

### Slider
\`\`\`typescript
{
  key: 'rating',
  type: 'slider',
  label: 'Rating',
  minValue: 1,   // AT FIELD LEVEL!
  maxValue: 10,  // AT FIELD LEVEL!
  step: 1,       // AT FIELD LEVEL!
  value: 5
}
\`\`\`

### Nested Group
\`\`\`typescript
{
  key: 'address',  // Creates formValue.address.*
  type: 'group',
  // NO LABEL!
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' }
  ]
}
// Result: { address: { street: '...', city: '...' } }
\`\`\`

### Text Display
\`\`\`typescript
{
  key: 'header',
  type: 'text',
  label: 'Section Title',  // Content goes in LABEL
  props: { elementType: 'h2' }  // NOT 'element', NOT 'content'
}
\`\`\`

## Output Shape (formValue structure)

Understanding how your config maps to the form value object:

\`\`\`typescript
// Flat fields → flat object
{ fields: [
  { key: 'name', type: 'input' },
  { key: 'email', type: 'input' }
]}
// Output: { name: 'John', email: 'john@example.com' }

// Group → nested object
{ fields: [
  { key: 'address', type: 'group', fields: [
    { key: 'street', type: 'input' },
    { key: 'city', type: 'input' }
  ]}
]}
// Output: { address: { street: '123 Main', city: 'NYC' } }

// Array with single field → array of primitives
{ fields: [
  { key: 'tags', type: 'array', fields: [
    { key: 'tag', type: 'input' }
  ]}
]}
// Output: { tags: ['tag1', 'tag2', 'tag3'] }

// Array with group → array of objects
{ fields: [
  { key: 'contacts', type: 'array', fields: [
    { key: 'contactGroup', type: 'group', fields: [
      { key: 'name', type: 'input' },
      { key: 'phone', type: 'input' }
    ]}
  ]}
]}
// Output: { contacts: [{ name: 'Alice', phone: '555-1234' }, { name: 'Bob', phone: '555-5678' }] }

// Pages don't affect structure - just navigation
{ fields: [
  { key: 'page1', type: 'page', fields: [
    { key: 'name', type: 'input' }
  ]},
  { key: 'page2', type: 'page', fields: [
    { key: 'email', type: 'input' }
  ]}
]}
// Output: { name: 'John', email: 'john@example.com' } (flat, pages are transparent)
\`\`\`

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "options" not found | \`props: { options: [...] }\` | Move to field level: \`options: [...]\` |
| "label" invalid on group | \`type: 'group', label: '...'\` | Remove label from containers |
| "logic" invalid on group/row/array | \`type: 'group', logic: [...]\` | Apply logic to CHILD FIELDS, not the container |
| slider min/max ignored | \`props: { min: 0 }\` | Use \`minValue\`, \`maxValue\` at field level |
| text not rendering | \`props: { content: '...' }\` | Use \`label: '...'\`, \`props: { elementType }\` |
| hideWhen not working | \`hideWhen: {...}\` | Use \`logic: [{ type: 'hidden', condition: {...} }]\` |
| derivation not working | \`derivation: { expression }\` | Use \`logic: [{ type: 'derivation', targetField, expression }]\` |

## Nested Paths (Accessing Nested Field Values)

When referencing fields inside groups/containers in expressions and conditions:

\`\`\`typescript
// Flat field (direct access)
'formValue.email'

// Inside a group (dot notation)
'formValue.address.city'
'formValue.address.zip'

// Inside nested groups
'formValue.billing.address.street'

// Inside an array (index access)
'formValue.contacts[0].email'
'formValue.items[2].quantity'

// With optional chaining (SAFE - handles undefined)
'formValue.address?.city'                    // returns undefined if address is null
'formValue.contacts?.[0]?.email'             // safe array access
'formValue.billing?.address?.street ?? ""'   // with default value

// In fieldValue conditions - use the FIELD PATH, not formValue
{
  type: 'fieldValue',
  fieldPath: 'address.city',        // NOT 'formValue.address.city'
  operator: 'equals',
  value: 'NYC'
}

// In JavaScript conditions - use formValue prefix
{
  type: 'javascript',
  expression: 'formValue.address?.city === "NYC"'
}
\`\`\`

**Tip:** For derivations referencing nested values, always use optional chaining to prevent errors when parent is undefined.

## Shorthand vs Full Syntax (When to Use Each)

### Validation
\`\`\`typescript
// SHORTHAND (recommended for simple cases)
{ key: 'email', type: 'input', required: true, email: true, minLength: 5 }

// FULL SYNTAX (for custom messages or complex rules)
{
  key: 'email',
  type: 'input',
  validators: [
    { type: 'required' },
    { type: 'email' },
    { type: 'minLength', value: 5 },
    { type: 'custom', expression: '!fieldValue.includes("spam")', kind: 'noSpam' }
  ]
}
\`\`\`

### When to use Full Syntax:
- Custom validators (expression/function-based)
- Async validators (API calls to check uniqueness)
- Cross-field validation (password confirmation)

### Logic Blocks (always explicit - NO shorthand exists)
\`\`\`typescript
// This is the ONLY way - there's no hideWhen/showWhen shorthand
logic: [{
  type: 'hidden',  // or 'disabled', 'readonly', 'required', 'derivation'
  condition: { type: 'fieldValue', fieldPath: 'x', operator: 'equals', value: 'y' }
}]
\`\`\`

## Error Message Examples (What You'll See)

### Error: "options" at wrong level
\`\`\`
Validation error at 'fields.0': options should be at FIELD level, not inside props
\`\`\`
**Fix:** Move \`options\` from \`props: { options: [...] }\` to field level

### Error: "label" on container
\`\`\`
Validation error at 'fields.0': Field "address" (type: group): "group" fields do NOT have a label property
\`\`\`
**Fix:** Remove \`label\` from group/row/array/page fields

### Error: "logic" on container
\`\`\`
Validation error at 'fields.0': "row" containers do NOT support logic blocks - apply logic to individual child fields instead
\`\`\`
**Fix:** Move logic to each child field, not the container

### Error: Invalid field type
\`\`\`
Validation error at 'fields.0': Unknown field type "inputField". Valid types: input, select, checkbox, radio, multi-checkbox, textarea, datepicker, toggle, slider, hidden, text, row, group, array, page, button, submit, next, previous
\`\`\`
**Fix:** Use exact type name (e.g., \`input\` not \`inputField\`)

### Error: Invalid property in props
\`\`\`
Validation error at 'fields.0.props': Unrecognized key(s) in object: 'min', 'max'
\`\`\`
**Fix:** For slider, use \`minValue\`/\`maxValue\` at field level

## Material-Specific Props (Detailed)

### Common Material Props
| Prop | Values | Description |
|------|--------|-------------|
| \`appearance\` | \`'outline'\` (default), \`'fill'\` | Form field style - outline has border, fill has background |
| \`subscriptSizing\` | \`'dynamic'\` (default), \`'fixed'\` | Error/hint space - dynamic grows, fixed reserves space |
| \`hint\` | string | Helper text shown below field |
| \`color\` | \`'primary'\`, \`'accent'\`, \`'warn'\` | Theme color for interactive elements |

### By Field Type
| Field Type | Valid Props |
|------------|-------------|
| input | \`type\`, \`placeholder\`, \`appearance\`, \`hint\`, \`subscriptSizing\` |
| select | \`placeholder\`, \`appearance\`, \`multiple\` |
| textarea | \`rows\`, \`placeholder\`, \`appearance\`, \`hint\` |
| checkbox | \`color\` |
| radio | \`color\` |
| toggle | \`color\` |
| datepicker | \`appearance\`, \`startView\` (\`'month'\`, \`'year'\`, \`'multi-year'\`), \`touchUi\` (boolean) |
| slider | \`thumbLabel\` (boolean - show value on thumb), \`tickInterval\` (number), \`color\` |

### Input \`type\` Values
\`'text'\` (default), \`'email'\`, \`'password'\`, \`'number'\`, \`'tel'\`, \`'url'\`

## Minimal Snippets (Copy-Paste Ready)

### Text Input with Validation
\`\`\`typescript
{ key: 'email', type: 'input', label: 'Email', required: true, email: true, props: { type: 'email' } }
\`\`\`

### Select with Options
\`\`\`typescript
{ key: 'country', type: 'select', label: 'Country', required: true, options: [{ label: 'USA', value: 'us' }, { label: 'Canada', value: 'ca' }] }
\`\`\`

### Slider with Range
\`\`\`typescript
{ key: 'rating', type: 'slider', label: 'Rating', minValue: 1, maxValue: 10, step: 1, value: 5 }
\`\`\`

### Conditional Field (Show When)
\`\`\`typescript
{ key: 'details', type: 'input', label: 'Details', logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'showDetails', operator: 'notEquals', value: true } }] }
\`\`\`

### Derived Field (Computed)
\`\`\`typescript
{ key: 'total', type: 'input', label: 'Total', readonly: true, logic: [{ type: 'derivation', targetField: 'total', expression: 'formValue.qty * formValue.price' }] }
\`\`\`

### Nested Group
\`\`\`typescript
{ key: 'address', type: 'group', fields: [{ key: 'street', type: 'input', label: 'Street' }, { key: 'city', type: 'input', label: 'City' }] }
\`\`\`

### Array of Items
\`\`\`typescript
{ key: 'contacts', type: 'array', fields: [{ key: 'item', type: 'group', fields: [{ key: 'name', type: 'input', label: 'Name' }, { key: 'phone', type: 'input', label: 'Phone' }] }] }
\`\`\`

### Multi-Page Form
\`\`\`typescript
{ fields: [{ key: 'p1', type: 'page', fields: [{ key: 'name', type: 'input', label: 'Name' }, { key: 'next', type: 'next', label: 'Next' }] }, { key: 'p2', type: 'page', fields: [{ key: 'email', type: 'input', label: 'Email' }, { key: 'back', type: 'previous', label: 'Back' }, { key: 'submit', type: 'submit', label: 'Submit' }] }] }
\`\`\`

### Disabled Submit When Invalid
\`\`\`typescript
{ key: 'submit', type: 'submit', label: 'Submit', logic: [{ type: 'disabled', condition: 'formInvalid' }] }
\`\`\`
`;

export function registerGetCheatsheetTool(server: McpServer): void {
  server.tool(
    'ngforge_get_cheatsheet',
    'Returns a complete, condensed reference for building forms. Use this FIRST - it has property placement rules, condition syntax, copy-paste patterns, and common error fixes. Designed to minimize tool calls.',
    {
      uiIntegration: z
        .enum(UI_INTEGRATIONS)
        .optional()
        .describe('UI library for library-specific props (material, bootstrap, primeng, ionic). Defaults to material.'),
    },
    async ({ uiIntegration }) => {
      // For now, return the same cheatsheet with a note about the UI integration
      const uiNote = uiIntegration
        ? `\n> Using **${uiIntegration}** UI integration. Props table shows ${uiIntegration}-specific properties.\n`
        : '\n> Showing **Material** UI integration by default.\n';

      return {
        content: [{ type: 'text' as const, text: uiNote + CHEATSHEET }],
      };
    },
  );
}

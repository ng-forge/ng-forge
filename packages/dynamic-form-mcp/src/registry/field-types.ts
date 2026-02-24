/**
 * Field Type Registry Data
 *
 * Canonical source of field type metadata for the MCP server.
 * Previously generated as field-types.json by generate-registry.ts.
 */

import type { FieldTypeInfo } from './index.js';

export const FIELD_TYPES: FieldTypeInfo[] = [
  {
    type: 'input',
    category: 'value',
    description: 'Text-based input field with HTML5 type support (text, email, password, number, tel, url)',
    valueType: 'string | number',
    baseInterface: 'BaseValueField',
    props: {
      type: {
        name: 'type',
        type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url'",
        description: 'HTML input type',
        required: false,
        default: 'text',
      },
      placeholder: {
        name: 'placeholder',
        type: 'DynamicText',
        description: 'Placeholder text displayed when field is empty',
        required: false,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  required: true,
  email: true,
  props: { type: 'email', placeholder: 'user@example.com' }
}`,
    minimalExample: `{ key: 'name', type: 'input', label: 'Name' }`,
  },
  {
    type: 'textarea',
    category: 'value',
    description: 'Multi-line text input field for longer content',
    valueType: 'string',
    baseInterface: 'BaseValueField',
    props: {
      rows: {
        name: 'rows',
        type: 'number',
        description: 'Number of visible text lines',
        required: false,
        default: 3,
      },
      placeholder: {
        name: 'placeholder',
        type: 'DynamicText',
        description: 'Placeholder text displayed when field is empty',
        required: false,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'description',
  type: 'textarea',
  label: 'Description',
  props: { rows: 5, placeholder: 'Enter description...' }
}`,
    minimalExample: `{ key: 'bio', type: 'textarea', label: 'Bio' }`,
  },
  {
    type: 'select',
    category: 'value',
    description: 'Dropdown selection field with single or multiple selection',
    valueType: 'T | T[]',
    baseInterface: 'BaseValueField',
    props: {
      options: {
        name: 'options',
        type: 'FieldOption[]',
        description: 'Array of selectable options with label and value. IMPORTANT: options goes at FIELD level, NOT inside props',
        required: true,
      },
      multiple: {
        name: 'multiple',
        type: 'boolean',
        description: 'Allow multiple selections',
        required: false,
        default: false,
      },
      placeholder: {
        name: 'placeholder',
        type: 'DynamicText',
        description: 'Placeholder text for empty selection',
        required: false,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' }
  ]
}`,
    minimalExample: `{ key: 'status', type: 'select', label: 'Status', options: [{ label: 'Active', value: 'active' }] }`,
  },
  {
    type: 'checkbox',
    category: 'value',
    description: 'Boolean toggle checkbox field',
    valueType: 'boolean',
    baseInterface: 'BaseCheckedField',
    props: {},
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'acceptTerms',
  type: 'checkbox',
  label: 'I accept the terms and conditions',
  required: true
}`,
    minimalExample: `{ key: 'agree', type: 'checkbox', label: 'I agree' }`,
  },
  {
    type: 'multi-checkbox',
    category: 'value',
    description: 'Multiple checkbox group for selecting multiple values from options',
    valueType: 'T[]',
    baseInterface: 'BaseValueField',
    props: {
      options: {
        name: 'options',
        type: 'FieldOption[]',
        description: 'Array of selectable options. IMPORTANT: options goes at FIELD level, NOT inside props',
        required: true,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Select your interests',
  options: [
    { label: 'Sports', value: 'sports' },
    { label: 'Music', value: 'music' },
    { label: 'Art', value: 'art' },
    { label: 'Technology', value: 'tech' }
  ]
}`,
    minimalExample: `{ key: 'tags', type: 'multi-checkbox', label: 'Tags', options: [{ label: 'A', value: 'a' }] }`,
  },
  {
    type: 'radio',
    category: 'value',
    description: 'Radio button group for single selection from options',
    valueType: 'T',
    baseInterface: 'BaseValueField',
    props: {
      options: {
        name: 'options',
        type: 'FieldOption[]',
        description: 'Array of selectable options. IMPORTANT: options goes at FIELD level, NOT inside props',
        required: true,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'gender',
  type: 'radio',
  label: 'Gender',
  options: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ]
}`,
    minimalExample: `{ key: 'choice', type: 'radio', label: 'Choice', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] }`,
  },
  {
    type: 'datepicker',
    category: 'value',
    description: 'Date selection field with calendar picker',
    valueType: 'Date | string',
    baseInterface: 'BaseValueField',
    props: {
      minDate: {
        name: 'minDate',
        type: 'Date | string',
        description: 'Minimum selectable date',
        required: false,
      },
      maxDate: {
        name: 'maxDate',
        type: 'Date | string',
        description: 'Maximum selectable date',
        required: false,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Date of Birth',
  required: true,
  props: { maxDate: new Date() }
}`,
    minimalExample: `{ key: 'date', type: 'datepicker', label: 'Date' }`,
  },
  {
    type: 'toggle',
    category: 'value',
    description: 'Switch/toggle control for boolean values',
    valueType: 'boolean',
    baseInterface: 'BaseCheckedField',
    props: {},
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'notifications',
  type: 'toggle',
  label: 'Enable notifications'
}`,
    minimalExample: `{ key: 'enabled', type: 'toggle', label: 'Enable' }`,
  },
  {
    type: 'slider',
    category: 'value',
    description: 'Numeric range slider for value selection',
    valueType: 'number',
    baseInterface: 'BaseValueField',
    props: {
      minValue: {
        name: 'minValue',
        type: 'number',
        description: 'Minimum value. IMPORTANT: This is at FIELD level, NOT inside props',
        required: false,
        default: 0,
      },
      maxValue: {
        name: 'maxValue',
        type: 'number',
        description: 'Maximum value. IMPORTANT: This is at FIELD level, NOT inside props',
        required: false,
        default: 100,
      },
      step: {
        name: 'step',
        type: 'number',
        description: 'Step increment. IMPORTANT: This is at FIELD level, NOT inside props',
        required: false,
        default: 1,
      },
    },
    validationSupported: true,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  value: 50,
  minValue: 0,
  maxValue: 100,
  step: 5
}`,
    minimalExample: `{ key: 'rating', type: 'slider', label: 'Rating' }`,
  },
  {
    type: 'hidden',
    category: 'value',
    description:
      'Hidden field that participates in form values without rendering. REQUIRED: The "value" property MUST be provided (string, number, boolean, or array). FORBIDDEN: label, logic, validators, required, props, disabled, readonly, hidden, col, tabIndex, meta - hidden fields are purely for passing values through the form. IMPORTANT: In multi-page forms, hidden fields must go INSIDE a page, not at the root level.',
    valueType: 'string | number | boolean | (string | number | boolean)[]',
    baseInterface: 'FieldDef',
    props: {},
    validationSupported: false,
    source: 'core',
    allowedIn: ['top-level (single-page forms only)', 'page.fields', 'group.fields', 'array.fields'],
    notAllowedIn: ['row', 'top-level when using pages'],
    example: `// Hidden field - value is REQUIRED!
{
  key: 'userId',
  type: 'hidden',
  value: 'abc123'  // REQUIRED: string, number, boolean, or array
}

// Valid value types:
{ key: 'count', type: 'hidden', value: 42 }           // number
{ key: 'active', type: 'hidden', value: true }        // boolean
{ key: 'tags', type: 'hidden', value: [1, 2, 3] }     // array

// ❌ FORBIDDEN (will cause validation error):
// - label, logic, validators, required, props
// - disabled, readonly, hidden, col, tabIndex, meta
// - Validation shorthand: email, min, max, minLength, maxLength, pattern`,
    minimalExample: `{ key: 'id', type: 'hidden', value: 'abc123' }`,
  },
  {
    type: 'text',
    category: 'display',
    description: 'Static text display element (headings, paragraphs, spans). The text content comes from the label property.',
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {
      elementType: {
        name: 'elementType',
        type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'",
        description: 'HTML element type for rendering',
        required: false,
        default: 'p',
      },
    },
    validationSupported: false,
    source: 'core',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'sectionTitle',
  type: 'text',
  label: 'Personal Information',
  props: { elementType: 'h2' }
}`,
    minimalExample: `{ key: 'header', type: 'text', label: 'Section Title' }`,
  },
  {
    type: 'row',
    category: 'container',
    description:
      "Horizontal layout container for grouping fields in columns. Rows do NOT have a label property. Supports only 'hidden' logic type for conditional visibility.",
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {
      fields: {
        name: 'fields',
        type: 'RowAllowedChildren[]',
        description:
          'Child fields to render horizontally. Allowed: groups, arrays, VALUE fields (input, select, etc). NOT ALLOWED: pages, rows, hidden fields',
        required: true,
      },
    },
    validationSupported: false,
    source: 'core',
    allowedIn: ['top-level', 'page', 'group', 'array'],
    notAllowedIn: ['row'],
    canContain: [
      'group',
      'array',
      'input',
      'textarea',
      'select',
      'checkbox',
      'multi-checkbox',
      'radio',
      'datepicker',
      'toggle',
      'slider',
      'text',
      'button',
      'submit',
      'next',
      'previous',
    ],
    cannotContain: ['page', 'row', 'hidden'],
    example: `{
  key: 'nameRow',
  type: 'row',
  // NOTE: Rows do NOT have a label property
  // Rows support only 'hidden' logic type for conditional visibility
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', col: 6 },
    { key: 'lastName', type: 'input', label: 'Last Name', col: 6 }
  ]
}
// NOT ALLOWED in rows:
// - type: 'hidden' (hidden fields cannot be inside rows)
// - type: 'page' (pages are top-level only)
// - type: 'row' (no nested rows)`,
    minimalExample: `{ key: 'row1', type: 'row', fields: [...] }`,
  },
  {
    type: 'group',
    category: 'container',
    description:
      "Nested form group container creating a sub-object in form values. Groups are logical containers only and do NOT have a label property. Supports only 'hidden' logic type for conditional visibility.",
    valueType: 'object',
    baseInterface: 'FieldDef',
    props: {
      fields: {
        name: 'fields',
        type: 'GroupAllowedChildren[]',
        description: 'Child fields in the group. Allowed: rows, leaf fields (NOT pages or other groups)',
        required: true,
      },
    },
    validationSupported: true,
    source: 'core',
    allowedIn: ['top-level', 'page', 'row', 'array'],
    notAllowedIn: ['group'],
    canContain: [
      'row',
      'input',
      'textarea',
      'select',
      'checkbox',
      'multi-checkbox',
      'radio',
      'datepicker',
      'toggle',
      'slider',
      'hidden',
      'text',
      'button',
      'submit',
      'next',
      'previous',
    ],
    cannotContain: ['page', 'group'],
    example: `{
  key: 'address',
  type: 'group',
  // NOTE: Groups do NOT have a label property
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' },
    { key: 'zip', type: 'input', label: 'ZIP Code' }
  ]
}`,
    minimalExample: `{ key: 'address', type: 'group', fields: [...] }`,
  },
  {
    type: 'array',
    category: 'container',
    description:
      'Repeatable field group for dynamic lists/arrays. Arrays do NOT have a label property. Use "fields" (not "template") to define the item template. Supports only \'hidden\' logic type for conditional visibility. Supports minLength/maxLength for array size validation. Each array item is rendered inside a `<div class="df-array-item">` wrapper with `role="group"`, `aria-label="Item N"` (1-based), `data-array-item-id`, and `data-array-item-index` attributes for styling, accessibility, and testing.',
    valueType: 'T[]',
    baseInterface: 'FieldDef',
    props: {
      fields: {
        name: 'fields',
        type: 'ArrayAllowedChildren[]',
        description: 'Template field(s) for each array item. Allowed: rows, groups, leaf fields (NOT pages or other arrays)',
        required: true,
      },
      minLength: {
        name: 'minLength',
        type: 'number',
        description: 'Minimum number of items required in the array. Validation fails if fewer items.',
        required: false,
      },
      maxLength: {
        name: 'maxLength',
        type: 'number',
        description: 'Maximum number of items allowed in the array. Validation fails if more items.',
        required: false,
      },
    },
    validationSupported: true,
    source: 'core',
    allowedIn: ['top-level', 'page', 'row', 'group'],
    notAllowedIn: ['array'],
    canContain: [
      'row',
      'group',
      'input',
      'textarea',
      'select',
      'checkbox',
      'multi-checkbox',
      'radio',
      'datepicker',
      'toggle',
      'slider',
      'hidden',
      'text',
      'button',
      'submit',
      'next',
      'previous',
    ],
    cannotContain: ['page', 'array'],
    example: `// Flat array with length validation
{
  key: 'tags',
  type: 'array',
  minLength: 1,  // At least one tag required
  maxLength: 5,  // No more than 5 tags
  fields: [
    { key: 'tag', type: 'input', label: 'Tag' }
  ]
}
// Result: { tags: ['value1', 'value2'] }

// Object array (nested groups)
{
  key: 'contacts',
  type: 'array',
  minLength: 1,
  fields: [{
    type: 'group',
    fields: [
      { key: 'name', type: 'input', label: 'Name' },
      { key: 'email', type: 'input', label: 'Email' }
    ]
  }]
}
// Result: { contacts: [{name: '', email: ''}, ...] }`,
    minimalExample: `{ key: 'items', type: 'array', fields: [...] }`,
  },
  {
    type: 'page',
    category: 'container',
    description:
      'Multi-step form page container for wizard-style forms. Pages do NOT have label or title properties. ALL top-level fields must be pages if using multi-page mode. IMPORTANT: Navigation buttons (next, previous) must be added as fields WITHIN each page that needs them.',
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {
      fields: {
        name: 'fields',
        type: 'PageAllowedChildren[]',
        description:
          'Fields in this page. Allowed: rows, groups, arrays, leaf fields (NOT other pages). Include next/previous buttons as needed.',
        required: true,
      },
    },
    validationSupported: false,
    source: 'core',
    allowedIn: ['top-level'],
    notAllowedIn: ['page', 'row', 'group', 'array'],
    canContain: [
      'row',
      'group',
      'array',
      'input',
      'textarea',
      'select',
      'checkbox',
      'multi-checkbox',
      'radio',
      'datepicker',
      'toggle',
      'slider',
      'hidden',
      'text',
      'button',
      'submit',
      'next',
      'previous',
    ],
    cannotContain: ['page'],
    example: `{
  key: 'step1',
  type: 'page',
  // NOTE: Pages do NOT have label or title properties
  // Navigation buttons are fields WITHIN the page
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name' },
    { key: 'lastName', type: 'input', label: 'Last Name' },
    { key: 'next', type: 'next', label: 'Next' }
  ]
}`,
    minimalExample: `{ key: 'step1', type: 'page', fields: [...] }`,
  },
  {
    type: 'next',
    category: 'button',
    description: "Navigation button to go to next page in multi-step forms. Must be placed INSIDE a page's fields array.",
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {},
    validationSupported: false,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'next',
  type: 'next',
  label: 'Next'
}`,
    minimalExample: `{ key: 'next', type: 'next', label: 'Next' }`,
  },
  {
    type: 'previous',
    category: 'button',
    description: "Navigation button to go to previous page in multi-step forms. Must be placed INSIDE a page's fields array.",
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {},
    validationSupported: false,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'back',
  type: 'previous',
  label: 'Back'
}`,
    minimalExample: `{ key: 'back', type: 'previous', label: 'Back' }`,
  },
  {
    type: 'button',
    category: 'button',
    description:
      "Generic button for custom actions. IMPORTANT: The generic 'button' type REQUIRES the 'event' property with a FormEventConstructor. For simple use cases, prefer 'submit', 'next', or 'previous' which don't require event configuration.",
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {
      event: {
        name: 'event',
        type: 'FormEventConstructor<TEvent>',
        description:
          'REQUIRED. Event constructor that will be emitted when button is clicked. Must be registered with provideFormEvents().',
        required: true,
      },
    },
    validationSupported: false,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `// RECOMMENDED: Use pre-defined button types for common actions
{ key: 'submit', type: 'submit', label: 'Submit Form' }
{ key: 'next', type: 'next', label: 'Next' }
{ key: 'back', type: 'previous', label: 'Back' }

// ADVANCED: Generic button with custom event (requires setup)
// 1. Create event class: class MyCustomEvent extends FormEvent {}
// 2. Register with: provideFormEvents([MyCustomEvent])
// 3. Use in config:
{
  key: 'customAction',
  type: 'button',
  label: 'Custom Action',
  event: MyCustomEvent  // Must be the class reference
}`,
    minimalExample: `{ key: 'action', type: 'button', label: 'Action', event: MyEvent }`,
  },
  {
    type: 'submit',
    category: 'button',
    description: 'Form submit button',
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {},
    validationSupported: false,
    source: 'adapter',
    allowedIn: ['top-level', 'page', 'row', 'group', 'array'],
    example: `{
  key: 'submit',
  type: 'submit',
  label: 'Submit Form'
}`,
    minimalExample: `{ key: 'submit', type: 'submit', label: 'Submit' }`,
  },
  {
    type: 'addArrayItem',
    category: 'button',
    description: 'Button to add a new item to an array field. Must be placed within or near the array container.',
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {},
    validationSupported: false,
    source: 'adapter',
    allowedIn: ['array', 'row', 'group'],
    example: `{
  key: 'addContact',
  type: 'addArrayItem',
  label: 'Add Contact'
}`,
    minimalExample: `{ key: 'add', type: 'addArrayItem', label: 'Add Item' }`,
  },
  {
    type: 'removeArrayItem',
    category: 'button',
    description: 'Button to remove the current item from an array field. Typically placed within each array item template.',
    valueType: undefined,
    baseInterface: 'FieldDef',
    props: {},
    validationSupported: false,
    source: 'adapter',
    allowedIn: ['array', 'row', 'group'],
    example: `{
  key: 'removeContact',
  type: 'removeArrayItem',
  label: 'Remove'
}`,
    minimalExample: `{ key: 'remove', type: 'removeArrayItem', label: 'Remove' }`,
  },
];

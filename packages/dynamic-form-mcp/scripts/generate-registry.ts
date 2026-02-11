#!/usr/bin/env node
/**
 * Registry Generation Script
 *
 * This script extracts field type, validator, UI adapter metadata,
 * and documentation from the ng-forge packages at build time.
 *
 * Output files:
 * - src/registry/field-types.json
 * - src/registry/validators.json
 * - src/registry/ui-adapters.json
 * - src/registry/docs.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Write JSON data to a file with proper formatting and trailing newline.
 */
function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

const OUTPUT_DIR = path.resolve(__dirname, '../src/registry');

interface FieldTypeInfo {
  type: string;
  category: 'value' | 'container' | 'button' | 'display';
  description: string;
  valueType?: string;
  baseInterface?: string;
  props: Record<string, PropertyInfo>;
  validationSupported: boolean;
  example: string;
  /** Field types that this container can contain (for containers only) */
  canContain?: string[];
  /** Field types that this container CANNOT contain (for containers only) */
  cannotContain?: string[];
  /** Where this field type is allowed to be placed */
  allowedIn?: string[];
  /** Where this field type is NOT allowed to be placed */
  notAllowedIn?: string[];
  /** Whether this field type is part of core library or requires an adapter */
  source: 'core' | 'adapter';
  /** Minimal valid example (just required properties) */
  minimalExample?: string;
}

interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: unknown;
}

interface ValidatorInfo {
  type: string;
  category: 'built-in' | 'custom' | 'async' | 'http';
  description: string;
  parameters: Record<string, PropertyInfo>;
  example: string;
}

interface UIAdapterInfo {
  library: string;
  package: string;
  fieldTypes: Array<{
    type: string;
    componentName: string;
    additionalProps: Record<string, PropertyInfo>;
  }>;
  providerFunction: string;
}

// Core field types based on ng-forge dynamic-forms
const CORE_FIELD_TYPES: FieldTypeInfo[] = [
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
      'Repeatable field group for dynamic lists/arrays. Arrays do NOT have label, minItems, or maxItems properties. Use "fields" (not "template") to define the item template. Supports only \'hidden\' logic type for conditional visibility. Each array item is rendered inside a `<div class="df-array-item">` wrapper with `role="group"`, `aria-label="Item N"` (1-based), `data-array-item-id`, and `data-array-item-index` attributes for styling, accessibility, and testing.',
    valueType: 'T[]',
    baseInterface: 'FieldDef',
    props: {
      fields: {
        name: 'fields',
        type: 'ArrayAllowedChildren[]',
        description: 'Template field(s) for each array item. Allowed: rows, groups, leaf fields (NOT pages or other arrays)',
        required: true,
      },
    },
    validationSupported: false,
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
    example: `// Flat array (primitive values)
{
  key: 'tags',
  type: 'array',
  // NOTE: Arrays do NOT have label, minItems, or maxItems
  fields: [
    { key: 'tag', type: 'input', label: 'Tag' }
  ]
}
// Result: { tags: ['value1', 'value2'] }

// Object array (nested groups)
{
  key: 'contacts',
  type: 'array',
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

// Validator types
const VALIDATORS: ValidatorInfo[] = [
  {
    type: 'required',
    category: 'built-in',
    description: 'Validates that a field has a non-empty value',
    parameters: {},
    example: `{ type: 'required' }
// or shorthand: required: true`,
  },
  {
    type: 'email',
    category: 'built-in',
    description: 'Validates email format',
    parameters: {},
    example: `{ type: 'email' }
// or shorthand: email: true`,
  },
  {
    type: 'min',
    category: 'built-in',
    description: 'Validates minimum numeric value',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Minimum allowed value',
        required: true,
      },
    },
    example: `{ type: 'min', value: 0 }
// or shorthand: min: 0`,
  },
  {
    type: 'max',
    category: 'built-in',
    description: 'Validates maximum numeric value',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Maximum allowed value',
        required: true,
      },
    },
    example: `{ type: 'max', value: 100 }
// or shorthand: max: 100`,
  },
  {
    type: 'minLength',
    category: 'built-in',
    description: 'Validates minimum string length',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Minimum string length',
        required: true,
      },
    },
    example: `{ type: 'minLength', value: 3 }
// or shorthand: minLength: 3`,
  },
  {
    type: 'maxLength',
    category: 'built-in',
    description: 'Validates maximum string length',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Maximum string length',
        required: true,
      },
    },
    example: `{ type: 'maxLength', value: 100 }
// or shorthand: maxLength: 100`,
  },
  {
    type: 'pattern',
    category: 'built-in',
    description: 'Validates against a regular expression pattern',
    parameters: {
      value: {
        name: 'value',
        type: 'string | RegExp',
        description: 'Regular expression pattern',
        required: true,
      },
    },
    example: `{ type: 'pattern', value: '^[A-Z][a-z]+$' }
// or shorthand: pattern: '^[A-Z][a-z]+$'`,
  },
  {
    type: 'custom',
    category: 'custom',
    description:
      "Custom synchronous validator using registered function or expression. IMPORTANT: The validator returns { kind: 'errorKind' } on failure. The actual error MESSAGE is defined in 'validationMessages' at the FIELD level, NOT in the validator config.",
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered validator function',
        required: false,
      },
      expression: {
        name: 'expression',
        type: 'string',
        description: 'JavaScript expression to evaluate',
        required: false,
      },
      kind: {
        name: 'kind',
        type: 'string',
        description: 'Error kind returned when validation fails. This kind maps to a message in field-level validationMessages.',
        required: false,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to validator function',
        required: false,
      },
    },
    example: `// Expression-based custom validator with error message
// The validator:
{
  type: 'custom',
  expression: 'fieldValue === formValue.password',
  kind: 'passwordMismatch'  // Just the error KIND, not the message
}

// COMPLETE FIELD with validationMessages at FIELD level:
{
  key: 'confirmPassword',
  type: 'input',
  label: 'Confirm Password',
  props: { type: 'password' },
  validators: [
    { type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }
  ],
  validationMessages: {
    passwordMismatch: 'Passwords do not match'  // Message goes HERE at field level
  }
}`,
  },
  {
    type: 'customAsync',
    category: 'async',
    description: 'Async validator using registered async function',
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered async validator function',
        required: true,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to validator function',
        required: false,
      },
    },
    example: `{
  type: 'customAsync',
  functionName: 'checkUsernameAvailability'
}`,
  },
  {
    type: 'customHttp',
    category: 'http',
    description: 'HTTP-based validator with automatic request cancellation',
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered HTTP validator configuration',
        required: true,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to HTTP validator',
        required: false,
      },
    },
    example: `{
  type: 'customHttp',
  functionName: 'validateEmailExists'
}`,
  },
];

// UI Adapter configurations
const UI_ADAPTERS: UIAdapterInfo[] = [
  {
    library: 'material',
    package: '@ng-forge/dynamic-forms-material',
    providerFunction: 'withMaterialFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'MatInputFieldComponent',
        additionalProps: {
          appearance: {
            name: 'appearance',
            type: "'fill' | 'outline'",
            description: 'Material form field appearance',
            required: false,
            default: 'outline',
          },
          subscriptSizing: {
            name: 'subscriptSizing',
            type: "'fixed' | 'dynamic'",
            description: 'Error/hint text sizing',
            required: false,
            default: 'dynamic',
          },
          hint: {
            name: 'hint',
            type: 'DynamicText',
            description: 'Hint text below the field',
            required: false,
          },
        },
      },
      {
        type: 'select',
        componentName: 'MatSelectFieldComponent',
        additionalProps: {
          appearance: {
            name: 'appearance',
            type: "'fill' | 'outline'",
            description: 'Material form field appearance',
            required: false,
            default: 'outline',
          },
        },
      },
      {
        type: 'checkbox',
        componentName: 'MatCheckboxFieldComponent',
        additionalProps: {
          color: {
            name: 'color',
            type: "'primary' | 'accent' | 'warn'",
            description: 'Checkbox color theme',
            required: false,
            default: 'primary',
          },
        },
      },
      {
        type: 'datepicker',
        componentName: 'MatDatepickerFieldComponent',
        additionalProps: {
          startView: {
            name: 'startView',
            type: "'month' | 'year' | 'multi-year'",
            description: 'Initial calendar view',
            required: false,
            default: 'month',
          },
        },
      },
    ],
  },
  {
    library: 'bootstrap',
    package: '@ng-forge/dynamic-forms-bootstrap',
    providerFunction: 'withBootstrapFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'BootstrapInputComponent',
        additionalProps: {
          size: {
            name: 'size',
            type: "'sm' | 'lg'",
            description: 'Bootstrap input size',
            required: false,
          },
          floating: {
            name: 'floating',
            type: 'boolean',
            description: 'Use floating labels',
            required: false,
            default: false,
          },
        },
      },
      {
        type: 'select',
        componentName: 'BootstrapSelectComponent',
        additionalProps: {
          size: {
            name: 'size',
            type: "'sm' | 'lg'",
            description: 'Bootstrap select size',
            required: false,
          },
        },
      },
    ],
  },
  {
    library: 'primeng',
    package: '@ng-forge/dynamic-forms-primeng',
    providerFunction: 'withPrimeNGFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'PrimeInputComponent',
        additionalProps: {
          variant: {
            name: 'variant',
            type: "'outlined' | 'filled'",
            description: 'Input variant style',
            required: false,
            default: 'outlined',
          },
        },
      },
      {
        type: 'select',
        componentName: 'PrimeDropdownComponent',
        additionalProps: {
          filter: {
            name: 'filter',
            type: 'boolean',
            description: 'Enable dropdown filtering',
            required: false,
            default: false,
          },
          showClear: {
            name: 'showClear',
            type: 'boolean',
            description: 'Show clear button',
            required: false,
            default: false,
          },
        },
      },
      {
        type: 'datepicker',
        componentName: 'PrimeDatepickerComponent',
        additionalProps: {
          showIcon: {
            name: 'showIcon',
            type: 'boolean',
            description: 'Show calendar icon',
            required: false,
            default: true,
          },
          dateFormat: {
            name: 'dateFormat',
            type: 'string',
            description: 'Date format pattern',
            required: false,
            default: 'mm/dd/yy',
          },
        },
      },
    ],
  },
  {
    library: 'ionic',
    package: '@ng-forge/dynamic-forms-ionic',
    providerFunction: 'withIonicFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'IonicInputComponent',
        additionalProps: {
          fill: {
            name: 'fill',
            type: "'solid' | 'outline'",
            description: 'Input fill style',
            required: false,
            default: 'solid',
          },
          labelPlacement: {
            name: 'labelPlacement',
            type: "'fixed' | 'stacked' | 'floating'",
            description: 'Label placement style',
            required: false,
            default: 'floating',
          },
        },
      },
      {
        type: 'select',
        componentName: 'IonicSelectComponent',
        additionalProps: {
          interface: {
            name: 'interface',
            type: "'alert' | 'action-sheet' | 'popover'",
            description: 'Selection interface style',
            required: false,
            default: 'alert',
          },
        },
      },
      {
        type: 'toggle',
        componentName: 'IonicToggleComponent',
        additionalProps: {
          enableOnOffLabels: {
            name: 'enableOnOffLabels',
            type: 'boolean',
            description: 'Show on/off labels',
            required: false,
            default: false,
          },
        },
      },
    ],
  },
];

const DOCS_DIR = path.resolve(__dirname, '../../../apps/docs/src/docs');

interface DocTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}

/**
 * Clean markdown content for AI consumption:
 * - Remove NgDoc demo directives
 * - Remove frontmatter
 * - Clean up excessive whitespace
 */
function cleanMarkdown(content: string): string {
  return (
    content
      // Remove frontmatter
      .replace(/^---[\s\S]*?---\n*/m, '')
      // Remove NgDoc demo directives
      .replace(/\{\{\s*NgDocActions\.demo\([^)]*\)\s*\}\}/g, '[Live Demo]')
      // Remove empty lines after headers
      .replace(/^(#{1,6}\s+.+)\n{3,}/gm, '$1\n\n')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      // Remove excessive blank lines
      .replace(/\n{4,}/g, '\n\n\n')
      .trim()
  );
}

/**
 * Convert file path to topic ID
 * e.g., "core/validation/basics.md" -> "validation-basics"
 */
function pathToTopicId(relativePath: string): string {
  return relativePath
    .replace(/^(core|prebuilt|examples|ui-libs-integrations|deep-dive|what-is-dynamic-forms|installation)\//, '')
    .replace(/\/index\.md$/, '')
    .replace(/\.md$/, '')
    .replace(/\//g, '-');
}

/**
 * Extract title from markdown content
 */
function extractTitle(content: string, fallback: string): string {
  // Try to get title from first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1];
  }
  // Fallback to converting the filename
  return fallback
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Get category from file path
 */
function getCategory(relativePath: string): string {
  const parts = relativePath.split('/');
  return parts[0] || 'general';
}

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.md')) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

/**
 * Generate docs.json from markdown files
 */
function generateDocs(): DocTopic[] {
  if (!fs.existsSync(DOCS_DIR)) {
    console.log('⚠️  Docs directory not found, skipping docs generation');
    return [];
  }

  const markdownFiles = findMarkdownFiles(DOCS_DIR);
  const docs: DocTopic[] = [];

  for (const relativePath of markdownFiles) {
    const fullPath = path.join(DOCS_DIR, relativePath);
    const rawContent = fs.readFileSync(fullPath, 'utf-8');
    const content = cleanMarkdown(rawContent);

    // Skip empty files
    if (content.length < 50) continue;

    const id = pathToTopicId(relativePath);
    const title = extractTitle(content, id);
    const category = getCategory(relativePath);

    docs.push({ id, title, category, content });
  }

  return docs;
}

async function generateRegistry(): Promise<void> {
  console.log('Generating MCP registry files...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write field types
  const fieldTypesPath = path.join(OUTPUT_DIR, 'field-types.json');
  writeJson(fieldTypesPath, CORE_FIELD_TYPES);
  console.log(`Generated ${fieldTypesPath}`);

  // Write validators
  const validatorsPath = path.join(OUTPUT_DIR, 'validators.json');
  writeJson(validatorsPath, VALIDATORS);
  console.log(`Generated ${validatorsPath}`);

  // Write UI adapters
  const uiAdaptersPath = path.join(OUTPUT_DIR, 'ui-adapters.json');
  writeJson(uiAdaptersPath, UI_ADAPTERS);
  console.log(`Generated ${uiAdaptersPath}`);

  // Generate and write docs
  const docs = generateDocs();
  if (docs.length > 0) {
    const docsPath = path.join(OUTPUT_DIR, 'docs.json');
    writeJson(docsPath, docs);
    console.log(`Generated ${docsPath} (${docs.length} topics)`);
  }

  console.log('\nRegistry generation complete!');
}

// Run the generator
generateRegistry().catch((error) => {
  console.error('❌ Registry generation failed:', error);
  process.exit(1);
});

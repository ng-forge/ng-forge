[← Back to Quick Start](/examples)

Dynamic form arrays using the complete API with declarative add/remove buttons, custom button placement, and full control over item structure.

## Live Demo

<iframe src="http://localhost:4201/#/examples/array" class="example-frame" title="Array Field Demo"></iframe>

## Overview

This example demonstrates the complete array API with:

- **Flat arrays** with row-based items (input + remove button)
- **Object arrays** with multiple fields per item
- **Declarative buttons** for add, prepend, and remove operations
- **Custom button placement** outside the array container
- **Template-based item creation**

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

// Template for new tags — a row with an input and remove button
const tagTemplate = {
  key: 'tag',
  type: 'row',
  fields: [
    {
      key: 'value',
      type: 'input',
      label: 'Tag',
      required: true,
      minLength: 2,
      props: { placeholder: 'Enter a tag', hint: 'Tags must be at least 2 characters' },
    },
    {
      key: 'removeTag',
      type: 'removeArrayItem',
      label: 'Remove',
      className: 'remove-tag-button',
      props: { color: 'warn' },
    },
  ],
} as const;

// Template for new contacts — includes remove button inside each item
const contactTemplate = [
  {
    key: 'name',
    type: 'input',
    label: 'Contact Name',
    required: true,
    minLength: 2,
    props: { placeholder: 'Enter contact name', hint: 'Full name of the emergency contact' },
  },
  {
    key: 'phone',
    type: 'input',
    label: 'Phone Number',
    required: true,
    pattern: /^\d{10}$/,
    validationMessages: { pattern: 'Please enter a valid 10-digit phone number' },
    props: { type: 'tel', placeholder: '5551234567' },
  },
  {
    key: 'relationship',
    type: 'select',
    label: 'Relationship',
    required: true,
    options: [
      { label: 'Family', value: 'family' },
      { label: 'Friend', value: 'friend' },
      { label: 'Colleague', value: 'colleague' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    key: 'removeContact',
    type: 'removeArrayItem',
    label: 'Remove Contact',
    className: 'remove-contact-button',
    props: { color: 'warn' },
  },
] as const;

@Component({
  selector: 'app-array-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class ArrayFormComponent {
  formValue = signal({});

  config = {
    fields: [
      // Flat array with row-based items
      {
        key: 'tags',
        type: 'array',
        fields: [
          [
            {
              key: 'tag',
              type: 'row',
              fields: [
                { key: 'value', type: 'input', label: 'Tag', value: 'angular', required: true, minLength: 2 },
                { key: 'removeTag', type: 'removeArrayItem', label: 'Remove', props: { color: 'warn' } },
              ],
            },
          ],
          [
            {
              key: 'tag',
              type: 'row',
              fields: [
                { key: 'value', type: 'input', label: 'Tag', value: 'typescript', required: true, minLength: 2 },
                { key: 'removeTag', type: 'removeArrayItem', label: 'Remove', props: { color: 'warn' } },
              ],
            },
          ],
        ],
      },
      // Add button placed outside the array
      {
        key: 'addTagButton',
        type: 'addArrayItem',
        label: 'Add Tag',
        arrayKey: 'tags',
        template: [tagTemplate],
        props: { color: 'primary' },
      },

      // Object array with multiple fields per item
      {
        key: 'contacts',
        type: 'array',
        fields: [
          [
            { key: 'name', type: 'input', label: 'Contact Name', value: 'Jane Smith', required: true, minLength: 2 },
            { key: 'phone', type: 'input', label: 'Phone Number', value: '5551234567', required: true },
            {
              key: 'relationship',
              type: 'select',
              label: 'Relationship',
              value: 'family',
              required: true,
              options: [
                { label: 'Family', value: 'family' },
                { label: 'Friend', value: 'friend' },
                { label: 'Colleague', value: 'colleague' },
                { label: 'Other', value: 'other' },
              ],
            },
            { key: 'removeContact', type: 'removeArrayItem', label: 'Remove Contact', props: { color: 'warn' } },
          ],
        ],
      },
      // Multiple add buttons with different behaviors
      {
        key: 'contactButtons',
        type: 'row',
        fields: [
          {
            key: 'prependContactButton',
            type: 'prependArrayItem',
            label: 'Add First',
            arrayKey: 'contacts',
            template: contactTemplate,
            props: { color: 'accent' },
          },
          {
            key: 'addContactButton',
            type: 'addArrayItem',
            label: 'Add Contact',
            arrayKey: 'contacts',
            template: contactTemplate,
            props: { color: 'primary' },
          },
        ],
      },

      { key: 'submit', type: 'submit', label: 'Save All', props: { color: 'primary' } },
    ],
  } as const satisfies FormConfig;
}
```

## Key Features

### Declarative Add/Remove Buttons

Use `addArrayItem`, `prependArrayItem`, and `removeArrayItem` button types directly in your config:

```typescript
// Add button outside the array
{
  key: 'addTag',
  type: 'addArrayItem',
  label: 'Add Tag',
  arrayKey: 'tags',        // Points to the array field
  template: tagTemplate,   // Defines the new item structure
}

// Remove button inside each array item
{
  key: 'removeTag',
  type: 'removeArrayItem',
  label: 'Remove',
}
```

### Custom Button Placement

Place add/prepend buttons anywhere in the form layout:

```typescript
{
  key: 'contactButtons',
  type: 'row',
  fields: [
    { key: 'prepend', type: 'prependArrayItem', label: 'Add First', arrayKey: 'contacts', template: contactTemplate },
    { key: 'append', type: 'addArrayItem', label: 'Add Last', arrayKey: 'contacts', template: contactTemplate },
  ],
}
```

### Templates for New Items

Each add button defines its own template for what to insert:

```typescript
const contactTemplate = [
  { key: 'name', type: 'input', label: 'Name' },
  { key: 'phone', type: 'input', label: 'Phone' },
  { key: 'remove', type: 'removeArrayItem', label: 'Remove' },
];
```

## Use Cases

- Forms requiring custom button placement
- Arrays with multiple add operations (append, prepend, insert)
- Heterogeneous arrays with different item structures
- Complex layouts with row-based array items

## Related Examples

- **[Simplified Array Form](../simplified-array-form/)** - Simpler API with auto-generated buttons
- **[Paginated Form](../paginated-form/)** - Multi-step wizard form
- **[Contact Form](../contact-form/)** - Basic contact form

## Related Documentation

- **[Complete Array API](../../prebuilt/form-arrays/complete/)** - Full API reference
- **[Simplified Array API](../../prebuilt/form-arrays/simplified/)** - Simpler alternative
- **[Validation](../../validation/basics/)** - Form validation guide

[← Back to Quick Start](/examples)

Dynamic arrays using the simplified API with auto-generated add/remove buttons, template-based item definitions, and both primitive and object arrays.

## Live Demo

<iframe src="http://localhost:4201/#/examples/simplified-array" class="example-frame" title="Simplified Array Demo"></iframe>

## Overview

This example showcases the simplified array API with:

- **Primitive arrays** (tags) with flat scalar values
- **Object arrays** (contacts) with multiple fields per item
- **Empty arrays** that start with no items
- **Button customization** including opt-out
- **Auto-generated add/remove buttons**

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-simplified-array-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class SimplifiedArrayFormComponent {
  formValue = signal({});

  config = {
    fields: [
      // Primitive array — tags
      {
        key: 'tags',
        type: 'array',
        template: {
          key: 'value',
          type: 'input',
          label: 'Tag',
          required: true,
          minLength: 2,
          props: { placeholder: 'Enter a tag' },
        },
        value: ['angular', 'typescript'],
        addButton: { label: 'Add Tag', props: { color: 'primary' } },
        removeButton: { label: 'Remove', props: { color: 'warn' } },
      },

      // Object array — contacts
      {
        key: 'contacts',
        type: 'array',
        template: [
          {
            key: 'name',
            type: 'input',
            label: 'Contact Name',
            required: true,
            minLength: 2,
            props: { placeholder: 'Enter contact name' },
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone Number',
            props: { type: 'tel', placeholder: '5551234567' },
          },
        ],
        value: [
          { name: 'Jane Smith', phone: '5551234567' },
          { name: 'John Doe', phone: '5559876543' },
        ],
        addButton: { label: 'Add Contact', props: { color: 'primary' } },
      },

      // Empty array — notes
      {
        key: 'notes',
        type: 'array',
        template: {
          key: 'text',
          type: 'input',
          label: 'Note',
          props: { placeholder: 'Enter a note' },
        },
        addButton: { label: 'Add Note' },
      },

      // No remove button — categories
      {
        key: 'categories',
        type: 'array',
        template: { key: 'name', type: 'input', label: 'Category' },
        value: ['Frontend', 'Backend'],
        removeButton: false,
        addButton: { label: 'Add Category' },
      },

      { key: 'submit', type: 'submit', label: 'Save All', props: { color: 'primary' } },
    ],
  } as const satisfies FormConfig;
}
```

## Key Features

### Template-Based Items

Define the item structure once via `template`, and provide initial data via `value`:

```typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag', required: true },
  value: ['angular', 'typescript'],
}
```

### Auto-Generated Buttons

Add and remove buttons are generated automatically. Customize labels and props:

```typescript
addButton: { label: 'Add Tag', props: { color: 'primary' } },
removeButton: { label: 'Remove', props: { color: 'warn' } },
```

### Button Opt-Out

Disable buttons entirely with `false`:

```typescript
removeButton: false,  // No remove buttons on items
addButton: false,     // No add button
```

## Use Cases

- Tag lists and keyword management
- Contact lists with multiple fields
- Dynamic note-taking
- Category management
- Any repeating data entry

## Related Examples

- **[Array Form (Complete)](../array-form/)** - Full control with declarative buttons and EventBus
- **[Paginated Form](../paginated-form/)** - Multi-step wizard form
- **[Contact Form](../contact-form/)** - Basic contact form

## Related Documentation

- **[Simplified Array API](../../prebuilt/form-arrays/simplified/)** - Full API reference
- **[Complete Array API](../../prebuilt/form-arrays/complete/)** - Advanced array features
- **[Validation](../../validation/basics/)** - Form validation guide

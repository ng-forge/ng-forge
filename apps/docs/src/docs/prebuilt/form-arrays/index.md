Arrays create dynamic collections of field values. The fields array defines a **template** that is cloned for each array item.

## Interactive Demo

{{ NgDocActions.demo("ArrayFieldDemoComponent") }}

## Flat Arrays (Primitive Values)

For simple arrays of primitive values, use a leaf field as the template:

```typescript
{
  key: 'tags',
  type: 'array',
  fields: [
    { key: 'tag', type: 'input', label: 'Tag', value: '' }
  ],
}
```

This creates a flat array in the form value:

```typescript
{
  tags: ['tag1', 'tag2', 'tag3'];
}
```

## Object Arrays (Nested Groups)

For arrays of objects, use a group field as the template:

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [{
    type: 'group',
    fields: [
      { key: 'name', type: 'input', label: 'Name', value: '' },
      { key: 'phone', type: 'input', label: 'Phone', value: '' }
    ]
  }],
}
```

This creates an array of objects:

```typescript
{
  contacts: [
    { name: 'John Doe', phone: '5551234567' },
    { name: 'Jane Smith', phone: '5559876543' },
  ];
}
```

## Array vs Group

- **Groups** create nested objects with keys: `{ address: { street: '', city: '' } }`
- **Flat Arrays** create lists of values: `{ tags: ['value1', 'value2'] }`
- **Object Arrays** create lists of objects: `{ items: [{name: ''}, {name: ''}] }`

## Dynamic Add/Remove

Array items can be added or removed dynamically at runtime using the event bus:

```typescript
import { EventBus } from '@ng-forge/dynamic-form';
import { AddArrayItemEvent, RemoveArrayItemEvent } from '@ng-forge/dynamic-form/events';

// Inject the event bus
eventBus = inject(EventBus);

// Add item to array
addItem() {
  this.eventBus.dispatch(AddArrayItemEvent, 'tags');
}

// Add item at specific index
addItemAt(index: number) {
  this.eventBus.dispatch(AddArrayItemEvent, 'tags', index);
}

// Remove last item
removeItem() {
  this.eventBus.dispatch(RemoveArrayItemEvent, 'tags');
}

// Remove item at specific index
removeItemAt(index: number) {
  this.eventBus.dispatch(RemoveArrayItemEvent, 'tags', index);
}
```

## Use Cases

Arrays are ideal for:

- Lists of simple values (tags, categories, keywords)
- Repeating form sections (multiple addresses, phone numbers)
- Dynamic collections where items can be added/removed
- Collection-based data structures where order matters

## Complete Example: Flat Array

Here's a complete working example of a flat array field with dynamic add/remove:

```typescript
import { Component, inject } from '@angular/core';
import { DynamicForm, EventBus } from '@ng-forge/dynamic-form';
import { AddArrayItemEvent, RemoveArrayItemEvent } from '@ng-forge/dynamic-form/events';

@Component({
  selector: 'app-tags-form',
  imports: [DynamicForm],
  template: `
    <dynamic-form [config]="formConfig" (submitted)="onSubmit($event)" />
    <button (click)="addTag()">Add Tag</button>
  `,
})
export class TagsFormComponent {
  private eventBus = inject(EventBus);

  formConfig = {
    fields: [
      {
        key: 'tags',
        type: 'array',
        label: 'Tags',
        fields: [
          {
            key: 'tag',
            type: 'input',
            label: 'Tag',
            value: '',
            required: true,
            minLength: 2,
          },
        ],
      },
    ],
  };

  addTag() {
    this.eventBus.dispatch(AddArrayItemEvent, 'tags');
  }

  removeTag(index: number) {
    this.eventBus.dispatch(RemoveArrayItemEvent, 'tags', index);
  }

  onSubmit(formValue: any) {
    console.log('Form submitted:', formValue);
    // Output: { tags: ['angular', 'typescript', 'forms'] }
  }
}
```

## Complete Example: Object Array

Here's a complete working example of an object array field with validation:

```typescript
import { Component, inject } from '@angular/core';
import { DynamicForm, EventBus } from '@ng-forge/dynamic-form';
import { AddArrayItemEvent, RemoveArrayItemEvent } from '@ng-forge/dynamic-form/events';

@Component({
  selector: 'app-contacts-form',
  imports: [DynamicForm],
  template: `
    <dynamic-form [config]="formConfig" (submitted)="onSubmit($event)" />
    <button (click)="addContact()">Add Contact</button>
  `,
})
export class ContactsFormComponent {
  private eventBus = inject(EventBus);

  formConfig = {
    fields: [
      {
        key: 'contacts',
        type: 'array',
        label: 'Emergency Contacts',
        fields: [
          {
            type: 'group',
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Contact Name',
                value: '',
                required: true,
                minLength: 2,
              },
              {
                key: 'phone',
                type: 'input',
                label: 'Phone Number',
                value: '',
                required: true,
                pattern: /^\d{10}$/,
              },
              {
                key: 'relationship',
                type: 'select',
                label: 'Relationship',
                value: 'friend',
                options: [
                  { label: 'Family', value: 'family' },
                  { label: 'Friend', value: 'friend' },
                  { label: 'Colleague', value: 'colleague' },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  addContact() {
    this.eventBus.dispatch(AddArrayItemEvent, 'contacts');
  }

  removeContact(index: number) {
    this.eventBus.dispatch(RemoveArrayItemEvent, 'contacts', index);
  }

  onSubmit(formValue: any) {
    console.log('Form submitted:', formValue);
    // Output:
    // {
    //   contacts: [
    //     { name: 'John Doe', phone: '5551234567', relationship: 'family' },
    //     { name: 'Jane Smith', phone: '5559876543', relationship: 'friend' },
    //   ]
    // }
  }
}
```

## Template Field Concept

The key concept is that the `fields` array contains a **template** (typically one field definition):

- **Flat arrays**: Template is a leaf field → creates `[value1, value2]`
- **Object arrays**: Template is a group field → creates `[{...}, {...}]`

When you add an array item via the event bus, the template is cloned and a new instance is created with the appropriate default value.

## Nesting Constraints

Array fields can be used within:

- Pages (top-level container)
- Rows (for horizontal layouts)
- Groups (for nested arrays within objects)

Arrays **cannot** contain:

- Other array fields (no nested arrays)
- Page fields

## Allowed Children (as template)

Arrays can use these field types as templates:

- Leaf fields (input, select, checkbox, etc.) → creates flat arrays
- Group fields → creates object arrays
- Row fields → for horizontal layouts within each array item

See [Type Safety & Inference](../core/type-safety) for details on how arrays affect type inference.

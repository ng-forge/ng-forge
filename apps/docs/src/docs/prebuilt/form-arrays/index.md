Arrays create dynamic collections of field values. The fields array defines a **template** that is cloned for each array item.

## Interactive Demo

<iframe src="http://localhost:4201/#/examples/array" class="example-frame" title="Array Field Demo"></iframe>

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

For arrays of objects with nested structure, use a group field as the template:

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [{
    key: 'contact',
    type: 'group',
    fields: [
      { key: 'name', type: 'input', label: 'Name', value: '' },
      { key: 'phone', type: 'input', label: 'Phone', value: '' }
    ]
  }],
}
```

This creates an array of nested objects (note the group key creates the nesting):

```typescript
{
  contacts: [{ contact: { name: 'John Doe', phone: '5551234567' } }, { contact: { name: 'Jane Smith', phone: '5559876543' } }];
}
```

For flat object arrays without nesting, use a row as the template instead (rows don't add nesting).

## Array vs Group

- **Groups** create nested objects with keys: `{ address: { street: '', city: '' } }`
- **Flat Arrays** create lists of values: `{ tags: ['value1', 'value2'] }`
- **Object Arrays** create lists of objects: `{ items: [{name: ''}, {name: ''}] }`

## Dynamic Add/Remove

### Declarative Approach (Recommended)

Use button field types directly in your form configuration for declarative array manipulation:

| Button Type        | Placement        | Description                                      |
| ------------------ | ---------------- | ------------------------------------------------ |
| `addArrayItem`     | Outside array    | Appends a new item to the end of the array       |
| `prependArrayItem` | Outside array    | Inserts a new item at the beginning of the array |
| `insertArrayItem`  | Outside array    | Inserts a new item at a specific index           |
| `removeArrayItem`  | Inside each item | Removes the current item from the array          |
| `popArrayItem`     | Outside array    | Removes the last item from the array             |
| `shiftArrayItem`   | Outside array    | Removes the first item from the array            |

**Note:** Add/prepend/insert buttons require a `template` property defining the new item structure and should be placed outside the array. Remove buttons go inside each item and don't need a template. Pop/shift buttons should be placed outside the array and require an `arrayKey` property.

```typescript
// Define the template for array items
const contactTemplate = {
  key: 'contact',
  type: 'row',
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    { key: 'phone', type: 'input', label: 'Phone' },
    // Remove button inside each item (no template needed)
    { key: 'remove', type: 'removeArrayItem', label: 'Remove' },
  ],
};

// Form configuration
{
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [contactTemplate],
    },
    // Add button outside the array (requires template and arrayKey)
    {
      key: 'addContact',
      type: 'addArrayItem',
      label: 'Add Contact',
      arrayKey: 'contacts',
      template: [contactTemplate],
    },
  ];
}
```

### Programmatic Approach

For more control, use the event bus with the `arrayEvent` builder:

```typescript
import { EventBus, arrayEvent } from '@ng-forge/dynamic-forms';

// Inject the event bus
eventBus = inject(EventBus);

// Add item to end of array (most common)
addItem() {
  this.eventBus.dispatch(arrayEvent('tags').append());
}

// Add item to beginning of array
prependItem() {
  this.eventBus.dispatch(arrayEvent('tags').prepend());
}

// Add item at specific index
addItemAt(index: number) {
  this.eventBus.dispatch(arrayEvent('tags').insertAt(index));
}

// Remove last item
removeLastItem() {
  this.eventBus.dispatch(arrayEvent('tags').pop());
}

// Remove first item
removeFirstItem() {
  this.eventBus.dispatch(arrayEvent('tags').shift());
}

// Remove item at specific index
removeItemAt(index: number) {
  this.eventBus.dispatch(arrayEvent('tags').removeAt(index));
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
import { DynamicForm, EventBus, arrayEvent } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-tags-form',
  imports: [DynamicForm],
  template: `
    <form [dynamic-form]="formConfig"></form>
    <button (click)="addTag()">Add Tag</button>
  `,
})
export class TagsFormComponent {
  private eventBus = inject(EventBus);

  formConfig = {
    fields: [
      // Note: Array fields don't support the 'label' property.
      // Use a text field above if you need a section header.
      {
        key: 'tags',
        type: 'array',
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
    this.eventBus.dispatch(arrayEvent('tags').append());
  }

  removeTag(index: number) {
    this.eventBus.dispatch(arrayEvent('tags').removeAt(index));
  }
}
```

## Complete Example: Object Array

Here's a complete working example of an object array field with validation:

```typescript
import { Component, inject } from '@angular/core';
import { DynamicForm, EventBus, arrayEvent } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-contacts-form',
  imports: [DynamicForm],
  template: `
    <form [dynamic-form]="formConfig"></form>
    <button (click)="addContact()">Add Contact</button>
  `,
})
export class ContactsFormComponent {
  private eventBus = inject(EventBus);

  formConfig = {
    fields: [
      // Note: Array fields don't support the 'label' property.
      // Use a text field above if you need a section header.
      {
        key: 'contacts',
        type: 'array',
        fields: [
          {
            key: 'contact',
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
    this.eventBus.dispatch(arrayEvent('contacts').append());
  }

  removeContact(index: number) {
    this.eventBus.dispatch(arrayEvent('contacts').removeAt(index));
  }
}
```

## Template Field Concept

The key concept is that the `fields` array contains a **template** (typically one field definition):

- **Flat arrays**: Template is a leaf field -> creates `[value1, value2]`
- **Object arrays**: Template is a group field with key -> creates `[{groupKey: {...}}, ...]`
- **Flat object arrays**: Template is a row field -> creates `[{...}, {...}]` (no nesting)

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

- Leaf fields (input, select, checkbox, etc.) -> creates flat arrays
- Group fields with key -> creates nested object arrays `[{groupKey: {...}}, ...]`
- Row fields -> creates flat object arrays `[{...}, {...}]` (rows don't add nesting)

See [Type Safety & Inference](../advanced/type-safety/basics) for details on how arrays affect type inference.

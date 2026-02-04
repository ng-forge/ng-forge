Arrays create dynamic collections of field values. Each item in the `fields` array defines **one array item** with its structure and initial values.

## Interactive Demo

<iframe src="http://localhost:4201/#/examples/array" class="example-frame" title="Array Field Demo"></iframe>

## Structure Overview

The `fields` property uses a **nested array structure**: `fields: FieldDef[][]`

- **Outer array**: Each element represents one initial array item
- **Inner array**: Field definitions for that item (with initial values via `value` property)

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [
    // Item 0
    [
      { key: 'name', type: 'input', label: 'Name', value: 'Alice' },
      { key: 'email', type: 'input', label: 'Email', value: 'alice@example.com' }
    ],
    // Item 1
    [
      { key: 'name', type: 'input', label: 'Name', value: 'Bob' },
      { key: 'email', type: 'input', label: 'Email', value: 'bob@example.com' }
    ]
  ]
}
```

This creates the form value:

```typescript
{
  contacts: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ];
}
```

## Empty Arrays (No Initial Items)

For arrays that start empty and are populated via buttons:

```typescript
{
  key: 'tags',
  type: 'array',
  fields: []  // No initial items - user adds via button
}
```

## Initial Values

Initial values are defined directly on each field via the `value` property - no separate `initialValue` is needed:

```typescript
{
  key: 'emails',
  type: 'array',
  fields: [
    // One initial item with pre-filled value
    [
      { key: 'email', type: 'input', label: 'Email', value: 'primary@example.com' }
    ]
  ]
}
```

## Flat Arrays (Primitive Values)

For simple arrays of primitive values, use a leaf field in each item:

```typescript
{
  key: 'tags',
  type: 'array',
  fields: [
    [{ key: 'tag', type: 'input', label: 'Tag', value: 'featured' }],
    [{ key: 'tag', type: 'input', label: 'Tag', value: 'popular' }]
  ]
}
```

This creates a flat array in the form value:

```typescript
{
  tags: ['featured', 'popular'];
}
```

## Object Arrays (Multiple Fields per Item)

For arrays of objects with multiple fields, include multiple field definitions per item:

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [
    [
      { key: 'name', type: 'input', label: 'Name', value: '' },
      { key: 'phone', type: 'input', label: 'Phone', value: '' }
    ]
  ]
}
```

This creates an array of objects:

```typescript
{
  contacts: [{ name: '', phone: '' }];
}
```

## Nested Object Arrays (Using Groups)

For arrays with nested object structure, use a group field:

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [
    [
      {
        key: 'contact',
        type: 'group',
        fields: [
          { key: 'name', type: 'input', label: 'Name', value: '' },
          { key: 'phone', type: 'input', label: 'Phone', value: '' }
        ]
      }
    ]
  ]
}
```

This creates an array of nested objects (note the group key creates the nesting):

```typescript
{
  contacts: [{ contact: { name: '', phone: '' } }];
}
```

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

**Important:** Add/prepend/insert buttons **require** a `template` property defining the new item structure. There is no fallback to the array's `fields[0]` - each button must explicitly define what structure to add.

```typescript
// Define the template for new array items
const contactTemplate = [
  { key: 'name', type: 'input', label: 'Name' },
  { key: 'phone', type: 'input', label: 'Phone' },
  // Remove button inside each item (no template needed)
  { key: 'remove', type: 'removeArrayItem', label: 'Remove' },
];

// Form configuration
{
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [], // Start empty
    },
    // Add button outside the array (requires template and arrayKey)
    {
      key: 'addContact',
      type: 'addArrayItem',
      label: 'Add Contact',
      arrayKey: 'contacts',
      template: contactTemplate, // REQUIRED - defines what to add
    },
  ];
}
```

### Programmatic Approach

For more control, use the event bus with the `arrayEvent` builder. **Note:** When using the programmatic approach, you must provide a template:

```typescript
import { EventBus, arrayEvent } from '@ng-forge/dynamic-forms';

// Inject the event bus
eventBus = inject(EventBus);

// Define the template for new items
contactTemplate = [
  { key: 'name', type: 'input', label: 'Name', value: '' },
  { key: 'phone', type: 'input', label: 'Phone', value: '' }
];

// Add item to end of array
addItem() {
  this.eventBus.dispatch(
    arrayEvent('contacts').append({ template: this.contactTemplate })
  );
}

// Add item to beginning of array
prependItem() {
  this.eventBus.dispatch(
    arrayEvent('contacts').prepend({ template: this.contactTemplate })
  );
}

// Add item at specific index
addItemAt(index: number) {
  this.eventBus.dispatch(
    arrayEvent('contacts').insertAt(index, { template: this.contactTemplate })
  );
}

// Remove last item (no template needed)
removeLastItem() {
  this.eventBus.dispatch(arrayEvent('contacts').pop());
}

// Remove first item (no template needed)
removeFirstItem() {
  this.eventBus.dispatch(arrayEvent('contacts').shift());
}

// Remove item at specific index (no template needed)
removeItemAt(index: number) {
  this.eventBus.dispatch(arrayEvent('contacts').removeAt(index));
}
```

## Use Cases

Arrays are ideal for:

- Lists of simple values (tags, categories, keywords)
- Repeating form sections (multiple addresses, phone numbers)
- Dynamic collections where items can be added/removed
- Collection-based data structures where order matters

## Complete Example: Flat Array with Initial Values

Here's a complete working example of a flat array field with initial values and dynamic add/remove:

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

  // Template for new tags
  private tagTemplate = [
    {
      key: 'tag',
      type: 'input',
      label: 'Tag',
      value: '',
      required: true,
      minLength: 2,
    },
  ];

  formConfig = {
    fields: [
      {
        key: 'tags',
        type: 'array',
        // Start with two initial tags
        fields: [
          [{ key: 'tag', type: 'input', label: 'Tag', value: 'featured', required: true, minLength: 2 }],
          [{ key: 'tag', type: 'input', label: 'Tag', value: 'popular', required: true, minLength: 2 }],
        ],
      },
    ],
  };

  addTag() {
    this.eventBus.dispatch(arrayEvent('tags').append({ template: this.tagTemplate }));
  }

  removeTag(index: number) {
    this.eventBus.dispatch(arrayEvent('tags').removeAt(index));
  }
}
```

## Complete Example: Object Array with Initial Values

Here's a complete working example of an object array field with initial values and validation:

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

  // Template for new contacts
  private contactTemplate = [
    { key: 'name', type: 'input', label: 'Contact Name', value: '', required: true, minLength: 2 },
    { key: 'phone', type: 'input', label: 'Phone Number', value: '', required: true, pattern: /^\d{10}$/ },
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
  ];

  formConfig = {
    fields: [
      {
        key: 'contacts',
        type: 'array',
        // Start with one pre-filled contact
        fields: [
          [
            { key: 'name', type: 'input', label: 'Contact Name', value: 'John Doe', required: true, minLength: 2 },
            { key: 'phone', type: 'input', label: 'Phone Number', value: '5551234567', required: true, pattern: /^\d{10}$/ },
            {
              key: 'relationship',
              type: 'select',
              label: 'Relationship',
              value: 'family',
              options: [
                { label: 'Family', value: 'family' },
                { label: 'Friend', value: 'friend' },
                { label: 'Colleague', value: 'colleague' },
              ],
            },
          ],
        ],
      },
    ],
  };

  addContact() {
    this.eventBus.dispatch(arrayEvent('contacts').append({ template: this.contactTemplate }));
  }

  removeContact(index: number) {
    this.eventBus.dispatch(arrayEvent('contacts').removeAt(index));
  }
}
```

## Template Requirement

**Important:** When adding items dynamically (via buttons or event bus), you must always provide an explicit `template`. There is no automatic fallback to use the first item's structure.

This design ensures:

- Clear intent - each add operation explicitly defines what to add
- Flexibility - different buttons can add different item structures
- No ambiguity - the array's `fields` only defines initial items, not a "default template"

## Heterogeneous Items

Arrays can have items with different field structures:

```typescript
{
  key: 'entries',
  type: 'array',
  fields: [
    // Item 0: Simple tag
    [{ key: 'tag', type: 'input', label: 'Tag', value: 'simple' }],
    // Item 1: Contact with more fields
    [
      { key: 'name', type: 'input', label: 'Name', value: 'Alice' },
      { key: 'email', type: 'input', label: 'Email', value: 'alice@example.com' }
    ]
  ]
}
```

This flexibility allows each item to have its own structure, though typically all items share the same structure for consistency.

## Nesting Constraints

Array fields can be used within:

- Pages (top-level container)
- Rows (for horizontal layouts)
- Groups (for nested arrays within objects)

Arrays **cannot** contain:

- Other array fields (no nested arrays)
- Page fields

## Allowed Children

Arrays can contain these field types:

- Leaf fields (input, select, checkbox, etc.) -> creates flat or object arrays
- Group fields with key -> creates nested object arrays `[{groupKey: {...}}, ...]`
- Row fields -> creates flat object arrays `[{...}, {...}]` (rows don't add nesting)
- Button fields (for remove operations inside each item)

See [Type Safety & Inference](../advanced/type-safety/basics) for details on how arrays affect type inference.

The simplified array API provides a concise way to define dynamic arrays. Instead of manually specifying each item in `fields`, you provide a `template` for the item structure and a `value` array with initial data. Add and remove buttons are generated automatically.

> **When should I use this?** For most array use cases -- primitive lists, object lists, and standard add/remove workflows -- the simplified API is the right choice. For advanced scenarios like heterogeneous items or custom button placement, see [Form Arrays (Complete)](/prebuilt/form-arrays/complete).

## Interactive Demo

<iframe src="http://localhost:4201/#/examples/simplified-array" class="example-frame" title="Simplified Array Demo"></iframe>

## Overview

The simplified API uses two key properties:

| Property    | Description                                                                |
| ----------- | -------------------------------------------------------------------------- |
| `template`  | Defines the structure of a single array item (single field or field array) |
| `value`     | Initial data array -- each element creates one pre-filled item             |
| `minLength` | Minimum number of array items (form invalid if fewer)                      |
| `maxLength` | Maximum number of array items (form invalid if more)                       |

The `template` shape determines the array variant:

- **Single field** (`template: { ... }`) -- primitive array (e.g. `['tag1', 'tag2']`)
- **Array of fields** (`template: [{ ... }, { ... }]`) -- object array (e.g. `[{ name: 'Jane', phone: '555' }]`)

```typescript
// Discriminant: template is a single field → primitive array
{ key: 'tags', type: 'array', template: { key: 'value', type: 'input', label: 'Tag' } }

// Discriminant: template is an array of fields → object array
{ key: 'contacts', type: 'array', template: [
  { key: 'name', type: 'input', label: 'Name' },
  { key: 'phone', type: 'input', label: 'Phone' },
] }
```

## Primitive Arrays

For simple arrays of scalar values like `['angular', 'typescript']`, provide a single field as the `template` and a flat array as the `value`:

```typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag', required: true },
  value: ['angular', 'typescript'],
}
```

This renders two input fields pre-filled with `'angular'` and `'typescript'`, each with an auto-generated **Remove** button. An **Add** button is placed after the array.

Form value output:

```typescript
{
  tags: ['angular', 'typescript'];
}
```

## Object Arrays

For arrays of objects like `[{ name: 'Jane', phone: '555' }]`, provide an array of fields as the `template` and an array of objects as the `value`:

```typescript
{
  key: 'contacts',
  type: 'array',
  template: [
    { key: 'name', type: 'input', label: 'Contact Name', required: true },
    { key: 'phone', type: 'input', label: 'Phone Number' },
  ],
  value: [
    { name: 'Jane', phone: '555-1234' },
    { name: 'Bob', phone: '555-5678' },
  ],
}
```

Each value object is matched to the template by key. If a value object omits a key, the corresponding field renders without an initial value.

Form value output:

```typescript
{
  contacts: [
    { name: 'Jane', phone: '555-1234' },
    { name: 'Bob', phone: '555-5678' },
  ];
}
```

## Empty Arrays

Omit `value` or set `value: []` to start with an empty array. Users populate it via the auto-generated **Add** button:

```typescript
// No value property — starts empty
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
}

// Explicit empty array — same behavior
{
  key: 'emails',
  type: 'array',
  template: [
    { key: 'address', type: 'input', label: 'Email Address', required: true },
    { key: 'label', type: 'select', label: 'Type', options: [
      { label: 'Work', value: 'work' },
      { label: 'Personal', value: 'personal' },
    ] },
  ],
  value: [],
}
```

## Button Customization

By default, the library generates an **Add** button (label: `"Add"`) after the array and a **Remove** button (label: `"Remove"`) inside each item. You can customize both via `addButton` and `removeButton`:

```typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  value: ['angular'],
  addButton: { label: 'Add Tag', props: { color: 'primary' } },
  removeButton: { label: 'Delete', props: { color: 'warn' } },
}
```

### Button Config Properties

| Property | Type                      | Description                                          |
| -------- | ------------------------- | ---------------------------------------------------- |
| `label`  | `string`                  | Custom label text for the button                     |
| `props`  | `Record<string, unknown>` | Additional properties passed to the button component |

## Button Opt-Out

Set `addButton: false` or `removeButton: false` to suppress the corresponding auto-generated button entirely:

```typescript
// No add button — items are only removable, not addable
{
  key: 'defaultTags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  value: ['featured', 'popular'],
  addButton: false,
}

// No remove button — items are only addable, not removable
{
  key: 'skills',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Skill' },
  value: ['TypeScript'],
  removeButton: false,
}

// No buttons at all — static list rendered from initial values
{
  key: 'readonlyItems',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Item' },
  value: ['A', 'B', 'C'],
  addButton: false,
  removeButton: false,
}
```

When `removeButton: false` is set for a primitive array, each item renders as a plain field without being wrapped in a row. When set for an object array, the remove button is simply omitted from the item's field list.

## Complete Example: Primitive Array

A full working configuration for a tag list with custom buttons:

```typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig: FormConfig = {
  fields: [
    {
      key: 'projectName',
      type: 'input',
      label: 'Project Name',
      required: true,
    },
    {
      key: 'tags',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Tag', required: true, minLength: 2 },
      value: ['angular', 'open-source'],
      addButton: { label: 'Add Tag' },
      removeButton: { label: 'Remove Tag' },
    },
  ],
};

// Form value:
// {
//   projectName: 'My Project',
//   tags: ['angular', 'open-source']
// }
```

## Complete Example: Object Array

A full working configuration for a contact list:

```typescript
import { FormConfig } from '@ng-forge/dynamic-forms';

const formConfig: FormConfig = {
  fields: [
    {
      key: 'teamName',
      type: 'input',
      label: 'Team Name',
      required: true,
    },
    {
      key: 'members',
      type: 'array',
      template: [
        { key: 'name', type: 'input', label: 'Full Name', required: true },
        { key: 'email', type: 'input', label: 'Email', required: true },
        {
          key: 'role',
          type: 'select',
          label: 'Role',
          options: [
            { label: 'Developer', value: 'dev' },
            { label: 'Designer', value: 'design' },
            { label: 'Manager', value: 'manager' },
          ],
        },
      ],
      value: [
        { name: 'Alice', email: 'alice@example.com', role: 'dev' },
        { name: 'Bob', email: 'bob@example.com', role: 'design' },
      ],
      addButton: { label: 'Add Member' },
      removeButton: { label: 'Remove' },
    },
  ],
};

// Form value:
// {
//   teamName: 'Frontend Team',
//   members: [
//     { name: 'Alice', email: 'alice@example.com', role: 'dev' },
//     { name: 'Bob', email: 'bob@example.com', role: 'design' },
//   ]
// }
```

## Form Value Output

The simplified API produces the same form values as the complete API:

| Template Shape  | Value Shape           | Output                                           |
| --------------- | --------------------- | ------------------------------------------------ |
| Single field    | Flat array of scalars | `{ tags: ['angular', 'typescript'] }`            |
| Array of fields | Array of objects      | `{ contacts: [{ name: 'Jane', phone: '555' }] }` |
| Any template    | `[]` or omitted       | `{ items: [] }`                                  |

## Array Size Validation

Use `minLength` and `maxLength` to constrain the number of items. When violated, the form becomes invalid (e.g. submit button is disabled).

```typescript
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  value: ['angular'],
  minLength: 1,
  maxLength: 5,
}
```

Both properties are optional and can be used independently or together.

## Conditional Visibility

Simplified arrays support `logic` for conditional visibility, just like the complete API:

```typescript
{
  key: 'extras',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Extra' },
  value: [],
  logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'showExtras', operator: 'equals', value: false } }],
}
```

## Decision Guide: Simplified vs Complete API

| Scenario                                        | Recommended API |
| ----------------------------------------------- | --------------- |
| Uniform items with standard add/remove          | **Simplified**  |
| Pre-filled values from a data source            | **Simplified**  |
| Custom button labels or styling                 | **Simplified**  |
| Empty array populated by users                  | **Simplified**  |
| Static list (no add/remove buttons)             | **Simplified**  |
| Heterogeneous items (different fields per item) | Complete        |
| Custom button placement (buttons outside array) | Complete        |
| Programmatic control via EventDispatcher        | Complete        |
| Multiple add buttons (append, prepend, insert)  | Complete        |
| Nested arrays inside item templates             | Complete        |

As a rule of thumb: **start with the simplified API**. If you hit a limitation, switch to the [complete API](/prebuilt/form-arrays/complete).

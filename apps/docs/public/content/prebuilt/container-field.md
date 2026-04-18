---
title: Container Fields
slug: prebuilt/container-field
description: 'Wrap a group of fields in a chain of wrapper components — titled sections, cards, collapsible panels — without adding nesting to your form values.'
---

A `container` is a layout-only field that chains [wrapper components](/wrappers/overview) around its children. It gives you a place to stack wrappers without the wrappers having to know about each other — no form nesting, no new form context, values flatten to the parent just like a [row](/prebuilt/form-rows).

## When to reach for a container

- You want one wrapper (or several stacked) around a **group of sibling fields**, not a single field.
- You don't want a new form key or nested value shape — the fields should flatten.
- You want a purely visual grouping: a section header, a card, a collapsible panel.

If you need a nested value shape (e.g. `user.address.street`), use a [form group](/prebuilt/form-groups) instead. If you only need horizontal layout, use a [form row](/prebuilt/form-rows).

## Interactive Demo

<docs-live-example scenario="examples/container-field"></docs-live-example>

## Basic Shape

```typescript
{
  key: 'contactSection',
  type: 'container',
  wrappers: [{ type: 'css', cssClasses: 'card' }],
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', value: '' },
    { key: 'email', type: 'input', label: 'Email', value: '' },
  ],
}
```

The `wrappers` array chains outermost-first: the first wrapper wraps everything else.

```typescript
{
  key: 'section',
  type: 'container',
  wrappers: [
    { type: 'section', title: 'Contact' },   // outermost
    { type: 'css', cssClasses: 'p-4' },       // innermost
  ],
  fields: [/* ... */],
}
```

See [Writing a Wrapper](/wrappers/writing-a-wrapper) for how to build your own, and [Registering and Applying](/wrappers/registering-and-applying) for how to make a custom wrapper type available.

## Container vs row vs group

| Container type                           | Adds form nesting? | Horizontal layout? | Wrapper chain? |
| ---------------------------------------- | ------------------ | ------------------ | -------------- |
| [`row`](/prebuilt/form-rows)             | No (flat)          | Yes (12-col grid)  | Implicit `row` |
| [`group`](/prebuilt/form-groups)         | Yes (under `key`)  | No                 | No             |
| [`container`](/prebuilt/container-field) | No (flat)          | No                 | Yes (explicit) |

A `row` is itself a container-field under the hood — the `row` type resolves to the container renderer with an auto-injected `row` wrapper. Keep writing `type: 'row'` for horizontal layouts; use `type: 'container'` when the wrappers are the point.

## Value Structure

Containers flatten their children into the parent form value:

```typescript
// Config
{
  fields: [
    {
      key: 'contactSection',
      type: 'container',
      wrappers: [{ type: 'section', title: 'Contact' }],
      fields: [
        { key: 'firstName', type: 'input', value: '' },
        { key: 'email', type: 'input', value: '' },
      ],
    },
  ];
}

// Form value (flat — no `contactSection` key)
{
  firstName: 'Ada',
  email: 'ada@example.com',
}
```

The `key` on the container itself is used for DOM id / test selectors only. It never appears in the form value.

## Nesting Rules

Containers follow the same rules as rows — they are layout-only.

**Containers can appear inside:**

- The top-level form
- Pages
- Groups
- Array items

**Containers cannot appear inside:**

- Rows
- Other containers _(treat each container as a single wrapping layer — stack wrappers on one container instead)_

**Containers can contain:**

- Leaf fields (`input`, `select`, `checkbox`, …)
- Group fields (for nested data)
- Array fields (for repeating sections)
- Rows (for horizontal layout within the container)

## Conditional Visibility

Like other containers, `container` supports the `logic` property for conditional show/hide:

```typescript
{
  key: 'shippingSection',
  type: 'container',
  wrappers: [{ type: 'section', title: 'Shipping' }],
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'sameAsBilling',
      operator: 'equals',
      value: true,
    },
  }],
  fields: [
    { key: 'street', type: 'input', value: '' },
    { key: 'city', type: 'input', value: '' },
  ],
}
```

Only `'hidden'` is supported as a logic type on containers. See [Conditional Logic](/dynamic-behavior/conditional-logic) for the full condition surface.

## Complete Example

```typescript
import { Component } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-profile-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="formConfig"></form>`,
})
export class ProfileFormComponent {
  formConfig = {
    fields: [
      {
        key: 'identitySection',
        type: 'container',
        wrappers: [{ type: 'section', title: 'Identity' }],
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', value: '', required: true },
          { key: 'lastName', type: 'input', label: 'Last Name', value: '', required: true },
        ],
      },
      {
        key: 'contactSection',
        type: 'container',
        wrappers: [{ type: 'section', title: 'Contact' }],
        fields: [
          { key: 'email', type: 'input', label: 'Email', value: '', email: true },
          { key: 'phone', type: 'input', label: 'Phone', value: '' },
        ],
      },
      { key: 'submit', type: 'submit', label: 'Save' },
    ],
  };
}
```

The resulting form value is flat — containers contribute structure to the UI, not the data:

```typescript
{
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '',
}
```

## Next Steps

- **[Wrappers Overview](/wrappers/overview)** — what wrappers are and when to use them
- **[Writing a Wrapper](/wrappers/writing-a-wrapper)** — build your own wrapper component
- **[Registering and Applying](/wrappers/registering-and-applying)** — make a custom wrapper type available
- **[Form Rows](/prebuilt/form-rows)** — horizontal layout without a wrapper chain
- **[Form Groups](/prebuilt/form-groups)** — add a nested value shape instead of flattening

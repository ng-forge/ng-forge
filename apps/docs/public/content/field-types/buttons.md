---
title: Buttons
slug: field-types/buttons
description: 'Submit, reset, custom button, navigation, and array manipulation button field types for ng-forge dynamic forms. Configure form actions, multi-step navigation, array add/remove operations, and adapter-specific styling.'
---

Action fields for form submission, multi-step navigation, and array manipulation.

> All button types share the same adapter-specific props for styling (color, variant, size, etc.). The props listed under **Adapter Props** apply to every button type on this page.

## submit

Renders a submit button that triggers form submission. Automatically disabled when the form is invalid.

```typescript
{
  key: 'submit',
  type: 'submit',
  label: 'Create Account',
  props: {
    color: 'primary',     // adapter-specific
  }
}
```

**Core Properties:**

- `label`: Button text (a top-level field property, not in props)
- `disabled`: Whether the button is disabled (a top-level field property, not in props)

#### Adapter Props

<docs-adapter-props field="submit"></docs-adapter-props>

<docs-live-example scenario="examples/button" hideForCustom="true" showHeading="true"></docs-live-example>

## button

Generic action button. Dispatches a form `event` when clicked; subscribe to the event on the form to handle the click.

```typescript
import { FormResetEvent } from '@ng-forge/dynamic-forms';

{
  key: 'resetBtn',
  type: 'button',
  label: 'Reset',
  event: FormResetEvent,
  props: {
    type: 'button',   // HTML button type: 'button' | 'submit' | 'reset'
  }
}
```

**Core Properties:**

- `event`: Form event constructor dispatched on click (e.g. `FormResetEvent`, `FormClearEvent`, or a custom `FormEvent` subclass). **Required**
- `label`: Button text

#### Adapter Props

<docs-adapter-props field="button"></docs-adapter-props>

## next

Advances to the next page in a multi-step form. Only valid inside a `page` container. Automatically disabled while the current page is invalid, so users cannot advance until it is valid.

```typescript
{
  key: 'nextBtn',
  type: 'next',
  label: 'Continue',
}
```

> This field type only makes sense inside a [Form Pages](/prebuilt/form-pages) container. It is ignored at the root level.

#### Adapter Props

<docs-adapter-props field="next"></docs-adapter-props>

## previous

Navigates back to the previous page in a multi-step form. Only valid inside a `page` container. Does not trigger validation.

```typescript
{
  key: 'prevBtn',
  type: 'previous',
  label: 'Back',
}
```

> This field type only makes sense inside a [Form Pages](/prebuilt/form-pages) container. It is ignored at the root level.

#### Adapter Props

<docs-adapter-props field="previous"></docs-adapter-props>

## Array Buttons

Button types for declarative array manipulation. See [Form Arrays (Complete)](/prebuilt/form-arrays/complete) for full usage details and interactive examples.

> The kebab-case type names below (`add-array-item`, `remove-array-item`, and the rest) are canonical. The earlier camelCase spellings (`addArrayItem`, `removeArrayItem`) are still accepted as deprecated aliases for backward compatibility.

### add-array-item

Appends a new item to the end of the target array.

```typescript
{
  key: 'addContact',
  type: 'add-array-item',
  label: 'Add Contact',
  arrayKey: 'contacts',
  template: [
    { key: 'name', type: 'input', label: 'Name' },
    { key: 'email', type: 'input', label: 'Email' },
  ],
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (required if placed outside the array)
- `template`: Field definition(s) for the new item: a single `FieldDef` for primitive items, an array of `FieldDef` for object items (**required**)

### prepend-array-item

Inserts a new item at the beginning of the target array.

```typescript
{
  key: 'prependContact',
  type: 'prepend-array-item',
  label: 'Add to Top',
  arrayKey: 'contacts',
  template: [
    { key: 'name', type: 'input', label: 'Name' },
  ],
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (required if placed outside the array)
- `template`: Field definition(s) for the new item (**required**)

### insert-array-item

Inserts a new item at a specific index in the target array.

```typescript
{
  key: 'insertContact',
  type: 'insert-array-item',
  label: 'Insert at Position 1',
  arrayKey: 'contacts',
  index: 1,
  template: [
    { key: 'name', type: 'input', label: 'Name' },
  ],
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (required if placed outside the array)
- `template`: Field definition(s) for the new item (**required**)
- `index`: Position at which to insert the new item (**required**)

### remove-array-item

Removes the current item from the array. Typically placed inside each array item.

```typescript
{
  key: 'remove',
  type: 'remove-array-item',
  label: 'Remove',
  props: { color: 'warn' },
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (optional when placed inside the array, where it is inferred automatically)

### pop-array-item

Removes the last item from the target array.

```typescript
{
  key: 'removeLast',
  type: 'pop-array-item',
  label: 'Remove Last',
  arrayKey: 'contacts',
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (**required**)

### shift-array-item

Removes the first item from the target array.

```typescript
{
  key: 'removeFirst',
  type: 'shift-array-item',
  label: 'Remove First',
  arrayKey: 'contacts',
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (**required**)

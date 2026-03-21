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

**Core Props:**

- `label`: Button text (also set via top-level `label`)
- `disabled`: Whether the button is disabled

#### Adapter Props

<docs-adapter-props field="submit"></docs-adapter-props>

#### Example

<docs-live-example scenario="examples/button" hideForCustom="true"></docs-live-example>

## button

Generic action button for custom event handling.

```typescript
{
  key: 'resetBtn',
  type: 'button',
  label: 'Reset',
  props: {
    onClick: (context) => context.form.reset(),
  }
}
```

**Core Props:**

- `label`: Button text
- `onClick`: Callback invoked when the button is clicked, receives the form context

#### Adapter Props

<docs-adapter-props field="button"></docs-adapter-props>

## next

Advances to the next page in a multi-step form. Only valid inside a `page` container. Validates the current page before advancing.

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

### addArrayItem

Appends a new item to the end of the target array.

```typescript
{
  key: 'addContact',
  type: 'addArrayItem',
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
- `template`: Field definition(s) for the new item — single `FieldDef` for primitive items, array of `FieldDef` for object items (**required**)

### prependArrayItem

Inserts a new item at the beginning of the target array.

```typescript
{
  key: 'prependContact',
  type: 'prependArrayItem',
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

### insertArrayItem

Inserts a new item at a specific index in the target array.

```typescript
{
  key: 'insertContact',
  type: 'insertArrayItem',
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

### removeArrayItem

Removes the current item from the array. Typically placed inside each array item.

```typescript
{
  key: 'remove',
  type: 'removeArrayItem',
  label: 'Remove',
  props: { color: 'warn' },
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (optional when placed inside the array — automatically inferred)

### popArrayItem

Removes the last item from the target array.

```typescript
{
  key: 'removeLast',
  type: 'popArrayItem',
  label: 'Remove Last',
  arrayKey: 'contacts',
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (**required**)

### shiftArrayItem

Removes the first item from the target array.

```typescript
{
  key: 'removeFirst',
  type: 'shiftArrayItem',
  label: 'Remove First',
  arrayKey: 'contacts',
}
```

**Core Properties:**

- `arrayKey`: Key of the target array field (**required**)

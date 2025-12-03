---
title: Basics
keyword: ConditionalLogicBasicsPage
---

Control field behavior dynamically based on form state. ng-forge provides a declarative API for conditional visibility, required state, and readonly state that maps directly to Angular's signal forms.

## Signal Forms Integration

The library integrates with Angular's signal forms logic functions:

```typescript
import { hidden, readonly, required } from '@angular/forms/signals';
```

All conditional logic configuration is applied using these functions, providing:

- **Reactive updates** when form state changes
- **Type-safe** conditional expressions
- **Automatic re-evaluation** on dependencies
- **Integration** with form validation state

## Static Properties

Use simple boolean properties for fields with fixed states.

### hidden

Hide a field from view (field still participates in form state):

```typescript
{
  key: 'internalId',
  type: 'input',
  value: '',
  label: 'Internal ID',
  hidden: true,
}
```

The field is hidden from the UI but still included in the form value.

### disabled

Disable user interaction:

```typescript
{
  key: 'systemField',
  type: 'input',
  value: 'auto-generated',
  label: 'System Field',
  disabled: true,
}
```

**Note:** The `disabled` property is handled at the component level and does not use signal forms logic functions. It's a static UI property that prevents user interaction.

### readonly

Make a field read-only (displays value but prevents modification):

```typescript
{
  key: 'createdAt',
  type: 'input',
  value: '2024-01-15',
  label: 'Created Date',
  readonly: true,
}
```

## Dynamic Conditional Logic

For conditional behavior based on form state, use the `logic` array with `LogicConfig` objects.

```typescript
interface LogicConfig {
  /** Logic type */
  type: 'hidden' | 'readonly' | 'disabled' | 'required';

  /** Boolean expression, static value, or form state condition */
  condition: ConditionalExpression | boolean | FormStateCondition;
}
```

`FormStateCondition` values (`'formInvalid'`, `'formSubmitting'`, `'pageInvalid'`) are primarily used for button disabled logic.

### Conditional Visibility (hidden)

Show or hide fields based on other field values.

#### Show Email When Contact Method is Email

```typescript
{
  key: 'contactMethod',
  type: 'select',
  value: '',
  options: [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ],
}
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'contactMethod',
      operator: 'notEquals',
      value: 'email',
    },
  }],
}
```

When `contactMethod !== 'email'`, the email field is hidden.

### Conditional Required

Make fields required based on conditions.

#### Tax ID Required for Business Accounts

```typescript
{
  key: 'accountType',
  type: 'radio',
  value: 'personal',
  options: [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
  ],
}
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

### Conditional Readonly

Make fields read-only based on conditions.

#### Lock Field After Submission

```typescript
{
  key: 'status',
  type: 'select',
  value: 'draft',
  options: [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
  ],
}
{
  key: 'documentNumber',
  type: 'input',
  value: '',
  label: 'Document Number',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'fieldValue',
      fieldPath: 'status',
      operator: 'equals',
      value: 'submitted',
    },
  }],
}
```

Once status is "submitted", the document number becomes read-only.

## Basic Conditional Expression

The most common conditional expression checks a specific field's value:

```typescript
{
  type: 'fieldValue',
  fieldPath: 'fieldKey',
  operator: 'equals',
  value: 'expectedValue',
}
```

**Components:**

- `type: 'fieldValue'` - Check a specific field
- `fieldPath` - The field key to check
- `operator` - Comparison operator (see [Expressions](../expressions/))
- `value` - Value to compare against

## Quick Example

Show a field only when another field has a specific value:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'notEquals',
        value: 'email',
      },
    },
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'equals',
        value: 'email',
      },
    },
  ],
}
```

This field is hidden unless `contactMethod === 'email'`, and required when visible. See [Examples](./examples/) for complete form implementations.

## When Logic Runs

Conditional logic is evaluated:

- **On form value change** - Any time a dependent field changes
- **On initialization** - When the form is created
- **Reactively** - Uses Angular's signal forms for automatic updates

### Evaluation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIC EVALUATION FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Form Value Changes                                         │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                       │
│  │ Signal Updates  │◄──── Angular's reactive system        │
│  └────────┬────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Evaluate logic  │                                       │
│  │    conditions   │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│     ┌─────┴─────┐                                          │
│     ▼           ▼                                          │
│  ┌──────┐   ┌──────┐                                       │
│  │ true │   │false │                                       │
│  └──┬───┘   └──┬───┘                                       │
│     │          │                                            │
│     ▼          ▼                                            │
│  Apply      Remove                                          │
│  effect     effect                                          │
│  (hide,     (show,                                          │
│  require,   optional,                                       │
│  readonly)  editable)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps

- **[Conditional Expressions](../expressions/)** - All operators and expression types
- **[Examples](../examples/)** - Real-world patterns
- **[Validation](../../validation/)** - Conditional validation
- **[Type Safety](../../type-safety/)** - TypeScript integration

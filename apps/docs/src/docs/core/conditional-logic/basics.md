# Conditional Logic Basics

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

  /** Boolean expression or static value */
  condition: ConditionalExpression | boolean;

  /** Optional error message for conditional required */
  errorMessage?: string;
}
```

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
    errorMessage: 'Tax ID is required for business accounts',
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
- `operator` - Comparison operator (see [Expressions](/core-concepts/conditional-logic/expressions))
- `value` - Value to compare against

## Quick Example

Contact form that shows different fields based on contact method:

```typescript
const config = {
  fields: [
    {
      key: 'contactMethod',
      type: 'select',
      value: '',
      label: 'Preferred Contact Method',
      required: true,
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'mail', label: 'Postal Mail' },
      ],
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      email: true,
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'notEquals',
          value: 'email',
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'equals',
          value: 'email',
        },
      }],
    },
    {
      key: 'phone',
      type: 'input',
      value: '',
      label: 'Phone Number',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'notEquals',
          value: 'phone',
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'equals',
          value: 'phone',
        },
      }],
      props: { type: 'tel' },
    },
    {
      key: 'address',
      type: 'input',
      value: '',
      label: 'Mailing Address',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'notEquals',
          value: 'mail',
        },
      }, {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'equals',
          value: 'mail',
        },
      }],
    },
  ],
} as const satisfies FormConfig;
```

This form shows only the relevant contact field based on the user's selection.

## When Logic Runs

Conditional logic is evaluated:
- **On form value change** - Any time a dependent field changes
- **On initialization** - When the form is created
- **Reactively** - Uses Angular's signal forms for automatic updates

## Next Steps

- **[Conditional Expressions](/core-concepts/conditional-logic/expressions)** - All operators and expression types
- **[Examples](/core-concepts/conditional-logic/examples)** - Real-world patterns
- **[Validation](/core-concepts/validation)** - Conditional validation
- **[Type Safety](/core-concepts/type-safety)** - TypeScript integration

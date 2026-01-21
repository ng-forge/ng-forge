---
title: Basics
keyword: DerivationBasicsPage
---

Automatically compute and set field values based on other form values. Derivations enable calculated fields, auto-fill patterns, and value transformations.

## Quick Start

Set a field's value based on another field:

```typescript
{
  key: 'total',
  type: 'input',
  value: 0,
  label: 'Total',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'total',
    expression: 'formValue.quantity * formValue.unitPrice',
  }],
}
```

When `quantity` or `unitPrice` changes, `total` is automatically recalculated.

## Derivation Types

### Expression-Based

Use JavaScript expressions with access to `formValue`:

```typescript
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'fullName',
    expression: 'formValue.firstName + " " + formValue.lastName',
  }],
}
```

**Available variables:**

- `formValue` - Object containing all form field values

### Static Value

Set a constant value when a condition is met:

```typescript
{
  key: 'phonePrefix',
  type: 'input',
  label: 'Phone Prefix',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'phonePrefix',
    value: '+1',
    condition: {
      type: 'fieldValue',
      fieldPath: 'country',
      operator: 'equals',
      value: 'USA',
    },
  }],
}
```

### Custom Function

Use a registered function for complex logic:

```typescript
// In form config
customFnConfig: {
  derivations: {
    calculateTax: (ctx) => ctx.formValue.subtotal * getTaxRate(ctx.formValue.state),
  },
},
fields: [
  {
    key: 'tax',
    type: 'input',
    logic: [{
      type: 'derivation',
      targetField: 'tax',
      functionName: 'calculateTax',
    }],
  },
],
```

## Trigger Timing

Control when derivations evaluate:

| Trigger     | Description                           | Use Case                              |
| ----------- | ------------------------------------- | ------------------------------------- |
| `onChange`  | Immediately on value change (default) | Computed totals, conditional prefixes |
| `debounced` | After value stabilizes                | Self-transforms, format masking       |

### Debounced Derivations

Use `trigger: 'debounced'` for self-transforming fields to avoid interrupting the user while typing:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  logic: [{
    type: 'derivation',
    targetField: 'email',
    expression: 'formValue.email.toLowerCase()',
    trigger: 'debounced',
    debounceMs: 500, // optional, defaults to 500
  }],
}
```

The transformation applies after the user stops typing for 500ms.

## Conditional Derivations

Only apply derivations when conditions are met:

```typescript
{
  key: 'currency',
  type: 'input',
  label: 'Currency',
  readonly: true,
  logic: [
    {
      type: 'derivation',
      targetField: 'currency',
      value: 'USD',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'equals',
        value: 'USA',
      },
    },
    {
      type: 'derivation',
      targetField: 'currency',
      value: 'EUR',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'equals',
        value: 'Germany',
      },
    },
  ],
}
```

Multiple derivations targeting the same field are evaluated in order.

## Dependencies

### Automatic Detection

For expressions, dependencies are automatically extracted:

```typescript
{
  key: 'total',
  type: 'input',
  label: 'Total',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'total',
    expression: 'formValue.quantity * formValue.unitPrice',
    // Automatically depends on: quantity, unitPrice
  }],
}
```

### Explicit Dependencies

For custom functions, specify dependencies explicitly:

```typescript
{
  key: 'discount',
  type: 'input',
  label: 'Discount',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: 'discount',
    functionName: 'calculateDiscount',
    dependsOn: ['total', 'memberLevel'],
  }],
}
```

Without `dependsOn`, custom functions re-evaluate on any form change.

## Complete Example

```typescript
const orderForm = {
  fields: [
    {
      key: 'quantity',
      type: 'input',
      value: 1,
      label: 'Quantity',
      props: { type: 'number' },
    },
    {
      key: 'unitPrice',
      type: 'input',
      value: 10,
      label: 'Unit Price',
      props: { type: 'number' },
    },
    {
      key: 'subtotal',
      type: 'input',
      value: 0,
      label: 'Subtotal',
      readonly: true,
      logic: [
        {
          type: 'derivation',
          targetField: 'subtotal',
          expression: 'formValue.quantity * formValue.unitPrice',
        },
      ],
    },
    {
      key: 'tax',
      type: 'input',
      value: 0,
      label: 'Tax (10%)',
      readonly: true,
      logic: [
        {
          type: 'derivation',
          targetField: 'tax',
          expression: 'formValue.subtotal * 0.1',
        },
      ],
    },
    {
      key: 'total',
      type: 'input',
      value: 0,
      label: 'Total',
      readonly: true,
      logic: [
        {
          type: 'derivation',
          targetField: 'total',
          expression: 'formValue.subtotal + formValue.tax',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Next Steps

- **[Advanced Derivations](./advanced/)** - Array derivations, debugging, bidirectional patterns
- **[Conditional Logic](../conditional-logic/)** - Control field visibility and state
- **[Validation](../../core/validation/)** - Field validation rules

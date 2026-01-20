---
title: Value Derivation
keyword: ValueDerivationExamplePage
---

This example demonstrates automatic value derivation using expressions. Watch how changing input values automatically updates calculated fields.

## Live Demo

{{ NgDocActions.demo("ValueDerivationDemoComponent", { container: false }) }}

## How It Works

### Numeric Calculations

The order calculator shows chained derivations:

1. **Subtotal** = Quantity × Unit Price
2. **Tax** = Subtotal × Tax Rate / 100
3. **Total** = Subtotal + Tax

When you change any input, all dependent fields update automatically.

### String Concatenation

The name fields demonstrate string derivation:

- **Full Name** = First Name + " " + Last Name

## Key Patterns

### Defining Derivations

Derivations are defined in the `logic` array of the source field:

```typescript
{
  key: 'quantity',
  type: 'input',
  value: 1,
  logic: [{
    type: 'derivation',
    targetField: 'subtotal',
    expression: 'formValue.quantity * formValue.unitPrice',
  }],
}
```

### Multiple Sources, Multiple Targets

When a source field affects multiple derived values (directly or through a chain), include ALL derivations on that source field. The derivation system processes them in dependency order within a single cycle:

```typescript
// On quantity field - includes ALL downstream derivations
logic: [
  { type: 'derivation', targetField: 'subtotal', expression: 'formValue.quantity * formValue.unitPrice' },
  { type: 'derivation', targetField: 'tax', expression: 'formValue.subtotal * formValue.taxRate / 100' },
  { type: 'derivation', targetField: 'total', expression: 'formValue.subtotal + formValue.tax' },
];

// On unitPrice field - same derivations since it also affects subtotal
logic: [
  { type: 'derivation', targetField: 'subtotal', expression: 'formValue.quantity * formValue.unitPrice' },
  { type: 'derivation', targetField: 'tax', expression: 'formValue.subtotal * formValue.taxRate / 100' },
  { type: 'derivation', targetField: 'total', expression: 'formValue.subtotal + formValue.tax' },
];

// On taxRate field - only affects tax and total
logic: [
  { type: 'derivation', targetField: 'tax', expression: 'formValue.subtotal * formValue.taxRate / 100' },
  { type: 'derivation', targetField: 'total', expression: 'formValue.subtotal + formValue.tax' },
];
```

### Derivation Flow

```
quantity ───┬── subtotal ─┬── tax ─┬── total
            │             │        │
unitPrice ──┘             │        │
                          │        │
taxRate ──────────────────┴────────┘
```

Each source field defines derivations for all fields downstream in its dependency chain.

## Related

- **[Value Derivation Basics](../../core/derivation/)** - Core concepts and syntax
- **[Advanced Derivations](../../core/derivation/advanced/)** - Array derivations, debugging, bidirectional patterns

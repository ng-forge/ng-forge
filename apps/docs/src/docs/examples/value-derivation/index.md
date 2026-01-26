---
title: Value Derivation
keyword: ValueDerivationExamplePage
---

[← Back to Quick Start](/examples)

This example demonstrates automatic value derivation using expressions. Watch how changing input values automatically updates calculated fields.

## Live Demo

<iframe src="http://localhost:4201/#/examples/value-derivation" class="example-frame" title="Value Derivation Demo"></iframe>

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

### Using the `derivation` Shorthand

The simplest way to create a derived field is with the `derivation` property directly on the target field:

```typescript
{
  key: 'subtotal',
  type: 'input',
  disabled: true,
  derivation: 'formValue.quantity * formValue.unitPrice',
}
```

The expression is evaluated whenever its dependencies change. Dependencies are automatically detected from the expression.

### Chained Derivations

Derivations can reference other derived values. The system automatically processes them in the correct order:

```typescript
// subtotal depends on quantity and unitPrice
{ key: 'subtotal', derivation: 'formValue.quantity * formValue.unitPrice' }

// tax depends on subtotal (another derived field)
{ key: 'tax', derivation: 'formValue.subtotal * formValue.taxRate / 100' }

// total depends on both subtotal and tax
{ key: 'total', derivation: 'formValue.subtotal + formValue.tax' }
```

### Derivation Flow

```
quantity ───┐
            ├── subtotal ──┬── tax ──┬── total
unitPrice ──┘              │         │
                           │         │
taxRate ───────────────────┴─────────┘
```

## Related

- **[Value Derivation](../../dynamic-behavior/value-derivation/basics/)** - Core concepts, syntax, array derivations, debugging, and bidirectional patterns

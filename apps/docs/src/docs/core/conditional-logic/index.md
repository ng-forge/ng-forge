Control field visibility, validation, and behavior based on form state.

## Conditional Visibility

Show/hide fields based on other field values:

```typescript
{
  key: 'otherPhone',
  type: 'input',
  label: 'Alternative Phone',
  hide: (model) => model.contactMethod !== 'phone',
}
```

Multiple conditions:

```typescript
{
  key: 'companyName',
  type: 'input',
  label: 'Company Name',
  hide: (model) => !model.isCompany || model.accountType === 'personal',
}
```

## Conditional Required

Make fields required conditionally:

```typescript
{
  key: 'taxId',
  type: 'input',
  label: 'Tax ID',
  required: (model) => model.accountType === 'business',
}
```

## Conditional Validation

Apply validators based on conditions:

```typescript
{
  key: 'phone',
  type: 'input',
  label: 'Phone Number',
  validators: {
    required: (model) => model.contactMethod === 'phone',
    pattern: {
      value: '^[0-9-]+$',
      condition: (model) => !!model.phone,
    },
  },
}
```

## Dependent Fields

Update field properties when another field changes:

```typescript
{
  key: 'shippingAddress',
  type: 'textarea',
  label: 'Shipping Address',
  props: {
    disabled: (model) => model.sameAsBilling,
  },
}
```

## Conditional Options

Change select options dynamically:

```typescript
{
  key: 'city',
  type: 'select',
  label: 'City',
  options: (model) => {
    const state = model.state;
    return CITIES_BY_STATE[state] || [];
  },
}
```

## Field Expressions

Use expressions for complex logic:

```typescript
{
  key: 'discount',
  type: 'input',
  label: 'Discount',
  props: {
    type: 'number',
    max: (model) => {
      if (model.membershipLevel === 'gold') return 30;
      if (model.membershipLevel === 'silver') return 20;
      return 10;
    },
  },
}
```

## Reactive Updates

Form model updates trigger re-evaluation of all conditional logic automatically.

## Best Practices

**Keep logic simple:**

```typescript
// ✓ Clear, readable
hide: (model) => !model.hasCompany;

// ✗ Complex, hard to maintain
hide: (model) => !model.hasCompany && (model.type === 'a' || model.type === 'b') && !model.override;
```

**Extract complex conditions:**

```typescript
function shouldShowCompanyFields(model: FormModel): boolean {
  return model.accountType === 'business' && model.hasEmployees && !model.isSoleProprietor;
}

{
  hide: shouldShowCompanyFields;
}
```

**Avoid circular dependencies:**

```typescript
// ✗ Circular: field A depends on B, B depends on A
{ key: 'a', hide: (m) => !m.b }
{ key: 'b', hide: (m) => !m.a }
```

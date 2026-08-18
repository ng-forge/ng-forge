---
title: Advanced
slug: validation/advanced
description: 'Advanced validation techniques including conditional validators, dynamic min/max values, and cross-field validation in ng-forge dynamic forms.'
---

Advanced validation techniques including conditional validators, dynamic values, and cross-field validation.

## Validators Array

The `validators` array provides fine-grained control over validation behavior:

```typescript
{
  key: 'discount',
  type: 'input',
  value: 0,
  validators: [{
    type: 'required',
  }, {
    type: 'min',
    value: 0,
  }, {
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
  }],
}
```

## Conditional Validators

Activate validators only when conditions are met.

### Based on Field Value

```typescript
{
  key: 'discount',
  type: 'input',
  value: 0,
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
  }],
}
```

The max validator only applies when `discountType === 'percentage'`.

Conditional built-in validators are applied through Angular Signal Forms' native `when` support. While the condition is active, the field exposes its constraint state (for example the `maxlength` attribute and `field().maxLength()`), and error messages can interpolate the constraint with placeholders like `{{max}}` or `{{requiredLength}}`.

### Based on Form Value

Validate against the entire form state:

```typescript
{
  key: 'endDate',
  type: 'datepicker',
  value: null,
  validators: [{
    type: 'required',
    when: {
      type: 'javascript',
      expression: 'formValue.hasEndDate === true',
    },
  }],
}
```

## Dynamic Validator Values

Use JavaScript expressions for dynamic validation:

```typescript
{
  key: 'quantity',
  type: 'input',
  value: 0,
  validators: [{
    type: 'max',
    expression: 'formValue.maxQuantity || 100',
  }],
}
```

The max value comes from `formValue.maxQuantity`, defaulting to 100.

## Multiple Conditional Validators

Combine multiple validators with different conditions:

```typescript
{
  key: 'customerId',
  type: 'input',
  value: '',
  validators: [
    {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'customerType',
        operator: 'equals',
        value: 'existing',
      },
    },
    {
      type: 'pattern',
      value: '^[A-Z0-9]{8}$',
      when: {
        type: 'fieldValue',
        fieldPath: 'customerType',
        operator: 'equals',
        value: 'existing',
      },
    },
  ],
}
```

## Cross-Field Validation

For validators that need to compare multiple fields (like password confirmation or date ranges), use custom validators.

**Quick example using expressions:**

```typescript
{
  key: 'confirmPassword',
  type: 'input',
  validators: [{
    type: 'custom',
    expression: 'fieldValue === formValue.password',
    kind: 'passwordMismatch',
  }],
  validationMessages: {
    passwordMismatch: 'Passwords must match',
  },
}
```

See **[Custom Validators](/validation/custom-validators)** for complete documentation on:

- Expression-based validators (simple, inline expressions)
- Function-based validators (complex, reusable logic)
- Cross-field validation patterns
- FieldContext API for accessing other field values
- Async validators and HTTP validators

## Container-Level Validation

When a rule belongs to a whole subtree rather than to one field, declare `validators` on the `group` or `array` itself. `ctx.value()` then resolves to the container's own value instead of a single field's:

```typescript
// Group: ctx.value() is { dateFrom, dateTo }
{
  key: 'period',
  type: 'group',
  fields: [
    { key: 'dateFrom', type: 'input', label: 'From', props: { type: 'date' } },
    { key: 'dateTo', type: 'input', label: 'To', props: { type: 'date' } },
  ],
  validators: [{ type: 'custom', functionName: 'dateOrder' }],
  validationMessages: { dateOrder: 'The end must not be before the start.' },
}

// Array: ctx.value() is the item list
{
  key: 'periods',
  type: 'array',
  fields: [[
    { key: 'from', type: 'input', label: 'From' },
    { key: 'to', type: 'input', label: 'To' },
  ]],
  validators: [{ type: 'custom', functionName: 'periodOrder' }],
  validationMessages: { periodOrder: 'Every period must end after it starts.' },
}
```

Reach for this over a cross-field expression when:

- The rule spans two fields of the same array row. A validator on a template child cannot see its row sibling, so the array is the only place the rule can live.
- The rule is about the group as a whole. Writing it as an expression on one child forces the group's absolute path into the expression, which then breaks if the group moves.

Containers accept `validators`, `validationMessages`, and `required`. The other leaf shorthands (`email`, `pattern`, `min`, and so on) are value-shaped and have no meaning on a subtree; arrays keep their own `minLength`/`maxLength` for size. `required` behaves differently from the rest: it cascades to descendants rather than validating the container itself, and a descendant's own `required` wins. See [Required Groups](/prebuilt/form-groups#required-groups).

Container validators honour `validateWhenHidden` exactly like leaf validators, so a hidden container does not gate submission. Layout containers (`page`, `row`, `container`) flatten into their parent and have no schema path, so they cannot carry validators at all.

The message renders below the container's content through the built-in `field-errors` wrapper. See [Group-Level Validation](/prebuilt/form-groups#group-level-validation) for how to restyle it.

## Complex Conditional Logic

Combine multiple conditions with AND/OR logic:

```typescript
{
  key: 'businessEmail',
  type: 'input',
  value: '',
  validators: [{
    type: 'required',
    when: {
      type: 'and',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        {
          type: 'fieldValue',
          fieldPath: 'hasTeam',
          operator: 'equals',
          value: true,
        },
      ],
    },
  }],
}
```

## Complete Examples

### Conditional Business Form

```typescript
const config = {
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      value: 'personal',
      options: [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' },
      ],
    },
    {
      key: 'companyName',
      type: 'input',
      value: '',
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
        {
          type: 'minLength',
          value: 2,
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
        {
          type: 'pattern',
          value: '^[0-9]{2}-[0-9]{7}$',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Dynamic Validation Form

Form where validation rules change based on selections:

```typescript
const config = {
  fields: [
    {
      key: 'discountType',
      type: 'select',
      value: '',
      options: [
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed Amount' },
      ],
    },
    {
      key: 'discountValue',
      type: 'input',
      value: 0,
      required: true,
      validators: [
        {
          type: 'min',
          value: 0,
        },
        {
          type: 'max',
          value: 100,
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'percentage',
          },
        },
        {
          type: 'max',
          expression: 'formValue.orderTotal || 1000',
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'fixed',
          },
        },
      ],
      props: { type: 'number' },
    },
  ],
} as const satisfies FormConfig;
```

## Best Practices

**Use shorthand when possible:**

```typescript
// ✅ Good - Simple and clear
{ required: true, email: true }

// ❌ Avoid - Unnecessarily complex
{ validators: [{ type: 'required' }, { type: 'email' }] }
```

**Combine shorthand with validators array:**

```typescript
// ✅ Good - Best of both
{
  required: true,
  email: true,
  validators: [{
    type: 'pattern',
    value: '@company\\.com$',
    when: { /* condition */ },
  }],
}
```

**Keep conditions simple:**

```typescript
// ✅ Good - Easy to understand
when: {
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}

// ❌ Avoid - Overly complex
when: {
  type: 'and',
  conditions: [/* 5 nested conditions */],
}
```

## Related

- **[Validation Basics](/validation/basics)** - Shorthand validators
- **[Validation Reference](/validation/reference)** - Complete API
- **[Conditional Logic](/dynamic-behavior/conditional-logic)** - Field behavior changes
- **[Examples](/examples)** - Real-world patterns

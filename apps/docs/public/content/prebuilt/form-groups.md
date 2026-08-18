---
title: Form Groups
slug: prebuilt/form-groups
description: 'Learn how to nest form fields under a single key using group fields, creating logical data grouping in your dynamic form configuration.'
---

Groups nest form fields under a single key in the form value. This creates logical grouping for form data, not visual grouping.

## Interactive Demo

<docs-live-example scenario="examples/group"></docs-live-example>

## Basic Group

```typescript
{
  type: 'group',
  key: 'address',
  fields: [
    { key: 'street', type: 'input', label: 'Street', value: '' },
    { key: 'city', type: 'input', label: 'City', value: '' },
    { key: 'zip', type: 'input', label: 'ZIP', value: '' },
  ],
}
```

This creates a nested structure in the form value:

```typescript
{
  address: {
    street: '',
    city: '',
    zip: ''
  }
}
```

Groups are for organizing form **data**, not UI. The visual presentation depends on your UI integration (Material, Bootstrap, etc.).

## Complete Example

Here's a complete working example of a group field with validation:

```typescript
import { Component } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-user-profile-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="formConfig"></form>`,
})
export class UserProfileFormComponent {
  formConfig = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        value: '',
        required: true,
      },
      {
        key: 'address',
        type: 'group',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            value: '',
            required: true,
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            value: '',
            required: true,
          },
          {
            key: 'state',
            type: 'input',
            label: 'State',
            value: '',
            required: true,
            maxLength: 2,
          },
          {
            key: 'zip',
            type: 'input',
            label: 'ZIP Code',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
          },
        ],
      },
    ],
  };
}
```

This produces a form value with nested structure:

```typescript
{
  name: 'John Doe',
  address: {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701'
  }
}
```

## Nesting Restrictions

Group fields can be used within:

- Pages (top-level container)
- Rows (for horizontal layouts)
- Array fields (for creating object arrays where each array item is an object)

Groups **cannot** be nested inside:

- Other group fields (no nested groups)

## Allowed Children

Groups can contain:

- Leaf fields (input, select, checkbox, etc.)
- Row fields (for horizontal layouts within the group)
- Array fields (for repeating sections nested under the group's key)

See [Type Safety & Inference](/recipes/type-safety) for details on how groups affect type inference.

## Conditional Visibility

Group containers support the `logic` property to conditionally show or hide the entire group (and all its nested fields) based on form state.

```typescript
{
  key: 'addressGroup',
  type: 'group',
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
    { key: 'street', type: 'input', label: 'Street', value: '' },
    { key: 'city', type: 'input', label: 'City', value: '' },
    { key: 'zip', type: 'input', label: 'ZIP', value: '' },
  ],
}
```

When the group is hidden, all its nested fields are hidden with it. Only `'hidden'` is supported as a logic type on containers (not `required`, `readonly`, or `disabled`).

For all available condition types and operators, see [Conditional Logic](/dynamic-behavior/conditional-logic).

## Required Groups

Setting `required` on a group marks every field inside it as required, so you write the rule once instead of on each child:

```typescript
{
  key: 'address',
  type: 'group',
  required: true,
  fields: [
    { key: 'street', type: 'input', label: 'Street', value: '' },
    { key: 'city', type: 'input', label: 'City', value: '' },
    { key: 'apartment', type: 'input', label: 'Apartment', value: '', required: false },
  ],
}
```

The group supplies a default, and a field that declares its own `required` wins — which is how `apartment` above stays optional. The same applies to a nested group: `required: false` on it opts its whole subtree back out. A field whose requiredness is conditional (`logic: [{ type: 'required', when }]`) keeps its own condition too, rather than being forced true by the cascade.

The cascade reaches through nested groups, rows, and array item templates, and respects `validateWhenHidden` like any other validation, so a hidden group does not make its children required.

## Group-Level Validation

A rule that spans several children belongs on the group, not on one of them. Declare `validators` on the group and `ctx.value()` resolves to the group's own object:

```typescript
{
  key: 'period',
  type: 'group',
  fields: [
    { key: 'dateFrom', type: 'input', label: 'From', props: { type: 'date' }, value: '' },
    { key: 'dateTo', type: 'input', label: 'To', props: { type: 'date' }, value: '' },
  ],
  validators: [{ type: 'custom', functionName: 'dateOrder' }],
  validationMessages: { dateOrder: 'The end must not be before the start.' },
}
```

The registered function receives the group's value, so both children are readable without spelling out any paths:

```typescript
const dateOrder: CustomValidator = (ctx) => {
  const { dateFrom, dateTo } = ctx.value() as { dateFrom?: string; dateTo?: string };
  return dateFrom && dateTo && dateTo < dateFrom ? { kind: 'dateOrder' } : null;
};
```

Register it with `customFnConfig.validators` the same way as any other custom validator. See [Custom Validators](/validation/custom-validators).

The error lands on the group itself, so it gates form and page validity like any other error. Group validators are skipped while the group is hidden, unless you set `validateWhenHidden: true`.

### Rendering the message

A group has no form element of its own, so there is nothing to hang a message on the way an input does. When a container declares `validators`, ng-forge appends the built-in `field-errors` wrapper, which renders each resolved message below the group's content:

```html
<div class="df-field-error" role="alert">The end must not be before the start.</div>
```

Each UI adapter ships its own version of this wrapper, so the message already renders in the adapter's native error style: `<mat-error>` on Material, `.invalid-feedback` on Bootstrap, `<small class="p-error">` on PrimeNG, and `<ion-note color="danger">` on Ionic. The core default shown above applies when you use ng-forge without an adapter; it follows the `--df-error-color` and `--df-error-font-size` conventions so it still matches surrounding field errors.

To render it your own way, register a wrapper under the same name. The later registration wins, so the built-in (or the adapter's) is replaced everywhere without touching any config:

```typescript name="app-wrappers.ts"
import { createWrappers } from '@ng-forge/dynamic-forms';

export const appWrappers = createWrappers({
  wrapperName: 'field-errors',
  loadComponent: () => import('./my-field-errors.wrapper'),
});
```

Your component receives the container's `validationMessages` as an input and follows the normal wrapper contract, exposing a `#fieldComponent` slot for the container's content. `injectContainerErrors` resolves the container's own errors so you do not have to reach into the field tree yourself:

```typescript name="my-field-errors.wrapper.ts"
@Component({
  selector: 'my-field-errors',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errors(); track error.kind) {
      <mat-error>{{ error.message }}</mat-error>
    }
  `,
})
export default class MyFieldErrorsWrapper implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}
```

Because you are replacing a built-in name rather than adding one, there is no `FieldRegistryWrappers` augmentation to write. See [Registering and Applying](/wrappers/registering-and-applying) for the full wrapper pipeline.

Setting `wrappers: null` on the container opts out of the message entirely while keeping the validator.

## Next Steps

- **[Form Rows](/prebuilt/form-rows)**: Arrange fields side-by-side in horizontal layouts
- **[Form Pages](/prebuilt/form-pages)**: Build multi-step wizard forms with page navigation
- **[Form Arrays](/prebuilt/form-arrays/simplified)**: Create repeating sections with dynamic add/remove

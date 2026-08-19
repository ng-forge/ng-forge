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

A group has no form element of its own, so there is nothing to hang a message on the way an input does. When a container declares `validators`, ng-forge appends the built-in `field-errors` wrapper, which renders the first resolved message below the group's content:

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

Extend `FieldErrorsWrapperBase` and supply a template. The base carries the `#fieldComponent` slot, the `fieldInputs` / `validationMessages` inputs, and `ngf` — the resolved error surface — so the only thing you write is markup:

```typescript name="my-field-errors.wrapper.ts"
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatError } from '@angular/material/form-field';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';

@Component({
  selector: 'my-field-errors',
  imports: [MatError],
  template: `
    <ng-container #fieldComponent></ng-container>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <mat-error [id]="ngf.errorId()">{{ error.message }}</mat-error>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFieldErrorDisplay(() => MyFieldErrorsWrapper)],
})
export default class MyFieldErrorsWrapper extends FieldErrorsWrapperBase {}
```

`ngf.errorsToDisplay()` is the gated list — it stays empty until the field is both invalid and touched, matching how field-level errors behave. `ngf.errors()` is the ungated list if you need it, and `ngf.errorId()` gives `{key}-error` for wiring `aria-describedby`.

`provideFieldErrorDisplay(...)` is what tells a wrapped leaf field to stop rendering its own errors, so the message appears once. It is harmless on a container, which has no field component of its own.

Because you are replacing a built-in name rather than adding one, there is no `FieldRegistryWrappers` augmentation to write. See [Registering and Applying](/wrappers/registering-and-applying) for the full wrapper pipeline.

### Using your own wrapper on specific containers

Replacing `field-errors` changes every container in the app. To use a different presentation on just some of them, register under your own name and set `rendersFieldErrors: true`:

```typescript name="app-wrappers.ts"
export const appWrappers = createWrappers({
  wrapperName: 'summary-errors',
  loadComponent: () => import('./summary-errors.wrapper'),
  rendersFieldErrors: true,
});
```

Then name it on the containers that should use it:

```typescript
{
  key: 'period',
  type: 'group',
  fields: [/* ... */],
  validators: [{ type: 'custom', functionName: 'dateOrder' }],
  wrappers: [{ type: 'summary-errors' }],
}
```

`rendersFieldErrors` tells ng-forge the wrapper already displays the message, so the default is not appended next to it and the error is not rendered twice. Declare it on the registration as well as calling `provideFieldErrorDisplay(...)` in the component: the chain is composed before any component exists to be asked.

The check runs after every wrapper layer is composed, so it holds however your wrapper reaches the container: named in `wrappers`, applied through `defaultWrappers`, or auto-associated to the `group` / `array` field type. Without the flag, a container carrying `summary-errors` would also get the built-in appended.

### Opting out of the message

`wrappers: null` on the container keeps the validator and renders no message at all. It is the absolute escape hatch: no wrappers of any kind, from any layer. Reach for it when the error is surfaced somewhere else entirely, such as a form-level summary. When you do have your own display, use `rendersFieldErrors` instead so the rest of the chain survives.

## Next Steps

- **[Form Rows](/prebuilt/form-rows)**: Arrange fields side-by-side in horizontal layouts
- **[Form Pages](/prebuilt/form-pages)**: Build multi-step wizard forms with page navigation
- **[Form Arrays](/prebuilt/form-arrays/simplified)**: Create repeating sections with dynamic add/remove

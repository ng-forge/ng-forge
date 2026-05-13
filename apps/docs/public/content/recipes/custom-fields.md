---
title: Custom Fields
slug: advanced/custom-fields
description: 'Add custom field types like rich text editors or file uploaders to any ng-forge adapter without building a full integration from scratch.'
---

Add a custom field type alongside an existing ng-forge adapter — Material, Bootstrap, PrimeNG, or Ionic — without writing a full adapter from scratch.

## When to use this vs build a full adapter

- **One or two extra fields** alongside an existing adapter (a rich text editor, file uploader, signature pad, rating widget) → this recipe.
- **A whole new design system** (Spartan, an internal kit, a custom theme with many field types) → see [Building an Adapter](/building-an-adapter).

The mechanics are the same in both cases — every ng-forge field component composes the `NgForgeField` directive — but the recipe stays focused on registering one type alongside `withMaterialFields()` (or whichever adapter you already use).

## 1. Create the field component

Compose `NgForgeField` via `hostDirectives` and consume the standard inputs and derived signals through `injectNgForgeField<T>()`. The directive owns the universal contract: `field`/`key`/`label`/`placeholder`/`className`/`tabIndex`/`props`/`meta`/`validationMessages` inputs (plus a deprecated `defaultValidationMessages` back-compat seam), `errors`/`errorsToDisplay`/`ariaInvalid`/`ariaRequired`/`ariaDescribedBy`/`errorId`/`hintId` derived signals, and `[id]`/`[class]`/`[data-testid]`/`[hidden]` host bindings.

```typescript name="rich-text-field.component.ts"
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeField, NgForgeControl, NgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe } from '@angular/common';

interface RichTextProps extends Record<string, unknown> {
  toolbar?: 'minimal' | 'full';
  hint?: string;
}

@Component({
  selector: 'app-rich-text-field',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = ngf.field();
    @let inputId = ngf.key() + '-rich-text';

    @if (ngf.label()) {
      <label [for]="inputId">{{ ngf.label() | dynamicText | async }}</label>
    }

    <my-rich-editor ngForgeControl [id]="inputId" [formField]="f" [toolbar]="props()?.toolbar ?? 'full'" />

    @if (ngf.errorsToDisplay()[0]; as error) {
      <div role="alert" [id]="ngf.errorId()">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div [id]="ngf.hintId()">{{ hint }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RichTextFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();
  readonly props = input<RichTextProps>();
}
```

A few things to note:

- **No manual input declarations** for `field`/`key`/`label`/etc. The 10 standard inputs come in via `hostDirectives`; `injectNgForgeField<T>()` returns a typed view of the directive instance.
- **No host bindings block** — `NgForgeField` already binds `[id]`/`[class]`/`[attr.data-testid]`/`[attr.hidden]` to the host element.
- **`[ngForgeControl]`** on the canonical control element forwards meta attributes (`data-*`, `autocomplete`, etc.) AND aria attributes (`aria-invalid`, `aria-required`, `aria-describedby` — derived from field state) onto that element. The author doesn't bind aria-\* manually — the marker absorbs it. For shadow-DOM wrappers where you can't reach the inner input, see [`NgForgeHostControl`](/building-an-adapter#meta-forwarding) in the integration guide.
- **`injectNgForgeField<string>()`** narrows `ngf.field()` to `Signal<FieldTree<string>>`, so the `[formField]="f"` binding type-checks. Use the appropriate generic for your value type (`boolean` for checkboxes, `Date | null` for datepickers, `ValueType[]` for multi-selects, etc.).

## 2. Register the field type

Define a `FieldTypeDefinition` that points to your component and the appropriate built-in mapper. For value-bearing fields (anything that contributes to the form's value as a single value), `valueFieldMapper` is the right choice:

```typescript name="rich-text-field.config.ts"
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

export const richTextField: FieldTypeDefinition = {
  name: 'rich-text',
  loadComponent: () => import('./rich-text-field.component'),
  mapper: valueFieldMapper,
};
```

Other built-in mappers cover the common categories: `checkboxFieldMapper` for boolean fields, `optionsFieldMapper` for fields with an `options` array (select/radio/multi-checkbox), `datepickerFieldMapper` for date fields with min/max/startAt. See [the integration guide](/building-an-adapter#mappers) for the full list.

## 3. Provide alongside your existing adapter

Spread your custom field into `provideDynamicForm` after the adapter's existing types:

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { richTextField } from './rich-text-field.config';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), richTextField)],
};
```

The same shape works with `withBootstrapFields()`, `withPrimeNgFields()`, or `withIonicFields()`.

## 4. Use it in a form

Reference your custom field type by name in any `FormConfig`:

```typescript
const config = {
  fields: [
    { key: 'title', type: 'input', value: '', label: 'Title' },
    { key: 'body', type: 'rich-text', value: '', label: 'Content' },
    { key: 'submit', type: 'submit', label: 'Save' },
  ],
} as const satisfies FormConfig;
```

Custom fields work with everything the built-in field types do — validation, derivations, conditional logic, dynamic text — without any extra wiring.

## Caveat: direct instantiation (TestBed, Storybook)

The form engine's outlet always binds `field` and `key` before triggering the first change-detection pass. Components instantiated directly — in a unit test via `TestBed.createComponent`, in Storybook, in a sandbox — bypass that ordering, so `NgForgeField`'s host bindings hit `input.required<>()` on first read and throw NG0950.

Bind both inputs **before** the first `detectChanges`:

```typescript
const fixture = TestBed.createComponent(MyFieldComponent);
fixture.componentRef.setInput('field', field);
fixture.componentRef.setInput('key', 'username');
fixture.detectChanges(); // safe — required inputs are bound
```

The directive's own spec (`packages/dynamic-forms/integration/src/directives/ng-forge-field.directive.spec.ts`) is the canonical example.

## Going further

- [Building an Adapter](/building-an-adapter) — full guide for shipping an adapter with many field types, adapter-level configuration cascades, and module augmentation for type-safety.
- [Type Safety](/recipes/type-safety) — register your custom field shape with `FieldRegistryLeaves` so `FormConfig` autocompletes against it.
- [Events](/recipes/events) — dispatch and subscribe to events from custom field components.

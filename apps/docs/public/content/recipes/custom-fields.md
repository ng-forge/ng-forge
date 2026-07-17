---
title: Custom Fields
slug: recipes/custom-fields
description: 'Add custom field types like rich text editors or file uploaders to any ng-forge adapter without building a full integration from scratch.'
---

Add a custom field type alongside an existing ng-forge adapter (Material, Bootstrap, PrimeNG, or Ionic) without writing a full adapter from scratch.

## When to use this vs build a full adapter

- **One or two extra fields** alongside an existing adapter (a rich text editor, file uploader, signature pad, rating widget): this recipe.
- **A whole new design system** (Spartan, an internal kit, a custom theme with many field types): see [Building an Adapter](/building-an-adapter).

The mechanics are the same in both cases (every ng-forge field component composes the `NgForgeField` directive), but the recipe stays focused on registering one type alongside `withMaterialFields()` (or whichever adapter you already use).

## 1. Create the field component

Compose the `NgForgeFieldHost` wrapper directive via `hostDirectives` and consume the standard inputs and derived signals through `injectNgForgeField<T>()`. The wrapper bundles `NgForgeFieldShell` (universal `key`/`className` inputs + `[id]`/`[attr.data-testid]`/`[class]` host bindings) with `NgForgeField` (the value plumbing: `field`/`label`/`placeholder`/`tabIndex`/`props`/`meta`/`validationMessages` inputs, error/aria derived signals, meta-tracking, plus `[attr.hidden]`/`[attr.aria-disabled]` host bindings driven by the field tree).

```typescript
// rich-text-field.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeField, NgForgeControl, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';

interface RichTextProps extends Record<string, unknown> {
  toolbar?: 'minimal' | 'full';
  hint?: string;
}

@Component({
  selector: 'app-rich-text-field',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
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

- **No manual input declarations** for `field`/`key`/`label`/etc. The standard inputs come in via the `NgForgeFieldHost` wrapper (Shell carries `key`/`className`; `NgForgeField` carries the rest); `injectNgForgeField<T>()` returns a typed view of the value-field directive instance and re-exposes `key()`/`className()` for templates.
- **No host bindings block**: Shell binds `[id]`/`[attr.data-testid]`/`[class]` from `key()`/`className()`, and `NgForgeField` binds `[attr.hidden]`/`[attr.aria-disabled]` from the field tree.
- **`[ngForgeControl]`** on the canonical control element forwards meta attributes (`data-*`, `autocomplete`, etc.) AND aria attributes (`aria-invalid`, `aria-required`, `aria-describedby`, derived from field state) onto that element. The author doesn't bind aria-\* manually; the marker absorbs it. For shadow-DOM wrappers where you can't reach the inner input, see [`NgForgeHostControl`](/building-an-adapter#meta-forwarding) in the integration guide.
- **`injectNgForgeField<string>()`** narrows `ngf.field()` to `Signal<FieldTree<string>>`, so the `[formField]="f"` binding type-checks. Use the appropriate generic for your value type (`boolean` for checkboxes, `Date | null` for datepickers, `ValueType[]` for multi-selects, etc.).

## 2. Register the field type

Define a `FieldTypeDefinition` that points to your component and the appropriate built-in mapper. For value-bearing fields (anything that contributes to the form's value as a single value), `valueFieldMapper` is the right choice:

```typescript
// rich-text-field.config.ts
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
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

```typescript
// app.config.ts
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

Custom fields work with everything the built-in field types do (validation, derivations, conditional logic, dynamic text) without any extra wiring.

## Testing a custom field

The form engine's outlet always binds `field` and `key` before triggering the first change-detection pass. Components instantiated directly (TestBed, Storybook, sandbox harnesses) bypass that ordering, so `NgForgeField`'s host bindings hit `input.required<>()` on first read and throw NG0950.

Use `createNgForgeFieldFixture` from `@ng-forge/dynamic-forms/testing` to build the fixture with `field` + `key` already bound. The harness wraps your value in a one-key form via `form()` in an injection context, sets the required inputs, and hands you back the fixture for assertions:

```typescript
import { required } from '@angular/forms/signals';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/testing';
import RichTextFieldComponent from './rich-text-field.component';

describe('RichTextFieldComponent', () => {
  it('shows the required error after the user blurs an empty field', () => {
    const { fixture, field } = createNgForgeFieldFixture(RichTextFieldComponent, {
      key: 'body',
      value: '',
      schema: (path) => required(path),
      touched: true,
      providers: [provideTestValidationMessages({ required: 'Required' })],
    });
    fixture.detectChanges();

    expect(field().invalid()).toBe(true);
    // Assert against rendered DOM, ngf signals, etc.
  });
});
```

For action / button components there's a sibling `createNgForgeActionFixture`:

```typescript
import { createNgForgeActionFixture } from '@ng-forge/dynamic-forms/testing';
import { FormSubmitEvent } from '@ng-forge/dynamic-forms';
import SubmitButtonComponent from './my-submit-button.component';

it('dispatches FormSubmitEvent through EventBus on click', () => {
  const { fixture, eventBus } = createNgForgeActionFixture(SubmitButtonComponent, {
    key: 'submit',
    label: 'Save',
    event: FormSubmitEvent,
  });
  const spy = vi.spyOn(eventBus, 'dispatch');
  fixture.detectChanges();
  fixture.nativeElement.querySelector('button').click();
  expect(spy).toHaveBeenCalledWith(FormSubmitEvent);
});
```

Both harnesses defer `detectChanges()` to the caller so you can set extra component-specific inputs between bind and render. Look at `create-field-fixture.spec.ts` in the integration package for the full surface.

### Running the fixtures under Vitest

Vitest externalizes packages from `node_modules` by default while inlining your specs. That gives the fixtures a second copy of `@angular/core/testing` whose test environment your setup file never initialized, and the first TestBed call crashes with `Cannot read properties of null (reading 'ngModule')`. Inline the package so your specs and the fixtures share one testing instance:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: { deps: { inline: ['@ng-forge/dynamic-forms'] } },
  },
});
```

## Going further

- [Building an Adapter](/building-an-adapter): full guide for shipping an adapter with many field types, adapter-level configuration cascades, and module augmentation for type-safety.
- [Type Safety](/recipes/type-safety): register your custom field shape with `FieldRegistryLeaves` so `FormConfig` autocompletes against it.
- [Events](/recipes/events): dispatch and subscribe to events from custom field components.

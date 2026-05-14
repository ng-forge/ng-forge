---
title: Building an Adapter
slug: building-an-adapter
description: 'Build a custom UI adapter for ng-forge dynamic forms. Compose the NgForgeField primitive into field components for any component library or design system.'
---

Build a custom integration so ng-forge field types render with your own component library or design system.

> **Just need one extra field on top of an existing adapter** (Material/Bootstrap/PrimeNG/Ionic)? See the shorter [Custom Fields](/recipes/custom-fields) recipe — same primitive, scoped to a single field type.

## Overview

An ng-forge adapter provides:

1. A **field component** for each field type your adapter supports (input, select, checkbox, etc.).
2. A **provider function** (`withMyAdapterFields()`) that registers all those types with `provideDynamicForm()`.
3. Optional **adapter-level configuration** that cascades into individual fields (size, appearance, theme color).

Every field component composes the `NgForgeField` directive via `hostDirectives`. That directive owns the standard contract — the 10 forwarded inputs every field accepts, eight derived signals (errors, ARIA helpers, ID derivation), and four universal host bindings — so you only write the parts that are actually adapter-specific: the template and any UI-library quirks.

Package entrypoints you'll import from:

| Entrypoint                            | Purpose                                                       |
| ------------------------------------- | ------------------------------------------------------------- |
| `@ng-forge/dynamic-forms`             | Core types, `provideDynamicForm`, `FormConfig`, etc.          |
| `@ng-forge/dynamic-forms/integration` | Field type definitions, mappers, the `NgForgeField` primitive |

## The directive primitives

ng-forge ships three layered directives + two **wrapper** directives that bundle them for the two common shapes. In practice you'll compose just the wrapper.

**Layers:**

- **`NgForgeFieldShell`** — the universal base. Owns the `key` + `className` inputs and the identity host bindings (`[id]`, `[attr.data-testid]`, `[class]`). Every ng-forge component uses this.
- **`NgForgeField`** — the **value** add-on. Injects Shell. Owns `field`/`label`/`placeholder`/`tabIndex`/`props`/`meta`/`validationMessages`, the error/aria derived signals, meta-tracking, and the `[attr.hidden]`/`[attr.aria-disabled]` host bindings driven by `field()()`.
- **`NgForgeAction`** — the **action** add-on. Injects Shell. Owns `label`/`disabled`/`hidden`/`tabIndex`/`event`/`eventArgs`/`eventContext`/`props`, the `[attr.hidden]`/`[attr.aria-disabled]` host bindings driven by its own inputs, and a `dispatch()` method that resolves event-arg tokens and dispatches through `EventBus`.

**Wrappers:**

- **`NgForgeFieldHost`** — composes `NgForgeFieldShell` + `NgForgeField`. Use for value-bearing components.
- **`NgForgeActionHost`** — composes `NgForgeFieldShell` + `NgForgeAction`. Use for button / action components.

The wrappers exist because Angular's library partial-compilation can't resolve cross-package const references inside `hostDirectives:` — a wrapper directive's own `hostDirectives` IS resolvable at the integration package's compile time, so consumers compose a single class instead of writing the two-entry literal in every component.

**Forwarded inputs** (per directive):

| Directive           | Input names array (re-export)                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NgForgeFieldShell` | `NG_FORGE_FIELD_SHELL_INPUTS` → `key`, `className`                                                                  |
| `NgForgeField`      | `NG_FORGE_VALUE_FIELD_INPUTS` → `field`, `label`, `placeholder`, `tabIndex`, `props`, `meta`, `validationMessages`  |
| `NgForgeAction`     | `NG_FORGE_ACTION_INPUTS` → `label`, `disabled`, `hidden`, `tabIndex`, `event`, `eventArgs`, `eventContext`, `props` |

**Derived signals available via `injectNgForgeField<T>()`:**

| Signal            | Type                      | Source                                                                  |
| ----------------- | ------------------------- | ----------------------------------------------------------------------- |
| `key`             | `Signal<string>`          | re-exported from the injected `NgForgeFieldShell`                       |
| `className`       | `Signal<string>`          | re-exported from the injected `NgForgeFieldShell`                       |
| `errors`          | `Signal<ResolvedError[]>` | resolved against `validationMessages` + `DEFAULT_VALIDATION_MESSAGES`   |
| `showErrors`      | `Signal<boolean>`         | `field` is invalid AND touched                                          |
| `errorsToDisplay` | `Signal<ResolvedError[]>` | `errors()` if `showErrors()` else `[]`                                  |
| `errorId`         | `Signal<string>`          | `${key()}-error`                                                        |
| `hintId`          | `Signal<string>`          | `${key()}-hint`                                                         |
| `ariaInvalid`     | `Signal<boolean>`         | `field()().invalid() && field()().touched()`                            |
| `ariaRequired`    | `Signal<true \| null>`    | `true` when the field has a required validator, otherwise `null`        |
| `ariaDescribedBy` | `Signal<string \| null>`  | links to `errorId` when erroring, `hintId` when `props.hint` is present |

**`NgForgeAction` exposes** `key`, `className` (re-exports from Shell), the value-input signals (`label`, `disabled`, `hidden`, `tabIndex`, `event`, `eventArgs`, `eventContext`, `props`), and a `dispatch()` method that components call from their click handler.

**Universal host bindings** (applied to your component's host element automatically):

- From `NgForgeFieldShell` (all field types): `[id]="key()"`, `[attr.data-testid]="key()"`, `[class]="className()"`
- From `NgForgeField` (value fields): `[attr.hidden]="field()().hidden() || null"`, `[attr.aria-disabled]="field()().disabled() || null"`
- From `NgForgeAction` (actions): `[attr.hidden]="hidden() || null"`, `[attr.aria-disabled]="disabled() || null"`

## Anatomy of a field component

The canonical shape, using a custom Bootstrap-style input as the example. Every value-bearing field component in every adapter follows this pattern:

```typescript
// custom-input.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeField, NgForgeControl, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { CustomInputProps } from './custom-input.type';

@Component({
  selector: 'custom-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let inputId = ngf.key() + '-input';

    @if (ngf.label()) {
      <label [for]="inputId">{{ ngf.label() | dynamicText | async }}</label>
    }

    <input
      ngForgeControl
      [formField]="f"
      [id]="inputId"
      [type]="props()?.type ?? 'text'"
      [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
      [attr.tabindex]="ngf.tabIndex()"
    />

    @if (ngf.errorsToDisplay()[0]; as error) {
      <div role="alert" [id]="ngf.errorId()">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CustomInputComponent {
  protected readonly ngf = injectNgForgeField<string>();
  readonly props = input<CustomInputProps>();
}
```

What the component does **not** declare:

- Standard inputs (`field`, `key`, `label`, etc.) — those come from `NgForgeField` via `hostDirectives`. The component reads them through `ngf.X()`.
- Host bindings for `id`/`data-testid`/`class`/`hidden` — `NgForgeField` owns those.
- Error / ARIA / hint plumbing — derived signals come from the directive.

What the component **does** declare:

- A typed `injectNgForgeField<T>()` so `ngf.field()` is a `Signal<FieldTree<T>>` rather than `FieldTree<unknown>`.
- The `props` input (typed to your adapter's per-field props interface).
- The template, including `[ngForgeControl]` on the canonical control element so meta attributes (`data-*`, `aria-*`, `autocomplete`) reach the right place.
- Any adapter-specific computeds (e.g. `size`, `appearance`) that resolve `props().X ?? adapterConfig?.X ?? defaultX`.

### Typed access via injectNgForgeField

`injectNgForgeField<T>()` returns the `NgForgeField` instance with `field` narrowed to `Signal<FieldTree<T>>`. The cast is unchecked — the runtime contract is that the field-type registration matches the value type — but it lets `[formField]="ngf.field()"` type-check inside templates that need a strict generic.

For boolean fields you'd write `injectNgForgeField<boolean>()`, for `Date | null` datepickers `injectNgForgeField<Date | null>()`, and so on.

## Anatomy of an action component

Buttons, submits, navigation buttons, and array-mutation buttons all compose `NgForgeFieldShell` + `NgForgeAction` instead of `NgForgeField`. The Action directive owns event dispatch — your component's click handler calls `action.dispatch()` and the directive resolves any `eventArgs` tokens via the ambient `ARRAY_CONTEXT` and dispatches through `EventBus`.

```typescript
// custom-button.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { CustomButtonProps } from './custom-button.type';

@Component({
  selector: 'custom-button',
  hostDirectives: [NgForgeActionHost],
  template: `
    <button [type]="buttonType()" [disabled]="action.disabled()" (click)="onClick()">
      {{ action.label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CustomButtonComponent<TEvent extends FormEvent> {
  protected readonly action = injectNgForgeAction<TEvent>();
  readonly props = input<CustomButtonProps>();

  protected readonly buttonType = computed(() => this.props()?.type ?? 'button');

  onClick(): void {
    // Native form submit buttons let the form handle submission; everything else dispatches.
    if (this.buttonType() === 'submit') return;
    this.action.dispatch();
  }
}
```

The corresponding `FieldTypeDefinition` opts out of value handling and explicit render-readiness:

```typescript
{
  name: 'button',
  loadComponent: () => import('./custom-button.component'),
  mapper: buttonFieldMapper,
  valueHandling: 'exclude',
  renderReadyWhen: [],
}
```

`buttonFieldMapper` (or `submitButtonFieldMapper` / `nextButtonFieldMapper` / `addArrayItemButtonMapper` / …) emits exactly the keys `NgForgeFieldShell` + `NgForgeAction` accept — same lockstep guarantee as value fields.

## Meta forwarding

Field meta — the `meta` input on every field — carries native HTML attributes (`data-*`, `autocomplete`, `inputmode`, etc.). Markers also forward the directive's derived aria signals (`aria-invalid`, `aria-required`, `aria-describedby`) onto the same target, so authors don't bind those manually. ng-forge ships two marker directives plus an ambient injection path for sub-components.

### NgForgeControl — the common case

A template attribute directive. Place it on the canonical control element in your template:

```html
<input ngForgeControl [formField]="f" ... />
```

`NgForgeControl` injects the parent `NgForgeField`, reads `meta()` and the aria signals, and applies the resulting attributes to its own host element. For wrapped controls where the canonical native input is rendered as a descendant inside the wrapper, pass a CSS selector through the input alias and the directive queries the host subtree:

```html
<mat-checkbox ngForgeControl="input[type='checkbox']" [formField]="f">{{ ngf.label() }}</mat-checkbox>
```

For dynamic option lists (radio buttons, multi-checkbox), put `ngForgeControl` inside the `@for`:

```html
@for (option of options(); track option.value) {
<input type="radio" ngForgeControl [value]="option.value" />
}
```

Each iteration spawns its own directive instance. Adding/removing options via Angular's structural lifecycle creates and destroys those instances naturally — no manual subscription, no `dependents` array.

### NgForgeHostControl — for shadow-DOM wrappers

Some component libraries (Ionic web components, certain PrimeNG controls) wrap a native input inside shadow DOM that you can't reach with a template selector. In those cases the wrapper element itself is the canonical control from the user's perspective. Add `NgForgeHostControl` to your component's `hostDirectives` so meta + aria land on the host:

```typescript
import { Component } from '@angular/core';
import { injectNgForgeField, NgForgeFieldHost, NgForgeHostControl } from '@ng-forge/dynamic-forms/integration';

@Component({
  selector: 'df-ionic-toggle',
  hostDirectives: [
    // Order matters — NgForgeFieldHost must come first.
    // NgForgeHostControl's constructor injects the parent NgForgeField,
    // and Angular instantiates hostDirectives in array order on the same
    // element injector. List Shell+Field (via NgForgeFieldHost) BEFORE
    // NgForgeHostControl so the parent exists when the marker constructs.
    NgForgeFieldHost,
    NgForgeHostControl,
  ],
  template: `<ion-toggle [formField]="ngf.field()">{{ ngf.label() | dynamicText | async }}</ion-toggle>`,
})
export default class IonicToggleField {
  protected readonly ngf = injectNgForgeField<boolean>();
}
```

`NgForgeHostControl` is selectorless — it's only used via `hostDirectives`, never as a template attribute. Reversing the order (`[NgForgeHostControl, NgForgeFieldHost]`) causes `inject(NgForgeField)` inside the marker's constructor to fail with NG0203 because the parent isn't on the element injector yet.

### Quick decision rule

- The control element is rendered in **your template** (an `input`, `select`, or any custom element) → `[ngForgeControl]` on that element.
- The control element is the **component's host** (no inner element to mark, e.g. shadow-DOM wrapper) → `NgForgeHostControl` in `hostDirectives`.
- Meta should not be applied at all → omit both.

If you set `meta()` on a field but no marker / ambient consumer claims it, ng-forge logs a dev-mode warning so the wiring gap surfaces immediately instead of failing silently.

### Forwarding to a sub-component

If your field component delegates rendering to a sub-component (e.g. `df-bs-radio-group` inside `df-bs-radio`), put `ngForgeControl` on the canonical control element in the sub-component's template — the marker walks the element-injector tree to find the parent's `NgForgeField` and absorbs meta + aria automatically. For per-iteration shapes (radio buttons, multi-checkbox options), one marker instance per `@for` iteration:

```typescript
@Component({
  selector: 'df-bs-radio-group',
  imports: [NgForgeControl],
  template: `
    @for (option of options(); track option.value; let i = $index) {
      <input
        ngForgeControl
        type="radio"
        [name]="name()"
        [value]="option.value"
        [checked]="value() === option.value"
        (change)="onRadioChange(option.value)"
        [id]="name() + '_' + i"
      />
      <label [for]="name() + '_' + i">{{ option.label | dynamicText | async }}</label>
    }
  `,
})
export class BsRadioGroupComponent {
  /* FormValueControl props omitted */
}
```

No `[meta]="ngf.meta()"` binding on the parent side is needed and no `setupMetaTracking` call inside the sub-component — each marker instance claims the ambient field on construction. The dev-mode unclaimed-meta warning fires if `meta()` is non-empty and no marker / ambient consumer registered.

> **Warning-race note.** In a normal template-driven render, sub-components construct during the parent's template instantiation (so `markClaimed()` runs before `NgForgeField`'s `afterRenderEffect.write` fires). For programmatic late mounts (Storybook stories, mid-tree manual instantiation) the warning can fire once before the late claim lands — the latch ensures it doesn't repeat.

## Mappers

A mapper translates a field definition (`FieldDef<...>`) into the inputs that flow into your component. It's a function called inside an injection context:

```typescript
type MapperFn<T extends FieldDef<unknown>> = (input: T) => Signal<Record<string, unknown>>;
```

The signal emits a record of input-name → value. The form engine reads each entry and calls `ref.setInput(name, value)` on the rendered component.

ng-forge ships mappers for the standard field categories. You'll register field types against these, not write your own most of the time:

| Mapper                  | For                                     | What it emits                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valueFieldMapper`      | input, textarea, datepicker, slider, …  | `field`, `key`, `label`, `placeholder`, `className`, `tabIndex`, `props`, `meta`, `validationMessages`. Note: the mapper no longer emits `defaultValidationMessages` as a per-component input — `NgForgeField` reads `DEFAULT_VALIDATION_MESSAGES` from DI directly. The form-level `defaultValidationMessages` config option in `provideDynamicForm` / `FormConfig` is unaffected: it still flows in through the DI token. |
| `checkboxFieldMapper`   | checkbox, toggle                        | same as `valueFieldMapper`                                                                                                                                                                                                                                                                                                                                                                                                  |
| `optionsFieldMapper`    | select, radio, multi-checkbox           | adds `options`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `datepickerFieldMapper` | datepicker                              | adds `minDate`, `maxDate`, `startAt` (string→Date conversion)                                                                                                                                                                                                                                                                                                                                                               |
| `buttonFieldMapper`     | plain buttons                           | `key`, `label`, `disabled`, `event`, `props`, `className`                                                                                                                                                                                                                                                                                                                                                                   |
| Array button mappers    | `addArrayItem`, `removeArrayItem`, etc. | event + event-args wiring for array mutations                                                                                                                                                                                                                                                                                                                                                                               |

### Mapper-as-contract

Every key a mapper emits must match a declared input on the component or one of its host directives. If your component exposes the standard 10 inputs (via `NgForgeField` `hostDirectives`) and accepts `props`, every key the built-in mappers emit lines up automatically.

`ComponentRef.setInput` (used by the field outlet to push mapper output onto the rendered component) is **lenient** on unknown input names in Angular 21 — extra keys are silently dropped rather than throwing NG0303. So if a custom mapper emits a key the component doesn't declare, the input is lost without a runtime error. Composing `NgForgeFieldHost` registers all the standard input names on the component (Shell's `key`/`className` + Field's `field`/`label`/`placeholder`/`tabIndex`/`props`/`meta`/`validationMessages`) so built-in mapper output always lines up — that's the recommended authoring shape for third-party adapters.

### Writing a custom mapper

Most adapter authors never need this — the built-in mappers handle every standard category. You'd write a custom mapper when your field type doesn't fit any standard category (e.g. a multi-select with grouped options, a tree-picker with a custom data shape).

Example: a hypothetical "weighted choice" field where each option has an associated number:

```typescript
import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS, FieldDef } from '@ng-forge/dynamic-forms';
import { buildValueFieldInputs, resolveValueFieldContext } from '@ng-forge/dynamic-forms/integration';
import type { WeightedChoiceField } from './weighted-choice.types';

export function weightedChoiceFieldMapper(fieldDef: WeightedChoiceField): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);

  return computed(() => {
    const base = buildValueFieldInputs(fieldDef, ctx, defaultProps());
    return {
      ...base,
      // Adapter-specific keys — every one must match a declared input on the
      // component or its host directives.
      choices: fieldDef.choices,
      totalWeight: fieldDef.choices.reduce((sum, c) => sum + c.weight, 0),
    };
  });
}
```

Reuse `buildValueFieldInputs` (exported from `/integration`) to get the standard 10 keys without rewriting them, then layer your extra keys on top.

### Writing a custom action / button mapper

Action fields (buttons, submits, array-mutation buttons) compose `NgForgeActionHost` instead of `NgForgeFieldHost`. Their mapper emits a different key set: `key`, `className`, `label`, `disabled`, `hidden`, `tabIndex`, `event`, `eventArgs`, `eventContext`, `props`. `NgForgeAction.dispatch()` reads `event` + `eventArgs` and resolves any tokens (`$key`, `$index`, `$arrayKey`, `formValue`) against the ambient `ARRAY_CONTEXT` injection token, falling back to the static `eventContext` input.

The built-in `buttonFieldMapper` covers the generic case. For preconfigured events (submit, next/previous-page, array mutations) ng-forge ships `submitButtonFieldMapper`, `nextButtonFieldMapper`, `previousButtonFieldMapper`, `addArrayItemButtonMapper`, `prependArrayItemButtonMapper`, `insertArrayItemButtonMapper`, `removeArrayItemButtonMapper`, `popArrayItemButtonMapper`, `shiftArrayItemButtonMapper` — each one wires the `event` class internally so the field definition doesn't have to.

You'd write a custom action mapper for a button that dispatches a custom `FormEvent` subclass with a non-standard payload shape, or for a button whose event-arg resolution differs from the built-in tokens.

Example: a "save draft" button that dispatches a custom `SaveDraftEvent` with the current form value snapshot:

```typescript
import { computed, inject, Signal } from '@angular/core';
import { ARRAY_CONTEXT, FieldDef, FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms';
import { buildBaseInputs, DEFAULT_PROPS } from '@ng-forge/dynamic-forms';
import type { ButtonField } from '@ng-forge/dynamic-forms/integration';
import { SaveDraftEvent } from './events/save-draft.event';

export function saveDraftButtonMapper<TProps>(fieldDef: ButtonField<TProps, SaveDraftEvent>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = inject(FIELD_SIGNAL_CONTEXT);
  // ARRAY_CONTEXT is optional — present when the button is rendered inside an array item.
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  return computed(() => {
    const base = buildBaseInputs(fieldDef, defaultProps());
    return {
      ...base,
      // The button-event surface — NgForgeAction reads these inputs verbatim.
      event: SaveDraftEvent,
      eventArgs: fieldDef.eventArgs,
      // Provide a fallback context when the button is rendered outside any array.
      // NgForgeAction prefers ARRAY_CONTEXT when present; eventContext is only
      // consulted when ARRAY_CONTEXT is absent.
      eventContext: arrayContext ? undefined : { key: fieldDef.key, formValue: ctx.value() },
    };
  });
}
```

Three contracts the mapper must honor:

- **The `event` input must be a class reference** (a `FormEventConstructor<TEvent>`), not an instance. `NgForgeAction.dispatch()` calls `new event(...args)` internally via `EventBus.dispatch`.
- **`eventArgs` carries tokens, not resolved values.** Token resolution happens inside `dispatch()` at click time, using the current `ARRAY_CONTEXT.index()` signal so dispatched indices are always live. Resolving args at mapper time would freeze the index at the moment the mapper ran.
- **`eventContext` is the fallback path.** When `ARRAY_CONTEXT` is provided (button is inside an array), it wins. When absent (button at form root), `NgForgeAction` falls back to `eventContext()`, then to `{ key: this.key() }`.

Register with `valueHandling: 'exclude'` and `renderReadyWhen: []` since action fields don't carry a value or wait for `field` to bind:

```typescript
{
  name: 'saveDraft',
  loadComponent: () => import('./save-draft-button.component'),
  mapper: saveDraftButtonMapper,
  valueHandling: 'exclude',
  renderReadyWhen: [],
}
```

## Required-input forwarding & renderReadyWhen

`NgForgeField` declares `field` and `key` as `input.required()`. The form engine guarantees both are bound before the component renders, but the contract is enforced via the `renderReadyWhen` mechanism on the `FieldTypeDefinition`.

For value-bearing fields (`valueFieldMapper`, `checkboxFieldMapper`, etc.), `renderReadyWhen: ['field']` is the implicit default — no need to declare it. The renderer waits for the mapper to emit `field` before instantiating the component, so the required-input contract is satisfied on first CD.

For fields that don't bind to a form value (buttons, display-only text), declare `renderReadyWhen: []` to opt out of the default wait:

```typescript
const BUTTON_FIELD_TYPES_BASE = {
  renderReadyWhen: [] as string[],
};

export const ADAPTER_FIELD_TYPES: FieldTypeDefinition[] = [
  // ...
  {
    name: 'submit',
    loadComponent: () => import('./buttons/submit-button.component'),
    mapper: submitButtonFieldMapper,
    valueHandling: 'exclude',
    ...BUTTON_FIELD_TYPES_BASE,
  },
];
```

For custom mappers that emit _other_ required inputs your component depends on, list them explicitly:

```typescript
{
  name: 'image-picker',
  loadComponent: () => import('./image-picker.component'),
  mapper: imagePickerFieldMapper,
  renderReadyWhen: ['field', 'allowedTypes'],
}
```

## Provider function & module augmentation

Wrap your `FieldTypeDefinition` array in an exported provider function so consumers register everything in one call:

```typescript
// my-adapter-providers.ts
import type { Provider } from '@angular/core';
import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { MY_ADAPTER_FIELD_TYPES } from './my-adapter-field-config';
import type { MyAdapterConfig } from './my-adapter-config';
import { MY_ADAPTER_CONFIG } from './my-adapter-config.token';

export type MyAdapterFieldTypes = FieldTypeDefinition[];

type MyAdapterConfigFeature = {
  ɵkind: 'my-adapter-config';
  ɵproviders: Provider[];
};

type MyAdapterFieldsWithConfig = [...MyAdapterFieldTypes, MyAdapterConfigFeature];

export function withMyAdapterFields(): MyAdapterFieldTypes;
export function withMyAdapterFields(config: MyAdapterConfig): MyAdapterFieldsWithConfig;
export function withMyAdapterFields(config?: MyAdapterConfig): MyAdapterFieldTypes | MyAdapterFieldsWithConfig {
  if (!config) return MY_ADAPTER_FIELD_TYPES;
  return [
    ...MY_ADAPTER_FIELD_TYPES,
    {
      ɵkind: 'my-adapter-config',
      ɵproviders: [{ provide: MY_ADAPTER_CONFIG, useValue: config }],
    } satisfies MyAdapterConfigFeature,
  ];
}
```

Consumers register the adapter just like the in-tree ones:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMyAdapterFields } from '@my-org/ng-forge-my-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMyAdapterFields({ size: 'lg', theme: 'dark' }))],
};
```

### Module augmentation for type safety

Register your typed field definitions with TypeScript so `FormConfig` autocompletes against the union of registered field types:

```typescript
// my-adapter-types.ts
import type { MyAdapterInputField, MyAdapterSelectField, MyAdapterCheckboxField } from './fields';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: MyAdapterInputField;
    select: MyAdapterSelectField;
    checkbox: MyAdapterCheckboxField;
    // ... one entry per field type
  }
}
```

After this declaration, IDE autocomplete on `FormConfig.fields[].type` resolves to your adapter's field types, and per-type props get full IntelliSense.

## Adapter-level configuration

Most design systems have settings that should cascade across every field — appearance variant, size, theme color. The pattern is:

1. Define an injection token with the config shape.
2. Make the config optional in your provider function.
3. Each component injects the token (optional) and resolves the value through a `computed` that falls back to the token, then a hard-coded default.

```typescript
// my-adapter-config.ts
export interface MyAdapterConfig {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}
```

```typescript
// my-adapter-config.token.ts
import { InjectionToken } from '@angular/core';
import type { MyAdapterConfig } from './my-adapter-config';

export const MY_ADAPTER_CONFIG = new InjectionToken<MyAdapterConfig>('MY_ADAPTER_CONFIG');
```

In each field component, layer the lookups: per-field `props` win, adapter config falls in next, hard-coded default last.

```typescript
@Component({
  /* ... */
})
export default class MyInputComponent {
  private readonly config = inject(MY_ADAPTER_CONFIG, { optional: true });
  protected readonly ngf = injectNgForgeField<string>();
  readonly props = input<MyInputProps>();

  readonly size = computed(() => this.props()?.size ?? this.config?.size ?? 'md');
}
```

Templates bind the resolved computeds rather than reading `props` directly:

```html
<input class="my-input" [class.my-input-lg]="size() === 'lg'" />
```

### propsToMeta

Some "props" are actually native HTML attributes — `type` on inputs, `rows`/`cols` on textareas, `autocomplete`. Listing them in `propsToMeta` on the field type definition causes the form engine to merge those values into `meta` before passing them to your component, which means they flow through `[ngForgeControl]` onto the actual control element automatically.

```typescript
{
  name: 'input',
  loadComponent: () => import('./fields/input/my-input.component'),
  mapper: valueFieldMapper,
  propsToMeta: ['type'],   // <input type="..."> reaches the DOM via meta
}
```

If `meta` and `props` both carry the same key, `meta` wins.

## Custom wrappers

Wrappers are "chrome" around a field — sections, accordions, tooltips, badges. ng-forge ships a wrapper-chain registry separate from the field-type registry, so adapters can register custom wrappers alongside field types from the same provider entry point.

The complete wrapper-authoring guide lives in **[Writing a Wrapper](/wrappers/writing-a-wrapper)** (component shape, slot semantics, `WrapperFieldInputs`, error patterns) and **[Registering and Applying](/wrappers/registering-and-applying)** (the `createWrappers` bundle + module augmentation).

For adapter library packaging, import the wrapper-authoring API from `@ng-forge/dynamic-forms/integration` rather than the root entry point — keeps a single import path across your field components and wrapper components:

```typescript
import {
  createWrappers,
  type FieldWrapper,
  type InferWrapperRegistry,
  type WrapperFieldInputs,
  wrapperProps,
} from '@ng-forge/dynamic-forms/integration';
```

Functionally identical to the root entry — same symbols, same `declare module '@ng-forge/dynamic-forms'` augmentation. The integration re-export exists so adapter packages have one import path.

## Reference adapters

The four in-tree adapters are the canonical reference implementations. Each ships ~10 field components, all built on `NgForgeField`. Read them as full working examples:

- [`packages/dynamic-forms-bootstrap`](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-forms-bootstrap) — the smallest surface, often the easiest to copy from.
- [`packages/dynamic-forms-material`](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-forms-material) — wraps Angular Material's existing form-field primitives.
- [`packages/dynamic-forms-primeng`](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-forms-primeng) — examples of inner control components for opaque PrimeNG widgets.
- [`packages/dynamic-forms-ionic`](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-forms-ionic) — shadow-DOM wrappers using `NgForgeHostControl`.

## Related

- **[Custom Fields](/recipes/custom-fields)** — single-field recipe alongside an existing adapter.
- **[Field Types](/field-types/text-inputs)** — what the standard field types provide.
- **[Type Safety](/recipes/type-safety)** — module augmentation patterns.
- **[Validation](/validation/basics)** — how validation surfaces through `ngf.errorsToDisplay()`.

---
title: Migrating from ngx-formly to ng-forge
slug: migrating-from-ngx-formly
description: A practical, honest guide to porting an Angular dynamic-forms app from ngx-formly to ng-forge — concept-by-concept mapping, side-by-side code, and the gaps you should know about before you start.
---

A side-by-side migration reference for teams moving from **ngx-formly** to **ng-forge**. ngx-formly is a mature library that has shaped how a generation of Angular developers think about dynamic forms — much of ng-forge's design vocabulary (field types, wrappers, declarative configs) exists because formly proved the approach worked. This is a translation, not a takedown.

## Who this guide is for

Strong reasons to migrate:

- You're blocked on Angular 21 (formly does not yet officially support v21).
- You want signal-native form state, schema-validation-first design (Zod / Valibot / ArkType), or first-class async value derivation.
- You're hitting performance limits with large forms or array sections. ng-forge's substrate is built around signals (not zone-driven change detection), uses stable `track` keys on every `@for`, preserves field-instance identity through `reconcileFields` (so signals don't fire spuriously when a config update doesn't actually change a field), defers non-adjacent pages in multi-step forms via `@defer (on idle)`, and updates arrays differentially — appending an item only renders the new one, existing items are kept in place.

<docs-perf-pipeline></docs-perf-pipeline>

Reasons to stay on formly:

- You depend on community formly extensions or a deep ecosystem of custom types you'd have to re-port.
- You need a stable, low-churn API today and don't have a forcing function (e.g., Angular 21).

(Using a UI library ng-forge does not ship today — Kendo, NG-ZORRO, NativeScript — is **not** a reason to stay. Building a custom adapter is a first-class workflow in ng-forge, intentionally easy enough to be one of the project's USPs. See [Building an Adapter](/building-an-adapter).)

## At a glance

| ngx-formly                                | ng-forge                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `FormlyFieldConfig`                       | `FieldConfig` (registered field type)                                   |
| `props` (was `templateOptions`)           | UI-adapter-specific keys live in `props`; validation and labelling (`label`, `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `placeholder`) live at the top level |
| `expressions: { hide: '!model.x' }`       | `logic: [{ type: 'hidden', condition: { … } }]` (structured)            |
| `expressionProperties` (deprecated v6)    | `logic` array + `derivation` for values                                 |
| `validators` / `asyncValidators`          | `validators[]` on the field + `customFnConfig.{validators,asyncValidators,httpValidators}` on the form |
| `wrappers: ['form-field']`                | `wrappers: [{ type: 'card', … }]` (config objects)                      |
| `fieldGroup` (object)                     | `type: 'group'` with `fields: [...]`                                    |
| `fieldArray` (custom `repeat` type)       | `type: 'array'` (built in; verbose form with explicit add/remove fields, or simplified form with `template` + auto-buttons) |
| `hooks: { onInit, onChanges, … }`         | Angular component lifecycle inside custom field components, plus `EventBus` / `EventDispatcher` for cross-field events |
| `FormlyJsonschema.toFieldConfig(schema)`  | `standardSchema(zodSchema)` (different paradigm — see below)            |
| `[model]` two-way binding                 | `[(value)]` two-way binding (Angular `model()` signal)                   |

The biggest *conceptual* shift: from **string expressions and template options** to **typed structured config** — same idioms, expressed as objects.

<docs-dsl-shift></docs-dsl-shift>

## Setup

Both libraries follow the same shape: install core + a UI theme, register them once at the application root, then bind a config object to a form component.

<docs-code-compare
  title="Application bootstrap"
  formly="// ngx-formly v7 (current standalone API)
import { ApplicationConfig } from '@angular/core';
import { provideFormlyCore } from '@ngx-formly/core';
import { withFormlyMaterial } from '@ngx-formly/material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFormlyCore(withFormlyMaterial()),
  ],
};"
  ngforge="import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withMaterialFields()),
  ],
};">
</docs-code-compare>

The package layout matches one-for-one: `@ngx-formly/material` ↔ `@ng-forge/dynamic-forms-material`, and so on for Bootstrap, PrimeNG, and Ionic.

## Your first form

The component-side change is small: bind a config to a form directive instead of three inputs (`form`, `fields`, `model`).

<docs-code-compare
  title="Minimal working form"
  formly="@Component({
  selector: 'app-contact',
  template: `
    <form [formGroup]='form' (ngSubmit)='onSubmit()'>
      <formly-form [form]='form' [fields]='fields' [model]='model'></formly-form>
      <button type='submit'>Submit</button>
    </form>
  `,
})
export class ContactComponent {
  form = new FormGroup({});
  model: { email?: string } = {};

  fields: FormlyFieldConfig[] = [
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email',
        required: true,
        type: 'email',
      },
    },
  ];

  onSubmit() {
    if (this.form.valid) console.log(this.model);
  }
}"
  ngforge="import { Component } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-contact',
  imports: [DynamicForm],
  template: `
    <form [dynamic-form]='config' (submitted)='onSubmit($event)'></form>
  `,
})
export class ContactComponent {
  config = {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
        props: { type: 'email' },
      },
      { key: 'submit', type: 'submit', label: 'Submit' },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: { email: string }) {
    console.log(value);
  }
}">
</docs-code-compare>

A few mechanical differences to internalise:

- **`value` seeds the initial value and the inferred type.** `value: ''` makes the field a string, `value: 0` makes it a number. `value` is optional — omit it for fields whose value is derived, computed, or hydrated from a backend. If you want literal-type inference into the form value, supplying `value` is what flows the literal type through.
- **The submit button is a field**, not a `<button>` outside the form. ng-forge owns the submit lifecycle.
- **`label`, `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `placeholder` live at the top level of the field**, not under `props`. `props` carries everything else — the rendered control's own attributes (`type: 'email'`, `rows`) and UI-adapter-specific options (`appearance`, `hint`, `color`, `subscriptSizing` for Material; equivalents for Bootstrap, PrimeNG, and Ionic).
- **`[(value)]` for two-way binding, `(submitted)` / `(events)` / `formValue` for read-only access.** ng-forge has a `model()`-based two-way `value` signal: `[(value)]="model"` is the direct migration target for formly's `[model]="model"`. If you don't need the live binding, `(submitted)` (only fires when valid), `(events)` (full event stream including invalid submits), or reading the `formValue` signal off a `viewChild` ref give you the same data without a writable parent variable.
- **Strong typing comes from `as const satisfies FormConfig`** — the config object's literal field shapes flow into the inferred form value, no decorator-style generics needed.

## Field types

The two libraries have nearly the same baseline of field types; the names line up directly except for a few cases.

| ngx-formly type     | ng-forge type           | Notes                                                              |
| ------------------- | ----------------------- | ------------------------------------------------------------------ |
| `input`             | `input`                 | HTML input type goes in `props.type` in both libraries             |
| `textarea`          | `textarea`              | `props.rows` in both                                               |
| `checkbox`          | `checkbox`              | Single boolean                                                     |
| `multicheckbox`     | `multi-checkbox`        | Hyphenated in ng-forge                                             |
| `radio`             | `radio`                 |                                                                    |
| `select`            | `select`                | `options` is **top-level** on the field in ng-forge                |
| `datepicker` (Material) | `datepicker`        |                                                                    |
| `slider` / `toggle` (Material) | `slider` / `toggle` |                                                              |
| `repeat` (custom)   | `array` (built-in)      | Two flavors: verbose (explicit `fields[][]` + button fields) or simplified (`template` + auto-buttons) |
| _none_              | `page`                  | Multi-step container — see below                                   |
| _none_              | `row`                   | Horizontal flex layout                                             |
| _none_              | `text`                  | Display-only label / heading                                       |
| _none_              | `submit` / `next` / `previous` / `addArrayItem` / `removeArrayItem` | First-class action buttons with form-state-aware disable behavior |

A few specifics worth flagging:

**Select with sync options.** Formly takes `options` inside `props`; ng-forge takes `options` at the top level of the field.

<docs-code-compare
  title="Select with static options"
  formly="{
  key: 'sport',
  type: 'select',
  props: {
    label: 'Sport',
    options: [
      { value: 'football', label: 'Football' },
      { value: 'basketball', label: 'Basketball' },
    ],
    valueProp: 'value',
    labelProp: 'label',
  },
}"
  ngforge="{
  key: 'sport',
  type: 'select',
  value: '',
  label: 'Sport',
  options: [
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
  ],
}">
</docs-code-compare>

**Mapping custom keys.** Formly lets you point at custom keys via `valueProp: 'id'` / `labelProp: 'name'`. ng-forge's `FieldOption` is fixed at `{ value, label, disabled? }` — remap your data once at the source: `data.map(d => ({ value: d.id, label: d.name }))`. The `targetProperty: 'options'` derivation pattern (see [Async data and dynamic options](#async-data-and-dynamic-options)) makes this a one-liner against an HTTP response.

**Async / observable options.** Formly accepts an `Observable` directly in `props.options`, and the cascaded-select pattern (one select's options driven by another's value) is canonically wired in an `onInit` hook subscribed to the parent's `valueChanges`. ng-forge has a first-class `targetProperty: 'options'` derivation for this — same shape for HTTP responses and for cross-field cascades. See [Async data and dynamic options](#async-data-and-dynamic-options) below.

## Validators

Both libraries support shorthand validators for the common cases (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`) and a registry for custom validators.

The mental shift: in formly the field-level validator config is *keyed by validator name* with an `expression` function inside; in ng-forge it's an *array* of validator objects with a `type` discriminator. Custom validator functions live on the form config under `customFnConfig`, split into three pillars by execution model:

<docs-validator-pillars></docs-validator-pillars>

Validator functions return only an error `{ kind }` — the human-readable message is configured separately via `validationMessages` (per-field) or `defaultValidationMessages` (form-level), so the same `kind` can be localised consistently.

<docs-code-compare
  title="Custom validator with inline message"
  formly="{
  key: 'ip',
  type: 'input',
  props: { label: 'IP Address', required: true },
  validators: {
    ip: {
      expression: (c: AbstractControl) =>
        !c.value || /(\d{1,3}\.){3}\d{1,3}/.test(c.value),
      message: (error, field) =>
        `&quot;${field.formControl.value}&quot; is not a valid IP Address`,
    },
  },
}"
  ngforge="// On the form config:
{
  customFnConfig: {
    validators: {
      ip: (ctx) => {
        const value = ctx.value();
        return !value || (typeof value === 'string' && /(\d{1,3}\.){3}\d{1,3}/.test(value))
          ? null
          : { kind: 'ip' };
      },
    },
  },
  defaultValidationMessages: {
    ip: 'Not a valid IP Address',
  },
  fields: [
    {
      key: 'ip',
      type: 'input',
      value: '',
      label: 'IP Address',
      required: true,
      validators: [{ type: 'custom', functionName: 'ip' }],
    },
  ],
}">
</docs-code-compare>

**Validation messages** look almost identical:

<docs-code-compare
  title="Per-field and form-level validation messages"
  formly="// Per-field
{
  key: 'email',
  type: 'input',
  props: { label: 'Email', required: true, type: 'email' },
  validation: {
    messages: {
      required: 'Please enter an email',
      email: 'Invalid email format',
    },
  },
}

// Or globally:
provideFormlyCore({
  validationMessages: [
    { name: 'required', message: 'This field is required' },
  ],
})"
  ngforge="// Per-field
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,
  email: true,
  validationMessages: {
    required: 'Please enter an email',
    email: 'Invalid email format',
  },
}

// Or per-form (lowercase keys for built-ins):
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minlength: 'Too short',
  },
  fields: [/* … */],
} as const satisfies FormConfig;">
</docs-code-compare>

**Async validators** in formly use `asyncValidators.<name>.expression` returning a `Promise` or `Observable`. ng-forge has two flavors: `httpValidators` for the common "ping the server with the value" case, and `asyncValidators` for arbitrary Angular `resource()`-API workflows. The simplest 1:1 with formly's example is `httpValidators`:

<docs-code-compare
  title="Async username availability check"
  formly="{
  key: 'username',
  type: 'input',
  props: { label: 'Username', required: true },
  asyncValidators: {
    unique: {
      expression: (control) =>
        this.api.checkUsername(control.value).pipe(
          map((available) => available),
        ),
      message: 'This username is already taken',
    },
  },
}"
  ngforge="// On the form config:
{
  customFnConfig: {
    httpValidators: {
      uniqueUsername: {
        request: (ctx) => {
          const username = ctx.value() as string;
          if (!username) return undefined;
          return `/api/users/check?username=${encodeURIComponent(username)}`;
        },
        onSuccess: (response) =>
          response.available ? null : { kind: 'taken' },
      },
    },
  },
  defaultValidationMessages: {
    taken: 'This username is already taken',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      required: true,
      validators: [{ type: 'http', functionName: 'uniqueUsername' }],
    },
  ],
}">
</docs-code-compare>

If you are using **schema validation** (Zod / Valibot / ArkType), most of this collapses into the schema itself — see [Schema validation and JSON-driven forms](#schema-validation-and-json-driven-forms) below.

## Conditional fields and dynamic props

This is where formly's `expressions` DSL — string-evaluated functions like `'!model.country'` — meets ng-forge's structured `logic` array. ng-forge's approach is more verbose but typed end-to-end and CSP-safe by default.

<docs-code-compare
  title="Hide a field based on another field's value"
  formly="{
  key: 'parentEmail',
  type: 'input',
  props: { label: 'Parent Email', type: 'email' },
  expressions: {
    hide: 'model.age >= 18',
    'props.required': 'model.age < 18',
  },
}"
  ngforge="{
  key: 'parentEmail',
  type: 'input',
  value: '',
  label: 'Parent Email',
  email: true,
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'age',
        operator: 'greaterOrEqual',
        value: 18,
      },
    },
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'age',
        operator: 'less',
        value: 18,
      },
    },
  ],
}">
</docs-code-compare>

If you have a complex condition and the structured form gets unwieldy, ng-forge has an escape hatch — a `javascript` condition that takes a string expression evaluated against `formValue` — but it's opt-in, not the default:

<docs-code-compare
  title="JavaScript expression as a condition (escape hatch)"
  formly="{
  key: 'taxId',
  expressions: {
    'props.required':
      'model.accountType === &quot;business&quot; && model.country === &quot;US&quot;',
  },
}"
  ngforge="{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  logic: [
    {
      type: 'required',
      condition: {
        type: 'javascript',
        expression: 'formValue.accountType === &quot;business&quot; && formValue.country === &quot;US&quot;',
      },
    },
  ],
}">
</docs-code-compare>

**Hidden field values work differently.** Formly's `resetOnHide` (default `true` since v6) actively *resets* a field's value when it becomes hidden — the value is gone from the model. ng-forge does not do this: hidden field values stay in the live form value, and the optional `excludeValueIfHidden` form option (or the global `withValueExclusionDefaults()` provider) filters them out only at **submission output** time. Mental model: formly mutates state when a field hides; ng-forge filters output. If your code relied on the formly reset, port it as an explicit derivation that clears the value when the hide condition is true.

<docs-hidden-field-flow></docs-hidden-field-flow>

## Cross-field validation

Formly puts cross-field validators on the parent `fieldGroup`. ng-forge does the same with a `group` field, and many users find Zod's `.refine()` / `.superRefine()` cleaner for this case.

<docs-code-compare
  title="Password and confirm-password match"
  formly="// Pre-register a fieldMatch validator
provideFormlyCore({
  validators: [
    {
      name: 'fieldMatch',
      validation: (control, _field, { errorPath }: any) => {
        const { password, passwordConfirm } = control.value;
        if (passwordConfirm === password) return null;
        return { fieldMatch: { errorPath: errorPath ?? 'passwordConfirm' } };
      },
    },
  ],
});

// Then in the form config:
fields = [
  {
    validators: {
      validation: [
        { name: 'fieldMatch', options: { errorPath: 'passwordConfirm' } },
      ],
    },
    fieldGroup: [
      {
        key: 'password',
        type: 'input',
        props: { type: 'password', label: 'Password', required: true },
      },
      {
        key: 'passwordConfirm',
        type: 'input',
        props: { type: 'password', label: 'Confirm', required: true },
      },
    ],
  },
];"
  ngforge="// Option A — using Zod (recommended)
import { z } from 'zod';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const schema = z
  .object({
    password: z.string().min(8),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Passwords must match',
    path: ['passwordConfirm'],
  });

const config = {
  schema: standardSchema(schema),
  fields: [
    {
      key: 'password',
      type: 'input',
      value: '',
      label: 'Password',
      props: { type: 'password' },
    },
    {
      key: 'passwordConfirm',
      type: 'input',
      value: '',
      label: 'Confirm',
      props: { type: 'password' },
    },
  ],
} as const satisfies FormConfig;">
</docs-code-compare>

## Custom field types

Both libraries register a Component against a name and let the field config reference it by name. The Component contract itself is what differs.

<docs-code-compare
  title="Registering a custom field type"
  formly="// 1. Component
@Component({
  selector: 'formly-rich-text',
  template: `
    <label>{{ props.label }}</label>
    <my-rich-editor
      [formControl]='formControl'
      [formlyAttributes]='field'>
    </my-rich-editor>
  `,
})
export class RichTextType extends FieldType<FieldTypeConfig> {}

// 2. Register
provideFormlyCore({
  types: [{ name: 'rich-text', component: RichTextType }],
})

// 3. Use
{ key: 'body', type: 'rich-text', props: { label: 'Content' } }"
  ngforge="// 1. Component — uses Angular Signal Forms' FieldTree primitive
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicText } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-rich-text',
  template: `
    @let f = field();
    <label>{{ label() }}</label>
    <my-rich-editor
      [value]='f().value()'
      (change)='f().valueChange.set($event)'>
    </my-rich-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RichTextField {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();
}

// 2. Register alongside the adapter
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

provideDynamicForm(
  ...withMaterialFields(),
  {
    name: 'rich-text',
    loadComponent: () => import('./rich-text'),
    mapper: valueFieldMapper,
  },
);

// 3. Use
{ key: 'body', type: 'rich-text', value: '', label: 'Content' }">
</docs-code-compare>

Two things differ:

- ng-forge custom fields are **standalone components with explicit `input` signals** rather than a base class with magic getters. They receive Angular Signal Forms' `FieldTree<T>` and read/write the value via `f().value()` / `f().valueChange.set(...)`.
- The library bridges your component to its internal state via a **`mapper`** (`valueFieldMapper`, `optionsFieldMapper`, etc.). For most field shapes you reuse a built-in mapper; for unusual ones you write a small custom mapper. See [Building an adapter](/building-an-adapter) for the full surface.

## Wrappers

Formly wrappers are components that include a `<ng-container #fieldComponent>` template marker. ng-forge wrappers are configured as objects with a `type` discriminator and optional props.

<docs-code-compare
  title="Wrapping a field in a panel"
  formly="// 1. Wrapper component
@Component({
  selector: 'formly-wrapper-panel',
  template: `
    <div class='card'>
      <h3 class='card-header'>{{ props.label }}</h3>
      <div class='card-body'>
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
})
export class PanelWrapper extends FieldWrapper {}

// 2. Register
provideFormlyCore({
  wrappers: [{ name: 'panel', component: PanelWrapper }],
});

// 3. Apply per-field
{ key: 'address', wrappers: ['panel'], props: { label: 'Address' } }"
  ngforge="// 1. Component — implements FieldWrapperContract (slot via viewChild)
import {
  Component, ChangeDetectionStrategy, ViewContainerRef, input, viewChild,
} from '@angular/core';
import type { FieldWrapperContract } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-panel-wrapper',
  template: `
    <div class='card'>
      <h3 class='card-header'>{{ title() }}</h3>
      <div class='card-body'>
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelWrapper implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>('');
}

// 2. Register (createWrappers is variadic — spread, do not array-wrap)
import { createWrappers } from '@ng-forge/dynamic-forms';

const appWrappers = createWrappers({
  wrapperName: 'panel',
  loadComponent: () => import('./panel-wrapper'),
});

provideDynamicForm(...withMaterialFields(), appWrappers);

// 3. Apply per-field — wrappers are config objects (carry props)
{
  key: 'address',
  type: 'group',
  fields: [/* … */],
  wrappers: [{ type: 'panel', title: 'Address' }],
}">
</docs-code-compare>

## Repeating sections / arrays

This is one of the biggest practical differences — and a common source of complaints in the formly ecosystem. **In formly, there is no built-in `repeat` type**: every formly app reimplements it as a custom `FieldArrayType` with `add()` / `remove()` handlers and a template. In ng-forge, arrays are first-class.

<docs-code-compare
  title="Repeating array of items"
  formly="// 1. Custom repeat type (every formly app needs this)
@Component({
  selector: 'formly-repeat',
  template: `
    <div *ngFor='let f of field.fieldGroup; let i = index'>
      <formly-field [field]='f'></formly-field>
      <button type='button' (click)='remove(i)'>Remove</button>
    </div>
    <button type='button' (click)='add()'>{{ props.addText }}</button>
  `,
})
export class RepeatType extends FieldArrayType {}

// 2. Register
provideFormlyCore({
  types: [{ name: 'repeat', component: RepeatType }],
});

// 3. Use
{
  key: 'tasks',
  type: 'repeat',
  props: { addText: 'Add Task' },
  fieldArray: {
    fieldGroup: [
      {
        key: 'name',
        type: 'input',
        props: { label: 'Task name', required: true },
      },
    ],
  },
}"
  ngforge="// Built in — verbose form (full control)
{
  key: 'tasks',
  type: 'array',
  fields: [
    [
      {
        key: 'task',
        type: 'row',
        fields: [
          {
            key: 'name',
            type: 'input',
            value: '',
            label: 'Task name',
            required: true,
          },
          { key: 'remove', type: 'removeArrayItem', label: 'Remove' },
        ],
      },
    ],
  ],
}

// Add button — separate field so it can live anywhere on the form
{
  key: 'addTask',
  type: 'addArrayItem',
  arrayKey: 'tasks',
  label: 'Add Task',
  template: [/* same row template */],
}

// Simplified form — same `type: 'array'`, just hand it a `template`
// and ng-forge auto-generates the add/remove buttons.
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  value: ['angular', 'typescript'],
  addButton: { label: 'Add Tag' },
  removeButton: { label: 'Remove' },
}">
</docs-code-compare>

Two flavors of the same `type: 'array'`:

- **Verbose form** (`fields: FieldDef[][]`) gives you full control — every item is an explicit field tree, every button is a placeable first-class field (`addArrayItem`, `prependArrayItem`, `insertArrayItem`, `removeArrayItem`, `popArrayItem`, `shiftArrayItem`). Put the add button anywhere — outside the array, in a sticky footer, in a sibling row.
- **Simplified form** (`template: FieldDef | FieldDef[]` + optional `addButton`/`removeButton`) is the ergonomic shortcut — pass a single field for `string[]` / `number[]` arrays, an array of fields for `Object[]` arrays, and ng-forge auto-generates the buttons.

## Multi-step wizards

Formly does not ship a wizard primitive — the canonical "stepper" example is a custom `FieldType` wrapping `mat-stepper`. ng-forge has a built-in `page` field type and `next` / `previous` button types that handle the navigation, per-page validation, and disabled-when-invalid state for you.

<docs-code-compare
  title="Two-step wizard"
  formly="// Custom stepper type required (rolling your own)
@Component({
  selector: 'formly-stepper',
  template: `
    <mat-horizontal-stepper>
      <mat-step
        *ngFor='let step of field.fieldGroup; let last = last'
        [completed]='isValid(step)'
      >
        <ng-template matStepLabel>{{ step.props.label }}</ng-template>
        <formly-field [field]='step'></formly-field>
        <button matStepperNext *ngIf='!last' [disabled]='!isValid(step)'>Next</button>
        <button *ngIf='last' [disabled]='!form.valid' type='submit'>Submit</button>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class StepperType extends FieldType { /* … */ }

// Then:
{
  type: 'stepper',
  fieldGroup: [
    { props: { label: 'Account' }, fieldGroup: [/* … */] },
    { props: { label: 'Profile' }, fieldGroup: [/* … */] },
  ],
}"
  ngforge="// Built in
{
  fields: [
    {
      key: 'account',
      type: 'page',
      fields: [
        {
          key: 'username',
          type: 'input',
          value: '',
          label: 'Username',
          required: true,
        },
        { type: 'next', key: 'next1', label: 'Next' },
      ],
    },
    {
      key: 'profile',
      type: 'page',
      fields: [
        { key: 'firstName', type: 'input', value: '', label: 'First name' },
        {
          type: 'row',
          key: 'buttons',
          fields: [
            { type: 'previous', key: 'back', label: 'Back' },
            { type: 'submit', key: 'submit', label: 'Submit' },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;">
</docs-code-compare>

The form value stays flat — pages are a layout / navigation concern, not a value-shape concern.

## Async data and dynamic options

Reactive options loading — populate a select from an HTTP call, or one select from another's value — is canonical in formly via `hooks.onInit` subscribing to `valueChanges`. In ng-forge it's a `derivation` with a `targetProperty` of `options`:

<docs-code-compare
  title="Cascade: load departments after a company is picked"
  formly="{
  key: 'department',
  type: 'select',
  props: { label: 'Department', options: [], valueProp: 'id', labelProp: 'name' },
  hooks: {
    onInit: (field) => {
      const company = field.parent.get('company').formControl;
      field.props.options = company.valueChanges.pipe(
        startWith(company.value),
        switchMap((id) => id ? this.api.departments(id) : of([])),
      );
    },
  },
}"
  ngforge="{
  key: 'department',
  type: 'select',
  value: '',
  label: 'Department',
  logic: [
    {
      type: 'derivation',
      targetProperty: 'options',
      source: 'http',
      http: {
        url: '/api/departments',
        queryParams: { companyId: 'formValue.company' },
      },
      responseExpression: 'response.map(d => ({ value: d.id, label: d.name }))',
      dependsOn: ['company'],
    },
  ],
}">
</docs-code-compare>

The same `http` shape works for **conditions** (hide if a flag endpoint says so), **value derivations** (look up a price after the user enters a SKU), and **property derivations** (populate options).

## Computed / derived values

Formly users typically write derived values via `expressions` setting `model.<key>` directly. ng-forge has a dedicated `derivation` shorthand and a structured `derivation` logic block.

<docs-code-compare
  title="Compute a total from quantity * unit price"
  formly="{
  key: 'total',
  type: 'input',
  props: { label: 'Total', readonly: true },
  expressions: {
    'model.total': 'model.quantity * model.unitPrice',
  },
}"
  ngforge="{
  key: 'total',
  type: 'input',
  value: 0,
  label: 'Total',
  disabled: true,
  derivation: 'formValue.quantity * formValue.unitPrice',
}">
</docs-code-compare>

For non-trivial derivations (reach to HTTP, depend on multiple async sources, debounce), use the long-form `logic: [{ type: 'derivation', … }]` block, which supports `source: 'http'`, `dependsOn: [...]`, `trigger: 'debounced'`, and `condition` to gate when it runs.

## Schema validation and JSON-driven forms

Two related-but-distinct concerns get conflated in the formly ecosystem: **schema-driven validation** (a schema enforces correctness) and **JSON-driven form generation** (a form structure comes from a serialized document, often a backend payload). ng-forge handles both, just differently.

**Schema-driven validation.** ngx-formly canonically uses **JSON Schema** for validation via `@ngx-formly/core/json-schema`'s `FormlyJsonschema.toFieldConfig(schema)`. ng-forge integrates with the **[Standard Schema](https://standardschema.dev) spec** — Zod, Valibot, ArkType, and any other library that implements it — via `standardSchema(yourSchema)`. Both approaches give you a single source of truth for shape + validation; ng-forge's choice runs through the modern TypeScript schema ecosystem (which can itself import JSON Schemas via `json-schema-to-zod` and similar tools).

**JSON-driven form generation.** ng-forge's `FormConfig` **is itself a JSON-serializable document** — you can author it as JSON, ship it from a backend, hydrate it on the client, hand it to `<form [dynamic-form]="config">`. There's no conversion step. If your backend currently emits JSON Schemas to drive formly, you have three options:

1. **Have the backend emit `FormConfig` directly.** This is the most ergonomic option — your API now ships ng-forge schemas as JSON, exactly the way formly apps consume JSON Schemas today.
2. **Generate `FormConfig` from your OpenAPI 3.x spec at build time** via `@ng-forge/openapi-generator`, then ship the generated `.ts` files. Best when the spec is your source of truth.
3. **Run a one-time `JSON Schema → FormConfig` conversion** during your migration. The two formats are structurally similar (object → properties → fields); a small adapter (~200 LOC) covers most apps. Or use Zod's `json-schema-to-zod` ecosystem if your validation is the part that has to remain JSON-Schema-driven.

<docs-code-compare
  title="Schema-driven validation"
  formly="// JSON Schema → FormlyFieldConfig
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';

const schema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 18, maximum: 120 },
  },
};

constructor(private formlyJsonschema: FormlyJsonschema) {
  this.fields = [this.formlyJsonschema.toFieldConfig(schema)];
}"
  ngforge="// Zod schema attached to a hand-authored field config
import { z } from 'zod';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
});

const config = {
  schema: standardSchema(schema),
  fields: [
    { key: 'email', type: 'input', value: '', label: 'Email', email: true },
    {
      key: 'age',
      type: 'input',
      value: 0,
      label: 'Age',
      props: { type: 'number' },
    },
  ],
} as const satisfies FormConfig;">
</docs-code-compare>

## Things that work differently (deliberate design choices)

These idioms translate, but with a different shape. The authoring feel changes; the outcomes match.

- **String expressions vs structured config.** Formly's `'model.foo === &quot;bar&quot;'` becomes either a `fieldValue` condition object or — for genuinely complex expressions — a `javascript` condition string. The default is structured because it's typed, CSP-safe, and refactorable. The JS escape hatch exists when you need it.
- **Hooks vs Angular lifecycle + EventBus.** ngx-formly's `hooks.onInit` / `onDestroy` map to standard Angular `effect()` / `OnDestroy` inside a custom field component. For cross-field coordination, ng-forge has an `EventBus` (inside fields) and `EventDispatcher` (from the host component) — see the [Events recipe](/recipes/events) for the full pattern.
- **Dependency tracking is automatic for some forms, explicit for others.** `fieldValue` conditions and shorthand `derivation` strings auto-detect the field paths they read, so they react when those fields change. Custom-function conditions and HTTP conditions / derivations require an explicit `dependsOn: [...]` because the engine can't introspect those bodies. Formly skips this because `expressions` re-runs against the whole model — historically more aggressively (every CD cycle pre-v6).
- **`templateOptions` cascading.** Formly inherits `props` through type-level `defaultOptions` and `extends` chains. ng-forge offers form-level `defaultProps` and adapter-level defaults (e.g., `withMaterialFields({ appearance: 'fill' })`) but no per-type inheritance chain — type-level defaults become a wrapper or a custom field component instead.
- **Wrappers carry their own props.** In formly, wrapper params (e.g., panel title) often come from the wrapped field's `props.label`. In ng-forge, wrapper config objects carry their own props (`{ type: 'panel', title: 'Address' }`) so the wrapped field doesn't need to know it has a wrapper. Cleaner separation; minor authoring change.
- **Per-field `parsers`, `modelOptions.debounce` / `updateOn`, `focus: true`.** Formly bundles a few small per-field hooks for value transformation, input→model commit timing, and autofocus on render. None has a direct per-field knob in ng-forge. Workarounds: a self-targeting `derivation` with `trigger: 'debounced'` covers `parsers`-style transforms; debouncing *consumers* of values (conditions, derivations) is built in via `debounceMs`; programmatic focus is a `viewChild` + `.nativeElement.focus()` in the host component. The Signal Forms substrate also handles input→model commit timing differently — values commit on every change by default, with no per-field override.
- **Bootstrap-style input `addons` (prefix / suffix slots).** Formly's `formly-bootstrap/addons` attaches text, icons, or buttons to an input via `props.addonLeft` / `props.addonRight`. ng-forge doesn't ship a built-in prefix/suffix slot in any adapter today — implement with a custom field type that wraps the adapter's input around your prefix/suffix elements (Material adapters can use `matPrefix` / `matSuffix` natively inside the custom component).

## What ng-forge does NOT have an equivalent for

This is the section that matters most. The answer to "should I migrate?" depends on whether any of these are blockers for your codebase.

- **`FormlyJsonschema.toFieldConfig(schema)` as a runtime converter.** No 1:1 equivalent — see [Schema validation and JSON-driven forms](#schema-validation-and-json-driven-forms) above for the three migration paths (backend emits `FormConfig`, OpenAPI generator at build time, or one-off JSON Schema → FormConfig converter).
- **A community plugin / extension ecosystem.** Formly has a long tail of community-built field types and extensions. ng-forge currently has only the four official UI adapters and the OpenAPI / MCP packages — adding a custom field type is easy, but you cannot count on finding one off-the-shelf.
- **Hot-swapping the form structure mid-edit.** Formly lets you replace `field.fieldGroup` at runtime. ng-forge's config is intended to be stable for the form's lifetime; structural changes happen via conditional logic (`hidden`) or by re-creating the form with a new config bound through a signal. If you swap entire form shapes from a remote API call mid-session, this requires re-thinking.
- **Two-or-more-dot prop paths in derivations.** Formly's `expressions: { 'props.minDate': 'model.startDate' }` lets you compute any prop from any expression. ng-forge's `targetProperty` derivations support up to one level of nesting (`options`, `label`, `disabled`, `hidden`, `placeholder`, `props.minDate`, …); two-plus dots (`props.config.foo`) push you to a custom field type.
- **Custom `valueProp` / `labelProp` for selects.** Formly accepts `valueProp: 'id'` / `labelProp: 'name'`. ng-forge's `FieldOption` is fixed at `{ value, label, disabled? }`, so source data with custom keys needs a one-time `.map()` (or a `targetProperty: 'options'` derivation with `responseExpression` to remap on the fly).
- **`extensions` API for cross-cutting field-construction hooks.** Formly's extension system (`extensions: ExtensionOption[]` in `provideFormlyCore`) lets you mutate every field's config during construction — set type defaults, register `prePopulate` / `postPopulate` hooks, transform configs tree-wide. ng-forge has form-level `defaultProps`, adapter-level provider features, and `customFnConfig` for shared functions, but no public extension API of that shape. If your formly app relies on extensions for declarative type-level defaults or cross-cutting transforms, you'll factor those into wrappers, custom field components, or build-time codegen.
- **Maturity at scale.** ngx-formly has been in production for years across thousands of apps. ng-forge is younger — fewer Stack Overflow answers, fewer war stories, fewer copy-paste solutions. We compensate with an [MCP server](/ai-integration) so an LLM can scaffold configs for you, and an active Discord, but it's a fair tradeoff to call out.

If none of those are blockers, the migration is mostly mechanical. If one or more is, you'll want to gate-check before committing.

## OpenAPI generator

If your formly forms are driven by an OpenAPI 3.x spec, `@ng-forge/openapi-generator` is the closest analogue to formly's `FormlyJsonschema` pattern. It generates a `FormConfig` *and* the inferred form-value TypeScript type from the spec at build time, so submission handlers end up typed end-to-end. See the [OpenAPI generator guide](/openapi-generator) for setup.

## FAQ

**Will my custom validators port over?**
Yes — the validator-function bodies usually port unchanged. You'll move them from formly's `validators: { name: { expression, message } }` shape to ng-forge's `customFnConfig.validators` (sync), `customFnConfig.httpValidators` (HTTP-driven), or `customFnConfig.asyncValidators` (Angular resource-API). The signature shifts from `(control) => …` to `(ctx) => …` — read the value via `ctx.value()`. Validators return only `{ kind: '…' }`; the human-readable message is configured separately on the field's `validationMessages` (or the form's `defaultValidationMessages`), so the same `kind` can be reused and localised.

**Will my custom field types port over?**
Yes — both libraries use Angular components. You'll change the base class (or remove it — ng-forge custom fields are plain Angular components with `input` / `output` signals) and the registration call. Templates often need only minor tweaks.

**Can I run both libraries side by side during a migration?**
Yes. They don't conflict — different package names, different injection tokens, different component selectors. A sensible migration is: install ng-forge, port one form at a time, deprecate formly only when nothing imports `@ngx-formly/*`.

**Does ng-forge support Angular 21?**
Yes — ng-forge requires Angular 21+ as its baseline (signal-native APIs depend on it). If you're stuck on Angular ≤17 today, migrating to ng-forge implies an Angular upgrade first.

**Does ng-forge use Reactive Forms (`FormGroup` / `FormControl`)?**
No. ng-forge is built on Angular **Signal Forms** (`@angular/forms/signals`), a separate system from Reactive Forms with a different primitive — `FieldTree<T>` — that holds value, validity, dirty/touched state, and errors as signals. There is no `FormGroup` or `FormControl` involved. Reactive Forms still exists in Angular and continues to work for code that uses it, but the two systems don't share types or APIs. If your formly app exposes a `formGroup` to consumers (template parents, services, etc.), those touch-points have no direct equivalent and need to be rewritten against the Signal Forms / ng-forge surface.

**What about i18n?**
Field labels, validation messages, and hint text accept `Signal<string> | Observable<string> | string`. Hand them an i18n signal and they update reactively. The [i18n guide](/dynamic-behavior/i18n) walks through patterns.

**How do I report bugs / get help?**
Open an issue at [github.com/ng-forge/ng-forge](https://github.com/ng-forge/ng-forge/issues) or join [Discord](https://discord.gg/qpzzvFagj3). For evaluation help, the [MCP server](/ai-integration) lets an LLM in your IDE scaffold configs for you.

## Migration checklist

A pragmatic order to port a non-trivial app:

1. **Audit blockers** against [What ng-forge does NOT have an equivalent for](#what-ng-forge-does-not-have-an-equivalent-for). If any apply to your app, decide upfront whether you'll work around or stay.
2. **Install ng-forge** and the matching UI adapter (see [Setup](#setup)). Both libraries can coexist.
3. **Port one read-only form first** — typically a settings page or a profile form. Fewer moving parts; easier sanity check.
4. **Translate validators next.** Centralise custom validators on a single `customFnConfig` object you can import everywhere.
5. **Translate forms in dependency order.** Forms with no cross-form coupling first; complex multi-step / array-heavy ones last.
6. **Remove formly when nothing imports `@ngx-formly/*`.** `pnpm uninstall @ngx-formly/core @ngx-formly/<theme>` and clean up `provideFormlyCore`.

Estimated effort scales close to linearly with form count for the simple cases, and superlinearly with custom-validator and custom-type complexity. Plan an extra pass for performance verification on array-heavy forms — this is one of the cases where you should see a meaningful improvement coming from formly.

## Next steps

- **[Getting started](/getting-started)** — install ng-forge, pick an adapter, render a form.
- **[Configuration](/configuration)** — `defaultProps`, global validators, schema integration.
- **[Examples](/examples)** — complete working forms covering most patterns above.
- **[OpenAPI generator](/openapi-generator)** — for backend-driven forms.
- **[AI integration (MCP)](/ai-integration)** — scaffold configs from your IDE.

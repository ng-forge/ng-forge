---
title: Migrating from ngx-formly to ng-forge
slug: migrating-from-ngx-formly
description: Concept-by-concept mapping from ngx-formly to ng-forge with side-by-side code and a list of gaps.
---

# Migrating from ngx-formly to ng-forge

A migration reference for moving an Angular dynamic-forms app from **ngx-formly** to **ng-forge**. Both libraries share the same shape — a config object describes the form, the library renders it — so most concepts map directly.

## Who this guide is for

Strong reasons to migrate:

- You're standardising on Angular **Signal Forms** as your form substrate. ng-forge is built on Signal Forms (`@angular/forms/signals`); formly is built on Reactive Forms.
- You want schema-validation-first design (Zod / Valibot / ArkType) or built-in async value derivation.
- You're hitting performance limits with large forms or array sections — see [Performance](#performance) below for the substrate-level reasons.

Reasons to stay on formly:

- You depend on community formly extensions or a deep ecosystem of custom types you'd have to re-port.
- You need a stable, low-churn API today, and the migration cost outweighs the substrate-level benefits for your codebase.

(Using a UI library ng-forge does not ship today — Kendo, NG-ZORRO, NativeScript — is **not** a reason to stay. See [Building an Adapter](/building-an-adapter).)

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

The default shifts from **string-first** (formly's `expressions` DSL, template options) to **structured-config-first**. Strings still exist in ng-forge as shorthand (`derivation: 'formValue.x * formValue.y'`) and escape hatches (the `javascript` condition), but the typical condition or derivation is now a typed object the engine can analyse for dependencies, refactor safely, and run under strict CSP.

## Setup

Install core + a UI theme, register them once at the application root.

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

Three things to internalise:

- **`label` / `required` / `email` / `min` / `max` / `minLength` / `maxLength` / `pattern` / `placeholder` live at the top level of the field**, not under `props`. `props` carries the rendered control's attributes (`type: 'email'`, `rows`) and UI-adapter-specific options (`appearance`, `hint` for Material; equivalents elsewhere).
- **`value` seeds the initial value and the inferred type** — `value: ''` makes the field a string, `value: 0` makes it a number. Optional; omit when the field is computed or hydrated from a backend.
- **`as const satisfies FormConfig` is how strong typing flows in.** No decorator-style generics; the literal field shapes infer the form value.

Two-way binding is `[(value)]` (Angular `model()` signal); read-only access is `(submitted)`, `(events)`, or the `formValue` signal off a `viewChild` ref.

## Field types

The names line up directly except for a few cases.

| ngx-formly type     | ng-forge type           | Notes                                                              |
| ------------------- | ----------------------- | ------------------------------------------------------------------ |
| `input`             | `input`                 | HTML input type goes in `props.type` in both                       |
| `textarea`          | `textarea`              | `props.rows` in both                                               |
| `checkbox`          | `checkbox`              | Single boolean                                                     |
| `multicheckbox`     | `multi-checkbox`        | Hyphenated in ng-forge                                             |
| `radio`             | `radio`                 |                                                                    |
| `select`            | `select`                | `options` is **top-level** on the field in ng-forge                |
| `datepicker` (Material) | `datepicker`        |                                                                    |
| `slider` / `toggle` (Material) | `slider` / `toggle` |                                                              |
| `repeat` (custom)   | `array` (built-in)      | Verbose (explicit `fields[][]` + button fields) or simplified (`template` + auto-buttons) |
| _none_              | `page`                  | Multi-step container                                               |
| _none_              | `row`                   | Horizontal flex layout                                             |
| _none_              | `text`                  | Display-only label / heading                                       |
| _none_              | `submit` / `next` / `previous` / `addArrayItem` / `removeArrayItem` | Built-in action buttons; auto-disabled while the form is invalid  |

**Selects.** Formly takes `options` inside `props`; ng-forge takes `options` at the top level. The `FieldOption` shape is fixed at `{ value, label, disabled? }` — if your data has custom keys, remap once at the source (`data.map(d => ({ value: d.id, label: d.name }))`) or use a `targetProperty: 'options'` derivation (see [Async data](#async-data-and-dynamic-options)).

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

## Validators

Both libraries support shorthand validators (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`) and a registry for custom validators. In formly, field-level validator config is *keyed by validator name* with an `expression` function inside; in ng-forge it's an *array* of validator objects with a `type` discriminator. Custom validator functions live on the form config under `customFnConfig`, split into three pillars by execution model:

<docs-validator-pillars></docs-validator-pillars>

Validator functions return only `{ kind }` — the human-readable message is configured separately via `validationMessages` (per-field) or `defaultValidationMessages` (form-level), so the same `kind` can be localised consistently.

<docs-code-compare
  title="Custom validator"
  formly="{
  key: 'ip',
  type: 'input',
  props: { label: 'IP Address', required: true },
  validators: {
    ip: {
      expression: (c: AbstractControl) =>
        !c.value || /(\d{1,3}\.){3}\d{1,3}/.test(c.value),
      message: 'Not a valid IP Address',
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

For HTTP-driven and async (`resource()`-API) validators, see [Custom validators](/validation/custom-validators). For the full validation reference (built-in keys, message localisation, conditional validators), see [Validation reference](/validation/reference).

## Conditional fields and dynamic props

Formly's `expressions` DSL — string-evaluated functions like `'!model.country'` — becomes ng-forge's structured `logic` array. More verbose, typed end-to-end, CSP-safe by default.

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

For genuinely complex expressions, ng-forge has an opt-in `javascript` condition (a string evaluated against `formValue`) — see [Conditional logic](/dynamic-behavior/conditional-logic).

**Hidden field values work differently.** Formly defaults to actively *resetting* a field's value when it becomes hidden (via `resetOnHide`). ng-forge keeps the value live; the optional `excludeValueIfHidden` form option filters it out at submission time. If your code relied on the formly reset, port it as an explicit derivation that clears the value when the hide condition is true. See [Hidden fields](/prebuilt/hidden-fields) and the [common pitfalls](/feature-overview#common-pitfalls).

## Cross-field validation

Formly puts cross-field validators on the parent `fieldGroup`. ng-forge does the same with a `group` field, but most users find Zod's `.refine()` / `.superRefine()` cleaner for this case:

```typescript
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
    { key: 'password', type: 'input', value: '', label: 'Password', props: { type: 'password' } },
    { key: 'passwordConfirm', type: 'input', value: '', label: 'Confirm', props: { type: 'password' } },
  ],
} as const satisfies FormConfig;
```

## Custom field types

Both libraries register a Component against a name and let the field config reference it by name. ng-forge custom fields are **plain standalone components** with explicit `input` signals (no base class with magic getters); they receive Angular Signal Forms' `FieldTree<T>` and read/write via `f().value()` / `f().valueChange.set(...)`. The library bridges your component to its internal state via a `mapper` (`valueFieldMapper`, `optionsFieldMapper`, etc.) — for most field shapes you reuse a built-in mapper.

See [Adding custom fields](/recipes/custom-fields) for the full walkthrough.

## Wrappers

Formly wrappers are components that include a `<ng-container #fieldComponent>` template marker. ng-forge wrappers do the same, but use `viewChild.required('fieldComponent', { read: ViewContainerRef })` to expose the slot. Wrapper *configuration* is also more explicit: ng-forge wrappers are config objects (`{ type: 'panel', title: 'Address' }`) that carry their own props, so the wrapped field doesn't need to know it's wrapped.

See [Writing a wrapper](/wrappers/writing-a-wrapper) and [Registering and applying](/wrappers/registering-and-applying).

## Repeating sections / arrays

**Formly has no built-in `repeat` type** — apps register a custom `FieldArrayType` with `add()` / `remove()` handlers and a template. ng-forge ships `type: 'array'` directly.

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
      { key: 'name', type: 'input', props: { label: 'Task name', required: true } },
    ],
  },
}"
  ngforge="// Simplified form — pass a template, ng-forge auto-generates buttons
{
  key: 'tags',
  type: 'array',
  template: { key: 'value', type: 'input', label: 'Tag' },
  value: ['angular', 'typescript'],
  addButton: { label: 'Add Tag' },
  removeButton: { label: 'Remove' },
}

// Verbose form — full control over per-item layout and button placement
{
  key: 'tasks',
  type: 'array',
  fields: [
    [
      {
        key: 'task',
        type: 'row',
        fields: [
          { key: 'name', type: 'input', value: '', label: 'Task name', required: true },
          { key: 'remove', type: 'removeArrayItem', label: 'Remove' },
        ],
      },
    ],
  ],
}">
</docs-code-compare>

The verbose form gives you placeable button fields (`addArrayItem`, `prependArrayItem`, `insertArrayItem`, `removeArrayItem`, `popArrayItem`, `shiftArrayItem`) — put the add button anywhere, including outside the array.

## Multi-step wizards

Formly does not ship a wizard primitive — the canonical "stepper" example is a custom `FieldType` wrapping `mat-stepper`. ng-forge has a built-in `page` field type and `next` / `previous` button types that handle navigation, per-page validation, and disabled-when-invalid state.

```typescript
{
  fields: [
    {
      key: 'account',
      type: 'page',
      fields: [
        { key: 'username', type: 'input', value: '', label: 'Username', required: true },
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
} as const satisfies FormConfig;
```

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

For non-trivial derivations (HTTP, multiple async sources, debounce), use the long-form `logic: [{ type: 'derivation', … }]` block, which supports `source: 'http'`, `dependsOn: [...]`, `trigger: 'debounced'`, and `condition` to gate when it runs.

## Schema validation and JSON-driven forms

Two related concerns: **schema-driven validation** (a schema enforces correctness) and **JSON-driven form generation** (the form structure itself comes from a serialized document, often a backend payload). ng-forge handles both.

**Schema-driven validation.** ngx-formly canonically uses **JSON Schema** for validation via `@ngx-formly/core/json-schema`'s `FormlyJsonschema.toFieldConfig(schema)`. ng-forge integrates with the **[Standard Schema](https://standardschema.dev) spec** — Zod, Valibot, ArkType, and any other library that implements it — via `standardSchema(yourSchema)`.

**JSON-driven form generation.** ng-forge's `FormConfig` **is itself a JSON-serializable document** — you can author it as JSON, ship it from a backend, hydrate it on the client. There's no conversion step. If your backend currently emits JSON Schemas to drive formly, you have three options:

1. **Have the backend emit `FormConfig` directly** — most ergonomic; your API now ships ng-forge schemas as JSON.
2. **Generate `FormConfig` from your OpenAPI 3.x spec at build time** via `@ng-forge/openapi-generator`. Best when the spec is your source of truth.
3. **Run a one-time `JSON Schema → FormConfig` conversion** during your migration. The two formats are structurally similar; a small adapter (~200 LOC) covers most apps.

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
    { key: 'age', type: 'input', value: 0, label: 'Age', props: { type: 'number' } },
  ],
} as const satisfies FormConfig;">
</docs-code-compare>

## Things that work differently

- **Strings → structured config.** `'model.foo === "bar"'` becomes a `fieldValue` condition object (or a `javascript` escape-hatch string for genuinely complex expressions).
- **Hooks → Angular lifecycle + EventBus.** `hooks.onInit` / `onDestroy` map to `effect()` / `OnDestroy` inside a custom field. Cross-field coordination uses the [EventBus / EventDispatcher](/recipes/events).
- **Dependency tracking.** `fieldValue` conditions and shorthand `derivation` strings auto-detect the field paths they read. Custom-function and HTTP variants need an explicit `dependsOn: [...]` because the engine can't introspect those bodies.
- **`templateOptions` cascading.** Formly inherits `props` through `defaultOptions` and `extends` chains. ng-forge has form-level `defaultProps` and adapter-level defaults, but no per-type inheritance — type-level defaults become a wrapper or a custom field component instead.
- **Wrappers carry their own props.** Wrapper config objects own their props (`{ type: 'panel', title: 'Address' }`), so the wrapped field doesn't need to know it has a wrapper.
- **`parsers`, `modelOptions.debounce`, `focus: true`.** No direct per-field knobs. Workarounds: a self-targeting `derivation` with `trigger: 'debounced'` covers `parsers`-style transforms; consumers (conditions, derivations) debounce via `debounceMs`; programmatic focus is a `viewChild` + `.nativeElement.focus()` in the host component.
- **`modelOptions.updateOn: 'blur' | 'submit'`.** No equivalent today — `LogicTrigger` only exposes `'onChange' | 'debounced'`, and the Signal Forms substrate commits on every change. If formly's commit-on-blur was load-bearing for your form, debouncing the consumers (validators, derivations) is the closest workaround. This is a hard wall, not a knob.
- **Bootstrap-style input addons (prefix / suffix slots).** Formly's `formly-bootstrap/addons` attaches text, icons, or buttons to an input via `props.addonLeft` / `props.addonRight`. ng-forge does not ship a built-in prefix/suffix slot today, but a first-class addon API is **WIP and is targeted for 0.9**. Until then, implement with a custom field type that wraps the adapter's input around your prefix/suffix elements (Material adapters can use `matPrefix` / `matSuffix` natively inside the custom component).

## What ng-forge does NOT have an equivalent for

If any of these are blockers, decide upfront before starting the migration.

- **`FormlyJsonschema.toFieldConfig(schema)` as a runtime converter.** No 1:1. See [Schema validation](#schema-validation-and-json-driven-forms) for the three migration paths.
- **A community plugin / extension ecosystem.** Formly has a long tail of community-built field types and extensions; ng-forge currently has only the four official UI adapters and the OpenAPI / MCP packages.
- **Two-or-more-dot prop paths in derivations.** Formly's `expressions: { 'props.config.foo': '…' }` lets you compute any nested prop. ng-forge supports up to one level (`options`, `label`, `disabled`, `props.minDate`, …) and **throws `DynamicFormError` at form-initialisation time** if the path goes deeper — restructure your prop shape so the dynamic value sits at the top of `props`, or move the dynamic computation into a custom field component.
- **Custom `valueProp` / `labelProp` for selects.** ng-forge's `FieldOption` is fixed at `{ value, label, disabled? }`; remap source data with `.map()` or a `targetProperty: 'options'` derivation.
- **`extensions` API for cross-cutting field-construction hooks.** Formly's extensions can mutate every field's config during construction. ng-forge has no public equivalent — those concerns become wrappers, custom field components, or build-time codegen.
- **Maturity at scale.** ngx-formly has been in production for years; ng-forge is younger — fewer Stack Overflow answers, fewer copy-paste solutions on the long tail. The [MCP server](/ai-integration) and [Discord](https://discord.gg/qpzzvFagj3) help, but they don't replace years of community-tested patterns.

## OpenAPI generator

If your formly forms are driven by an OpenAPI 3.x spec, `@ng-forge/openapi-generator` is the closest analogue to formly's `FormlyJsonschema` pattern. It generates a `FormConfig` *and* the inferred form-value TypeScript type from the spec at build time, so submission handlers end up typed end-to-end. See the [OpenAPI generator guide](/openapi-generator).

## Performance

ng-forge is **built for zoneless** — every default component runs `ChangeDetectionStrategy.OnPush` and the value/validity/dirty-tracking layer is signal-driven, so there is no whole-tree change-detection cycle on every input event the way zone.js + Reactive Forms triggers one. The renderer also uses stable `track` keys on every `@for`, preserves field-instance identity across config updates so unchanged fields don't re-render, defers non-adjacent pages in multi-step forms via `@defer (on idle)`, and updates arrays differentially (appending an item only renders the new one).

<docs-perf-pipeline></docs-perf-pipeline>

## FAQ

**Can I run both libraries side by side during a migration?**
Yes. They don't conflict — different package names, different injection tokens, different component selectors. Install ng-forge, port one form at a time, deprecate formly only when nothing imports `@ngx-formly/*`.

**Does ng-forge support Angular 21?**
Yes — ng-forge requires Angular 21+ as its baseline (signal-native APIs depend on it). If you're on Angular 20 or earlier, migrating to ng-forge implies an Angular upgrade first.

**Does ng-forge use Reactive Forms (`FormGroup` / `FormControl`)?**
No. ng-forge is built on Angular **Signal Forms** (`@angular/forms/signals`), a separate system with a different primitive — `FieldTree<T>` — that holds value, validity, dirty/touched state, and errors as signals. There is no `FormGroup` or `FormControl` involved. If your formly app exposes a `formGroup` to consumers (template parents, services, etc.), those touch-points have no direct equivalent and need to be rewritten against the Signal Forms surface.

**How do I report bugs / get help?**
Open an issue at [github.com/ng-forge/ng-forge](https://github.com/ng-forge/ng-forge/issues) or join [Discord](https://discord.gg/qpzzvFagj3). For evaluation help, the [MCP server](/ai-integration) lets an LLM in your IDE scaffold configs for you.

## Migration checklist

An order that works for porting a non-trivial app:

1. **Audit blockers** against [What ng-forge does NOT have an equivalent for](#what-ng-forge-does-not-have-an-equivalent-for). Decide upfront whether you'll work around or stay.
2. **Install ng-forge** and the matching UI adapter (see [Setup](#setup)). Both libraries can coexist.
3. **Port one read-only form first** — typically a settings page or a profile form. Fewer moving parts; easier sanity check.
4. **Translate validators next.** Centralise custom validators on a single `customFnConfig` object you can import everywhere.
5. **Translate forms in dependency order.** Forms with no cross-form coupling first; complex multi-step / array-heavy ones last.
6. **Remove formly when nothing imports `@ngx-formly/*`.** `pnpm uninstall @ngx-formly/core @ngx-formly/<theme>` and clean up `provideFormlyCore`.

**Rough effort estimate.** Plan ~half a day per simple form (a login, a profile, a contact form), and ~1–2 days per non-trivial form (multi-step wizards, custom field types, schema-driven forms with non-trivial cross-field validators, anything with custom wrappers or extension hooks). Plus an extra pass for performance verification on array-heavy forms — this is one of the cases where you should see meaningful improvement coming from formly. There is no automated migration tool today; port manually.

## Next steps

- **[Getting started](/getting-started)** — install ng-forge, pick an adapter, render a form.
- **[Configuration](/configuration)** — `defaultProps`, global validators, schema integration.
- **[Examples](/examples)** — complete working forms covering most patterns above.
- **[OpenAPI generator](/openapi-generator)** — for backend-driven forms.
- **[AI integration (MCP)](/ai-integration)** — scaffold configs from your IDE.

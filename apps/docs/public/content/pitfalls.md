---
title: Common Pitfalls
slug: pitfalls
description: Surprises and footguns that catch ng-forge users — what each looks like in code, why it happens, and the canonical fix.
---

A running list of the patterns that trip people up. Each entry is **Symptom → Why → Fix** so you can scan to the one that matches what you're seeing.

## I used `type: 'group'` to make a section, now my form value is nested

**Symptom.** You wanted "a card with three fields inside". You reached for `type: 'group'` because it accepts `fields: [...]`. Now your form value looks like `{ section: { firstName, email, phone } }` instead of `{ firstName, email, phone }`, and you're mapping the nested object back out at submit time.

**Why.** `group` is for **data nesting** — `user.address.street` shape. The `key` becomes a level in the form value. If all you wanted was a _visual_ grouping, `group` is the wrong primitive.

**Fix.** Use [`type: 'container'`](/prebuilt/container-field) instead. Containers flatten their children into the parent form value (same as `row`) and give you a wrapper-chain slot for the visual treatment — section header, card, collapsible panel, whatever.

```typescript
// Before — group adds nesting
{ type: 'group', key: 'contact', fields: [/* … */] }
// formValue.contact.firstName

// After — container is flat, visual-only
{
  type: 'container',
  key: 'contactSection',
  wrappers: [{ type: 'section', title: 'Contact' }],
  fields: [/* … */],
}
// formValue.firstName
```

Quick reference:

- **`row`** — flat value, horizontal layout (12-col grid)
- **`container`** — flat value, wrapper chain
- **`group`** — **nested** value, no layout

## My hidden field's value is still in the submitted form value

**Symptom.** A field has `logic: [{ type: 'hidden', condition: { … } }]`. The user can't see it. But on `(submitted)`, its previous value is still in the payload.

**Why.** ng-forge keeps hidden values in the live form value (so a hide/show toggle preserves what the user typed). Filtering happens at **submission output** time only, and only when you opt in.

**Fix.** Set `excludeValueIfHidden: true` in the form options, or apply globally with `withValueExclusionDefaults({ excludeValueIfHidden: true })` in `provideDynamicForm`. There are sibling options for disabled and readonly:

```typescript
const config = {
  options: {
    excludeValueIfHidden: true,
    excludeValueIfDisabled: true,
    excludeValueIfReadonly: true,
  },
  fields: [
    /* … */
  ],
} as const satisfies FormConfig;
```

If you want the value _cleared from state_ the moment the field hides (formly's `resetOnHide` behaviour), wire a `derivation` that returns `undefined` when the hide condition is true.

## My custom validator runs but no error message renders

**Symptom.** Validator returns `{ kind: 'noSpaces' }`. Field is invalid. No message appears under the input. Console logs a warning along the lines of "no message configured for kind".

**Why.** ng-forge validators only declare the **error kind**. Human-readable messages live separately so the same kind can be reused, localised, and overridden per-field.

**Fix.** Configure the message under either `validationMessages` (per-field) or `defaultValidationMessages` (form-level):

```typescript
{
  customFnConfig: {
    validators: {
      noSpaces: (ctx) => /\s/.test(ctx.value() as string) ? { kind: 'noSpaces' } : null,
    },
  },
  defaultValidationMessages: {
    noSpaces: 'Spaces are not allowed',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      validators: [{ type: 'custom', functionName: 'noSpaces' }],
      // Or per-field override:
      // validationMessages: { noSpaces: 'No spaces in usernames' },
    },
  ],
}
```

## My custom-function condition doesn't react when its dependencies change

**Symptom.** A field hides via `condition: { type: 'custom', functionName: 'isAdult' }`. The custom function reads `ctx.formValue.age`. Toggling `age` doesn't re-evaluate the condition.

**Why.** `fieldValue` conditions and shorthand `derivation` strings auto-detect their dependencies because the engine can read the field paths off the structured config. **Custom functions and HTTP conditions/derivations** can't be statically introspected, so the engine doesn't know what to subscribe to.

**Fix.** List dependencies explicitly with `dependsOn`:

```typescript
{
  key: 'parentalConsent',
  type: 'checkbox',
  value: false,
  logic: [
    {
      type: 'hidden',
      condition: { type: 'custom', functionName: 'isAdult' },
      dependsOn: ['age'],
    },
  ],
}
```

Same for HTTP-driven conditions and derivations.

## My select's options don't render — my data has `id` / `name`, not `value` / `label`

**Symptom.** Backend returns `[{ id: 1, name: 'Active' }, …]`. You hand it to `options`. The dropdown shows blank rows, or shows `[object Object]`, depending on adapter.

**Why.** ng-forge's `FieldOption` is fixed at `{ value, label, disabled? }`. There's no `valueProp` / `labelProp` mapping like formly's.

**Fix.** Remap once at the source:

```typescript
const departmentOptions = await api.departments();
const config = {
  fields: [
    {
      key: 'department',
      type: 'select',
      value: '',
      options: departmentOptions.map((d) => ({ value: d.id, label: d.name })),
    },
  ],
};
```

Or, if the data comes from HTTP, do the remap inside a `targetProperty: 'options'` derivation:

```typescript
{
  key: 'department',
  type: 'select',
  value: '',
  logic: [
    {
      type: 'derivation',
      targetProperty: 'options',
      source: 'http',
      http: { url: '/api/departments' },
      responseExpression: 'response.map(d => ({ value: d.id, label: d.name }))',
    },
  ],
}
```

## My derivation on `props.config.foo` doesn't fire

**Symptom.** A `targetProperty: 'props.config.minDate'` derivation never updates the field's prop. No error, just no effect.

**Why.** `targetProperty` paths support up to one level of nesting (`options`, `label`, `props.minDate`, etc.). Two-or-more-dot paths (`props.config.foo`) aren't in the supported set today.

**Fix.** Either restructure your prop shape so the dynamic value sits at the top of `props`, or move the dynamic computation into a custom field component that reads the value off a sibling field directly.

## More questions?

- General API questions: [API Reference](/api-reference) and [Recipes](/recipes/custom-fields).
- Coming from formly: [Migrating from ngx-formly](/migrating-from-ngx-formly).
- Stuck on something not listed: [Discord](https://discord.gg/qpzzvFagj3) or [GitHub Issues](https://github.com/ng-forge/ng-forge/issues).

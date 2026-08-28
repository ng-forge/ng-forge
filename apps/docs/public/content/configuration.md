---
title: Configuration
slug: configuration
description: 'Configure ng-forge at the provider, form, and field level. Learn the configuration cascade and how to set global defaults and per-field props.'
---

> [!TIP]
> **Coming from ngx-formly?** The [migration guide](/migrating-from-ngx-formly) maps `defaultProps`, `extends`, and the formly `extensions` API to their ng-forge equivalents.

Configure global defaults for all forms at provider level, or per-form via `defaultProps`.

## The Cascade

ng-forge applies props in priority order: more specific always wins.

<docs-cascade-visual></docs-cascade-visual>

---

<docs-configuration-view></docs-configuration-view>

---

## Large-form rendering

Paged and flat forms use separate rendering controls.

For a paged form, `options.pagePreloadWindow` controls how many neighbouring pages are mounted and preloaded. The default is `1`. Set it to `0` when only the active page should load, or increase it when fast jump navigation matters more than initial work.

For a large flat form, `options.fieldWindowing` can defer leaf fields until they approach the viewport:

```typescript
const config = {
  options: {
    fieldWindowing: {
      eager: 20,
      placeholderHeight: '4rem',
      park: { margin: '100%' },
    },
  },
  fields: [
    // Flat field definitions
  ],
} as const satisfies FormConfig;
```

- `eager` mounts the leading leaf fields immediately.
- `placeholderHeight` reserves layout space before a deferred field mounts.
- `park` leaves mounted offscreen DOM in place while removing its view from routine change detection. Disabled, readonly, required, and validation state stays current. Other model-to-DOM updates catch up when the field returns.
- `park.margin` follows `IntersectionObserver.rootMargin`: use one to four `px` or `%` values. Unsupported units fall back to the inherited margin.
- `fieldWindowing: false` disables inherited deferred mounting for this form.
- A park-only object changes parking without changing the inherited mounting mode. Use `{ park: false }` to opt out or `{ park: true }` to opt in.

Use `withFieldWindowing()` at provider level when the same defaults should apply to every form. Per-form options take precedence.

---

## Field-level Props

Each field type also accepts its own adapter-specific `props`. See [Field Types](/field-types/text-inputs) for the full per-field reference.

### Nullable values

Value fields accept an optional `nullable?: boolean` flag. When `true`:

- `value` accepts `null` in addition to the field's normal type (e.g. `string | null`).
- An omitted `value` resolves to `null` instead of the type-specific empty default (`''`, `NaN`, `[]`, …).
- `nullable` stays orthogonal to `required`: they describe different layers. `nullable` declares that the **model** accepts `null` (data shape). `required` is a **validation** constraint. ng-forge maps `{ type: 'required' }` to the Signal Forms `required()` validator, which treats `null` as invalid, so a field that is both `nullable` and `required` will fail required-validation when the value is `null`. The flags are independent OpenAPI concepts; combine them if that matches your schema, but understand the runtime interaction.

```typescript
{
  key: 'middleName',
  type: 'input',
  label: 'Middle Name',
  nullable: true,
  value: null,       // allowed; also the resolved default when omitted
}
```

**Read-side caveat.** A user clearing a text input reads back as `""`, not `null`. This is a DOM/Web IDL contract, identical to classic Reactive Forms. `nullable` is a contract for _accepted_ values, not a guarantee of _emitted_ ones. If your backend distinguishes null from empty string, handle the coercion at submission.

## Multiple forms on one page

Each field renders a DOM `id` derived from its key (`id="email"`, `id="email-input"`), and that id is reused for the `<label for>`, `aria-describedby`, and error/hint targets. Render **two forms built from the same config** on one page and those ids collide: clicking the second form's label focuses the first form's input, and duplicate ids are invalid HTML that also break `getByLabelText`-style queries.

ng-forge scopes ids to a form instance to prevent this:

- **One form on the page**: ids stay clean and unprefixed (`email-input`). Nothing changes, so existing selectors and `data-testid`s are untouched.
- **Two or more forms visible at once**: each form automatically gets a generated prefix (`df-1`, `df-2`, …), so its ids become `df-2_email-input`. Detection tracks the forms currently rendered, so a form reverts to clean, unprefixed ids once it's the only one left (and hidden/cached pages, such as a previous route still in the DOM, don't count).

Set `options.idPrefix` when you want **stable, human-readable** ids regardless of how many forms are on the page (recommended when you control both forms). An explicit prefix always wins over auto-detection:

```typescript
const billing = {
  options: { idPrefix: 'billing' },
  fields: [{ key: 'email', type: 'input', label: 'Email' }],
} as const satisfies FormConfig;
// → <form id="billing">, <input id="billing_email-input">, <label for="billing_email-input">
```

The prefix is the **outermost** id segment, composing with group and array scoping:

```
{idPrefix}_{group}_{key}_{index}   e.g.  billing_address_street_0
```

Use a valid id token: letters, digits, `-`, `_`. Whitespace or punctuation is replaced with `_` (with a dev-mode warning), since a space would break the `aria-describedby` token list and `for`/`id` matching.

> [!TIP]
> Writing E2E selectors or `aria-*` references against a form that shares the page with another form? Set an explicit `idPrefix` so the ids you target are deterministic, then select `#billing_email-input` rather than the auto-generated `#df-2_email-input`.

## Next Steps

- **[Examples](/examples)**: Browse complete form examples
- **[Field Types](/field-types/text-inputs)**: Per-field adapter props reference
- **[Building an Adapter](/building-an-adapter)**: Build your own adapter

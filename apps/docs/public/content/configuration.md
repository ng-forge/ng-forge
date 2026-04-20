---
title: Configuration
slug: configuration
description: 'Configure ng-forge at the provider, form, and field level. Learn the configuration cascade and how to set global defaults and per-field props.'
---

Configure global defaults for all forms at provider level, or per-form via `defaultProps`.

## The Cascade

ng-forge applies props in priority order — more specific always wins:

<docs-cascade-visual></docs-cascade-visual>

---

<docs-configuration-view></docs-configuration-view>

---

## Field-level Props

Each field type also accepts its own adapter-specific `props`. See [Field Types](/field-types/text-inputs) for the full per-field reference.

### Nullable values

Value fields accept an optional `nullable?: boolean` flag. When `true`:

- `value` accepts `null` in addition to the field's normal type (e.g. `string | null`).
- An omitted `value` resolves to `null` instead of the type-specific empty default (`''`, `NaN`, `[]`, …).
- `nullable` stays orthogonal to `required` — they describe different layers. `nullable` declares that the **model** accepts `null` (data shape). `required` is a **validation** constraint. Angular's `Validators.required` treats `null` as invalid, so a field that is both `nullable` and `required` will fail required-validation when the value is `null`. The flags are independent OpenAPI concepts; combine them if that matches your schema, but understand the runtime interaction.

```typescript
{
  key: 'middleName',
  type: 'input',
  label: 'Middle Name',
  nullable: true,
  value: null,       // allowed; also the resolved default when omitted
}
```

**Read-side caveat.** A user clearing a text input reads back as `""`, not `null` — this is a DOM/Web IDL contract, identical to classic Reactive Forms. `nullable` is a contract for _accepted_ values, not a guarantee of _emitted_ ones. If your backend distinguishes null from empty string, handle the coercion at submission.

## Next Steps

- **[Examples](/examples)** — Browse complete form examples
- **[Field Types](/field-types/text-inputs)** — Per-field adapter props reference
- **[Building an Adapter](/building-an-adapter)** — Build your own adapter

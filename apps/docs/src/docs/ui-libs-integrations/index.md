Configure global defaults for all forms at provider level, or per-form via `defaultProps`.

## The Cascade

ng-forge applies props in priority order — more specific always wins:

```
Library-level → Form-level → Field-level
```

- **Library-level**: `withXxxFields({ appearance: 'outline' })` — applies to every form in your app
- **Form-level**: `defaultProps: { appearance: 'fill' }` — overrides library defaults for one form
- **Field-level**: `props: { appearance: 'outline' }` — overrides everything for one field

---

<docs-configuration-view></docs-configuration-view>

---

## Field-level Props

Each field type also accepts its own adapter-specific `props`. See [Field Types →](/field-types/text-inputs) for the full per-field reference.

## Next Steps

- **[Examples →](/examples)** — Browse complete form examples
- **[Field Types →](/field-types/text-inputs)** — Per-field adapter props reference
- **[Building an Adapter →](/building-an-adapter)** — Build your own adapter

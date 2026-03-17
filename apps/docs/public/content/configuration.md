---
title: Configuration
slug: configuration
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

## Next Steps

- **[Examples](/examples)** — Browse complete form examples
- **[Field Types](/field-types/text-inputs)** — Per-field adapter props reference
- **[Building an Adapter](/building-an-adapter)** — Build your own adapter

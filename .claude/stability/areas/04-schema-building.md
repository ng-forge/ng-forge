# Area 04 — Schema Building

## Key Files

- `packages/dynamic-forms/src/lib/core/schema-builder.ts`
- `packages/dynamic-forms/src/lib/core/form-mapping.ts`
- `packages/dynamic-forms/src/lib/core/schema-merger.ts`
- `packages/dynamic-forms/src/lib/core/schema-transformation.ts`
- `packages/dynamic-forms/src/lib/core/schema-application.ts`
- `packages/dynamic-forms/src/lib/core/` (root-level files)

## Scenarios to Check

- [ ] Config → FormSetup pipeline — trace the full path from FormConfig input to FormSetup output
- [ ] `keyBy()` behavior with duplicate keys — silent overwrite, no warning
- [ ] Schema builder with empty config — no fields, no pages
- [ ] Schema builder with deeply nested containers — array > group > row > fields
- [ ] Schema transformation — what transformations are applied? Are they idempotent?
- [ ] Schema merger — field-level schema + form-level schema merge behavior
- [ ] Config validation — what's validated at parse time vs deferred to runtime?
- [ ] Dynamic config replacement — schema rebuild correctness, stale references
- [ ] Form mapping — how field configs map to Angular Signal Form structure
- [ ] Schema application — how schema is applied to form controls

## Known Findings

- **B8/B38** (medium) — Duplicate field keys: `keyBy()` silently last-write-wins, no error/warning

# Area 10 — Schema Validation (Zod / Standard Schema)

## Key Files

- `packages/dynamic-forms/src/lib/core/form-schema-merger.ts`
- `packages/dynamic-forms/src/lib/models/schemas/`
- `packages/dynamic-forms/src/lib/models/validation/`

## Scenarios to Check

- [ ] `formLevelSchema` with async Zod refinements — synchronous `validateStandardSchema` treats Promise as truthy
- [ ] `formLevelSchema` + field-level schema — merge conflict behavior, which takes precedence?
- [ ] Zod schema error at path that doesn't match any field key — silently discarded?
- [ ] Valibot schemas — same async refinement issue as Zod?
- [ ] ArkType schemas — same issues?
- [ ] Standard Schema interface compliance — does the library correctly implement the contract?
- [ ] Schema with nested paths — `address.street` style paths, do they map to group fields?
- [ ] Schema with array paths — `items[0].name` style, correct mapping?
- [ ] Multiple schemas for same field path — which wins, is there a warning?
- [ ] Dev-mode warning when async refinement is detected

## Known Findings

- **B40** (high) — Async Zod refinements silently pass (always valid); Promise is truthy
- **B31** (medium) — Zod/Standard Schema error at non-matching path silently discarded; path typo produces zero feedback

# Area 03 — Registry

## Key Files

- `packages/dynamic-forms/src/lib/core/registry/field-context-registry.service.ts`
- `packages/dynamic-forms/src/lib/core/registry/` (all files)

## Scenarios to Check

- [ ] Field registry — registration order, duplicate type handling, lazy loading
- [ ] Function registry — custom function registration, name collision, unregistered function access
- [ ] Schema registry — multiple schemas for same path, which wins?
- [ ] `externalData` handling — runtime type checking for signal values
- [ ] `externalData` — what happens with `undefined`, `null`, empty object?
- [ ] Field context registry — lifecycle of registered contexts, cleanup on destroy
- [ ] Registry isolation between concurrent form instances on same page
- [ ] Registry access before initialization complete

## Known Findings

- **B22** (medium) — Passing a non-signal value in `externalData` crashes with unhelpful TypeError; no runtime `isSignal()` check

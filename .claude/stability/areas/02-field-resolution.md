# Area 02 — Field Resolution

## Key Files

- `packages/dynamic-forms/src/lib/utils/resolve-field/resolve-field.ts`
- `packages/dynamic-forms/src/lib/utils/inject-field-registry/inject-field-registry.ts`
- `packages/dynamic-forms/src/lib/utils/container-utils/`
- `packages/dynamic-forms/src/lib/utils/field-mapper/`

## Scenarios to Check

- [ ] `resolveField()` async pipeline — what happens when component lazy-load fails (network error, missing chunk)?
- [ ] `resolveFieldSync()` — fast path using cached components; does it correctly fall back?
- [ ] `reconcileFields()` identity preservation — if keys shuffle order but same content, does it preserve identity or re-render?
- [ ] `COMPONENT_CACHE` scoping — is it DI-scoped or module-scoped? SSR implications?
- [ ] Unregistered field type — when is the error thrown? Can it be caught earlier?
- [ ] Field type registered twice — warning logged? Which wins?
- [ ] `createFieldResolutionPipe()` — used by page/group/row; verify it handles empty field arrays, null fields
- [ ] Component injector reference comparison in reconciliation — edge cases with destroyed injectors
- [ ] Field resolution with dynamic config changes — fields added/removed mid-lifecycle

## Known Findings

- **B12** (medium) — Unregistered field type passes initialization silently; throws only at render time

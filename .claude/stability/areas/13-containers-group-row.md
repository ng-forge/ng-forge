# Area 13 — Containers: Group & Row

## Key Files

- `packages/dynamic-forms/src/lib/fields/group/group-field.component.ts`
- `packages/dynamic-forms/src/lib/fields/row/row-field.component.ts`
- `packages/dynamic-forms/src/lib/utils/container-utils/` (3 files)
- `packages/dynamic-forms/src/lib/utils/grid-classes/` (3 files)

## Scenarios to Check

- [ ] Group field `explicitEffect` — dependency arrays, stale reads
- [ ] Group field nested field tree — resolution, identity preservation
- [ ] Group field value shape — nested object in form value, correct path mapping
- [ ] Row field grid class derivations — dynamic class binding correctness
- [ ] Row field `fields` type — returns `readonly RowAllowedChildren[]`, cast needed
- [ ] Container host classes — `computeContainerHostClasses()` correctness
- [ ] Container init effect — `setupContainerInitEffect()` timing
- [ ] Container field processors — `createContainerFieldProcessors()` correctness
- [ ] Empty group — no children, form value shape
- [ ] Empty row — no children, rendering
- [ ] Deeply nested containers — group > row > group > field
- [ ] Container visibility (hidden/shown) — does hiding a group hide all children?
- [ ] Grid class with responsive breakpoints — all Material/Bootstrap grid systems

## Known Findings

- **B36** (low) — Group field `explicitEffect` missing `this.field` dependency → stale log

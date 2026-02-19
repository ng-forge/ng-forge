# Area 17 — Path Utilities

## Key Files

- `packages/dynamic-forms/src/lib/utils/path-utils/path-utils.ts`
- `packages/dynamic-forms/src/lib/utils/path-utils/` (3 files)

## Scenarios to Check

- [ ] `getIn` — deeply nested path access; undefined intermediate, null intermediate, empty path
- [ ] `setIn` — immutable set at path; create intermediate objects/arrays as needed?
- [ ] Path with dots — `address.street` style, ambiguity with field keys containing dots
- [ ] Path with array indices — `items.0.name`, `items[0].name` — both supported?
- [ ] Path with wildcard `$` — array template paths `items.$.name`
- [ ] Empty path string — behavior
- [ ] Path to nonexistent field — error or undefined?
- [ ] Path splitting — correct handling of edge cases in separator logic
- [ ] Plain `Error` vs `DynamicFormError` — internal consistency check

## Known Findings

- Minor: `path-utils.ts:340,351` uses plain `Error` instead of `DynamicFormError`

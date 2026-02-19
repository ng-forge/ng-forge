# Area 20 — Defaults, Mappers, Helpers & Misc

## Key Files

### Definitions (22 files)

- `packages/dynamic-forms/src/lib/definitions/default/` (12 files — default field configs)
- `packages/dynamic-forms/src/lib/definitions/base/` (10 files — base field templates)

### Mappers (14 files)

- `packages/dynamic-forms/src/lib/mappers/base/` (BaseFieldMapper)
- `packages/dynamic-forms/src/lib/mappers/array/`
- `packages/dynamic-forms/src/lib/mappers/group/`
- `packages/dynamic-forms/src/lib/mappers/page/`
- `packages/dynamic-forms/src/lib/mappers/row/`
- `packages/dynamic-forms/src/lib/mappers/text/`

### Helpers (4 files)

- `packages/dynamic-forms/src/lib/helpers/` (`createField` and related)

### Pipes (2 files)

- `packages/dynamic-forms/src/lib/pipes/` (DynamicTextPipe)

### Errors (2 files)

- `packages/dynamic-forms/src/lib/errors/`

### Styles (2 files)

- `packages/dynamic-forms/src/lib/styles/`

## Scenarios to Check

### Definitions

- [ ] Default field configs — correct defaults for each field type (input, select, checkbox, etc.)
- [ ] Base field templates — required properties present, optional properties typed correctly
- [ ] Default values — correct type per field (empty string, false, null, [], etc.)

### Mappers

- [ ] BaseFieldMapper — abstract contract, required method signatures
- [ ] Container mappers (array, group, page, row) — correct input mapping from config to component
- [ ] Text mapper — display-only field, no form control
- [ ] Mapper with missing props — fallback behavior, error handling
- [ ] `propsToMeta` — metadata generation correctness

### Helpers

- [ ] `createField()` — type safety of `value` vs inferred field type
- [ ] `createField()` with all field types — correct type narrowing
- [ ] Helper usage in consuming code — ergonomic API

### Pipes

- [ ] `DynamicTextPipe` — what it transforms, edge cases (null, undefined, empty)

### Errors

- [ ] `DynamicFormError` — prefix format, stack trace preservation
- [ ] Plain `Error` used instead of `DynamicFormError` in 5 internal files

## Known Findings

- Minor: Plain `Error` used instead of `DynamicFormError` in cross-field-collector, derivation-applicator, path-utils, derived-from-deferred, cycle-detector

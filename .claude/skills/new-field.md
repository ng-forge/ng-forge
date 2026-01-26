---
name: new-field
description: Scaffold a new dynamic form field component for one or more UI libraries (Material, Bootstrap, PrimeNG, Ionic)
---

# New Field Skill

Scaffolds a new dynamic form field component across the ng-forge UI libraries.

## Required User Input

The user **must** provide:

1. **Field name** (e.g., `color-picker`, `file-upload`, `autocomplete`)
2. **Target libraries** (default: all four)

If not specified, ask:

> What should the field be called? (e.g., `color-picker`)
> Which libraries? (material, bootstrap, primeng, ionic, or all)

## Field Naming Conventions

| Library   | Component Prefix | File Prefix | Example                                     |
| --------- | ---------------- | ----------- | ------------------------------------------- |
| Material  | `Mat`            | `mat-`      | `MatColorPicker`, `mat-color-picker.ts`     |
| Bootstrap | `Bs`             | `bs-`       | `BsColorPicker`, `bs-color-picker.ts`       |
| PrimeNG   | `Prime`          | `prime-`    | `PrimeColorPicker`, `prime-color-picker.ts` |
| Ionic     | `Ionic`          | `ionic-`    | `IonicColorPicker`, `ionic-color-picker.ts` |

## Directory Structure

Each field follows this structure:

```
packages/dynamic-forms-{library}/src/lib/fields/{field-name}/
├── {prefix}-{field-name}.ts          # Component
├── {prefix}-{field-name}.spec.ts     # Unit tests
└── index.ts                          # Barrel export
```

## Implementation Steps

### 1. Analyze existing field as reference

Before creating, examine an existing similar field for patterns:

```bash
ls packages/dynamic-forms-material/src/lib/fields/input/
```

Read the component to understand the pattern:

- How props are defined
- How the field extends base classes
- How Angular Material/Bootstrap/PrimeNG/Ionic components are integrated

### 2. Create the field component

For each target library, create the component file following these patterns:

**Component structure:**

```typescript
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ForgeFieldBase } from '@ng-forge/dynamic-forms';
// Import UI library components

// Define props interface
export interface {Prefix}{FieldName}Props {
  // Field-specific props
  label?: string;
  placeholder?: string;
  hint?: string;
  // Add field-specific props here
}

@Component({
  selector: 'forge-{library}-{field-name}',
  template: `
    <!-- Template using UI library components -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // Required imports
  ],
})
export class {Prefix}{FieldName} extends ForgeFieldBase<{ValueType}, {Prefix}{FieldName}Props> {
  // Component implementation
}
```

### 3. Create unit tests

Create spec file with tests covering:

- Component creation
- Props binding
- Value changes
- Validation states
- Accessibility

Use existing tests as reference:

```bash
cat packages/dynamic-forms-material/src/lib/fields/input/mat-input.spec.ts | head -100
```

### 4. Create barrel export

Create `index.ts`:

```typescript
export * from './{prefix}-{field-name}';
```

### 5. Register the field

Add to the library's field registry in `packages/dynamic-forms-{library}/src/lib/fields/index.ts`:

```typescript
export * from './{field-name}';
```

### 6. Add type definition

Update `packages/dynamic-forms-{library}/src/lib/types.ts` to include the new field type.

### 7. Run verification

```bash
# Build the affected library
nx build dynamic-forms-{library}

# Run tests
nx test dynamic-forms-{library}

# Run lint
nx lint dynamic-forms-{library}
```

## Example Usage

User: `/new-field color-picker material`

This creates:

- `packages/dynamic-forms-material/src/lib/fields/color-picker/mat-color-picker.ts`
- `packages/dynamic-forms-material/src/lib/fields/color-picker/mat-color-picker.spec.ts`
- `packages/dynamic-forms-material/src/lib/fields/color-picker/index.ts`
- Updates to registry and types

## Checklist

Before completing, verify:

- [ ] Component follows library patterns
- [ ] Props interface is properly typed
- [ ] Unit tests pass
- [ ] Build succeeds
- [ ] Lint passes
- [ ] Exports are registered

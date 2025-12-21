# Refactor UI Library Duplication

## Objective

Eliminate code duplication across the 4 UI library packages by extracting shared utilities to `@ng-forge/dynamic-forms/integration` and simplifying redundant template patterns.

## Context

The ng-forge project has 4 UI library packages that wrap dynamic forms for different UI frameworks:
- `packages/dynamic-forms-material`
- `packages/dynamic-forms-bootstrap`
- `packages/dynamic-forms-ionic`
- `packages/dynamic-forms-primeng`

These packages contain duplicated utilities and overly verbose templates that should be consolidated.

---

## Phase 1: Extract `isEqual` Utility

### Problem
The `isEqual` deep equality function is duplicated identically in all 4 UI libraries.

### Current Locations (DELETE these after migration)
- `packages/dynamic-forms-material/src/lib/utils/is-equal.ts`
- `packages/dynamic-forms-bootstrap/src/lib/utils/is-equal.ts`
- `packages/dynamic-forms-ionic/src/lib/utils/is-equal.ts`
- `packages/dynamic-forms-primeng/src/lib/utils/is-equal.ts`

### Target Location (CREATE)
- `packages/dynamic-forms/integration/src/utils/is-equal.ts`

### Implementation Steps

1. **Create the shared utility** at `packages/dynamic-forms/integration/src/utils/is-equal.ts`:
```typescript
/**
 * Performs a deep equality comparison between two values
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => keysB.includes(key) && isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }

  return Object.is(a, b);
}
```

2. **Export from integration utils index** - Add to `packages/dynamic-forms/integration/src/utils/index.ts`:
```typescript
export { isEqual } from './is-equal';
```

3. **Update consumers** - Change imports in these multi-checkbox components:
   - `packages/dynamic-forms-material/src/lib/fields/multi-checkbox/mat-multi-checkbox.component.ts`
   - `packages/dynamic-forms-bootstrap/src/lib/fields/multi-checkbox/bs-multi-checkbox.component.ts`
   - `packages/dynamic-forms-ionic/src/lib/fields/multi-checkbox/ionic-multi-checkbox.component.ts`
   - `packages/dynamic-forms-primeng/src/lib/fields/multi-checkbox/prime-multi-checkbox.component.ts`

   Change FROM:
   ```typescript
   import { isEqual } from '../../utils/is-equal';
   ```

   Change TO:
   ```typescript
   import { isEqual } from '@ng-forge/dynamic-forms/integration';
   ```

4. **Delete the duplicate files** listed in "Current Locations" above.

5. **Clean up empty utils directories** if they become empty after deletion.

---

## Phase 2: Extract `ValueInArrayPipe`

### Problem
The `ValueInArrayPipe` is duplicated in 3 UI libraries (Bootstrap uses a different approach).

### Current Locations (DELETE these after migration)
- `packages/dynamic-forms-material/src/lib/directives/value-in-array.pipe.ts`
- `packages/dynamic-forms-ionic/src/lib/directives/value-in-array.pipe.ts`
- `packages/dynamic-forms-primeng/src/lib/directives/value-in-array.pipe.ts`

### Target Location (CREATE)
- `packages/dynamic-forms/integration/src/pipes/value-in-array.pipe.ts`
- `packages/dynamic-forms/integration/src/pipes/index.ts`

### Implementation Steps

1. **Create pipes directory and the shared pipe**:

   Create `packages/dynamic-forms/integration/src/pipes/value-in-array.pipe.ts`:
   ```typescript
   import { Pipe, PipeTransform } from '@angular/core';

   @Pipe({
     pure: true,
     name: 'inArray',
   })
   export class ValueInArrayPipe implements PipeTransform {
     transform<T>(element: T, array: T[] | undefined): boolean {
       return array?.includes(element) ?? false;
     }
   }
   ```

   Create `packages/dynamic-forms/integration/src/pipes/index.ts`:
   ```typescript
   export { ValueInArrayPipe } from './value-in-array.pipe';
   ```

2. **Export from integration public API** - Add to `packages/dynamic-forms/integration/src/public_api.ts`:
   ```typescript
   export * from './pipes';
   ```

3. **Update consumers** - Change imports in these multi-checkbox components:
   - `packages/dynamic-forms-material/src/lib/fields/multi-checkbox/mat-multi-checkbox.component.ts`
   - `packages/dynamic-forms-ionic/src/lib/fields/multi-checkbox/ionic-multi-checkbox.component.ts`
   - `packages/dynamic-forms-primeng/src/lib/fields/multi-checkbox/prime-multi-checkbox.component.ts`

   Change FROM:
   ```typescript
   import { ValueInArrayPipe } from '../../directives/value-in-array.pipe';
   ```

   Change TO:
   ```typescript
   import { ValueInArrayPipe } from '@ng-forge/dynamic-forms/integration';
   ```

4. **Delete the duplicate files** listed in "Current Locations" above.

---

## Phase 3: Simplify Input Component `@switch` Blocks

### Problem
All input components use a verbose `@switch` block that repeats the entire `<input>` element 6 times, with the ONLY difference being the `type` attribute. This can be replaced with a single input using dynamic type binding.

### Files to Modify
- `packages/dynamic-forms-material/src/lib/fields/input/mat-input.component.ts`
- `packages/dynamic-forms-bootstrap/src/lib/fields/input/bs-input.component.ts`
- `packages/dynamic-forms-ionic/src/lib/fields/input/ionic-input.component.ts`
- `packages/dynamic-forms-primeng/src/lib/fields/input/prime-input.component.ts`

### Material Implementation

**BEFORE** (lines 24-103, ~80 lines):
```html
@switch (props()?.type ?? 'text') {
  @case ('email') {
    <input #inputRef matInput type="email" [field]="f" ... />
  }
  @case ('password') {
    <input #inputRef matInput type="password" [field]="f" ... />
  }
  @case ('number') {
    <input #inputRef matInput type="number" [field]="f" ... />
  }
  @case ('tel') {
    <input #inputRef matInput type="tel" [field]="f" ... />
  }
  @case ('url') {
    <input #inputRef matInput type="url" [field]="f" ... />
  }
  @default {
    <input #inputRef matInput type="text" [field]="f" ... />
  }
}
```

**AFTER** (~12 lines):
```html
<input
  #inputRef
  matInput
  [type]="props()?.type ?? 'text'"
  [field]="f"
  [placeholder]="(placeholder() | dynamicText | async) ?? ''"
  [attr.tabindex]="tabIndex()"
  [attr.aria-invalid]="ariaInvalid"
  [attr.aria-required]="ariaRequired"
  [attr.aria-describedby]="ariaDescribedBy"
/>
```

### Bootstrap Implementation

Bootstrap is more complex because it has TWO @switch blocks (one for floating labels, one for standard). Both need to be simplified.

**BEFORE** (lines 21-130 for floating, lines 149-258 for standard, ~220 lines total):
```html
@if (effectiveFloatingLabel) {
  <div class="form-floating mb-3">
    @switch (p?.type ?? 'text') {
      @case ('email') { <input type="email" ... /> }
      <!-- 5 more cases -->
    }
    ...
  </div>
} @else {
  <div class="mb-3">
    ...
    @switch (p?.type ?? 'text') {
      @case ('email') { <input type="email" ... /> }
      <!-- 5 more cases -->
    }
    ...
  </div>
}
```

**AFTER** (~50 lines total):
```html
@if (effectiveFloatingLabel) {
  <div class="form-floating mb-3">
    <input
      [type]="p?.type ?? 'text'"
      [field]="f"
      [id]="key()"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid"
      [attr.aria-required]="ariaRequired"
      [attr.aria-describedby]="ariaDescribedBy"
      class="form-control"
      [class.form-control-sm]="effectiveSize === 'sm'"
      [class.form-control-lg]="effectiveSize === 'lg'"
      [class.form-control-plaintext]="p?.plaintext"
      [class.is-invalid]="f().invalid() && f().touched()"
      [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
    />
    @if (label()) {
      <label [for]="key()">{{ label() | dynamicText | async }}</label>
    }
    <!-- rest of floating label template -->
  </div>
} @else {
  <div class="mb-3">
    @if (label()) {
      <label [for]="key()" class="form-label">{{ label() | dynamicText | async }}</label>
    }
    <input
      [type]="p?.type ?? 'text'"
      [field]="f"
      [id]="key()"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid"
      [attr.aria-required]="ariaRequired"
      [attr.aria-describedby]="ariaDescribedBy"
      class="form-control"
      [class.form-control-sm]="effectiveSize === 'sm'"
      [class.form-control-lg]="effectiveSize === 'lg'"
      [class.form-control-plaintext]="p?.plaintext"
      [class.is-invalid]="f().invalid() && f().touched()"
      [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
    />
    <!-- rest of standard template -->
  </div>
}
```

### Ionic Implementation

Similar to Material - replace the @switch with dynamic `[type]` binding. Check the current template structure and preserve all Ionic-specific attributes.

### PrimeNG Implementation

Similar to Material - replace the @switch with dynamic `[type]` binding. Check the current template structure and preserve all PrimeNG-specific attributes (like `pInputText` directive).

---

## Verification Steps

After completing all phases, run:

```bash
# Build all affected packages
nx run-many -t build -p dynamic-forms dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-ionic dynamic-forms-primeng

# Run tests
nx run-many -t test -p dynamic-forms dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-ionic dynamic-forms-primeng

# Run linting
nx run-many -t lint -p dynamic-forms dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-ionic dynamic-forms-primeng
```

All checks must pass before considering the migration complete.

---

## Summary

| Phase | Files Deleted | Files Created | Files Modified | Lines Saved |
|-------|---------------|---------------|----------------|-------------|
| Phase 1: `isEqual` | 4 | 1 | 5 | ~108 |
| Phase 2: `ValueInArrayPipe` | 3 | 2 | 4 | ~33 |
| Phase 3: Input @switch | 0 | 0 | 4 | ~410 |
| **Total** | **7** | **3** | **13** | **~550** |

---

## Important Notes

1. **Do NOT use barrel imports within the dynamic-forms library itself** - import directly from specific files per CLAUDE.md guidelines.

2. **Preserve all existing functionality** - the refactoring should be purely structural with no behavioral changes.

3. **Each UI library may have slightly different template structures** - read each file carefully before modifying and preserve framework-specific attributes.

4. **Commit after each phase** with messages like:
   - `refactor(dynamic-forms): extract isEqual utility to integration entrypoint`
   - `refactor(dynamic-forms): extract ValueInArrayPipe to integration entrypoint`
   - `refactor(dynamic-forms): simplify input components with dynamic type binding`

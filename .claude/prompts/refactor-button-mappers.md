# Refactor Button Mapper Duplication

## Objective

Eliminate code duplication by extracting identical button mapper functions from the 4 UI library packages to `@ng-forge/dynamic-forms/integration`.

## Context

The button mapper functions are 100% identical across all 4 UI libraries. They contain no UI-specific logic - they only deal with field definitions, events, and input building. These should be shared from a central location.

---

## Files to Consolidate

### Generic Button Mapper (42 lines each, 100% identical)

**Current Locations (DELETE after migration):**
- `packages/dynamic-forms-material/src/lib/fields/button/mat-button.mapper.ts`
- `packages/dynamic-forms-bootstrap/src/lib/fields/button/bs-button.mapper.ts`
- `packages/dynamic-forms-ionic/src/lib/fields/button/ionic-button.mapper.ts`
- `packages/dynamic-forms-primeng/src/lib/fields/button/prime-button.mapper.ts`

### Specific Button Mappers (276 lines each, 100% identical except import)

**Current Locations (DELETE after migration):**
- `packages/dynamic-forms-material/src/lib/fields/button/mat-specific-button.mapper.ts`
- `packages/dynamic-forms-bootstrap/src/lib/fields/button/bs-specific-button.mapper.ts`
- `packages/dynamic-forms-ionic/src/lib/fields/button/ionic-specific-button.mapper.ts`
- `packages/dynamic-forms-primeng/src/lib/fields/button/prime-specific-button.mapper.ts`

---

## Phase 1: Extract Generic Button Mapper

### Step 1: Create shared mapper

Create `packages/dynamic-forms/integration/src/mappers/button/button-field.mapper.ts`:

```typescript
import { computed, Signal } from '@angular/core';
import { buildBaseInputs, FieldDef } from '@ng-forge/dynamic-forms';

/**
 * Generic button mapper for custom events or basic buttons.
 * For specific button types (submit, next, prev, add/remove array items),
 * use the dedicated field types and their specific mappers.
 *
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    // Add event binding for button events
    if ('event' in fieldDef && fieldDef.event !== undefined) {
      inputs['event'] = fieldDef.event;
    }

    // Add eventArgs binding if provided
    if ('eventArgs' in fieldDef && fieldDef.eventArgs !== undefined) {
      inputs['eventArgs'] = fieldDef.eventArgs;
    }

    return inputs;
  });
}
```

### Step 2: Create index file

Create `packages/dynamic-forms/integration/src/mappers/button/index.ts`:

```typescript
export { buttonFieldMapper } from './button-field.mapper';
```

### Step 3: Update mappers index

Update `packages/dynamic-forms/integration/src/mappers/index.ts` to add:

```typescript
export * from './button';
```

### Step 4: Update UI library re-exports

In each UI library, update the button mapper file to re-export from integration:

**Example for Material** - Replace entire content of `packages/dynamic-forms-material/src/lib/fields/button/mat-button.mapper.ts`:

```typescript
// Re-export shared button mapper from integration
export { buttonFieldMapper } from '@ng-forge/dynamic-forms/integration';
```

Do the same for Bootstrap, Ionic, and PrimeNG.

---

## Phase 2: Extract Specific Button Mappers

### Step 1: Define shared types for array button fields

First, check if `AddArrayItemButtonField` and `RemoveArrayItemButtonField` types are identical across packages. If they are, they should also be in the integration package.

Create or update types in `packages/dynamic-forms/integration/src/definitions/button-field.ts`:

```typescript
import { ButtonField, ButtonProps, EventArgs, FormEvent } from '@ng-forge/dynamic-forms';

/**
 * Button field for adding items to an array field.
 * Can be placed inside or outside an array template.
 */
export interface AddArrayItemButtonField<TProps extends ButtonProps = ButtonProps> extends ButtonField<TProps, FormEvent> {
  /** Target array key. Required when button is outside the array template. */
  arrayKey?: string;
  /** Optional event arguments override */
  eventArgs?: EventArgs;
}

/**
 * Button field for removing items from an array field.
 * Can be placed inside or outside an array template.
 */
export interface RemoveArrayItemButtonField<TProps extends ButtonProps = ButtonProps> extends ButtonField<TProps, FormEvent> {
  /** Target array key. Required when button is outside the array template. */
  arrayKey?: string;
  /** Optional event arguments override */
  eventArgs?: EventArgs;
}
```

### Step 2: Create shared specific button mappers

Create `packages/dynamic-forms/integration/src/mappers/button/specific-button.mapper.ts`:

```typescript
import { computed, inject, isSignal, Signal } from '@angular/core';
import {
  AddArrayItemEvent,
  ARRAY_CONTEXT,
  buildBaseInputs,
  DYNAMIC_FORM_LOGGER,
  FIELD_SIGNAL_CONTEXT,
  FieldDef,
  FieldWithValidation,
  NextPageEvent,
  PreviousPageEvent,
  RemoveArrayItemEvent,
  resolveNextButtonDisabled,
  resolveSubmitButtonDisabled,
} from '@ng-forge/dynamic-forms';
import { AddArrayItemButtonField, RemoveArrayItemButtonField } from '../../definitions/button-field';

/**
 * Mapper for submit button - configures native form submission via type="submit"
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  const baseInputs = buildBaseInputs(fieldDef);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;
  const disabledSignal = resolveSubmitButtonDisabled({
    form: fieldSignalContext.form,
    formOptions: fieldSignalContext.formOptions,
    fieldLogic: fieldWithLogic.logic,
    explicitlyDisabled: fieldDef.disabled,
  });

  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      props: { ...(fieldDef.props as Record<string, unknown>), type: 'submit' },
      disabled: disabledSignal(),
    };

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  const baseInputs = buildBaseInputs(fieldDef);

  const fieldWithLogic = fieldDef as FieldDef<Record<string, unknown>> & Partial<FieldWithValidation>;
  const disabledSignal = resolveNextButtonDisabled({
    form: fieldSignalContext.form,
    formOptions: fieldSignalContext.formOptions,
    fieldLogic: fieldWithLogic.logic,
    explicitlyDisabled: fieldDef.disabled,
    currentPageValid: fieldSignalContext.currentPageValid,
  });

  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: NextPageEvent,
      disabled: disabledSignal(),
    };

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 */
export function previousButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  const baseInputs = buildBaseInputs(fieldDef);

  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: PreviousPageEvent,
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for add array item button - preconfigures AddArrayItemEvent with array context.
 */
export function addArrayItemButtonFieldMapper(fieldDef: AddArrayItemButtonField): Signal<Record<string, unknown>> {
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });
  const logger = inject(DYNAMIC_FORM_LOGGER);

  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    logger.warn(
      `addArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  const baseInputs = buildBaseInputs(fieldDef);
  const defaultEventArgs = ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  return computed(() => {
    const getIndex = () => {
      if (!arrayContext) return -1;
      return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
    };

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: AddArrayItemEvent,
      eventArgs,
      eventContext: {
        key: fieldDef.key,
        index: getIndex(),
        arrayKey: targetArrayKey ?? '',
        formValue: arrayContext?.formValue ?? {},
      },
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for remove array item button - preconfigures RemoveArrayItemEvent with array context.
 */
export function removeArrayItemButtonFieldMapper(fieldDef: RemoveArrayItemButtonField): Signal<Record<string, unknown>> {
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });
  const logger = inject(DYNAMIC_FORM_LOGGER);

  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    logger.warn(
      `removeArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  const baseInputs = buildBaseInputs(fieldDef);
  const defaultEventArgs = arrayContext ? ['$arrayKey', '$index'] : ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  return computed(() => {
    const getIndex = () => {
      if (!arrayContext) return -1;
      return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
    };

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: RemoveArrayItemEvent,
      eventArgs,
      eventContext: {
        key: fieldDef.key,
        index: getIndex(),
        arrayKey: targetArrayKey ?? '',
        formValue: arrayContext?.formValue ?? {},
      },
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}
```

### Step 3: Update button index exports

Update `packages/dynamic-forms/integration/src/mappers/button/index.ts`:

```typescript
export { buttonFieldMapper } from './button-field.mapper';
export {
  submitButtonFieldMapper,
  nextButtonFieldMapper,
  previousButtonFieldMapper,
  addArrayItemButtonFieldMapper,
  removeArrayItemButtonFieldMapper,
} from './specific-button.mapper';
```

### Step 4: Update UI library re-exports

Replace entire content of each specific button mapper file with re-exports:

**Material** - `packages/dynamic-forms-material/src/lib/fields/button/mat-specific-button.mapper.ts`:

```typescript
// Re-export shared specific button mappers from integration
export {
  submitButtonFieldMapper,
  nextButtonFieldMapper,
  previousButtonFieldMapper,
  addArrayItemButtonFieldMapper,
  removeArrayItemButtonFieldMapper,
} from '@ng-forge/dynamic-forms/integration';
```

Do the same for Bootstrap, Ionic, and PrimeNG.

### Step 5: Update button type files

Each UI library's button type file (e.g., `mat-button.type.ts`) should re-export the shared types:

```typescript
// Re-export shared array button field types
export type { AddArrayItemButtonField, RemoveArrayItemButtonField } from '@ng-forge/dynamic-forms/integration';
```

Or update their local type definitions to extend the shared ones if they have UI-specific properties.

---

## Phase 3: Clean Up

### Delete redundant files

After confirming the re-exports work correctly:

1. The UI library mapper files can be kept as thin re-export wrappers (recommended for backwards compatibility)
2. OR delete them entirely and update all imports to use `@ng-forge/dynamic-forms/integration` directly

### Update any direct imports

Search for any files importing directly from the old mapper locations and update them.

---

## Verification

After completing all phases, run:

```bash
# Build all affected packages
nx run-many -t build -p dynamic-forms dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-ionic dynamic-forms-primeng

# Run tests
nx run-many -t test -p dynamic-forms dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-ionic dynamic-forms-primeng

# Run linting
nx run-many -t lint -p dynamic-forms dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-ionic dynamic-forms-primeng
```

---

## Summary

| Phase | Action | Files Affected | Lines Saved |
|-------|--------|----------------|-------------|
| Phase 1 | Extract `buttonFieldMapper` | 4 files → 1 | ~126 lines |
| Phase 2 | Extract specific button mappers | 4 files → 1 | ~828 lines |
| Phase 3 | Clean up / re-exports | 8 files updated | - |
| **Total** | | **12 files** | **~950 lines** |

---

## Notes

1. **Backwards Compatibility**: Keep the UI library files as re-export wrappers so existing imports continue to work.

2. **Type Imports**: Verify that `AddArrayItemButtonField` and `RemoveArrayItemButtonField` types are truly identical across packages before consolidating. Check each `*-button.type.ts` file.

3. **Import Paths**: Per CLAUDE.md guidelines, within the dynamic-forms library itself, use direct file imports, not barrel imports. The re-exports in UI libraries can use the barrel `@ng-forge/dynamic-forms/integration`.

4. **Commit Messages**:
   - `refactor(dynamic-forms): extract buttonFieldMapper to integration entrypoint`
   - `refactor(dynamic-forms): extract specific button mappers to integration entrypoint`

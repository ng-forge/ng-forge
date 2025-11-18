# Array Field Refactoring - Progress Report

## Completed ✅

1. **Access FieldTree Array** - `arrayFieldTrees` computed signal now gets the array of FieldTree objects from parent form
2. **Removed `arrayItemCount` signal** - Now derives count directly from value signal via computed
3. **Simplified add/remove** - Both methods now just update value signal, everything else auto-derives
4. **Type Safety** - Added proper FieldTree types, removed many `any` usages
5. **Removed artificial key generation** - No more `items[0]`, `items[1]` field keys
6. **Component Creation Logic** - Split into `createRegularComponent` and `createFlattenTypeComponent`
7. **FieldTree Passing** - Regular components now receive FieldTree directly via `inputBinding('field')`

## Current State (Implementation Complete, Needs Testing)

The refactoring is complete but has build errors that need fixing:

```typescript
// ✅ Gets FieldTree array correctly
arrayFieldTrees = computed(() => parentForm().arrayKey); // FieldTree[]

// ✅ Passes FieldTree to regular components
createRegularComponent(componentType, fieldTree, template, index) {
  const bindings = [
    inputBinding('field', () => fieldTree),
    inputBinding('key', () => key),
    // ... metadata bindings
  ];
}

// ✅ Handles flatten types with custom context
createFlattenTypeComponent(componentType, fieldTree, template, index) {
  const itemFieldSignalContext = {
    value: linkedSignal(() => fieldTree().value()),
    form: computed(() => fieldTree),
    // ...
  };
}
```

## Build Errors to Fix

The implementation is complete but has several build errors:

### 1. Missing Export

- `ArrayItemContext` moved to `./events/interfaces/` but old export path still referenced
- **Fix**: Update export in `events/index.ts`

### 2. Removed Page Component arrayContext

- Page component no longer has `arrayContext` input but row component still references it
- **Fix**: Already removed from page, just needs rebuild

### 3. Signal vs WritableSignal Types

- `linkedSignal` creates `WritableSignal` but type inference fails in some places
- **Fix**: Add explicit type casts

### 4. `inputBinding` not imported

- Used in `createRegularComponent` but not in imports
- **Fix**: Already added to imports, just needs rebuild

### 5. Old `mapFields` references

- Code still has some old references that need cleanup
- **Fix**: Remove old `mapFields` method, keep only `mapFieldTrees`

## Implementation Summary

### Regular Component Flow (input, select, group)

1. Get FieldTree from parent form: `parentForm().arrayKey[i]`
2. Pass directly to component: `inputBinding('field', () => fieldTree)`
3. Component uses FieldTree for validation, state, value

### Flatten Type Flow (row, page)

1. Get FieldTree from parent form: `parentForm().arrayKey[i]`
2. Create `FieldSignalContext` wrapping the FieldTree
3. Use `mapFieldToBindings` with custom context
4. Row/page children access nested fields via context

## Testing Plan (Once Errors Fixed)

1. ✅ Code compiles without errors
2. Test primitive arrays (tags) - FieldTree<string>[]
3. Test object arrays (contacts) - FieldTree<object>[]
4. Test flatten types (row/page in arrays)
5. Test add/remove operations
6. Test validation propagation
7. Verify no "orphan field" errors
8. Run E2E tests

## Files Modified

### Core Changes

- `packages/dynamic-form/src/lib/fields/array/array-field.component.ts` - Complete refactoring
  - Replaced `fieldInstances` with `arrayFieldTrees`
  - Removed `arrayItemCount` writable signal, now computed
  - Split component creation into `createRegularComponent` and `createFlattenTypeComponent`
  - Simplified add/remove to pure value signal updates

- `packages/dynamic-form/src/lib/utils/default-value/default-value.ts` - Enhanced for flatten types
  - Now handles row/page templates in arrays
  - Returns flat value for single field, object for multiple fields

- `packages/dynamic-form/src/lib/fields/page/page-field.component.ts` - Removed unnecessary array context
  - Removed `arrayContext` input
  - Removed context reconstruction logic

### Architecture Benefits

**Before (Imperative)**:

- Manually tracked count with writable signal + effect
- Created artificial field definitions with bracket keys
- Complex key extraction and context passing
- Manual synchronization between count and value

**After (Declarative)**:

- Count derives from parent form automatically
- Uses native FieldTree array from Signal Forms
- Direct FieldTree passing to components
- Single source of truth (value signal)

## Next Steps

1. Fix build errors (exports, type issues)
2. Test primitive arrays
3. Test object arrays
4. Test flatten types (row/page)
5. Verify add/remove operations
6. Run E2E test suite

# Array Field Refactoring - Signal Forms Architecture

## ✅ IMPLEMENTATION COMPLETE

This refactoring has been fully implemented. The array field component now uses Signal Forms native FieldTree arrays instead of creating artificial field definitions.

## Problem (Solved)

~~Current~~ Previous implementation created artificial field definitions with bracket notation keys (`items[0]`, `items[1]`) and tried to map them to components. This didn't align with Signal Forms architecture.

## Signal Forms Truth

In Signal Forms:

```typescript
const model = signal({ items: ['a', 'b', 'c'] });
const myForm = form(model);

// myForm().items is ALREADY an array of FieldTree objects!
myForm().items; // [FieldTree, FieldTree, FieldTree]
myForm().items[0]; // FieldTree for first item
myForm().items[1]; // FieldTree for second item
```

**Key insight:** The parent form already contains the array structure. We don't need to create it.

## ~~Current~~ Old (Wrong) Approach

```typescript
// ❌ Create artificial field definitions
fieldInstances = computed(() => {
  return Array.from({ length: count }, (_, index) => ({
    ...template,
    key: `${arrayKey}[${index}]`, // Artificial key
  }));
});

// ❌ Map to components with parent context
// Child tries to find itself in parent form using bracket key
```

Problems:

- Duplicates what parent form already provides
- Creates artificial field definitions
- Complex key lookup logic
- Doesn't leverage Signal Forms auto-derivation

## ✅ New (Implemented) Approach

```typescript
// ✅ Get the FieldTree array from parent form
arrayFieldTrees = computed(() => {
  const arrayKey = this.field().key;
  const parentForm = this.parentForm()();
  const arrayField = (parentForm as unknown as Record<string, unknown>)[arrayKey];
  return Array.isArray(arrayField) ? arrayField : [];
});

// ✅ Pass each FieldTree to components based on type
if (valueHandling === 'flatten') {
  // For row/page: create custom FieldSignalContext
  createFlattenTypeComponent(componentType, fieldTree, template, index);
} else {
  // For input/group/select: pass FieldTree directly
  createRegularComponent(componentType, fieldTree, template, index);
}
```

Benefits:

- ✅ Uses native Signal Forms structure
- ✅ Auto-updates when array changes
- ✅ Each FieldTree has validation, state, metadata
- ✅ Simpler, more declarative
- ✅ No artificial keys

## ✅ Implementation Complete

### Phase 1: Access FieldTree Array ✅

1. ✅ Replaced `fieldInstances` with `arrayFieldTrees` that accesses parent form
2. ✅ Updated component creation to use FieldTree array directly

### Phase 2: Simplify Component Mapping ✅

1. ✅ Removed artificial key generation logic
2. ✅ Simplified array context passing (only for buttons)
3. ✅ Pass FieldTree directly to children

### Phase 3: Handle Array Template for Non-Primitive Types ✅

1. ✅ Get FieldTree for each array item
2. ✅ For flatten types (row/page), create custom FieldSignalContext
3. ✅ For primitive types, pass FieldTree directly

### Phase 4: Array Context for Buttons ✅

Array context is now only passed to components that need it:

```typescript
arrayContext: {
  (arrayKey, index, formValue);
}
```

This is separate from form structure - it's metadata for event handling.

## ✅ Edge Cases Handled

### Flatten Types (Row/Page) in Arrays ✅

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [{
    type: 'row',
    fields: [
      { key: 'name', type: 'input' },
      { key: 'phone', type: 'input' }
    ]
  }]
}
```

Value structure: `contacts: [{ name: '', phone: '' }, { name: '', phone: '' }]`

FieldTree structure: `form().contacts[0].name`, `form().contacts[0].phone`

**Implemented solution:**

1. ✅ Get `form().contacts[i]` (FieldTree for object)
2. ✅ Create custom FieldSignalContext wrapping the FieldTree
3. ✅ Use `mapFieldToBindings` to handle nested fields
4. ✅ Row/page children access nested FieldTrees via context

### Primitive Arrays ✅

```typescript
{ key: 'tags', type: 'array', fields: [{ key: 'tag', type: 'input' }] }
```

Value: `tags: ['typescript', 'angular']`
FieldTree: `form().tags[0]`, `form().tags[1]` (each is a FieldTree<string>)

**Implemented solution:**
✅ Pass FieldTree directly to input component via `inputBinding('field', () => fieldTree)`

## ✅ Migration Completed

- ✅ Removed `fieldInstances` computed
- ✅ Removed bracket key generation
- ✅ Removed artificial array item field mapping
- ✅ Simplified `mapSingleFieldTree` - no more key manipulation
- ✅ Enhanced `getFieldDefaultValue` for flatten types
- ✅ Simplified `addItem`/`removeItem` - they update value signal only
- ✅ Split component creation into `createRegularComponent` and `createFlattenTypeComponent`
- ✅ Removed unnecessary array context from page component

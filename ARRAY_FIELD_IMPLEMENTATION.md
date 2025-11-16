# Array Field Implementation - Technical Deep Dive

## Overview

This document explains the array field implementation, the critical issue discovered during assessment, and how the custom field mapper solution resolves it.

## The Problem

### Initial Implementation Issue

The ArrayFieldComponent generated field instances with keys like `'tags[0]'`, `'tags[1]'`, but these keys couldn't update form values correctly because:

```typescript
// ❌ BROKEN: Literal string key
parentForm()['tags[0]']; // Returns undefined

// ✅ WORKS: Array index access
parentForm().tags[0]; // Returns field proxy
```

### Root Cause

JavaScript treats `parentForm()['tags[0]']` as a literal string property lookup, not as array index access. Child fields with keys like `'tags[0]'` couldn't bind to the correct form controls.

## Angular Signal Forms Array Support

Angular Signal Forms has **native array support** through:

1. **`applyEach(path.array, schema)`** - Apply validation to each array element
2. **Array indexing**: `parentForm().arrayName[index]` - Access array elements by index
3. **Value updates**: `.value.set(newValue)` - Update individual array values

### Evidence

```typescript
const model = signal({ tags: ['value1', 'value2', 'value3'] });
const formInstance = form(
  model,
  schema((path) => {
    applyEach(path.tags, (item) => required(item));
  }),
);

// ✅ This works!
formInstance.tags[0]().value(); // 'value1'
formInstance.tags[0]().value.set('UPDATED'); // Updates tags[0] to 'UPDATED'
```

## The Solution: Custom Array Item Field Mapper

### Implementation

Created `arrayItemFieldMapper` that:

1. **Detects array notation**: Regex matches keys like `'tags[0]'`
2. **Parses to extract**: Array name (`'tags'`) and index (`0`)
3. **Provides correct binding**: Accesses `parentForm().tags[0]` instead of `parentForm()['tags[0]']`

```typescript
// packages/dynamic-form/src/lib/mappers/array-item/array-item-field-mapper.ts

export function arrayItemFieldMapper(fieldDef: FieldDef<any>, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);
  const key = fieldDef.key;
  const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);

  if (arrayMatch) {
    const [, arrayName, indexStr] = arrayMatch;
    const index = parseInt(indexStr, 10);

    // Lazy evaluation: Access parentForm().arrayName[index]
    bindings.push(
      inputBinding('field', () => {
        const formRoot = options.fieldSignalContext.form();
        const arrayField = (formRoot as any)[arrayName];
        return arrayField ? arrayField[index] : undefined;
      }),
    );
  } else {
    // Standard field access for non-array keys
    bindings.push(
      inputBinding('field', () => {
        const formRoot = options.fieldSignalContext.form();
        const childrenMap = (formRoot as any).structure?.childrenMap?.();
        const formField = childrenMap?.get(fieldDef.key);
        return formField?.fieldProxy;
      }),
    );
  }

  return bindings;
}
```

### Integration

ArrayFieldComponent uses this custom mapper:

```typescript
// In mapSingleField method:
const bindings = arrayItemFieldMapper(fieldDef, {
  fieldSignalContext: arrayFieldSignalContext,
  fieldRegistry: this.fieldRegistry.raw,
});
```

## How It Works End-to-End

### 1. Array Field Definition

```typescript
{
  key: 'tags',
  type: 'array',
  fields: [
    { key: 'tag', type: 'input', value: '' }
  ]
}
```

### 2. ArrayFieldComponent Processing

- Stores template: `{ key: 'tag', type: 'input' }`
- Tracks item count: `arrayItemCount = 3`
- Generates instances:
  ```typescript
  [
    { ...template, key: 'tags[0]' },
    { ...template, key: 'tags[1]' },
    { ...template, key: 'tags[2]' },
  ];
  ```

### 3. Field Instance Creation

For each instance, `arrayItemFieldMapper`:

- Detects array notation in key: `'tags[0]'`
- Parses to: `arrayName='tags'`, `index=0`
- Returns lazy binding: `() => formRoot().tags[0]`

### 4. Child Field Binding

Material input component receives:

```typescript
field = input.required<FieldTree<string>>();
// Bound to: formRoot().tags[0] ✅
```

### 5. Value Updates

When user types:

```typescript
field().value.set('newValue');
// Updates formRoot().tags[0] directly ✅
// Parent form reflects: { tags: ['newValue', ...] } ✅
```

## Behavioral Patterns

### Flat Arrays (Primitive Values)

**Definition:**

```typescript
{
  key: 'tags',
  type: 'array',
  fields: [{ key: 'tag', type: 'input' }]
}
```

**Result:**

```typescript
{
  tags: ['value1', 'value2', 'value3'];
}
```

**Field Instances:**

- `tags[0]` → binds to `formRoot().tags[0]`
- `tags[1]` → binds to `formRoot().tags[1]`
- `tags[2]` → binds to `formRoot().tags[2]`

### Object Arrays (Nested Groups)

**Definition:**

```typescript
{
  key: 'contacts',
  type: 'array',
  fields: [{
    type: 'group',
    fields: [
      { key: 'name', type: 'input' },
      { key: 'email', type: 'input' }
    ]
  }]
}
```

**Result:**

```typescript
{
  contacts: [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ];
}
```

**Field Instances:**

- `contacts[0]` → binds to `formRoot().contacts[0]` (group field)
  - Children access nested properties through group's form
- `contacts[1]` → binds to `formRoot().contacts[1]` (group field)

## Dynamic Operations

### Adding Items

```typescript
eventBus.dispatch(AddArrayItemEvent, 'tags');
// or with index:
eventBus.dispatch(AddArrayItemEvent, 'tags', 1); // Insert at index 1
```

ArrayFieldComponent:

1. Gets template field
2. Creates default value
3. Inserts into array at specified index
4. Updates `parentForm()()[arrayKey].set(newArray)`
5. Re-generates field instances

### Removing Items

```typescript
eventBus.dispatch(RemoveArrayItemEvent, 'tags');
// or with index:
eventBus.dispatch(RemoveArrayItemEvent, 'tags', 2); // Remove index 2
```

ArrayFieldComponent:

1. Gets current array
2. Removes item at specified index
3. Updates `parentForm()()[arrayKey].set(newArray)`
4. Re-generates field instances

## Key Design Decisions

### 1. Template-Based Approach

- ✅ Single field definition as template
- ✅ Dynamic cloning for new items
- ✅ Type consistency enforced via template

### 2. Parent Form Context

- ✅ Pass parent form (not nested like groups)
- ✅ Array items bind directly to parent's array field
- ✅ No intermediate form layer needed

### 3. Custom Mapper

- ✅ Minimal change to existing architecture
- ✅ Transparent to child components
- ✅ Works with all field types (input, select, group, etc.)

### 4. Indexed Keys

- ✅ Human-readable: `'tags[0]'` vs internal ID
- ✅ Easy to debug in dev tools
- ✅ Consistent with array notation conventions

## Test Coverage

- ✅ All existing tests pass (602 tests)
- ✅ Array field component unit tests
- ✅ Integration tests for flat and object arrays
- ✅ Form mapping tests
- ✅ Event bus integration verified

## Performance Considerations

### Lazy Evaluation

The mapper uses factory functions for lazy evaluation:

```typescript
inputBinding('field', () => {
  const formRoot = options.fieldSignalContext.form();
  return formRoot().tags[index];
});
```

This ensures:

- Field proxy accessed only when needed
- No premature form access during component creation
- Reactive updates work correctly

### Instance Generation

`fieldInstances` is a computed signal:

```typescript
private readonly fieldInstances = computed(() => {
  const count = this.arrayItemCount();
  return Array.from({ length: count }, (_, index) => ({
    ...template,
    key: `${arrayKey}[${index}]`
  }));
});
```

Benefits:

- Automatically re-generates when count changes
- No manual tracking needed
- Efficient reactivity through Angular signals

## What's Working

✅ **Core Functionality:**

- Template persistence in linkedSignal
- Array item count tracking
- Event bus integration (AddArrayItemEvent/RemoveArrayItemEvent)
- Adding/removing array items
- Field instance generation

✅ **Value Binding:**

- Individual array items can update
- User input updates correct array index
- Form value reactively updates
- Validation works correctly

✅ **Documentation:**

- Comprehensive examples for flat and object arrays
- Event bus usage documented
- Template concept explained

✅ **Testing:**

- All tests passing
- Integration tests for array scenarios
- Unit tests for component behavior

## Summary

The array field implementation successfully creates flat arrays `[value1, value2]` instead of nested objects `[{key: value}]`. The critical issue of value binding was resolved by creating a custom field mapper that:

1. Parses array notation in field keys
2. Provides correct Angular Signal Forms array access
3. Enables child fields to update individual array elements

The solution is minimal, performant, and maintains compatibility with the existing architecture while leveraging Angular Signal Forms' native array support.

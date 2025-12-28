# Implementation Plan: Value Modification Logic

## Overview

Extend the existing `logic` system to support value modification. When a condition is met, a field's value can be programmatically set based on a static value, expression, or custom function.

---

## API Design

### Two-Level API

**1. Shorthand `setValue` property** - For simple computed/derived fields (always computed):

```typescript
interface FieldDef {
  // ... existing properties
  setValue?: string;  // Expression string, e.g., 'quantity * unitPrice'
}
```

**2. Full `logic` integration** - For conditional value setting with full control:

```typescript
// Existing logic for field state (unchanged)
interface StateLogicConfig {
  type: 'hidden' | 'readonly' | 'disabled' | 'required';
  condition: ConditionalExpression | boolean | FormStateCondition;
}

// New discriminated type for value modification
interface SetValueLogicConfig {
  type: 'setValue';
  targetField: string;                                  // Field to modify (required)
  condition?: ConditionalExpression | boolean;          // When to apply (defaults to true)
  value?: unknown;                                      // Static value
  expression?: string;                                  // JavaScript expression
  functionName?: string;                                // Registered custom function
  trigger?: 'onChange' | 'onBlur';                      // When to evaluate (default: onChange)
}

// Union type keeps logic array clean
type LogicConfig = StateLogicConfig | SetValueLogicConfig;
```

This discriminated union ensures:
- `targetField` is required only for `setValue`
- `FormStateCondition` is not allowed for `setValue` (only field/form value conditions)
- Condition defaults to `true` for `setValue` (always compute)
- Type narrowing works correctly with `config.type === 'setValue'`

### Examples

**Shorthand - computed field (always recomputes):**
```typescript
{
  key: 'total',
  type: 'number',
  setValue: 'quantity * unitPrice'
}

{
  key: 'fullName',
  type: 'input',
  setValue: 'firstName + " " + lastName'
}

{
  key: 'discountedPrice',
  type: 'number',
  setValue: 'price * (1 - discountPercent / 100)'
}
```

**Full form - conditional value setting on another field:**
```typescript
{
  key: 'country',
  type: 'select',
  logic: [
    {
      type: 'setValue',
      targetField: 'phonePrefix',
      value: '+1',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'equals',
        value: 'USA'
      }
    },
    {
      type: 'setValue',
      targetField: 'phonePrefix',
      value: '+44',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'equals',
        value: 'UK'
      }
    }
  ]
}
```

**Custom function for complex logic (e.g., country→currency mapping):**
```typescript
// Field definition
{
  key: 'country',
  type: 'select',
  logic: [
    {
      type: 'setValue',
      targetField: 'currency',
      functionName: 'getCurrencyForCountry',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'notEquals',
        value: null
      }
    }
  ]
}

// In customFnConfig
customFnConfig: {
  valueModifiers: {
    getCurrencyForCountry: (context) => {
      const countryToCurrency: Record<string, string> = {
        'USA': 'USD',
        'Germany': 'EUR',
        'France': 'EUR',
        'UK': 'GBP',
        'Japan': 'JPY'
      };
      return countryToCurrency[context.country] ?? 'USD';
    }
  }
}
```

**Transform on self (e.g., lowercase email):**
```typescript
{
  key: 'email',
  type: 'input',
  logic: [
    {
      type: 'setValue',
      targetField: 'email',  // Self-reference
      expression: 'email.toLowerCase()',
      condition: true,
      trigger: 'onBlur'  // Only transform on blur to avoid mid-typing issues
    }
  ]
}
```

### Shorthand vs Full Form Decision Tree

| Use Case | Use |
|----------|-----|
| Field computes its own value from other fields | `setValue: 'expr'` |
| Field A changes → set Field B | `logic: [{ type: 'setValue', targetField: 'B', ... }]` |
| Conditional value based on another field's value | `logic: [{ type: 'setValue', condition: {...}, ... }]` |
| Complex mapping logic | `logic: [{ type: 'setValue', functionName: '...', ... }]` |

---

## Loop Prevention Strategy

### Layer 1: Dependency Graph Analysis (Build-Time)

Extend `cross-field-collector.ts` to collect setValue logic entries and detect cycles:

```typescript
interface CrossFieldCollection {
  validators: CrossFieldValidatorEntry[];
  logic: CrossFieldLogicEntry[];
  schemas: CrossFieldSchemaEntry[];
  valueModifications: ValueModificationEntry[];  // NEW
}

interface ValueModificationEntry {
  sourceFieldKey: string;      // Field where logic is defined
  targetFieldKey: string;      // Field being modified
  dependsOn: string[];         // Fields referenced in condition/expression
}
```

**Cycle Detection Algorithm:**
1. Build directed graph: sourceField → targetField
2. Run topological sort
3. Throw descriptive error if cycle detected during form initialization

### Layer 2: Modification Chain Tracking (Runtime)

Track which modifications have already run in the current update cycle:

```typescript
interface ModificationContext {
  chain: Set<string>;  // Set of "sourceField:targetField" keys
  iteration: number;
}

function shouldApplyModification(
  entry: ValueModificationEntry,
  context: ModificationContext
): boolean {
  const key = `${entry.sourceFieldKey}:${entry.targetFieldKey}`;
  return !context.chain.has(key);
}
```

### Layer 3: Value Equality Check (Runtime)

Skip modification if target already has the computed value:

```typescript
function applyValueModification(targetPath: string, newValue: unknown, form: FormState): void {
  const currentValue = getNestedValue(form.value(), targetPath);
  if (isEqual(currentValue, newValue)) {
    return;  // No change needed
  }
  // Apply the modification
}
```

### Layer 4: Max Iteration Limit (Safety Fallback)

```typescript
const MAX_MODIFICATION_ITERATIONS = 10;

function processValueModifications(form: FormState): void {
  let iterations = 0;

  while (hasPendingModifications() && iterations < MAX_MODIFICATION_ITERATIONS) {
    iterations++;
    applyNextModification();
  }

  if (iterations >= MAX_MODIFICATION_ITERATIONS) {
    logger.error('Value modification loop detected - max iterations reached');
  }
}
```

---

## Implementation Steps

### Step 1: Extend Type Definitions

**Files to modify:**
- `packages/dynamic-forms/src/lib/models/logic/logic-config.ts`

**Changes:**
1. Rename existing `LogicConfig` to `StateLogicConfig`
2. Create new `SetValueLogicConfig` interface with:
   - `type: 'setValue'`
   - `targetField: string` (required)
   - `condition?: ConditionalExpression | boolean` (optional, defaults to true)
   - `value?: unknown`
   - `expression?: string`
   - `functionName?: string`
   - `trigger?: 'onChange' | 'onBlur'`
3. Create union type: `type LogicConfig = StateLogicConfig | SetValueLogicConfig`
4. Add type guards: `isStateLogicConfig()`, `isSetValueLogicConfig()`
5. Update JSDoc with examples

**Files to modify:**
- `packages/dynamic-forms/src/lib/definitions/base/field-def.ts`

**Changes:**
1. Add `setValue?: string` property to base field definition

### Step 2: Extend CustomFnConfig

**Files to modify:**
- `packages/dynamic-forms/src/lib/models/custom-fn-config.ts`

**Changes:**
1. Add `valueModifiers` property for custom value modification functions
2. Define `ValueModifierFn` type signature

### Step 3: Create Value Modification Collector

**New file:**
- `packages/dynamic-forms/src/lib/core/value-modification/value-modification-collector.ts`

**Functionality:**
1. Traverse field definitions to find `setValue` logic entries
2. Extract dependencies from conditions and expressions
3. Build `ValueModificationEntry[]` for each field

### Step 4: Create Cycle Detector

**New file:**
- `packages/dynamic-forms/src/lib/core/value-modification/cycle-detector.ts`

**Functionality:**
1. Build dependency graph from modification entries
2. Implement topological sort
3. Return cycle errors with clear field path information

### Step 5: Create Value Modification Applicator

**New file:**
- `packages/dynamic-forms/src/lib/core/value-modification/value-modification-applicator.ts`

**Functionality:**
1. Evaluate condition for each setValue logic entry
2. Compute value (static, expression, or function)
3. Apply to target field with loop prevention
4. Track modification chain

### Step 6: Integrate into Schema Builder

**Files to modify:**
- `packages/dynamic-forms/src/lib/core/schema-builder.ts`

**Changes:**
1. Collect value modifications during schema creation
2. Validate no cycles exist
3. Set up modification effects

### Step 7: Integrate into Form Component

**Files to modify:**
- `packages/dynamic-forms/src/lib/dynamic-form.component.ts`

**Changes:**
1. Set up `explicitEffect` to watch for value changes
2. Process value modifications when dependencies change
3. Use `untracked` for applying modifications to prevent reactive loops

### Step 8: Add Tests

**New test files:**
- `packages/dynamic-forms/src/lib/core/value-modification/value-modification-collector.spec.ts`
- `packages/dynamic-forms/src/lib/core/value-modification/cycle-detector.spec.ts`
- `packages/dynamic-forms/src/lib/core/value-modification/value-modification-applicator.spec.ts`

**Test scenarios:**
1. Simple conditional setValue
2. Expression-based setValue
3. Custom function setValue
4. Self-transform with trigger
5. Cycle detection (should error)
6. Chain tracking (A→B→C should work, A→B→A should not)
7. Value equality skip

### Step 9: Add Integration Tests / Scenarios

**New scenario files:**
- `apps/examples/material/src/app/testing/logic-system/scenarios/set-value-logic.scenario.ts`

**Test scenarios:**
1. Country → currency mapping via custom function
2. Computed total from quantity × price
3. Email lowercase transform on blur
4. Conditional default value setting

---

## File Structure

```
packages/dynamic-forms/src/lib/
├── models/
│   └── logic/
│       └── logic-config.ts                    # MODIFY: Add setValue type
├── core/
│   └── value-modification/                    # NEW DIRECTORY
│       ├── index.ts
│       ├── value-modification-collector.ts
│       ├── value-modification-applicator.ts
│       ├── cycle-detector.ts
│       └── modification-context.ts
```

---

## Open Questions / Future Considerations

1. **Trigger timing (`onChange` vs `onBlur`)**: Should we support this for self-transforms? Useful for formatting but adds complexity.

2. **Async value modifiers**: Should we support async functions (e.g., API lookups)? Could reuse async validator pattern but adds significant complexity. Recommend deferring to future iteration.

3. **Array field support**: How should `targetField` work within arrays? Suggest supporting relative paths like `$.siblingField` for same-index targeting.

4. **Undo/reset behavior**: When condition becomes false, should we reset the value? Recommend: No automatic reset - let users handle via another setValue rule if needed.

5. **Priority/ordering**: When multiple setValue rules target the same field, which wins? Recommend: Last matching rule wins (array order).

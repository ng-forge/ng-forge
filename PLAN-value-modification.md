# Implementation Plan: Value Derivation Logic

## Overview

Extend the existing `logic` system to support value derivation. When a condition is met, a field's value can be programmatically derived based on a static value, expression, or custom function.

---

## API Design

### Two-Level API

**1. Shorthand `derivation` property** - For simple computed/derived fields (always computed):

```typescript
interface FieldDef {
  // ... existing properties
  derivation?: string;  // Expression string, e.g., 'formValue.quantity * formValue.unitPrice'
}
```

**2. Full `logic` integration** - For conditional value derivation with full control:

```typescript
// Existing logic for field state (unchanged)
interface StateLogicConfig {
  type: 'hidden' | 'readonly' | 'disabled' | 'required';
  condition: ConditionalExpression | boolean | FormStateCondition;
}

// New discriminated type for value derivation
interface DerivationLogicConfig {
  type: 'derivation';
  targetField: string;                                  // Field to modify (required)
  condition?: ConditionalExpression | boolean;          // When to apply (defaults to true)
  value?: unknown;                                      // Static value
  expression?: string;                                  // JavaScript expression
  functionName?: string;                                // Registered custom function
  trigger?: 'onChange' | 'onBlur';                      // When to evaluate (default: onChange)
}

// Union type keeps logic array clean
type LogicConfig = StateLogicConfig | DerivationLogicConfig;
```

This discriminated union ensures:
- `targetField` is required only for `derivation`
- `FormStateCondition` is not allowed for `derivation` (only field/form value conditions)
- Condition defaults to `true` for `derivation` (always compute)
- Type narrowing works correctly with `config.type === 'derivation'`

### Examples

**Shorthand - computed field (always recomputes):**
```typescript
{
  key: 'total',
  type: 'number',
  derivation: 'formValue.quantity * formValue.unitPrice'
}

{
  key: 'fullName',
  type: 'input',
  derivation: 'formValue.firstName + " " + formValue.lastName'
}

{
  key: 'discountedPrice',
  type: 'number',
  derivation: 'formValue.price * (1 - formValue.discountPercent / 100)'
}
```

**Full form - conditional value derivation on another field:**
```typescript
{
  key: 'country',
  type: 'select',
  logic: [
    {
      type: 'derivation',
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
      type: 'derivation',
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
      type: 'derivation',
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
  derivations: {
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
      type: 'derivation',
      targetField: 'email',  // Self-reference
      expression: 'formValue.email.toLowerCase()',
      condition: true,
      trigger: 'onBlur'  // Only transform on blur to avoid mid-typing issues
    }
  ]
}
```

### Shorthand vs Full Form Decision Tree

| Use Case | Use |
|----------|-----|
| Field computes its own value from other fields | `derivation: 'expr'` |
| Field A changes → set Field B | `logic: [{ type: 'derivation', targetField: 'B', ... }]` |
| Conditional value based on another field's value | `logic: [{ type: 'derivation', condition: {...}, ... }]` |
| Complex mapping logic | `logic: [{ type: 'derivation', functionName: '...', ... }]` |

---

## Loop Prevention Strategy

### Layer 1: Dependency Graph Analysis (Build-Time)

Extend `cross-field-collector.ts` to collect derivation logic entries and detect cycles:

```typescript
interface CrossFieldCollection {
  validators: CrossFieldValidatorEntry[];
  logic: CrossFieldLogicEntry[];
  schemas: CrossFieldSchemaEntry[];
  derivations: DerivationEntry[];  // NEW
}

interface DerivationEntry {
  sourceFieldKey: string;      // Field where logic is defined
  targetFieldKey: string;      // Field being modified
  dependsOn: string[];         // Fields referenced in condition/expression
}
```

**Cycle Detection Algorithm:**
1. Build directed graph: sourceField → targetField
2. Run topological sort
3. Throw descriptive error if cycle detected during form initialization

### Layer 2: Derivation Chain Tracking (Runtime)

Track which derivations have already run in the current update cycle:

```typescript
interface DerivationContext {
  chain: Set<string>;  // Set of "sourceField:targetField" keys
  iteration: number;
}

function shouldApplyDerivation(
  entry: DerivationEntry,
  context: DerivationContext
): boolean {
  const key = `${entry.sourceFieldKey}:${entry.targetFieldKey}`;
  return !context.chain.has(key);
}
```

### Layer 3: Value Equality Check (Runtime)

Skip derivation if target already has the computed value:

```typescript
function applyDerivation(targetPath: string, newValue: unknown, form: FormState): void {
  const currentValue = getNestedValue(form.value(), targetPath);
  if (isEqual(currentValue, newValue)) {
    return;  // No change needed
  }
  // Apply the derivation
}
```

### Layer 4: Max Iteration Limit (Safety Fallback)

```typescript
const MAX_DERIVATION_ITERATIONS = 10;

function processDerivations(form: FormState): void {
  let iterations = 0;

  while (hasPendingDerivations() && iterations < MAX_DERIVATION_ITERATIONS) {
    iterations++;
    applyNextDerivation();
  }

  if (iterations >= MAX_DERIVATION_ITERATIONS) {
    logger.error('Derivation loop detected - max iterations reached');
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
2. Create new `DerivationLogicConfig` interface with:
   - `type: 'derivation'`
   - `targetField: string` (required)
   - `condition?: ConditionalExpression | boolean` (optional, defaults to true)
   - `value?: unknown`
   - `expression?: string`
   - `functionName?: string`
   - `trigger?: 'onChange' | 'onBlur'`
3. Create union type: `type LogicConfig = StateLogicConfig | DerivationLogicConfig`
4. Add type guards: `isStateLogicConfig()`, `isDerivationLogicConfig()`
5. Update JSDoc with examples

**Files to modify:**
- `packages/dynamic-forms/src/lib/definitions/base/field-def.ts`

**Changes:**
1. Add `derivation?: string` property to base field definition

### Step 2: Extend CustomFnConfig

**Files to modify:**
- `packages/dynamic-forms/src/lib/models/custom-fn-config.ts`

**Changes:**
1. Add `derivations` property for custom derivation functions
2. Define `DerivationFn` type signature

### Step 3: Create Derivation Collector

**New file:**
- `packages/dynamic-forms/src/lib/core/derivation/derivation-collector.ts`

**Functionality:**
1. Traverse field definitions to find `derivation` logic entries and shorthand properties
2. Extract dependencies from conditions and expressions
3. Build `DerivationEntry[]` for each field

### Step 4: Create Cycle Detector

**New file:**
- `packages/dynamic-forms/src/lib/core/derivation/cycle-detector.ts`

**Functionality:**
1. Build dependency graph from derivation entries
2. Implement topological sort
3. Return cycle errors with clear field path information

### Step 5: Create Derivation Applicator

**New file:**
- `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.ts`

**Functionality:**
1. Evaluate condition for each derivation logic entry
2. Compute value (static, expression, or function)
3. Apply to target field with loop prevention
4. Track derivation chain

### Step 6: Integrate into Schema Builder

**Files to modify:**
- `packages/dynamic-forms/src/lib/core/schema-builder.ts`

**Changes:**
1. Collect derivations during schema creation
2. Validate no cycles exist
3. Set up derivation effects

### Step 7: Integrate into Form Component

**Files to modify:**
- `packages/dynamic-forms/src/lib/dynamic-form.component.ts`

**Changes:**
1. Set up `explicitEffect` to watch for value changes
2. Process derivations when dependencies change
3. Use `untracked` for applying derivations to prevent reactive loops

### Step 8: Add Tests

**New test files:**
- `packages/dynamic-forms/src/lib/core/derivation/derivation-collector.spec.ts`
- `packages/dynamic-forms/src/lib/core/derivation/cycle-detector.spec.ts`
- `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.spec.ts`

**Test scenarios:**
1. Simple conditional derivation
2. Expression-based derivation
3. Custom function derivation
4. Self-transform with trigger
5. Cycle detection (should error)
6. Chain tracking (A→B→C should work, A→B→A should not)
7. Value equality skip

### Step 9: Add Integration Tests / Scenarios

**New scenario files:**
- `apps/examples/material/src/app/testing/logic-system/scenarios/derivation-logic.scenario.ts`

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
│       └── logic-config.ts                    # MODIFY: Add derivation type
├── definitions/
│   └── base/
│       └── field-def.ts                       # MODIFY: Add derivation property
├── core/
│   └── derivation/                            # NEW DIRECTORY
│       ├── index.ts
│       ├── derivation-collector.ts
│       ├── derivation-applicator.ts
│       ├── cycle-detector.ts
│       └── derivation-context.ts
```

---

## Open Questions / Future Considerations

1. **Trigger timing (`onChange` vs `onBlur`)**: Should we support this for self-transforms? Useful for formatting but adds complexity.

2. **Async derivations**: Should we support async functions (e.g., API lookups)? Could reuse async validator pattern but adds significant complexity. Recommend deferring to future iteration.

3. **Array field support**: How should `targetField` work within arrays? Suggest supporting relative paths like `$.siblingField` for same-index targeting.

4. **Undo/reset behavior**: When condition becomes false, should we reset the value? Recommend: No automatic reset - let users handle via another derivation rule if needed.

5. **Priority/ordering**: When multiple derivation rules target the same field, which wins? Recommend: Last matching rule wins (array order).

# Derivation System Architecture

## Introduction

The derivation system automatically computes field values based on other form values. This guide explains the internal architecture for developers who want to understand how value derivations are collected, processed, and applied.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Form Initialization                               │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │ Field Definitions │ → │ Derivation       │ → │ DerivationCollection │  │
│  │ (with logic[])    │   │ Collector        │   │ (entries only)       │  │
│  └──────────────────┘    └──────────────────┘    └──────────────────────┘  │
│                                   │                        │               │
│                                   ▼                        ▼               │
│                          ┌──────────────────┐    ┌──────────────────────┐  │
│                          │ Cycle Detector   │    │ Topological Sorter   │  │
│                          │ (validates)      │    │ (orders entries)     │  │
│                          └──────────────────┘    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Runtime Processing                                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │ Derivation       │ ────────────────────→ │ RxJS Streams          │  │
│  │ Orchestrator     │                       │ (onChange/debounce)   │  │
│  └──────────────────┘                        └──────────────────────┘  │
│                                                            │               │
│                                                            ▼               │
│                                                  ┌──────────────────────┐  │
│                                                  │ Derivation Applicator│  │
│                                                  │ → Form Value Updates │  │
│                                                  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Derivation Collector (`derivation-collector.ts`)

The collector traverses field definitions and extracts all derivation rules into a normalized structure.

**Responsibilities:**

- Traverse field tree (including nested containers and arrays)
- Extract shorthand `derivation` properties
- Extract full `logic` array entries with `type: 'derivation'`
- Resolve relative paths for array fields (`$.fieldName`)
- Extract dependencies from expressions and conditions

**Input:** Field definitions array
**Output:** `DerivationCollection` with sorted entries

```typescript
interface DerivationCollection {
  /** All derivation entries, sorted topologically */
  entries: DerivationEntry[];
}
```

The collection is intentionally minimal - lookup maps are provided via `DerivationLookup` which computes them lazily on demand.

**Shorthand vs Full Logic:**

Derivations are always **self-targeting**: they compute and set the value of the field they are defined on.

```typescript
// Shorthand: derivation property directly on field (recommended)
{
  key: 'total',
  type: 'input',
  derivation: 'formValue.quantity * formValue.unitPrice',
}

// Full logic: in logic[] array (for conditions, debounce, functions)
{
  key: 'total',
  type: 'input',
  logic: [{
    type: 'derivation',
    expression: 'formValue.quantity * formValue.unitPrice',
    condition: { type: 'fieldValue', fieldPath: 'quantity', operator: 'greater', value: 0 },
  }],
}
```

### 2. Cycle Detector (`cycle-detector.ts`)

Validates the derivation graph to prevent infinite loops at runtime.

**Algorithm:** Uses depth-first search (DFS) with three-color marking:

- **White (Unvisited):** Node not yet processed
- **Gray (InProgress):** Node currently in the DFS stack
- **Black (Completed):** Node fully processed

A cycle is detected when visiting a gray node (back edge).

**Special case:** Bidirectional patterns (A↔B) are allowed because they stabilize via equality checks at runtime. These are detected separately and exempted from cycle errors.

```
quantity ─┐
          ├─→ subtotal ─┬─→ tax ─┬─→ total
unitPrice ─┘            │        │
                        └────────┘
                   (no cycles - valid)

celsius ←─→ fahrenheit
     (bidirectional - allowed, stabilizes via equality)
```

**Bidirectional Derivation Warning:**

In dev mode, the system warns about bidirectional patterns that may oscillate with floating-point values:

```
[Derivation] Bidirectional derivation patterns detected: celsius↔fahrenheit
These patterns stabilize via equality checks, but may oscillate with floating-point values.
```

### 3. Topological Sorter (`derivation-sorter.ts`)

Sorts derivation entries in dependency order using Kahn's algorithm.

**Why sorting matters:** Ensures derivations are processed in the correct order. If `total` depends on `subtotal`, `subtotal` must be computed first. This reduces the number of iterations needed in the applicator loop.

```
Before sorting: [total, subtotal, tax]
After sorting:  [subtotal, tax, total]
```

**Algorithm:**

1. Build adjacency list (edge A→B exists if B depends on A's target)
2. Calculate in-degree for each node
3. Start with nodes having in-degree 0 (no dependencies)
4. Process queue, reducing in-degree of neighbors
5. Result is topologically sorted

**Optimization:** Uses pre-built index (`producersByTarget`) for O(1) lookups instead of O(n) scanning.

### 4. Derivation Orchestrator (`derivation-orchestrator.ts`)

Central coordinator that sets up RxJS streams for reactive derivation processing.

**Instantiation:** The orchestrator is provided via `DERIVATION_ORCHESTRATOR` injection token and lazily instantiated in `DynamicForm`:

```typescript
// In DynamicForm constructor
afterNextRender(() => {
  this.injector.get(DERIVATION_ORCHESTRATOR);
});
```

The lazy instantiation via `afterNextRender` avoids circular dependency issues (the orchestrator factory depends on DynamicForm signals).

**Streams:**

**1. onChange Stream:**

```typescript
collection$
  .pipe(
    filter((collection) => collection !== null),
    combineLatestWith(formValue$, form$),

    // auditTime(0): Batch synchronous emissions from Angular's change detection.
    // When a single user action triggers multiple signal updates, this ensures
    // we only process derivations once after all updates complete (microtask timing).
    auditTime(0),

    // exhaustMap: Prevents re-entry while processing derivations.
    // If form value changes DURING derivation processing (from our own setValue calls),
    // we ignore those emissions and complete the current cycle first.
    // switchMap would cancel mid-processing, causing incomplete derivation chains.
    exhaustMap(([collection, , formAccessor]) => {
      this.applyOnChangeDerivations(collection, formAccessor);

      // scheduled with queueScheduler: Ensures the observable completes
      // in the next microtask, allowing exhaustMap to accept new emissions.
      // Without this, exhaustMap would block indefinitely.
      return scheduled([null], queueScheduler);
    }),

    takeUntilDestroyed(),
  )
  .subscribe();
```

**2. Debounced Stream:**

```typescript
formValue$
  .pipe(
    // debounceTime: Wait for value to stabilize before detecting changes.
    // Uses DEFAULT_DEBOUNCE_MS as the minimum debounce period.
    debounceTime(DEFAULT_DEBOUNCE_MS),

    // startWith + pairwise: Track previous and current values to detect changes.
    // startWith(null) ensures pairwise has an initial value to pair with.
    startWith(null),
    pairwise(),
    map(([previous, current]) => getChangedKeys(previous, current)),
    filter((changedFields) => changedFields.size > 0),

    // switchMap: For debounced derivations, it's OK to cancel pending work
    // if new changes come in - we want the latest debounced values.
    // (Unlike onChange which uses exhaustMap to prevent cancellation)
    switchMap((changedFields) => {
      // merge: Process multiple debounce periods concurrently.
      // Each period stream handles its own timing independently.
      const periodStreams = debouncePeriods.map((debounceMs) =>
        this.createPeriodStream(debounceMs, collection, formAccessor, changedFields),
      );
      return merge(...periodStreams);
    }),

    takeUntilDestroyed(),
  )
  .subscribe();
```

**Key RxJS patterns:**

| Operator             | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `exhaustMap`         | Prevents re-entry during derivation processing |
| `auditTime(0)`       | Batches synchronous emissions from Angular CD  |
| `pairwise`           | Tracks value changes without mutable state     |
| `switchMap`          | Cancels pending debounced work on new changes  |
| `takeUntilDestroyed` | Automatic cleanup on component destruction     |

### 5. Derivation Applicator (`derivation-applicator.ts`)

Executes derivation logic and applies values to the form.

**Processing loop:**

```typescript
function applyDerivations(collection, context, changedFields?) {
  const chainContext = createDerivationChainContext();
  let hasChanges = true;

  while (hasChanges && chainContext.iteration < MAX_DERIVATION_ITERATIONS) {
    chainContext.iteration++;
    hasChanges = false;

    for (const entry of entriesToProcess) {
      const result = tryApplyDerivation(entry, context, chainContext);
      if (result.applied) {
        hasChanges = true;
      }
    }
  }

  return { appliedCount, skippedCount, errorCount, iterations };
}
```

**Skip conditions:**

1. **Already applied in this cycle** - Chain tracking via `appliedDerivations` set
2. **Condition evaluates to false** - Conditional derivations
3. **Computed value equals current value** - Equality check (how bidirectional stabilizes)

**Value computation priority:**

1. Static `value` property
2. JavaScript `expression`
3. Custom `functionName`

```typescript
function computeDerivedValue(entry, evalContext, applicatorContext) {
  // 1. Static value
  if (entry.value !== undefined) {
    return entry.value;
  }

  // 2. Expression
  if (entry.expression) {
    return ExpressionParser.evaluate(entry.expression, evalContext);
  }

  // 3. Custom function
  if (entry.functionName) {
    const fn = applicatorContext.derivationFunctions?.[entry.functionName];
    return fn(evalContext);
  }
}
```

## Data Flow

### 1. Collection Phase

```
Field Definitions
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ collectDerivations(fields)                               │
│                                                          │
│  1. Traverse field tree recursively                      │
│  2. For each field with derivation/logic:                │
│     - Create DerivationEntry                             │
│     - Extract dependencies from expression               │
│     - Resolve relative paths ($.field → array.$.field)   │
│  3. Sort entries topologically                           │
└──────────────────────────────────────────────────────────┘
       │
       ▼
DerivationCollection { entries }
```

### 2. Validation Phase

```
DerivationCollection
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ validateNoCycles(collection)                             │
│                                                          │
│  1. Build dependency graph                               │
│  2. Detect bidirectional pairs (A↔B)                     │
│  3. Run DFS cycle detection                              │
│  4. If cycle found → throw error                         │
│  5. If bidirectional pairs → warn (dev mode)             │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Validated Collection
```

### 3. Runtime Processing

```
Form Value Change
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ DerivationOrchestrator (RxJS Streams)                    │
│                                                          │
│  onChange Stream:                                        │
│    formValue$ → auditTime(0) → exhaustMap → apply        │
│                                                          │
│  debounced Stream:                                       │
│    formValue$ → debounceTime → pairwise → switchMap      │
│                  → timer per period → apply              │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ applyDerivationsForTrigger(collection, trigger, context) │
│                                                          │
│  1. Filter entries by trigger type                       │
│  2. Filter entries by changed fields                     │
│  3. Process in iteration loop:                           │
│     - Evaluate condition                                 │
│     - Compute derived value                              │
│     - Check equality (skip if unchanged)                 │
│     - Apply to form via Angular Signals                  │
│  4. Repeat until no changes or max iterations            │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Form Value Updated
```

## DerivationEntry Structure

```typescript
interface DerivationEntry {
  /**
   * The key of the field where this derivation is defined and targets.
   *
   * Derivations always target the field they are defined on (self-targeting).
   * For array fields, this may include a placeholder path like 'items.$.lineTotal'
   * which is resolved to actual indices at runtime.
   */
  fieldKey: string;

  /** Field keys this derivation depends on */
  dependsOn: string[]; // ['quantity', 'unitPrice'] or ['*'] for wildcard

  /** Condition that determines when derivation applies */
  condition: ConditionalExpression | boolean;

  /** Static value to set (mutually exclusive with expression/functionName) */
  value?: unknown;

  /** JavaScript expression to evaluate */
  expression?: string;

  /** Name of registered custom function */
  functionName?: string;

  /** When to evaluate: 'onChange' (default) or 'debounced' */
  trigger: 'onChange' | 'debounced';

  /** Debounce duration in ms (only for trigger: 'debounced') */
  debounceMs?: number;

  /** Whether from shorthand derivation property */
  isShorthand: boolean;

  /** Original config (for full logic entries) */
  originalConfig?: DerivationLogicConfig;

  /** Optional debug name for logs */
  debugName?: string;
}
```

## Dependency Extraction

Dependencies are automatically extracted from expressions:

```typescript
// Expression: 'formValue.quantity * formValue.unitPrice'
// Extracted: ['quantity', 'unitPrice']

// Condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'USA' }
// Extracted: ['country']
```

**Wildcard dependencies (`*`):** Custom functions without explicit `dependsOn` default to wildcard, meaning they run on every form change.

```typescript
// On the 'total' field:

// Wildcard - runs on any change (performance warning in dev mode)
{
  key: 'total',
  logic: [{
    type: 'derivation',
    functionName: 'calculateTotal',
  }],
}

// Explicit - only runs when quantity or price changes
{
  key: 'total',
  logic: [{
    type: 'derivation',
    functionName: 'calculateTotal',
    dependsOn: ['quantity', 'price'],
  }],
}
```

The wildcard warning includes field count for context:

```
[Derivation] Derivations using custom functions without explicit dependsOn detected.
These run on EVERY form change, which may impact performance (form has 25 fields).
```

## Array Field Derivations

Array derivations use `$` as a placeholder for the array index in the internal `fieldKey`:

```typescript
// Configuration
{
  key: 'lineItems',
  type: 'array',
  fields: [
    { key: 'quantity', type: 'input', value: 1 },
    { key: 'unitPrice', type: 'input', value: 0 },
    {
      key: 'lineTotal',
      type: 'input',
      derivation: 'formValue.quantity * formValue.unitPrice',
    },
  ],
}
// Internal fieldKey becomes: 'lineItems.$.lineTotal'
```

**At runtime:**

1. Get array from form value
2. Iterate each item
3. Resolve `$` to actual index (e.g., `lineItems.0.lineTotal`)
4. Create scoped evaluation context
5. Apply derivation for each item independently

**Context in array expressions:**

- `formValue`: Current array item (e.g., `{ quantity: 5, unitPrice: 10 }`)
- `rootFormValue`: Entire form value (for cross-scope references)

```typescript
// Access root form value inside array item
{
  key: 'lineTotal',
  derivation: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.globalDiscount / 100)',
}
```

## Loop Prevention

Four mechanisms prevent infinite loops:

### 1. Cycle Detection (Build Time)

Detects static cycles in the dependency graph and throws an error:

```
Derivation cycle detected: A -> B -> C -> A
This would cause an infinite loop at runtime.
Remove one of the derivations to break the cycle.
```

### 2. Chain Tracking (Runtime)

Tracks which derivations have been applied in the current cycle:

```typescript
interface DerivationChainContext {
  appliedDerivations: Set<string>; // fieldKey strings
  iteration: number;
}
```

Once a derivation is applied, it won't run again in the same cycle (until next form value change).

### 3. Equality Check (Runtime)

Skips application if the computed value equals the current value:

```typescript
const currentValue = getNestedValue(formValue, entry.fieldKey);
if (isEqual(currentValue, newValue)) {
  return { applied: false, skipReason: 'value-unchanged' };
}
```

This is how bidirectional derivations stabilize:

```
celsius: 0 → fahrenheit: 32 (applied)
fahrenheit: 32 → celsius: 0 (equals current, skipped)
// Cycle complete, stable state reached
```

### 4. Max Iterations (Safety Fallback)

Processing stops after `MAX_DERIVATION_ITERATIONS` (10) to catch unexpected loops:

```
Derivation processing reached max iterations (onChange).
This may indicate a loop in derivation logic that wasn't caught at build time.
Applied: 15, Skipped: 3, Errors: 0
```

## Performance Optimizations

### 1. Topological Sorting

Reduces iterations by processing derivations in dependency order. Without sorting, the loop might need multiple iterations to stabilize. With sorting, most cases complete in 1-2 iterations.

### 2. Indexed Lookup Maps

O(1) access via pre-built `byDependency`, `byField` maps instead of O(n) filtering:

```typescript
// Instead of O(n) filter
const affected = entries.filter((e) => e.dependsOn.includes(changedField));

// O(1) map lookup
const affected = byDependency.get(changedField);
```

These maps are built once from the collected derivation entries and cached for the lifetime of the form.

### 3. Changed Field Filtering

Only processes derivations affected by changed fields:

```typescript
// O(k) where k = number of changed fields
for (const fieldKey of changedFields) {
  byDependency.get(fieldKey)?.forEach((e) => entries.add(e));
  byArrayPath.get(fieldKey)?.forEach((e) => entries.add(e));
}

// O(w) where w = number of wildcard entries
wildcardEntries.forEach((e) => entries.add(e));
```

### 4. Batched Synchronous Emissions

Uses `auditTime(0)` to batch synchronous emissions from Angular's change detection:

```typescript
combineLatestWith(formValue$, form$),
auditTime(0),  // Batch microtask-level emissions
exhaustMap(...)
```

This prevents multiple derivation cycles when Angular emits multiple synchronous value changes.

## Debugging

Enable derivation logging via `withLoggerConfig`:

```typescript
provideDynamicForm(...withMaterialFields(), withLoggerConfig({ derivations: 'verbose' }));
```

**Log levels:**

| Level     | Output                            |
| --------- | --------------------------------- |
| `none`    | No logging (production default)   |
| `summary` | Cycle completion with counts      |
| `verbose` | Individual derivation evaluations |

**Summary mode output:**

```
Derivation - Cycle complete (onChange) { applied: 3, skipped: 2, errors: 0, iterations: 2 }
```

**Verbose mode output:**

```
Derivation - Starting cycle (onChange) with 5 derivation(s)
Derivation - Iteration 1
Derivation - Applied "Calculate total" { field: 'total', previousValue: 0, newValue: 150 }
Derivation - Skipped: phonePrefix (condition not met)
Derivation - Iteration 2
Derivation - Skipped: "Calculate total" (value unchanged)
Derivation - Cycle complete (onChange) { applied: 1, skipped: 4, errors: 0, iterations: 2 }
```

Use `debugName` on derivation configs for easier identification:

```typescript
// On the lineTotal field inside an array
{
  key: 'lineTotal',
  logic: [{
    type: 'derivation',
    debugName: 'Calculate line total',
    expression: 'formValue.quantity * formValue.unitPrice',
  }],
}
```

## File Reference

| File                            | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `derivation-types.ts`           | TypeScript interfaces and factory functions    |
| `derivation-collector.ts`       | Traverses fields, extracts derivations         |
| `cycle-detector.ts`             | Validates no cycles, warns about bidirectional |
| `derivation-sorter.ts`          | Topological sort using Kahn's algorithm        |
| `derivation-orchestrator.ts`    | RxJS stream setup and coordination             |
| `derivation-applicator.ts`      | Evaluates and applies derivations to form      |
| `derivation-logger.service.ts`  | Structured logging for debugging               |
| `derivation-constants.ts`       | Shared constants (MAX_ITERATIONS, etc.)        |
| `derivation-warning-tracker.ts` | Prevents duplicate warnings per form instance  |

## Common Issues

### Derivations Not Running

1. **Check if orchestrator is instantiated:** The `DERIVATION_ORCHESTRATOR` must be injected somewhere. The `DynamicForm` component does this lazily via `afterNextRender`.

2. **Check dependencies:** If using a custom function without `dependsOn`, it defaults to wildcard (`*`). For expressions, dependencies are auto-extracted.

3. **Check trigger type:** `trigger: 'debounced'` derivations don't run immediately - they wait for the debounce period.

### Infinite Loop Warnings

1. **Check for cycles:** The cycle detector should catch most cases at build time. If you see max iterations warnings, there may be a runtime-only cycle.

2. **Check bidirectional patterns:** If you have A↔B derivations with floating-point math, they may oscillate. Add rounding to expressions.

### Performance Issues

1. **Avoid wildcard dependencies:** Specify explicit `dependsOn` arrays for custom functions.

2. **Check field count:** Large forms with many wildcard derivations will be slow. The warning message includes field count for context.

3. **Profile with verbose logging:** Enable `derivations: 'verbose'` to see exactly which derivations run and how many iterations are needed.

## Summary

The derivation system is built on these principles:

1. **Build-time optimization:** Collect, sort at initialization
2. **Runtime efficiency:** Lazy-computed indexed lookups, changed-field filtering
3. **Loop prevention:** Multiple layers of protection
4. **Debugging support:** Structured logging with detail levels
5. **Flexibility:** Supports expressions, functions, conditions, arrays

The architecture separates concerns cleanly:

- **Collector:** Extracts and normalizes derivation rules
- **Validator:** Ensures no cycles at build time
- **Sorter:** Orders for efficient processing
- **Lookup:** Provides lazy-computed lookup maps
- **Orchestrator:** Coordinates reactive streams
- **Applicator:** Executes logic and updates form

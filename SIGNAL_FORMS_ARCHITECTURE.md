# Signal Forms Integration Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CONFIGURATION                            │
│                  (Framework Agnostic)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FieldDef {                                                     │
│    key: 'email',                                                │
│    type: 'input',                                               │
│    required: true,                    ← Simple (backward compat)│
│    validators: [                      ← Advanced                │
│      { type: 'email' },                                         │
│      { type: 'minLength', value: 5, expression: 'foo * 2' }    │
│    ],                                                            │
│    logic: [                           ← Conditional behavior     │
│      { type: 'hidden', condition: { type: 'fieldValue', ... } } │
│    ],                                                            │
│    schemas: [...]                     ← Nested schemas          │
│  }                                                               │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              OUR INTEGRATION LAYER                               │
│            (What We're Testing)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  form-mapping.ts (Orchestrator)                         │   │
│  │  ───────────────────────────────────                    │   │
│  │  • Entry point for field transformation                 │   │
│  │  • Detects field type (page/group/regular)             │   │
│  │  • Routes to appropriate handler                        │   │
│  │  • Coordinates all transformation steps                 │   │
│  └───────┬─────────────────┬───────────────┬─────────────┘   │
│          │                 │               │                   │
│          ▼                 ▼               ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ validator-   │  │ logic-       │  │ schema-      │        │
│  │ factory.ts   │  │ applicator.ts│  │ application  │        │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤        │
│  │              │  │              │  │              │        │
│  │ Translates:  │  │ Translates:  │  │ Resolves:    │        │
│  │              │  │              │  │              │        │
│  │ ValidatorCfg │  │ LogicConfig  │  │ SchemaConfig │        │
│  │      ↓       │  │      ↓       │  │      ↓       │        │
│  │   Angular    │  │   Angular    │  │   Angular    │        │
│  │  Validators  │  │    Logic     │  │   Schemas    │        │
│  │              │  │              │  │              │        │
│  │ Features:    │  │ Features:    │  │ Features:    │        │
│  │ • Type map   │  │ • Condition  │  │ • Strategy   │        │
│  │ • Expr → Fn  │  │   type check │  │   branching  │        │
│  │ • When cond  │  │ • Bool/Expr  │  │ • Nested     │        │
│  │ • Dynamic    │  │   convert    │  │   resolution │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
│  Supporting Services:                                           │
│  ┌──────────────────┐  ┌────────────────────────────┐          │
│  │ expressions/     │  │ values/                    │          │
│  │ logic-functions  │  │ dynamic-values             │          │
│  ├──────────────────┤  ├────────────────────────────┤          │
│  │ ConditionalExpr  │  │ Expression strings         │          │
│  │       ↓          │  │       ↓                    │          │
│  │    LogicFn       │  │ Dynamic value functions    │          │
│  └──────────────────┘  └────────────────────────────┘          │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│           ANGULAR SIGNAL FORMS API                               │
│         (Framework - We Don't Test This)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  import {                                                        │
│    required, email, min, max, minLength, maxLength, pattern,   │
│    hidden, readonly, disabled,                                  │
│    schema, form, FieldPath                                      │
│  } from '@angular/forms/signals';                               │
│                                                                  │
│  Usage in schema callback:                                      │
│  ───────────────────────────                                    │
│  form(model, schema<T>((path) => {                             │
│    required(path.email);          ← Angular validates          │
│    min(path.age, 18);              ← Angular validates          │
│    hidden(path.phone, () => ...);  ← Angular controls visibility│
│  }))                                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Special Handling: Page & Group Fields

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE FIELD FLATTENING                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input:                        Output (flattened to root):      │
│  ──────                        ────────────────────────          │
│  {                             form: {                           │
│    type: 'page',                 firstName: <control>            │
│    fields: [                     lastName: <control>             │
│      { key: 'firstName', ... },                                 │
│      { key: 'lastName', ... }                                   │
│    ]                           }                                 │
│  }                                                               │
│                                                                  │
│  Implementation (mapPageFieldToForm):                           │
│  ────────────────────────────────────                            │
│  - Iterates over child fields                                   │
│  - Maps each to rootPath[childKey] (not nested)                │
│  - Recursively calls mapFieldToForm                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  GROUP FIELD NESTING                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input:                        Output (nested):                  │
│  ──────                        ──────────────                    │
│  {                             form: {                           │
│    key: 'address',               address: {                      │
│    type: 'group',                  street: <control>             │
│    fields: [                       city: <control>               │
│      { key: 'street', ... },     }                               │
│      { key: 'city', ... }      }                                 │
│    ]                                                             │
│  }                                                               │
│                                                                  │
│  Implementation (mapGroupFieldToForm):                          │
│  ─────────────────────────────────────                           │
│  - Iterates over child fields                                   │
│  - Maps each to groupPath[childKey] (nested)                    │
│  - Recursively calls mapFieldToForm                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Test Coverage Map

```
┌──────────────────────────────────────────────────────────────┐
│  UNIT TESTS                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  validator-factory.spec.ts (18 tests) ✅                     │
│  ├─ Type checking edge cases (4 tests)                       │
│  │  └─ Tests undefined/wrong type handling                   │
│  ├─ Expression vs static value branching (2 tests)           │
│  │  └─ Tests our dynamic value feature                       │
│  ├─ Pattern conversion (4 tests)                             │
│  │  └─ Tests string → RegExp conversion                      │
│  ├─ Conditional required validator (3 tests)                 │
│  │  └─ Tests our 'when' condition feature                    │
│  ├─ Unknown validator type (1 test)                          │
│  ├─ Email validator (1 test)                                 │
│  └─ applyValidators (3 tests)                                │
│                                                               │
│  logic-applicator.spec.ts (15 tests) ✅                      │
│  ├─ Condition type checking (4 tests)                        │
│  │  └─ Tests boolean vs ConditionalExpression               │
│  ├─ Logic type handling (3 tests)                            │
│  │  └─ Tests hidden/readonly/required                        │
│  ├─ Disabled logic warning (1 test)                          │
│  │  └─ Tests our console.warn                                │
│  ├─ Unknown logic type (1 test)                              │
│  ├─ Edge cases (2 tests)                                     │
│  └─ applyMultipleLogic (4 tests)                             │
│                                                               │
│  form-mapping.spec.ts (29 tests) ⏳ NEEDS FIXING             │
│  ├─ Field type routing (3 tests)                             │
│  │  └─ Tests page/group/regular field detection              │
│  ├─ Simple validation rules (7 tests)                        │
│  │  └─ Tests backward compat (required: true)               │
│  ├─ Advanced validators/logic/schemas (5 tests)              │
│  │  └─ Tests our array-based configs                         │
│  ├─ Field-specific configuration (3 tests)                   │
│  │  └─ Tests disabled/custom props                           │
│  ├─ Page field flattening (5 tests)                          │
│  │  └─ Tests our flattening logic  ⭐ CRITICAL               │
│  └─ Group field flattening (6 tests)                         │
│     └─ Tests our nesting logic  ⭐ CRITICAL                   │
│                                                               │
│  schema-transformation.spec.ts (28 tests) ⏳ NEEDS FIXING    │
│  ├─ Schema resolution (8 tests)                              │
│  ├─ Strategy branching (8 tests)                             │
│  │  └─ Tests apply/applyWhen/applyWhenValue/applyEach        │
│  ├─ Value handling modes (6 tests)                           │
│  └─ Default value extraction (6 tests)                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  INTEGRATION TESTS (End-to-End Pipeline)                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  validator-transformation.integration.spec.ts (18) ⏳         │
│  logic-transformation.integration.spec.ts (16) ⏳             │
│  form-mapping.integration.spec.ts (16) ⏳ (2 passing!)        │
│  schema-transformation.integration.spec.ts (~16) ⏳           │
│                                                               │
│  These test the FULL pipeline from FieldDef → Working Form   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## What Makes Our Integration Valuable

### 1. **Translation Layer**

We don't just pass through to Angular - we translate from our domain format:

```typescript
// Our Format (declarative, serializable)
validators: [{ type: 'minLength', value: 5, expression: 'maxLength / 2' }];

// Angular Format (imperative, functional)
minLength(path, () => {
  const ctx = inject(FieldContext);
  return ctx.form().value.maxLength / 2;
});
```

### 2. **Custom Features**

- **Dynamic Expressions**: String expressions → Runtime functions
- **Conditional Validation**: `when` conditions
- **Field Routing**: Auto-detect page/group/regular
- **Flattening/Nesting**: Special field type handling
- **Backward Compatibility**: Simple props + Advanced configs

### 3. **Type Safety & Error Handling**

- Edge case handling (undefined, wrong types)
- Type conversions (string → RegExp)
- Graceful degradation
- Developer warnings

## Conclusion

**We are testing critical integration infrastructure, NOT Angular.**

Our tests verify that our translation layer correctly:

1. Maps configurations → API calls
2. Handles edge cases
3. Implements custom features
4. Maintains backward compatibility
5. Provides good developer experience (warnings, error handling)

**Recommendation: Fix all remaining tests.**

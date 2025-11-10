# Advanced Validation Integration - Addendum

**Date:** 2025-11-10
**Related Document:** `ADVANCED_VALIDATION_RESEARCH.md`

---

## Integration with Existing Custom Validation

### Current State

The ng-forge/dynamic-form library already has some custom validation infrastructure in place:

#### 1. Existing `CustomValidator` Type

**Location:** `packages/dynamic-form/src/lib/models/validation-types.ts:13`

```typescript
/**
 * Custom validator function following Angular signal forms pattern
 */
export type CustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;
```

**Characteristics:**

- ✅ Simpler signature than Angular's `FieldContext` API
- ✅ Takes `value` (current field value) and `formValue` (entire form value)
- ✅ Returns `ValidationError | null`
- ⚠️ **Not currently used** - defined but no implementation found
- ⚠️ Does not have access to Angular's full field context (errors, state, etc.)

#### 2. Existing `FunctionRegistryService`

**Location:** `packages/dynamic-form/src/lib/core/registry/function-registry.service.ts`

```typescript
@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, (context: EvaluationContext) => unknown>();

  registerCustomFunction(name: string, fn: (context: EvaluationContext) => unknown): void {
    this.customFunctions.set(name, fn);
  }

  getCustomFunctions(): Record<string, (context: EvaluationContext) => unknown> {
    return Object.fromEntries(this.customFunctions);
  }
}
```

**Current Usage:**

- ✅ Used for conditional logic expressions (when/readonly/disabled logic)
- ✅ Registered via `SignalFormsConfig.customFunctions`
- ✅ Functions receive `EvaluationContext` (not `FieldContext`)
- ⚠️ Not used for validation (only for expressions)

#### 3. Custom Validation Messages

**Location:** `packages/dynamic-form/src/lib/models/validation-types.ts:19-28`

```typescript
export interface ValidationMessages {
  required?: DynamicText;
  email?: DynamicText;
  min?: DynamicText;
  max?: DynamicText;
  minLength?: DynamicText;
  maxLength?: DynamicText;
  pattern?: DynamicText;
  [key: string]: DynamicText | undefined;
}
```

**Current Usage:**

- ✅ Allows customizing error messages for built-in validators
- ✅ Supports dynamic content (Observable, Signal, or string)
- ✅ Implemented in `create-resolved-errors-signal.ts`
- ✅ Messages are interpolated with error parameters

---

## Integration Strategy

### Option 1: Extend Existing `FunctionRegistryService` (Recommended)

**Pros:**

- ✅ Leverages existing infrastructure
- ✅ Single unified developer API - all custom functions in `SignalFormsConfig`
- ✅ Simpler internal architecture - one registry service instead of two
- ✅ Consistent pattern across features
- ✅ Better discoverability - developers see all custom functions in one config object

**Cons:**

- ⚠️ Mixes validation and expression logic internally (could complicate maintenance)
- ⚠️ Different function signatures (EvaluationContext vs FieldContext)
- ⚠️ Service could become large if many features are added

**Implementation:**

```typescript
// Extend FunctionRegistryService
@Injectable({ providedIn: 'root' })
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, (context: EvaluationContext) => unknown>();
  private readonly customValidators = new Map<string, CustomValidatorFn>();
  private readonly asyncValidators = new Map<string, AsyncValidatorOptions>();
  private readonly treeValidators = new Map<string, TreeValidatorFn>();

  // Existing methods
  registerCustomFunction(name: string, fn: (context: EvaluationContext) => unknown): void { ... }
  getCustomFunctions(): Record<string, (context: EvaluationContext) => unknown> { ... }

  // New validator methods
  registerValidator(name: string, fn: CustomValidatorFn): void {
    this.customValidators.set(name, fn);
  }

  registerAsyncValidator(name: string, opts: AsyncValidatorOptions): void {
    this.asyncValidators.set(name, opts);
  }

  registerTreeValidator(name: string, fn: TreeValidatorFn): void {
    this.treeValidators.set(name, fn);
  }

  getValidator(name: string): CustomValidatorFn | undefined {
    return this.customValidators.get(name);
  }

  getAsyncValidator(name: string): AsyncValidatorOptions | undefined {
    return this.asyncValidators.get(name);
  }

  getTreeValidator(name: string): TreeValidatorFn | undefined {
    return this.treeValidators.get(name);
  }
}
```

### Option 2: Create Separate `ValidatorRegistryService`

**Pros:**

- ✅ Clear separation of concerns (validation vs expressions)
- ✅ Easier to maintain and test independently
- ✅ More focused API surface
- ✅ Better for tree-shaking if expressions aren't used

**Cons:**

- ⚠️ Additional internal service (more complexity in library code)
- ⚠️ Two separate config sections for developers (could be confusing)
- ⚠️ Validators and expressions can't easily share logic

**Implementation:**

```typescript
@Injectable({ providedIn: 'root' })
export class ValidatorRegistryService {
  private readonly customValidators = new Map<string, CustomValidatorFn>();
  private readonly asyncValidators = new Map<string, AsyncValidatorOptions>();
  private readonly treeValidators = new Map<string, TreeValidatorFn>();

  // Same methods as Option 1 validator methods
}
```

---

## Developer-Facing vs Internal Architecture

**Important Note:** Developers using dynamic-form will **not** directly inject or interact with `FunctionRegistryService`. Instead, they register validators through the `SignalFormsConfig` object in their form configuration. The registry service is an internal implementation detail.

**Developer Experience:**

```typescript
// Developers do this - declarative config
const formConfig: FormConfig = {
  fields: [...],
  signalFormsConfig: {
    customValidators: { ... },
    contextValidators: { ... },
    treeValidators: { ... }
  }
};
```

**Internal Implementation:**

```typescript
// dynamic-form library does this internally
this.functionRegistry.registerValidator('myValidator', validatorFn);
this.functionRegistry.registerCustomFunction('myFunction', functionFn);
```

The decision between Option 1 (extend FunctionRegistryService) vs Option 2 (separate ValidatorRegistryService) is about **internal architecture**, not developer API. Developers see a unified `SignalFormsConfig` either way.

---

## Unified Validator API Design

### Three Levels of Custom Validators

#### Level 1: Simple Custom Validators (Existing Pattern)

**Use Case:** Simple validation that only needs field value and form value

```typescript
export type SimpleCustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

// Example
const simpleValidator: SimpleCustomValidator<string> = (value, formValue) => {
  if (value.length < 3) {
    return { kind: 'tooShort', message: 'Must be at least 3 characters' };
  }
  return null;
};
```

**Registration:**

```typescript
functionRegistry.registerValidator('minLength3', simpleValidator);
```

**JSON Config:**

```json
{
  "key": "username",
  "validators": [{ "type": "custom", "functionName": "minLength3" }]
}
```

#### Level 2: Context-Aware Validators (New - using `validate`)

**Use Case:** Validation that needs access to field state, parent context, or other fields

```typescript
export type ContextAwareValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>
) => ValidationError | null;

// Example
const contextAwareValidator: ContextAwareValidator<number> = (ctx, params) => {
  const price = ctx.value();
  const msrp = ctx.root().msrp?.value();
  const minDiscount = params?.minDiscount || 10;

  if (msrp && price >= msrp * (1 - minDiscount / 100)) {
    return {
      kind: 'priceToHigh',
      message: `Price must be at least ${minDiscount}% less than MSRP`,
    };
  }
  return null;
};
```

**Registration:**

```typescript
functionRegistry.registerContextValidator('lessThanMsrp', contextAwareValidator);
```

**JSON Config:**

```json
{
  "key": "price",
  "validators": [
    {
      "type": "contextValidator",
      "functionName": "lessThanMsrp",
      "params": { "minDiscount": 15 }
    }
  ]
}
```

#### Level 3: Tree Validators (New - using `validateTree`)

**Use Case:** Cross-field validation, password confirmation, date ranges

```typescript
export type TreeValidator<TModel = unknown> = (ctx: FieldContext<TModel>, params?: Record<string, unknown>) => TreeValidationResult;

// Example
const passwordMatchValidator: TreeValidator = (ctx) => {
  const password = ctx.password?.value();
  const confirmPassword = ctx.confirmPassword?.value();

  if (password && confirmPassword && password !== confirmPassword) {
    // Return error with field target
    return {
      field: ctx.confirmPassword,
      kind: 'passwordMismatch',
      message: 'Passwords must match',
    };
  }
  return null;
};
```

**Registration:**

```typescript
functionRegistry.registerTreeValidator('passwordsMatch', passwordMatchValidator);
```

**JSON Config:**

```json
{
  "type": "group",
  "fields": [
    { "key": "password", "type": "password" },
    { "key": "confirmPassword", "type": "password" }
  ],
  "validators": [{ "type": "treeValidator", "functionName": "passwordsMatch" }]
}
```

---

## Migration Path from Existing Pattern

### Phase 1: Implement Simple Adapter (Backward Compatible)

Adapt existing `CustomValidator` type to work with Angular's `validate` API:

```typescript
/**
 * Adapter that wraps simple validators to work with FieldContext
 */
function adaptSimpleValidator<TValue>(simpleValidator: SimpleCustomValidator<TValue>): ContextAwareValidator<TValue> {
  return (ctx: FieldContext<TValue>) => {
    const value = ctx.value();
    const formValue = ctx.root()().value();
    return simpleValidator(value, formValue);
  };
}

// Usage in validator factory
function applyCustomValidator<TValue>(config: CustomValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(FunctionRegistryService);

  // Try context-aware validator first
  let validatorFn = registry.getContextValidator(config.functionName);

  // Fall back to simple validator with adapter
  if (!validatorFn) {
    const simpleValidator = registry.getValidator(config.functionName);
    if (simpleValidator) {
      validatorFn = adaptSimpleValidator(simpleValidator);
    }
  }

  if (!validatorFn) {
    console.warn(`Validator "${config.functionName}" not found`);
    return;
  }

  const wrappedValidator = (ctx: FieldContext<TValue>) => {
    return validatorFn(ctx, config.params);
  };

  validate(fieldPath, wrappedValidator);
}
```

### Phase 2: Extend ValidatorConfig Types

Update validator config to support all three levels:

```typescript
export type ValidatorType =
  // Built-in validators
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  // Custom validators (all levels)
  | 'custom' // Level 1: Simple or Level 2: Context-aware (auto-detect)
  | 'treeValidator' // Level 3: Tree validators
  | 'async' // Async validators
  | 'http'; // HTTP validators

export interface CustomValidatorConfig extends BaseValidatorConfig {
  type: 'custom';
  functionName: string;
  params?: Record<string, unknown>;
}

export interface TreeValidatorConfig extends BaseValidatorConfig {
  type: 'treeValidator';
  functionName: string;
  params?: Record<string, unknown>;
  targetFields?: string[]; // Optional: which fields should receive errors
}
```

### Phase 3: Enhanced SignalFormsConfig

Add validator registration to form configuration:

```typescript
export interface SignalFormsConfig {
  // Existing
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

  // New: Simple validators (Level 1)
  customValidators?: Record<string, SimpleCustomValidator>;

  // New: Context-aware validators (Level 2)
  contextValidators?: Record<string, ContextAwareValidator>;

  // New: Tree validators (Level 3)
  treeValidators?: Record<string, TreeValidator>;

  // New: Async validators
  asyncValidators?: Record<string, AsyncValidatorOptions>;

  // Existing
  migrateLegacyValidation?: boolean;
  strictMode?: boolean;
}
```

**Usage Example:**

```typescript
const formConfig: FormConfig = {
  fields: [...],
  signalFormsConfig: {
    // Simple validators
    customValidators: {
      noSpaces: (value) => {
        if (typeof value === 'string' && value.includes(' ')) {
          return { kind: 'noSpaces', message: 'Spaces not allowed' };
        }
        return null;
      }
    },

    // Context-aware validators
    contextValidators: {
      lessThanField: (ctx, params) => {
        const value = ctx.value();
        const otherFieldName = params?.field;
        const otherValue = ctx.root()[otherFieldName]?.value();

        if (otherValue !== undefined && value >= otherValue) {
          return {
            kind: 'notLessThan',
            message: `Must be less than ${otherFieldName}`
          };
        }
        return null;
      }
    },

    // Tree validators
    treeValidators: {
      dateRange: (ctx) => {
        const start = ctx.startDate?.value();
        const end = ctx.endDate?.value();

        if (start && end && new Date(start) >= new Date(end)) {
          return {
            field: ctx.endDate,
            kind: 'invalidDateRange',
            message: 'End date must be after start date'
          };
        }
        return null;
      }
    }
  }
};
```

---

## Comparison: Existing vs New Approach

### Existing `CustomValidator` Type

**Signature:**

```typescript
(value: TValue, formValue: unknown) => ValidationError | null;
```

**Pros:**

- ✅ Simple and easy to understand
- ✅ No Angular-specific knowledge required
- ✅ Can access current field value and entire form value

**Cons:**

- ❌ Cannot access field state (errors, touched, dirty, etc.)
- ❌ Cannot access parent context or sibling fields efficiently
- ❌ No type safety for form value access
- ❌ Cannot target errors to specific fields (for tree validation)

### New Context-Aware Validators

**Signature:**

```typescript
(ctx: FieldContext<TValue>, params?: Record<string, unknown>) => ValidationError | null;
```

**Pros:**

- ✅ Full access to Angular's `FieldContext` API
- ✅ Can read other field states, errors, metadata
- ✅ Type-safe access to sibling fields via `ctx.parent()`
- ✅ Can receive parameters from JSON config
- ✅ Better integration with Angular Signal Forms

**Cons:**

- ⚠️ Slightly more complex API
- ⚠️ Requires understanding of `FieldContext`

---

## Recommended Implementation Strategy

### Step 1: Extend FunctionRegistryService (Week 1)

- Add validator registration methods to existing `FunctionRegistryService`
- Implement simple validator adapter to support both signatures
- Purely additive - doesn't change existing functionality

### Step 2: Implement `validate` API Integration (Week 2)

- Add `custom` validator type to `ValidatorConfig`
- Implement `applyCustomValidator` in validator factory
- Support both simple and context-aware validators with auto-detection
- Add tests for custom validation

### Step 3: Implement `validateTree` API Integration (Week 3)

- Add `treeValidator` validator type to `ValidatorConfig`
- Implement `applyTreeValidator` in form mapping
- Add support for field targeting in error results
- Add tests for cross-field validation

### Step 4: Implement Async Validation APIs (Week 4-5)

- Add `async` and `http` validator types
- Implement resource-based async validation
- Add HTTP validation helper
- Add tests for async validation

### Step 5: Update Documentation (Week 6)

- Document all three validator levels
- Provide migration guide
- Add comprehensive examples
- Update API reference

---

## Key Decisions

### 1. Naming Convention

**Decision:** Use clear, descriptive names that indicate the level of complexity

- ✅ `custom` - Auto-detects simple or context-aware validators
- ✅ `treeValidator` - Explicitly for cross-field validation
- ✅ `async` - For async validators with resource API
- ✅ `http` - Simplified HTTP validation

### 2. Registry Location

**Decision:** Extend existing `FunctionRegistryService` (Option 1)

**Rationale:**

- **Developer-facing:** Unified `SignalFormsConfig` API - all custom functions in one place
- **Internal:** Simpler architecture - one registry service instead of two
- **Reusability:** Validators and expressions can share logic (e.g., "isAdult" function used in both)
- **Flexibility:** Can be split later without changing the developer-facing API
- **Consistency:** Same registration pattern across all custom functionality

### 3. Support Existing `CustomValidator` Type

**Decision:** Keep existing `CustomValidator` type, add adapter

**Rationale:**

- The simple signature `(value, formValue) => error` is already defined
- Good progressive enhancement - start simple, upgrade to FieldContext when needed
- Adapter pattern allows both styles to coexist
- Zero impact on existing code (even though no users yet)

### 4. Error Message Customization

**Decision:** Keep existing `ValidationMessages` system, extend for custom validators

**Rationale:**

- Already working well
- Supports dynamic content
- No changes needed - custom validators return standard `ValidationError`

---

## Updated Success Criteria

- [ ] Extend `FunctionRegistryService` with validator registration
- [ ] Implement simple validator adapter to support both signatures
- [ ] Add `custom` validator type with auto-detection
- [ ] Add `treeValidator` validator type for cross-field validation
- [ ] Add `async` and `http` validator types
- [ ] Update `SignalFormsConfig` to accept validator registrations
- [ ] Support both simple and context-aware validator signatures
- [ ] Add comprehensive tests for all validator levels
- [ ] Document progressive enhancement from simple to context-aware validators
- [ ] Provide examples for all use cases

---

## Next Steps After Research

1. ✅ Research complete - APIs and existing patterns understood
2. ⏭️ Get stakeholder approval on integration strategy
3. ⏭️ Create proof-of-concept with existing `CustomValidator` adapter
4. ⏭️ Implement Phase 1 (extend FunctionRegistryService)
5. ⏭️ Test integration with existing forms
6. ⏭️ Roll out remaining phases

---

**Status:** ✅ COMPLETE
**Last Updated:** 2025-11-10
**Related:** `ADVANCED_VALIDATION_RESEARCH.md`

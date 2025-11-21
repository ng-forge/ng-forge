# Dynamic Form Library - Feature Roadmap

This document outlines planned features and known limitations that need to be addressed in future releases.

## Priority Features

### 1. Conditional Page Visibility (High Priority)

**Status:** Not Implemented
**Related Files:**

- `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts`
- `packages/dynamic-forms/src/lib/definitions/default/page-field.ts`
- `packages/dynamic-forms/src/lib/models/logic/logic-config.ts`

**Description:**
The library currently lacks support for conditional page visibility in multi-page forms. While the `LogicConfig` interface exists for field-level logic (hidden, readonly, disabled, required), it is not implemented for `PageField` types.

**Current Behavior:**

- PageOrchestratorComponent performs simple sequential navigation (+1/-1)
- Pages cannot be conditionally shown/hidden based on form values
- Navigation does not skip hidden pages

**Required Implementation:**

1. **Add Logic Support to PageField Interface**

   ```typescript
   // packages/dynamic-forms/src/lib/definitions/default/page-field.ts
   export interface PageField {
     type: 'page';
     logic?: LogicConfig[]; // Add this property
     readonly fields: TFields;
   }
   ```

2. **Create Conditional Expression Evaluator**
   - Implement a service/utility to evaluate `ConditionalExpression` against form values
   - Support all expression types: `fieldValue`, `formValue`, `custom`, `javascript`, `and`, `or`
   - Support all operators: `equals`, `notEquals`, `greater`, `less`, `greaterOrEqual`, `lessOrEqual`, `contains`, `startsWith`, `endsWith`, `matches`

3. **Update PageOrchestratorComponent**

   ```typescript
   // Add method to evaluate if page is hidden
   private isPageHidden(pageField: PageField, formValue: any): boolean {
     if (!pageField.logic) return false;

     const hiddenLogic = pageField.logic.find(l => l.type === 'hidden');
     if (!hiddenLogic) return false;

     return this.evaluateCondition(hiddenLogic.condition, formValue);
   }

   // Update navigation to skip hidden pages
   navigateToNextPage(): NavigationResult {
     let newIndex = currentState.currentPageIndex + 1;
     const formValue = this.form().value;

     // Skip hidden pages
     while (newIndex < totalPages && this.isPageHidden(this.pageFields()[newIndex], formValue)) {
       newIndex++;
     }

     return this.navigateToPage(newIndex);
   }

   navigateToPreviousPage(): NavigationResult {
     let newIndex = currentState.currentPageIndex - 1;
     const formValue = this.form().value;

     // Skip hidden pages
     while (newIndex >= 0 && this.isPageHidden(this.pageFields()[newIndex], formValue)) {
       newIndex--;
     }

     return this.navigateToPage(newIndex);
   }
   ```

4. **Update State Management**
   - Modify `PageOrchestratorState` to track visible pages count
   - Update `isFirstPage` and `isLastPage` calculations to consider hidden pages

**Use Case Example:**

```typescript
{
  key: 'businessPage',
  type: 'page',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'notEquals',
        value: 'business',
      },
    },
  ],
  fields: [/* business-specific fields */]
}
```

**Affected Tests:**

- `apps/examples/material/e2e/src/cross-page-validation.spec.ts` (currently failing)
  - "should navigate through individual account flow"
  - "should navigate through business account flow"
  - "should validate Tax ID format"
  - "should enforce validation at each page level"

---

### 2. Numeric Input Support (Medium Priority)

**Status:** Not Implemented
**Related Files:**

- Input field components across all UI libraries (Material, Bootstrap, Ionic, PrimeNG)
- Type definition for input field props

**Description:**
Input fields currently treat all values as strings. There's no built-in support for numeric inputs that properly handle number types, formatting, and validation.

**Current Limitations:**

- Number inputs don't preserve numeric types
- No support for min/max constraints on UI level
- No support for step increments
- Number formatting options are limited

**Required Implementation:**

1. **Add Numeric Input Props**

   ```typescript
   export interface InputProps {
     type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
     min?: number;
     max?: number;
     step?: number;
     placeholder?: string;
     // ...existing props
   }
   ```

2. **Value Type Handling**
   - Ensure form control values maintain numeric types when `type="number"`
   - Add value transformation/parsing for numeric inputs
   - Handle edge cases (empty string vs null vs undefined)

3. **Update All UI Library Implementations**
   - Material: `mat-input.component.ts`
   - Bootstrap: `bs-input.component.ts`
   - Ionic: `ionic-input.component.ts`
   - PrimeNG: `prime-input.component.ts`

4. **Add Numeric Validators**
   - Built-in min/max validators
   - Integer validation
   - Decimal precision validation
   - Range validation

**Use Case Example:**

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  props: {
    type: 'number',
    min: 0,
    max: 120,
    step: 1
  },
  validators: ['required', 'min:0', 'max:120']
}
```

---

## Lower Priority Features

### 3. Async Validation Support

**Status:** Partially Implemented
**Description:** Support for asynchronous validators (e.g., checking username availability with API)

### 4. Dynamic Array Field Templates

**Status:** Needs Enhancement
**Description:** More flexible templates for array field items with conditional rendering

### 5. File Upload Field Type

**Status:** Not Implemented
**Description:** Native support for file upload with preview and validation

---

## Contributing

When implementing these features:

1. Follow the existing architecture patterns
2. Add comprehensive unit tests
3. Update E2E tests to cover new functionality
4. Document the feature in the appropriate guide
5. Add examples to the demo applications

---

**Last Updated:** 2025-01-21

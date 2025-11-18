# Phase 1: Critical Infrastructure Testing Plan

## Overview
This document outlines the comprehensive testing strategy for Phase 1 of the ng-forge dynamic form library test improvements. Phase 1 focuses on testing the critical infrastructure components that form the foundation of the entire system.

## Test Files to Create

1. `packages/dynamic-form/src/lib/core/schema-builder.spec.ts`
2. `packages/dynamic-form/src/lib/core/schema-application.spec.ts`
3. `packages/dynamic-form/src/lib/events/event.bus.spec.ts`
4. `packages/dynamic-form/src/lib/core/page-orchestrator/page-orchestrator.component.spec.ts`

---

## 1. schema-builder.spec.ts

### File: `packages/dynamic-form/src/lib/core/schema-builder.ts`

**Functions to test:**
- `createSchemaFromFields<TModel>(fields: FieldDef<any>[], registry: Map<string, FieldTypeDefinition>): Schema<TModel>`
- `fieldsToDefaultValues<TModel>(fields: FieldDef<any>[], registry: Map<string, FieldTypeDefinition>): TModel`

---

### Test Suite 1.1: createSchemaFromFields()

#### 1.1.1 Basic Field Processing
- [ ] Should create schema from empty fields array
- [ ] Should create schema from single field with 'include' value handling
- [ ] Should create schema from multiple fields with 'include' value handling
- [ ] Should skip fields without keys
- [ ] Should handle fields where path is undefined/null

#### 1.1.2 Value Handling Mode: 'exclude'
- [ ] Should skip fields with 'exclude' value handling (e.g., text, button)
- [ ] Should not call mapFieldToForm for excluded fields
- [ ] Should process subsequent fields after excluded fields

#### 1.1.3 Value Handling Mode: 'flatten'
- [ ] Should flatten page field children to current level
- [ ] Should flatten row field children to current level
- [ ] Should handle array-based fields (page/row with fields as array)
- [ ] Should handle object-based fields (group with fields as object)
- [ ] Should skip flatten fields without fields property
- [ ] Should skip flatten children without keys
- [ ] Should skip flatten children where childPath is undefined
- [ ] Should handle mixed flatten and include fields

#### 1.1.4 Value Handling Mode: 'include' (regular fields)
- [ ] Should process input fields with 'include' handling
- [ ] Should process checkbox fields with 'include' handling
- [ ] Should process select fields with 'include' handling
- [ ] Should call mapFieldToForm with correct parameters
- [ ] Should handle fields where fieldPath is undefined

#### 1.1.5 Complex Scenarios
- [ ] Should handle nested field structures (groups within pages)
- [ ] Should handle mixed value handling modes in same form
- [ ] Should preserve field order during schema creation
- [ ] Should handle large number of fields (performance test)

#### 1.1.6 Registry Integration
- [ ] Should correctly query registry for value handling mode
- [ ] Should default to 'include' when field type not in registry
- [ ] Should handle undefined/null registry gracefully

#### 1.1.7 Type Safety
- [ ] Should maintain type safety with generic TModel parameter
- [ ] Should work with complex model types

---

### Test Suite 1.2: fieldsToDefaultValues()

#### 1.2.1 Basic Default Value Extraction
- [ ] Should return empty object for empty fields array
- [ ] Should extract default values from single field
- [ ] Should extract default values from multiple fields
- [ ] Should skip fields without keys
- [ ] Should skip fields with undefined default values

#### 1.2.2 Value Handling Modes
- [ ] Should skip excluded fields (text, button, etc.)
- [ ] Should process included fields (input, checkbox, etc.)
- [ ] Should handle flatten fields correctly

#### 1.2.3 Field Type Specific Defaults
- [ ] Should use empty string for input fields without value
- [ ] Should use false for checkbox fields without value
- [ ] Should use empty array for array fields
- [ ] Should use explicit value when provided
- [ ] Should use explicit defaultValue when provided
- [ ] Should handle null values correctly
- [ ] Should handle undefined values correctly

#### 1.2.4 Nested Structures
- [ ] Should extract nested defaults from group fields
- [ ] Should flatten values from row/page fields correctly
- [ ] Should handle deeply nested structures

#### 1.2.5 Edge Cases
- [ ] Should handle fields with value set to 0
- [ ] Should handle fields with value set to empty string
- [ ] Should handle fields with value set to false
- [ ] Should handle circular references gracefully (if applicable)

#### 1.2.6 Type Safety
- [ ] Should return correctly typed TModel
- [ ] Should work with complex model types

---

## 2. schema-application.spec.ts

### File: `packages/dynamic-form/src/lib/core/schema-application.ts`

**Functions to test:**
- `applySchema(config: SchemaApplicationConfig, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void`
- `createSchemaFunction<T>(schema: SchemaDefinition): SchemaOrSchemaFn<T>`

---

### Test Suite 2.1: applySchema()

#### 2.1.1 Schema Resolution
- [ ] Should resolve schema by name from registry
- [ ] Should resolve inline schema definitions
- [ ] Should log error when schema not found
- [ ] Should list available schemas in error message
- [ ] Should handle empty schema registry gracefully
- [ ] Should not throw when schema is missing

#### 2.1.2 Application Type: 'apply'
- [ ] Should call Angular's apply() with schema function
- [ ] Should apply schema unconditionally
- [ ] Should work with SchemaPath parameter
- [ ] Should work with SchemaPathTree parameter

#### 2.1.3 Application Type: 'applyWhen'
- [ ] Should call Angular's applyWhen() with condition and schema
- [ ] Should create logic function from condition expression
- [ ] Should apply schema only when condition is true
- [ ] Should skip application when condition is undefined
- [ ] Should handle complex conditional expressions

#### 2.1.4 Application Type: 'applyWhenValue'
- [ ] Should call Angular's applyWhenValue() with predicate and schema
- [ ] Should create type predicate function
- [ ] Should apply schema when value matches predicate
- [ ] Should skip application when typePredicate is undefined
- [ ] Should handle type narrowing correctly

#### 2.1.5 Application Type: 'applyEach'
- [ ] Should call Angular's applyEach() for array schemas
- [ ] Should cast path to SchemaPath<any[]>
- [ ] Should apply schema to each array item

#### 2.1.6 Error Handling
- [ ] Should handle invalid application types gracefully
- [ ] Should handle missing SchemaRegistryService
- [ ] Should log meaningful error messages
- [ ] Should not crash on malformed config

#### 2.1.7 Integration with Registry
- [ ] Should inject SchemaRegistryService correctly
- [ ] Should query registry for schema resolution
- [ ] Should handle schema not in registry

---

### Test Suite 2.2: createSchemaFunction()

#### 2.2.1 Validator Application
- [ ] Should apply validators from schema definition
- [ ] Should apply multiple validators in order
- [ ] Should handle schema without validators
- [ ] Should call applyValidator for each validator config
- [ ] Should pass SchemaPathTree to applyValidator

#### 2.2.2 Logic Application
- [ ] Should apply logic rules from schema definition
- [ ] Should apply multiple logic rules in order
- [ ] Should handle schema without logic
- [ ] Should call applyLogic for each logic config
- [ ] Should pass SchemaPathTree to applyLogic

#### 2.2.3 Sub-Schema Application
- [ ] Should apply sub-schemas from schema definition
- [ ] Should apply multiple sub-schemas in order
- [ ] Should handle schema without sub-schemas
- [ ] Should call applySchema for each sub-schema config
- [ ] Should pass SchemaPathTree to applySchema
- [ ] Should handle nested sub-schemas (recursion)

#### 2.2.4 Combined Scenarios
- [ ] Should apply validators, logic, and sub-schemas together
- [ ] Should apply in correct order (validators → logic → sub-schemas)
- [ ] Should handle empty schema definition
- [ ] Should work with complex schema definitions

#### 2.2.5 Type Safety
- [ ] Should maintain generic type parameter T
- [ ] Should return valid SchemaOrSchemaFn<T>

---

## 3. event.bus.spec.ts

### File: `packages/dynamic-form/src/lib/events/event.bus.ts`

**Class to test:** `EventBus`

**Methods:**
- `dispatch<T extends FormEventConstructor>(eventConstructor: T, ...args: any[]): void`
- `on<T extends FormEvent>(eventType: T['type'] | Array<T['type']>): Observable<T>`

**Properties:**
- `events$: Observable<FormEvent>`

---

### Test Suite 3.1: EventBus Service Setup

#### 3.1.1 Service Creation
- [ ] Should be created successfully
- [ ] Should have events$ observable
- [ ] Should have pipeline$ as Subject internally

---

### Test Suite 3.2: dispatch()

#### 3.2.1 Basic Event Dispatching
- [ ] Should dispatch event with no arguments
- [ ] Should dispatch event with single argument
- [ ] Should dispatch event with multiple arguments
- [ ] Should create new instance of event class
- [ ] Should emit event to events$ observable

#### 3.2.2 Event Constructor Handling
- [ ] Should handle parameterless constructors
- [ ] Should handle constructors with required parameters
- [ ] Should handle constructors with optional parameters
- [ ] Should pass all args to constructor

#### 3.2.3 Multiple Dispatches
- [ ] Should dispatch multiple events in sequence
- [ ] Should dispatch different event types
- [ ] Should maintain event order in stream

#### 3.2.4 Error Handling
- [ ] Should handle constructor that throws error
- [ ] Should not break pipeline on dispatch error

---

### Test Suite 3.3: on() - Single Event Type

#### 3.3.1 Basic Subscription
- [ ] Should subscribe to single event type (string)
- [ ] Should receive events matching the type
- [ ] Should not receive events of different types
- [ ] Should filter events correctly

#### 3.3.2 Type Narrowing
- [ ] Should type-narrow to specific event type
- [ ] Should provide type-safe event access
- [ ] Should work with custom event properties

#### 3.3.3 Multiple Subscribers
- [ ] Should support multiple subscribers to same event type
- [ ] Should deliver event to all subscribers
- [ ] Should maintain independent subscriptions

#### 3.3.4 Subscription Lifecycle
- [ ] Should continue receiving events until unsubscribed
- [ ] Should stop receiving events after unsubscribe
- [ ] Should handle subscription before any dispatch
- [ ] Should handle subscription after dispatches

---

### Test Suite 3.4: on() - Multiple Event Types

#### 3.4.1 Array-Based Subscription
- [ ] Should subscribe to multiple event types with array
- [ ] Should receive events matching any type in array
- [ ] Should not receive events not in array
- [ ] Should filter events correctly

#### 3.4.2 Type Handling
- [ ] Should handle empty array
- [ ] Should handle single-item array
- [ ] Should handle large arrays of event types

#### 3.4.3 Event Differentiation
- [ ] Should allow distinguishing between different event types
- [ ] Should preserve event.type property
- [ ] Should maintain type information

---

### Test Suite 3.5: Integration Scenarios

#### 3.5.1 Full Event Flow
- [ ] Should support dispatch → subscribe → receive flow
- [ ] Should support subscribe → dispatch → receive flow
- [ ] Should handle interleaved dispatch and subscribe

#### 3.5.2 Event Bus Isolation
- [ ] Should maintain separate event streams per EventBus instance
- [ ] Should not leak events between instances

#### 3.5.3 Real-World Event Types
- [ ] Should work with NextPageEvent
- [ ] Should work with PreviousPageEvent
- [ ] Should work with PageChangeEvent
- [ ] Should work with custom user events

#### 3.5.4 Observable Behavior
- [ ] Should complete when Subject completes
- [ ] Should handle RxJS operators (map, filter, etc.)
- [ ] Should support async pipe usage

---

## 4. page-orchestrator.component.spec.ts

### File: `packages/dynamic-form/src/lib/core/page-orchestrator/page-orchestrator.component.ts`

**Component to test:** `PageOrchestratorComponent`

**Public Methods:**
- `navigateToNextPage(): NavigationResult`
- `navigateToPreviousPage(): NavigationResult`
- `navigateToPage(pageIndex: number): NavigationResult`

**Inputs:**
- `pageFields: PageField[]`
- `form: FieldTree<any>`
- `fieldSignalContext: FieldSignalContext`
- `config: PageOrchestratorConfig`

**Signals:**
- `state: Signal<PageOrchestratorState>`

---

### Test Suite 4.1: Component Initialization

#### 4.1.1 Basic Setup
- [ ] Should create component successfully
- [ ] Should initialize with default config
- [ ] Should set up event listeners on creation
- [ ] Should inject EventBus correctly

#### 4.1.2 Initial State
- [ ] Should start with currentPageIndex = 0 by default
- [ ] Should respect config.initialPageIndex
- [ ] Should clamp initialPageIndex to valid range (0 to totalPages-1)
- [ ] Should handle initialPageIndex > totalPages
- [ ] Should handle initialPageIndex < 0
- [ ] Should handle empty pageFields array

#### 4.1.3 State Computation
- [ ] Should compute isFirstPage correctly
- [ ] Should compute isLastPage correctly
- [ ] Should compute totalPages correctly
- [ ] Should compute navigationDisabled from config
- [ ] Should update state when pageFields changes

---

### Test Suite 4.2: navigateToNextPage()

#### 4.2.1 Successful Navigation
- [ ] Should navigate from page 0 to page 1
- [ ] Should navigate from middle page to next page
- [ ] Should update currentPageIndex signal
- [ ] Should return success: true
- [ ] Should return correct newPageIndex
- [ ] Should dispatch PageChangeEvent
- [ ] Should include previous page index in event

#### 4.2.2 Boundary Conditions
- [ ] Should fail when on last page (isLastPage = true)
- [ ] Should return success: false when on last page
- [ ] Should return error message when on last page
- [ ] Should not change page index when on last page
- [ ] Should not dispatch event when on last page

#### 4.2.3 Navigation Disabled
- [ ] Should fail when navigationDisabled = true
- [ ] Should return success: false when disabled
- [ ] Should return error message about disabled navigation
- [ ] Should not change page index when disabled
- [ ] Should not dispatch event when disabled

---

### Test Suite 4.3: navigateToPreviousPage()

#### 4.3.1 Successful Navigation
- [ ] Should navigate from page 1 to page 0
- [ ] Should navigate from middle page to previous page
- [ ] Should navigate from last page backwards
- [ ] Should update currentPageIndex signal
- [ ] Should return success: true
- [ ] Should return correct newPageIndex
- [ ] Should dispatch PageChangeEvent

#### 4.3.2 Boundary Conditions
- [ ] Should fail when on first page (isFirstPage = true)
- [ ] Should return success: false when on first page
- [ ] Should return error message when on first page
- [ ] Should not change page index when on first page
- [ ] Should not dispatch event when on first page

#### 4.3.3 Navigation Disabled
- [ ] Should fail when navigationDisabled = true
- [ ] Should return success: false when disabled
- [ ] Should return error message about disabled navigation
- [ ] Should not change page index when disabled

---

### Test Suite 4.4: navigateToPage()

#### 4.4.1 Valid Navigation
- [ ] Should navigate to page 0
- [ ] Should navigate to middle page
- [ ] Should navigate to last page
- [ ] Should update currentPageIndex signal
- [ ] Should return success: true
- [ ] Should dispatch PageChangeEvent
- [ ] Should allow navigation to current page (no-op)

#### 4.4.2 Invalid Page Index
- [ ] Should reject negative page index
- [ ] Should reject page index >= totalPages
- [ ] Should return success: false for invalid index
- [ ] Should return error message with valid range
- [ ] Should not change page index for invalid input
- [ ] Should not dispatch event for invalid input

#### 4.4.3 Navigation to Current Page
- [ ] Should return success: true when navigating to current page
- [ ] Should not dispatch event when already on target page
- [ ] Should return current page as newPageIndex

#### 4.4.4 Edge Cases
- [ ] Should handle totalPages = 0
- [ ] Should handle totalPages = 1
- [ ] Should validate against current totalPages

---

### Test Suite 4.5: Event Handling

#### 4.5.1 Event Listeners Setup
- [ ] Should subscribe to NextPageEvent on creation
- [ ] Should subscribe to PreviousPageEvent on creation
- [ ] Should unsubscribe on component destroy
- [ ] Should use takeUntilDestroyed for cleanup

#### 4.5.2 NextPageEvent Response
- [ ] Should call navigateToNextPage() when NextPageEvent received
- [ ] Should handle multiple NextPageEvent emissions
- [ ] Should navigate correctly in response to event

#### 4.5.3 PreviousPageEvent Response
- [ ] Should call navigateToPreviousPage() when PreviousPageEvent received
- [ ] Should handle multiple PreviousPageEvent emissions
- [ ] Should navigate correctly in response to event

#### 4.5.4 PageChangeEvent Emission
- [ ] Should dispatch PageChangeEvent on successful navigation
- [ ] Should include currentPageIndex in event
- [ ] Should include totalPages in event
- [ ] Should include previousPageIndex in event

#### 4.5.5 PageNavigationStateChangeEvent
- [ ] Should dispatch state change event when state updates
- [ ] Should include full state in event
- [ ] Should trigger on page changes
- [ ] Should use explicitEffect for state watching

---

### Test Suite 4.6: State Signal Behavior

#### 4.6.1 State Properties
- [ ] Should expose currentPageIndex in state
- [ ] Should expose totalPages in state
- [ ] Should expose isFirstPage in state
- [ ] Should expose isLastPage in state
- [ ] Should expose navigationDisabled in state

#### 4.6.2 State Reactivity
- [ ] Should update state when navigating
- [ ] Should update state when pageFields changes
- [ ] Should update state when config changes
- [ ] Should trigger effects on state changes

#### 4.6.3 Computed State Values
- [ ] Should compute isFirstPage = true on page 0
- [ ] Should compute isFirstPage = false on page > 0
- [ ] Should compute isLastPage = true on last page
- [ ] Should compute isLastPage = false on page < last
- [ ] Should compute totalPages from pageFields length

---

### Test Suite 4.7: Template and Rendering

#### 4.7.1 Deferred Rendering Strategy
- [ ] Should render current page immediately
- [ ] Should render adjacent pages (±1) immediately
- [ ] Should defer distant pages until idle
- [ ] Should use @defer blocks correctly

#### 4.7.2 Page Visibility
- [ ] Should set isVisible=true for current page only
- [ ] Should set isVisible=false for non-current pages
- [ ] Should pass correct pageIndex to page-field
- [ ] Should pass correct field definition to page-field

#### 4.7.3 Host Attributes
- [ ] Should set data-current-page attribute
- [ ] Should set data-total-pages attribute
- [ ] Should update attributes when state changes

---

### Test Suite 4.8: Provider Configuration

#### 4.8.1 FIELD_SIGNAL_CONTEXT Provider
- [ ] Should provide FIELD_SIGNAL_CONTEXT
- [ ] Should use orchestrator's fieldSignalContext
- [ ] Should be available to child components

---

### Test Suite 4.9: Integration Tests

#### 4.9.1 Full Navigation Flow
- [ ] Should navigate through all pages forward
- [ ] Should navigate through all pages backward
- [ ] Should jump to arbitrary pages
- [ ] Should handle circular navigation (not implemented, but validate boundaries)

#### 4.9.2 Config Changes
- [ ] Should handle initialPageIndex change
- [ ] Should handle navigationDisabled toggle
- [ ] Should handle pageFields array changes

#### 4.9.3 Error Recovery
- [ ] Should recover from invalid navigation attempts
- [ ] Should maintain valid state after errors
- [ ] Should continue functioning after failed navigation

---

## Testing Guidelines

### General Best Practices

1. **Arrange-Act-Assert Pattern**: Structure all tests clearly
2. **Test Isolation**: Each test should be independent
3. **Descriptive Names**: Use clear, descriptive test names
4. **Edge Cases**: Always test boundary conditions
5. **Error Handling**: Test both success and failure paths
6. **Type Safety**: Verify generic type parameters work correctly

### Angular Testing Utilities

- Use `TestBed` for service and component testing
- Use `runInInjectionContext` for testing functions that use `inject()`
- Use `signal()` and `computed()` for reactive values
- Use Angular's `form()` and `schema()` from `@angular/forms/signals`

### Mocking Strategy

- **EventBus**: Create real instance, don't mock (it's simple)
- **SchemaRegistryService**: Mock for schema-application tests
- **FieldTypeRegistry**: Create test registry with known types
- **RootFormRegistryService**: Mock or use real implementation

### Coverage Goals

- **Line Coverage**: 90%+ for all files
- **Branch Coverage**: 85%+ for all files
- **Function Coverage**: 100% for public APIs

### Test Organization

```typescript
describe('FileName', () => {
  describe('functionName', () => {
    describe('specific scenario', () => {
      it('should do specific thing', () => {
        // Arrange
        // Act
        // Assert
      });
    });
  });
});
```

---

## Summary Statistics

**Total Test Suites**: 20
**Estimated Total Tests**: ~220+

### Breakdown by File:
- **schema-builder.spec.ts**: ~50 tests
- **schema-application.spec.ts**: ~40 tests
- **event.bus.spec.ts**: ~40 tests
- **page-orchestrator.component.spec.ts**: ~90 tests

---

## Implementation Order

### Recommended sequence:

1. **event.bus.spec.ts** (simplest, no dependencies)
2. **schema-builder.spec.ts** (depends on form-mapping but can mock)
3. **schema-application.spec.ts** (depends on schema-builder concepts)
4. **page-orchestrator.component.spec.ts** (depends on EventBus, most complex)

---

## Acceptance Criteria

For Phase 1 to be considered complete:

- [ ] All 4 test files created
- [ ] All test suites implemented
- [ ] 90%+ line coverage achieved
- [ ] 85%+ branch coverage achieved
- [ ] All tests passing
- [ ] No skipped or pending tests
- [ ] Tests run in CI successfully
- [ ] Documentation updated if needed

---

## Next Steps

After completing Phase 1, proceed to Phase 2 (Field Mappers) as outlined in the main test coverage analysis document.

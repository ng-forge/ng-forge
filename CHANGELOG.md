## 0.5.2 (2026-02-09)

### 🚀 Features

- **dynamic-forms:** add generalized non-field logic resolvers ([#224](https://github.com/ng-forge/ng-forge/pull/224))
- **dynamic-forms:** add property derivation system for reactive field properties ([#232](https://github.com/ng-forge/ng-forge/pull/232), [#220](https://github.com/ng-forge/ng-forge/issues/220))

### 🐛 Bug Fixes

- **config:** use production domain URL for deployment smoke test ([#233](https://github.com/ng-forge/ng-forge/pull/233))
- **docs:** correct broken iframe routes and array example configuration ([#213](https://github.com/ng-forge/ng-forge/pull/213))
- **dynamic-forms:** make logic condition evaluation array-aware via pathKeys ([#231](https://github.com/ng-forge/ng-forge/pull/231))

### ⚡ Performance Improvements

- **dynamic-forms:** prevent redundant recalculations with deep equality checks ([#177](https://github.com/ng-forge/ng-forge/pull/177))

### ♻️ Code Refactoring

- **dynamic-forms:** replace array events with semantic event classes and builder API ([#218](https://github.com/ng-forge/ng-forge/pull/218))
- ⚠️ **dynamic-forms:** implement direct root form binding with UUID keys for array items ([#219](https://github.com/ng-forge/ng-forge/pull/219), [#218](https://github.com/ng-forge/ng-forge/issues/218))
- **dynamic-forms:** extract and optimize form state management ([#223](https://github.com/ng-forge/ng-forge/pull/223))

### ✅ Tests

- **examples:** add comprehensive E2E test suites and edge case coverage ([#225](https://github.com/ng-forge/ng-forge/pull/225))

### ⚠️ Breaking Changes

- **dynamic-forms:** implement direct root form binding with UUID keys for array items ([#219](https://github.com/ng-forge/ng-forge/pull/219), [#218](https://github.com/ng-forge/ng-forge/issues/218))
  ArrayField.fields is now `FieldDef[][]` instead of `FieldDef[]`
  The outer array defines initial items (each element = one array item).
  The inner arrays define the field structure for each item.
  Values are now embedded in field definitions via the `value` property.
  Before:

  ```typescript
  {
    key: 'contacts',
    type: 'array',
    fields: [{ key: 'name', type: 'input' }]
  }
  // + initialValue: { contacts: [{name: 'Alice'}] }
  ```

  After:

  ```typescript
  {
    key: 'contacts',
    type: 'array',
    fields: [
      [{ key: 'name', type: 'input', value: 'Alice' }]
    ]
  }
  // No separate initialValue needed
  ```

  - Update ArrayField type with ArrayItemTemplate type alias
  - Update isArrayField type guard to validate nested structure
  - Update ArrayFieldComponent to resolve items from fields[][]
  - Update form schema mapping to handle heterogeneous items
  - Update default value computation for new structure
  - Update field flattener and form mode validator
  - Update all example scenarios across all UI libraries
  - Update unit tests for new structure
  * refactor(dynamic-forms): improve row layout and array example styling
  - Add df-col-auto class for natural content width in rows
  - Add df-row-mobile-keep-cols class to maintain horizontal layout on mobile
  - Use baseline alignment for better button/input vertical alignment
  - Set consistent 156px min-width for form buttons
  - Add gap between array items for visual separation
  - Update array example with side-by-side Add First/Add Contact buttons
  - Add ARRAY_TEMPLATE_REGISTRY token for tracking item templates
  * fix(dynamic-forms): update type tests for ArrayItemTemplate[] structure
    Update type tests in array-field.type-test.ts to use ArrayItemTemplate[]
    instead of ArrayAllowedChildren[] to match the new nested array structure
    (FieldDef[][]) introduced in the array field refactoring.
  * chore(mcp): regenerate registry with updated array docs
  * revert(dynamic-forms): restore original row and grid styling
    Revert library styling changes made in e5bb3f250 that should have been
    in docs-specific styles, not core library files.
  - Restore row-field.component.scss to use flex-start alignment and
    natural content sizing (flex: 0 0 auto) for items without col classes
  - Restore 576px mobile breakpoint instead of 768px
  - Remove df-col-auto from array example (not needed with original styling)
  * refactor(examples): move row styling overrides to example-specific styles
    Add row layout overrides to \_examples.scss instead of modifying library:
  - Baseline alignment for better button/input vertical alignment
  - Equal space distribution for children (flex: 1 1 0)
  - df-col-auto class for natural content width
  - 768px responsive breakpoint for example container width
  - df-row-mobile-keep-cols opt-in for horizontal mobile layout
    Restore df-col-auto classes on array example buttons.
  * fix(examples): correct row field selector to [row-field]
  * fix(dynamic-forms): address array field review concerns
  - Add fallback for crypto.randomUUID() for older browsers/non-HTTPS contexts
  - Fix formValue snapshot issue by using getter for reactive access
  * refactor(dynamic-forms): simplify array item ID generation to counter
  * refactor(dynamic-forms): remove dead key-suffix code
  * perf(dynamic-forms): optimize array remove operations to avoid recreates
    Update resolvedItems BEFORE form value for all remove operations (pop,
    shift, removeAt). This ensures differential update sees "none" (lengths
    already match) and avoids unnecessary component recreates. Remaining
    items' linkedSignal indices auto-update via itemOrderSignal.
    Also removes unused 'pop' type variant from DifferentialUpdateOperation
    since all removes now use the same optimized path.
  * chore(dynamic-forms): remove unused ArrayTemplateRegistry type import
  * refactor(dynamic-forms): remove unused fieldTree and explicitDefaultValue parameters
    These parameters were passed through the array item resolution chain but
    never actually used:
  - createArrayItemInjectorAndInputs now gets form from RootFormRegistryService
  - explicitDefaultValue was never read by any function
    Removed from:
  - CreateArrayItemInjectorOptions interface
  - ResolveArrayItemOptions interface
  - All callers in array-field.component.ts
  * perf(dynamic-forms): optimize array item index lookup from O(n) to O(1)
    Replace itemOrderSignal (string[]) with itemPositionMap (Map<string, number>)
    for position lookup. Each array item's linkedSignal was doing indexOf() which
    is O(n) per item, resulting in O(n²) total on every array mutation.
    Now uses Map.get() for O(1) per item, O(n) total.
    Also:
  - Replace redundant linkedSignal wrapper with computed for resolvedItems
  - Remove unused linkedSignal import from array-field.component
  * fix(dynamic-forms): scope array item ID generator to component for SSR compatibility
    Replace module-level counter with DI-based ID generator per array instance.
    Each ArrayFieldComponent now provides its own ARRAY_ITEM_ID_GENERATOR via
    createArrayItemIdGenerator factory, ensuring:
  - SSR hydration compatibility (server and client generate same IDs)
  - No global state pollution between form instances
  - Deterministic IDs within each array's lifecycle
  * feat(dynamic-forms): support primitive arrays alongside object arrays
    Add ArrayItemDefinition type to support both primitive and object array items:
  - Single FieldDef (not wrapped) creates primitive item (extracts value directly)
  - Array of FieldDefs creates object item (merges fields into object)
    This enables three array patterns:
  - Primitive arrays: ['tag1', 'tag2']
  - Object arrays: [{ name: 'Alice', email: '...' }]
  - Heterogeneous arrays: [{ value: 'x' }, 'y']
    Updated components:
  - ArrayField interface and isArrayField type guard
  - Default value computation for primitive items
  - Form schema mapping for primitive/mixed arrays
  - Array component to normalize and handle both formats
  - Event types to accept single field or array templates
  - Button types for all UI libraries
  * docs(dynamic-forms): update array documentation for primitive array support
  - Fix programmatic approach section to use correct API syntax
  - Update "Complete Example: Flat Array" to use primitive array syntax
  - Add form value comments to show expected output
  - Document both primitive and object template formats
  * docs(dynamic-forms): update events documentation for required array templates
  - Update array events section to show required template parameter
  - Add examples for both primitive and object item templates
  - Regenerate MCP registry with updated documentation
  * fix(dynamic-forms): use core package field types in array type tests
    Change type tests to use 'hidden' instead of 'input' since 'input' is
    only available in UI library packages, not in the core dynamic-forms
    package. The 'hidden' type is a value field in the core registry.
  * fix(dynamic-forms): correct array derivation traversal for primitive/object items
  - Fix derivation collector to properly handle (FieldDef | FieldDef[])[] format
  - Add scoped styling for array docs example via formClassName property
  - Add formClassName to ExampleScenario interface for custom form classes

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru
- Artur @arturovt

# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and uses [Conventional Commits](https://www.conventionalcommits.org/).

## [0.5.1](https://github.com/ng-forge/ng-forge/compare/v0.5.0...v0.5.1) (2026-02-01)

### 🚀 Features

- ⚠️ **dynamic-forms:** remove targetField from derivation API ([#202](https://github.com/ng-forge/ng-forge/pull/202))
- **dynamic-forms:** add externalData support for conditional logic ([#204](https://github.com/ng-forge/ng-forge/pull/204))
- **dynamic-forms:** add comprehensive test coverage for stability benchmarks ([#203](https://github.com/ng-forge/ng-forge/pull/203))
- **dynamic-forms:** add withEventFormValue() feature for attaching form values to events ([#209](https://github.com/ng-forge/ng-forge/pull/209))
- ⚠️ **mcp:** add dynamic-form-mcp package ([#126](https://github.com/ng-forge/ng-forge/pull/126))

### 🐛 Bug Fixes

- **config:** allow production deploys from any branch and skip smoke test on preview ([#198](https://github.com/ng-forge/ng-forge/pull/198))
- **dynamic-forms:** comprehensive API fixes for type inference and silent failures ([#206](https://github.com/ng-forge/ng-forge/pull/206))

### ♻️ Code Refactoring

- **mcp:** consolidate to 4 focused tools with improved documentation ([#210](https://github.com/ng-forge/ng-forge/pull/210))

### 📚 Documentation

- add Quick Start examples hub and improve documentation UX ([#188](https://github.com/ng-forge/ng-forge/pull/188))

### ⏪ Reverts

- **dynamic-forms:** feat(dynamic-forms): add internal zod schema validation package (#187) ([#187](https://github.com/ng-forge/ng-forge/pull/187), [#185](https://github.com/ng-forge/ng-forge/issues/185), [#186](https://github.com/ng-forge/ng-forge/issues/186))

### ⚠️ Breaking Changes

- **dynamic-forms:** remove targetField from derivation API ([#202](https://github.com/ng-forge/ng-forge/pull/202))
  The targetField property has been removed from DerivationLogicConfig.
  All derivations now target the field they are defined on (self-targeting).

  Migration:
  - Move derivation logic from source fields to target fields
  - Remove targetField property from logic configs
  - Use shorthand 'derivation' property when possible

  Before:

  ```typescript
  {
    key: 'quantity',
    logic: [{
      type: 'derivation',
      targetField: 'total',
      expression: 'formValue.quantity * formValue.unitPrice'
    }]
  }
  ```

  After:

  ```typescript
  {
    key: 'total',
    derivation: 'formValue.quantity * formValue.unitPrice'
  }
  ```

- **mcp:** add dynamic-form-mcp package ([#126](https://github.com/ng-forge/ng-forge/pull/126))
  New MCP server for AI-assisted form schema generation with 4 focused tools:
  - `ngforge_lookup`: unified documentation
  - `ngforge_examples`: working code patterns
  - `ngforge_validate`: config verification
  - `ngforge_scaffold`: skeleton generator

## [0.5.0](https://github.com/ng-forge/ng-forge/compare/v0.4.0...v0.5.0) (2026-01-25)

### 🚀 Features

- **docs:** add vercel speed insights integration ([#189](https://github.com/ng-forge/ng-forge/pull/189))
- **dynamic-forms:** add value derivation logic system ([#123](https://github.com/ng-forge/ng-forge/pull/123))
- **dynamic-forms:** add zod integration ([#179](https://github.com/ng-forge/ng-forge/pull/179), [#180](https://github.com/ng-forge/ng-forge/issues/180), [#181](https://github.com/ng-forge/ng-forge/issues/181), [#182](https://github.com/ng-forge/ng-forge/issues/182))

### 🐛 Bug Fixes

- cache playwright browsers for unit tests in CI ([#192](https://github.com/ng-forge/ng-forge/pull/192), [#190](https://github.com/ng-forge/ng-forge/issues/190))
- **dynamic-forms:** show only first validation error instead of all errors ([#183](https://github.com/ng-forge/ng-forge/pull/183), [#179](https://github.com/ng-forge/ng-forge/issues/179))

### ♻️ Code Refactoring

- **dynamic-forms:** extract testing utilities and reduce package size ([#176](https://github.com/ng-forge/ng-forge/pull/176))

### 📚 Documentation

- add social media preview and optimize seo keywords ([#178](https://github.com/ng-forge/ng-forge/pull/178))
- sync compatibility matrix across all READMEs

## [0.4.0](https://github.com/ng-forge/ng-forge/compare/v0.3.1...v0.4.0) (2026-01-18)

### 🚀 Features

- add errors-cover-hint behavior with e2e tests ([#170](https://github.com/ng-forge/ng-forge/pull/170))
- **dynamic-forms:** add form-level default props support ([#172](https://github.com/ng-forge/ng-forge/pull/172), [#134](https://github.com/ng-forge/ng-forge/issues/134))
- **dynamic-forms:** add comprehensive html input type support ([#163](https://github.com/ng-forge/ng-forge/pull/163), [#140](https://github.com/ng-forge/ng-forge/issues/140))
- **ionic:** add helper text support to all form field components ([#169](https://github.com/ng-forge/ng-forge/pull/169))

### 🐛 Bug Fixes

- **dynamic-forms:** use root form validity for submit buttons in nested contexts ([#162](https://github.com/ng-forge/ng-forge/pull/162), [#157](https://github.com/ng-forge/ng-forge/issues/157))
- **material,bootstrap,primeng,ionic:** set side-effects to true for module augmentation ([#161](https://github.com/ng-forge/ng-forge/pull/161))

### ⚡ Performance Improvements

- **dynamic-forms:** use dedicated injection tokens for form-level config ([#173](https://github.com/ng-forge/ng-forge/pull/173))

### ♻️ Code Refactoring

- **bootstrap:** clean up component templates and effects ([#168](https://github.com/ng-forge/ng-forge/pull/168))
- **bootstrap:** rename helper text prop from helptext to hint ([#171](https://github.com/ng-forge/ng-forge/pull/171))
- **ionic:** standardize accessibility signal naming and add aria-describedby ([#165](https://github.com/ng-forge/ng-forge/pull/165))
- **material:** clean up component templates and effects ([#164](https://github.com/ng-forge/ng-forge/pull/164))
- **material,bootstrap,primeng,ionic:** remove generics from field components ([#158](https://github.com/ng-forge/ng-forge/pull/158))
- **primeng:** clean up signal forms integration ([#167](https://github.com/ng-forge/ng-forge/pull/167))

## [0.3.1](https://github.com/ng-forge/ng-forge/compare/v0.3.0...v0.3.1) (2026-01-14)

### 🚀 Features

- **docs:** add interactive demo and syntax highlighting to landing page ([#132](https://github.com/ng-forge/ng-forge/pull/132))
- **docs:** add link title attributes and improve example input theming ([#138](https://github.com/ng-forge/ng-forge/pull/138))
- **docs:** add new landing page with improved design ([#127](https://github.com/ng-forge/ng-forge/pull/127))

### 🐛 Bug Fixes

- **core:** add unique ids to form field inner elements ([#136](https://github.com/ng-forge/ng-forge/pull/136))
- **dynamic-forms:** bind classname to container field components ([#137](https://github.com/ng-forge/ng-forge/pull/137))

## [0.3.0](https://github.com/ng-forge/ng-forge/compare/v0.2.0...v0.3.0) (2026-01-12)

### 🚀 Features

- **dynamic-forms:** add hidden field type for storing non-rendered values ([#122](https://github.com/ng-forge/ng-forge/pull/122))
- **dynamic-forms:** add meta attribute support for wrapped components ([#115](https://github.com/ng-forge/ng-forge/pull/115))

### ✅ Tests

- **examples:** add visual regression screenshots and e2e infrastructure ([#125](https://github.com/ng-forge/ng-forge/pull/125))
- **forms:** add exhaustive type tests for all ui libraries and core types ([#121](https://github.com/ng-forge/ng-forge/pull/121))

### 📦 Build System

- **deps:** update angular to 21.0.8 with formfield directive migration ([#124](https://github.com/ng-forge/ng-forge/pull/124))

### ⚠️ Breaking Changes

- **deps:** Angular 21.0.7+ renamed the Signal Forms directive from `Field` to `FormField`. This requires `@angular/*` >= 21.0.7.

## [0.2.0](https://github.com/ng-forge/ng-forge/compare/v0.1.3...v0.2.0) (2025-12-23)

### ♻️ Code Refactoring

- **dynamic-forms:** replace any types with unknown for improved type safety ([#106](https://github.com/ng-forge/ng-forge/pull/106))
- **dynamic-forms:** centralize error prefix in base error class ([#113](https://github.com/ng-forge/ng-forge/pull/113))
- **dynamic-forms:** extract shared utilities and simplify input templates ([#116](https://github.com/ng-forge/ng-forge/pull/116))
- **dynamic-forms:** simplify logger configuration ([#118](https://github.com/ng-forge/ng-forge/pull/118))

## [0.1.3](https://github.com/ng-forge/ng-forge/compare/v0.1.2...v0.1.3) (2025-12-20)

### 🚀 Features

- **dynamic-forms:** add configurable logger service ([#105](https://github.com/ng-forge/ng-forge/pull/105))
- **dynamic-forms:** add secondary entrypoints for integration and testing ([#108](https://github.com/ng-forge/ng-forge/pull/108))

### 🐛 Bug Fixes

- **docs:** improve mobile responsiveness for navbar and sidebar ([#109](https://github.com/ng-forge/ng-forge/pull/109))
- **dynamic-forms:** infer number type for input fields with props.type: 'number' ([#104](https://github.com/ng-forge/ng-forge/pull/104))

### ♻️ Code Refactoring

- **dynamic-forms:** simplify field tree access using bracket notation ([#107](https://github.com/ng-forge/ng-forge/pull/107))

## [0.1.2](https://github.com/ng-forge/ng-forge/compare/v0.1.1...v0.1.2) (2025-12-14)

### 🚀 Features

- **dynamic-forms:** improve form value type inference and add field type utilities ([#99](https://github.com/ng-forge/ng-forge/pull/99))

### 🐛 Bug Fixes

- **dynamic-forms:** resolve build warnings ([#102](https://github.com/ng-forge/ng-forge/pull/102))

### 📚 Documentation

- improve package readmes and metadata ([#100](https://github.com/ng-forge/ng-forge/pull/100))

### ♻️ Code Refactoring

- **dynamic-forms:** encapsulate effects and subscriptions in constructor-called methods ([#101](https://github.com/ng-forge/ng-forge/pull/101))

## [0.1.1](https://github.com/ng-forge/ng-forge/compare/v0.1.0...v0.1.1) (2025-12-12)

### 🐛 Bug Fixes

- **dynamic-forms:** update form-internals for angular 21.0.5 signal forms api ([#95](https://github.com/ng-forge/ng-forge/pull/95))

## [0.1.0](https://github.com/ng-forge/ng-forge/releases/tag/v0.1.0) (2025-12-11)

Initial release of ng-forge dynamic forms library.

### 🚀 Features

- Type-safe, signal-powered dynamic forms for Angular 21+
- Full TypeScript inference for form values
- Support for multiple UI frameworks: Material, Bootstrap, PrimeNG, Ionic
- Built-in validation with shorthand validators
- Conditional field visibility and requirements
- Multi-step form and wizard support
- i18n ready with Observable/Signal support for labels
- Comprehensive ARIA accessibility support ([#83](https://github.com/ng-forge/ng-forge/pull/83))
- Vercel Analytics integration ([#77](https://github.com/ng-forge/ng-forge/pull/77))

### 🐛 Bug Fixes

- Group array value propagation ([#74](https://github.com/ng-forge/ng-forge/pull/74))
- **docs:** resolve infinite redirect loop on GitHub Pages deployment ([#70](https://github.com/ng-forge/ng-forge/pull/70))
- **docs:** Vercel preview white screen issue ([#79](https://github.com/ng-forge/ng-forge/pull/79))

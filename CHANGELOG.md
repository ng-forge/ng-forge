# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and uses [Conventional Commits](https://www.conventionalcommits.org/).

## [0.6.1](https://github.com/ng-forge/ng-forge/compare/v0.6.0...v0.6.1) (2026-02-28)

### 🚀 Features

- **dynamic-forms:** add EventDispatcher injectable for external event dispatch ([#267](https://github.com/ng-forge/ng-forge/pull/267))

### 🐛 Bug Fixes

- **bootstrap:** add readonly DOM sync and floating label hint to textarea ([#270](https://github.com/ng-forge/ng-forge/pull/270))
- **config:** skip playwright browser install on vercel ([3c2dff785](https://github.com/ng-forge/ng-forge/commit/3c2dff785))
- **config:** optimize vercel build to prevent oom and reduce cold build time ([#289](https://github.com/ng-forge/ng-forge/pull/289))
- **dynamic-forms:** expression parser correctness and HTTP injection fixes ([#268](https://github.com/ng-forge/ng-forge/pull/268))
- **dynamic-forms:** fix page navigation validation and hidden page handling ([#271](https://github.com/ng-forge/ng-forge/pull/271))
- **dynamic-forms:** align HTTP condition boolean semantics with validWhen strict check ([#274](https://github.com/ng-forge/ng-forge/pull/274))
- **dynamic-forms:** isolate event bus subscriber exceptions from pipeline ([#272](https://github.com/ng-forge/ng-forge/pull/272))
- **dynamic-forms:** fix submission safety — pending guard, config hot-swap, double-submit ([#278](https://github.com/ng-forge/ng-forge/pull/278))
- **dynamic-forms:** fix HTTP lifecycle safety bugs ([#281](https://github.com/ng-forge/ng-forge/pull/281))
- **dynamic-forms:** fix initialization timing, hang, and nested count ([#280](https://github.com/ng-forge/ng-forge/pull/280))
- **dynamic-forms:** validate config at bootstrap for common misconfigurations ([#283](https://github.com/ng-forge/ng-forge/pull/283))
- **dynamic-forms:** fix array field event API, maxLength, bounds, cleanup ([#282](https://github.com/ng-forge/ng-forge/pull/282))
- **ionic,primeng:** improve a11y and correctness across adapters ([#279](https://github.com/ng-forge/ng-forge/pull/279))
- **mcp:** correct operator names, document HTTP conditions and async custom functions ([#269](https://github.com/ng-forge/ng-forge/pull/269))

### ♻️ Code Refactoring

- **dynamic-forms:** replace \_connectStateDeps IIFE with connectDeps() method ([#291](https://github.com/ng-forge/ng-forge/pull/291))
- **mcp:** remove offline docs generation and CI registry checks ([#290](https://github.com/ng-forge/ng-forge/pull/290))

### 📦 Build System

- **deps:** update angular framework packages to 21.2.0 ([#288](https://github.com/ng-forge/ng-forge/pull/288))

### ✅ Tests

- **dynamic-forms:** add type tests for public exported types ([#285](https://github.com/ng-forge/ng-forge/pull/285))

## [0.6.0](https://github.com/ng-forge/ng-forge/compare/v0.5.2...v0.6.0) (2026-02-19)

### 🚀 Features

- ⚠️ **dynamic-forms:** add 3-tier value exclusion for form submissions ([#240](https://github.com/ng-forge/ng-forge/pull/240))
- **dynamic-forms:** add hidden logic support to container fields ([#242](https://github.com/ng-forge/ng-forge/pull/242))
- **dynamic-forms:** add per-item wrapper div to array fields ([#243](https://github.com/ng-forge/ng-forge/pull/243))
- **dynamic-forms:** add simplified array API with template property ([#245](https://github.com/ng-forge/ng-forge/pull/245))
- **dynamic-forms:** add minLength/maxLength validation for array fields ([#211](https://github.com/ng-forge/ng-forge/pull/211))
- **dynamic-forms:** add declarative HTTP validator type ([#249](https://github.com/ng-forge/ng-forge/pull/249))
- **dynamic-forms:** add field state in evaluation context and stopOnUserOverride ([#248](https://github.com/ng-forge/ng-forge/pull/248))
- **dynamic-forms:** add HTTP resolver for derivations ([#255](https://github.com/ng-forge/ng-forge/pull/255), [#246](https://github.com/ng-forge/ng-forge/issues/246))
- **dynamic-forms:** add HTTP condition type for server-driven field state ([#256](https://github.com/ng-forge/ng-forge/pull/256))
- **dynamic-forms:** add async custom functions for derivations and conditions ([#257](https://github.com/ng-forge/ng-forge/pull/257))
- **dynamic-forms:** add URL path parameter interpolation to HttpRequestConfig ([#263](https://github.com/ng-forge/ng-forge/pull/263))

### 🐛 Bug Fixes

- **dynamic-forms:** fix cross-field validators silently failing on fields inside groups ([#260](https://github.com/ng-forge/ng-forge/pull/260))
- **dynamic-forms:** fix cross-field validators not routing errors for fields inside groups ([#262](https://github.com/ng-forge/ng-forge/pull/262))

### ♻️ Code Refactoring

- ⚠️ **dynamic-forms:** simplify logic APIs with deprecation warnings ([#254](https://github.com/ng-forge/ng-forge/pull/254))
- **dynamic-forms:** improve async/HTTP API ergonomics with source discriminant ([#258](https://github.com/ng-forge/ng-forge/pull/258))
- **examples:** split E2E tests into core functional and UI visual apps ([#239](https://github.com/ng-forge/ng-forge/pull/239))

### 📚 Documentation

- fix broken documentation links, update sitemap and llms.txt ([#241](https://github.com/ng-forge/ng-forge/pull/241))
- add backers section to readme ([21740ab7a](https://github.com/ng-forge/ng-forge/commit/21740ab7a))
- **docs:** document async features, HTTP validators, and container logic ([#259](https://github.com/ng-forge/ng-forge/pull/259))
- **dynamic-forms:** add CLAUDE.md project documentation and gitignore .claude/plans ([48954c2ff](https://github.com/ng-forge/ng-forge/commit/48954c2ff))

### ✅ Tests

- **dynamic-forms:** add value two-way binding e2e tests ([#244](https://github.com/ng-forge/ng-forge/pull/244))

### ⚠️ Breaking Changes

- **dynamic-forms:** simplify logic APIs with deprecation warnings ([#254](https://github.com/ng-forge/ng-forge/pull/254))
  `ConditionalExpression` is now a discriminated union. Code that sets invalid property combos (e.g., `fieldPath` on a javascript condition) will fail to compile.
- **dynamic-forms:** add 3-tier value exclusion for form submissions ([#240](https://github.com/ng-forge/ng-forge/pull/240))
  Field values are now excluded from submitted output when the field is hidden, disabled, or readonly. To restore previous behavior, use `withValueExclusionDefaults({ excludeValueIfHidden: false, excludeValueIfDisabled: false, excludeValueIfReadonly: false })`.

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
- **mcp:** add dynamic-form-mcp package ([#126](https://github.com/ng-forge/ng-forge/pull/126))

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

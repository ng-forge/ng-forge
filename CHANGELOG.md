# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and uses [Conventional Commits](https://www.conventionalcommits.org/).

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

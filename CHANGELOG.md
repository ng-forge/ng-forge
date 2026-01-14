## 0.3.1 (2026-01-14)

### 🚀 Features

- **docs:** add interactive demo and syntax highlighting to landing page ([#132](https://github.com/ng-forge/ng-forge/pull/132))
- **docs:** add link title attributes and improve example input theming ([#138](https://github.com/ng-forge/ng-forge/pull/138))

### 🐛 Bug Fixes

- **core:** add unique ids to form field inner elements ([#136](https://github.com/ng-forge/ng-forge/pull/136), [#131](https://github.com/ng-forge/ng-forge/issues/131))
- **dynamic-forms:** bind classname to container field components ([#137](https://github.com/ng-forge/ng-forge/pull/137), [#133](https://github.com/ng-forge/ng-forge/issues/133))

### ⏪ Reverts

- **docs:** feat(docs): add new landing page with improved design (#127) ([#127](https://github.com/ng-forge/ng-forge/pull/127))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru

## 0.3.0 (2026-01-12)

### 🚀 Features

- **dynamic-forms:** add hidden field type for storing non-rendered values ([#122](https://github.com/ng-forge/ng-forge/pull/122))
- **dynamic-forms:** add meta attribute support for wrapped components ([#115](https://github.com/ng-forge/ng-forge/pull/115))

### 📦 Build System

- ⚠️ **deps:** update angular to 21.0.8 with formfield directive migration ([#124](https://github.com/ng-forge/ng-forge/pull/124))

### ✅ Tests

- **forms:** add exhaustive type tests for all ui libraries and core types ([#121](https://github.com/ng-forge/ng-forge/pull/121))

### ⏪ Reverts

- ⚠️ **examples:** test(examples): add visual regression screenshots and e2e infrastructure (#125) ([#125](https://github.com/ng-forge/ng-forge/pull/125))

### ⚠️ Breaking Changes

- **examples:** test(examples): add visual regression screenshots and e2e infrastructure (#125) ([#125](https://github.com/ng-forge/ng-forge/pull/125))
  CSS class prefix changed from df-ionic-_ to df-ion-_
  to match naming convention of other UI libs (df-mat-_, df-bs-_, df-prime-\*).
  Also standardize CSS variables across all UI libs:
  - Add --df-label-color: inherit to Material, Ionic, PrimeNG
  - Update Material font sizes from 0.75rem to 0.875rem
  - All libs now have identical CSS variable sets
  * refactor(config): extract shared playwright configuration
    Create createPlaywrightConfig() factory function that generates
    consistent Playwright configurations for all example apps.
    Reduces each config file from ~95 lines to 3 lines.
  - Add playwright-config.ts with APP_PORTS mapping and browser projects
  - Export createPlaywrightConfig, APP_PORTS, ExampleApp from shared
  - Update all 4 example apps to use shared config factory
  * refactor(examples): remove hardcoded test urls
    Replace hardcoded localhost URLs with path-only format that leverages
    Playwright's baseURL configuration. This makes tests portable and
    removes duplication.
  - Replace http://localhost:42XX/# URLs with /# paths in 45+ spec files
  - Update testUrl() functions to return path-only format
  - Remove unused testUrl imports from ionic tests
  - Clean up BASE_URL imports no longer needed
  * fix(config): separate playwright config from angular compilation
    The playwright-config.ts uses Node.js APIs (process.env, node:url)
    which are not available in Angular's browser compilation context.
  - Remove playwright-config exports from shared testing index
  - Update playwright configs to import directly from the specific file
  - Add comment explaining the separation
  * fix(ionic): update eslint selector prefix to df-ion
  * ci(config): add debugging for e2e affected detection
  * fix(config): install pnpm in playwright docker container
  * perf(config): run playwright directly in ci instead of docker
    CI is already Ubuntu Linux, same as the Playwright Docker image.
    Running directly avoids:
  - Docker image pull (~1GB)
  - Container setup overhead
  - Reinstalling dependencies inside container
    Docker scripts remain for local development where consistent
    Linux rendering is needed on Mac/Windows.
  * Revert "perf(config): run playwright directly in ci instead of docker
- **deps:** update angular to 21.0.8 with formfield directive migration ([#124](https://github.com/ng-forge/ng-forge/pull/124))
  Angular 21.0.7 renamed the Signal Forms directive from
  `Field` to `FormField`. This requires `@angular/*` >= 21.0.7.
  Angular & Forms changes:
  - Update all @angular/\* packages to 21.0.8
  - Rename [field] to [formField] in all UI library templates
  - Update Field imports to FormField from @angular/forms/signals
  - Update peer dependencies to require >= 21.0.7
  - Remove [attr.hidden] from elements with [formField] (not allowed)
  - Change model.required() to model() in radio group components
    Dependency updates:
  - @ng-doc/\*: 20.1.1 → 21.0.0 (Angular 21 support)
  - @analogjs/\*: 2.1.3 → 2.2.1
  - @ionic/angular: 8.7.14 → 8.7.16
  - primeng: 21.0.1 → 21.0.2
  - ng-packagr: 21.0.0 → 21.0.1
  - eslint: 9.39.1 → 9.39.2
  - vite: 7.3.0 → 7.3.1
  - And other minor/patch updates
    Cleanup:
  - Remove ng-doc Angular 21 compatibility patch (no longer needed)
  * fix(dynamic-forms): disable browser validation to fix ionic hidden field issues
    Add novalidate attribute to DynamicForm host to prevent browser native
    validation. This fixes issues with Ionic web components where hidden
    form controls with required validation would trigger "invalid form
    control is not focusable" errors during form submission.
    Angular Signal Forms handles all validation, so browser validation is
    unnecessary and causes issues with shadow DOM components like Ionic.
  * fix(primeng,ionic): correct validation styling and error display
    PrimeNG:
  - Add CSS override in \_form-field.scss to hide invalid styling when
    field has not been touched yet (using :host:not(.df-touched) selector)
  - Add [class.df-touched] binding to all PrimeNG component hosts to
    track touched state for CSS targeting
    The issue was that Angular's InteropNgControl.invalid property returns
    the raw invalid state without considering the touched state, causing
    PrimeNG to show red borders on pristine required fields.
    Ionic:
  - Move error messages outside of Ionic component elements
  - Remove slot="error" wrappers that were hidden by Ionic's CSS
  - Add df-ionic-error class to error notes for consistent styling
  - Update accessibility tests to use new error message selectors
    The issue was that Ionic web components hide slot="error" content unless
    the ion-invalid and ion-touched classes are applied, which Angular's
    Signal Forms directive doesn't do automatically.
  * fix(ionic,primeng): handle angular 21.0.7 auto-propagation of invalid state
    Angular 21.0.7+ automatically propagates form state (invalid, required,
    touched, etc.) to component inputs via the FormField directive. This
    caused PrimeNG components to show red borders on untouched fields and
    Ionic components to not show error styling at all.
    PrimeNG fix:
  - Add CSS override in \_form-field.scss to hide invalid styling until
    the field is touched (.df-touched class)
  - Use ::ng-deep to pierce view encapsulation for PrimeNG components
    Ionic fix:
  - Add host class bindings for df-invalid and df-touched
  - Centralize error styling in shared \_form-field.scss
  - Use Ionic CSS custom properties for danger color theming
  - Update all field components to use shared stylesheet

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru

## 0.2.0 (2025-12-23)

### ♻️ Code Refactoring

- **dynamic-forms:** replace any types with unknown for improved type safety ([#106](https://github.com/ng-forge/ng-forge/pull/106))
- **dynamic-forms:** centralize error prefix in base error class ([#113](https://github.com/ng-forge/ng-forge/pull/113))
- **dynamic-forms:** extract shared utilities and simplify input templates ([#116](https://github.com/ng-forge/ng-forge/pull/116))
- **dynamic-forms:** simplify logger configuration ([#118](https://github.com/ng-forge/ng-forge/pull/118))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru

## 0.1.3 (2025-12-20)

### 🚀 Features

- **dynamic-forms:** add configurable logger service ([#105](https://github.com/ng-forge/ng-forge/pull/105))
- **dynamic-forms:** add secondary entrypoints for integration and testing ([#108](https://github.com/ng-forge/ng-forge/pull/108))

### 🐛 Bug Fixes

- **docs:** improve mobile responsiveness for navbar and sidebar ([#109](https://github.com/ng-forge/ng-forge/pull/109))
- **dynamic-forms:** infer number type for input fields with props.type: 'number' ([#104](https://github.com/ng-forge/ng-forge/pull/104))

### ♻️ Code Refactoring

- **dynamic-forms:** simplify field tree access using bracket notation ([#107](https://github.com/ng-forge/ng-forge/pull/107))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru
- Claude Opus 4.5

## 0.1.0 (2025-12-11)

### 🚀 Features

- add ng error prefix ([#51](https://github.com/ng-forge/ng-forge/pull/51))
- form config changes and verify builds ([#53](https://github.com/ng-forge/ng-forge/pull/53))
- e2e format improvement ([#65](https://github.com/ng-forge/ng-forge/pull/65))
- improve docs ([#68](https://github.com/ng-forge/ng-forge/pull/68))
- update LoginComponent template and remove onSubmit ([ff8000b9](https://github.com/ng-forge/ng-forge/commit/ff8000b9))
- improve tests ([#55](https://github.com/ng-forge/ng-forge/pull/55))
- write missing E2E tests for dynamic forms material ([#69](https://github.com/ng-forge/ng-forge/pull/69))
- add Vercel Analytics to docs app ([#77](https://github.com/ng-forge/ng-forge/pull/77))
- complete migration to Vercel and update domain links ([#78](https://github.com/ng-forge/ng-forge/pull/78))
- add comprehensive ARIA accessibility support ([#83](https://github.com/ng-forge/ng-forge/pull/83))
- accessibility improvements ([#86](https://github.com/ng-forge/ng-forge/pull/86))
- ionic e2e tests ([#87](https://github.com/ng-forge/ng-forge/pull/87))

### 🩹 Fixes

- always install Playwright browsers regardless of cache status ([#62](https://github.com/ng-forge/ng-forge/pull/62))
- group array value propagation ([#74](https://github.com/ng-forge/ng-forge/pull/74))
- **docs:** resolve infinite redirect loop on GitHub Pages deployment ([#70](https://github.com/ng-forge/ng-forge/pull/70))
- **docs:** Vercel preview white screen issue ([#79](https://github.com/ng-forge/ng-forge/pull/79))
- **docs:** improve iframe auto-sizing with URL-based message filtering ([#80](https://github.com/ng-forge/ng-forge/pull/80))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru
- Claude
